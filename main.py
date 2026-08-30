from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
import json
import logging
import os

from .database import engine, Base, get_db
from . import models, schemas, auth, geo_utils
from .websocket_mgr import manager
from .mock_data import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

# Create all 10 tables on startup
Base.metadata.create_all(bind=engine)

# Seed database with initial routes & users
db_session = next(get_db())
seed_database(db_session)
db_session.close()

app = FastAPI(
    title="College Bus Live Tracking System API",
    description="FastAPI Backend for real-time GPS telemetry, JWT Auth, and WebSocket streaming.",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve Web Frontend static assets
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", response_class=FileResponse)
def read_root():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "College Bus Tracking Backend API. Visit /docs for API documentation."}

# --- Authentication Endpoints ---
@app.post("/api/auth/register", response_model=schemas.UserOut)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = auth.get_password_hash(user_in.password)
    new_user = models.User(
        email=user_in.email,
        password_hash=hashed_pwd,
        name=user_in.name,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if user_in.role == "driver":
        driver = models.Driver(
            name=user_in.name,
            phone="+91 99000 00000",
            license_number="DL-TEMP-001",
            user_id=new_user.id
        )
        db.add(driver)
        db.commit()

    return new_user

@app.post("/api/auth/token", response_model=schemas.Token)
def login_for_access_token(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not auth.verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name
    }

# --- System & Routes Endpoints ---
@app.get("/api/routes", response_model=List[schemas.RouteSchema])
def get_routes(db: Session = Depends(get_db)):
    routes = db.query(models.Route).all()
    return routes

@app.get("/api/buses", response_model=List[schemas.BusSchema])
def get_buses(db: Session = Depends(get_db)):
    buses = db.query(models.Bus).all()
    return buses

@app.get("/api/buses/{bus_id}/history")
def get_bus_history(bus_id: int, limit: int = 50, db: Session = Depends(get_db)):
    locations = db.query(models.BusLocation)\
        .filter(models.BusLocation.bus_id == bus_id)\
        .order_by(models.BusLocation.timestamp.desc())\
        .limit(limit)\
        .all()
    return [{
        "id": loc.id,
        "bus_id": loc.bus_id,
        "latitude": loc.latitude,
        "longitude": loc.longitude,
        "speed": loc.speed,
        "timestamp": loc.timestamp.isoformat()
    } for loc in locations]

@app.post("/api/location")
async def receive_location_rest(payload: schemas.LocationPayload, db: Session = Depends(get_db)):
    """REST API endpoint for receiving Driver GPS coordinates"""
    # 1. Insert into bus_locations database table
    new_loc = models.BusLocation(
        bus_id=payload.bus_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        speed=payload.speed,
        timestamp=datetime.utcnow()
    )
    db.add(new_loc)
    db.commit()

    # 2. Fetch route stops for ETA calculations
    assignment = db.query(models.BusAssignment).filter(models.BusAssignment.bus_id == payload.bus_id).first()
    stops = []
    if assignment:
        stops_records = db.query(models.Stop).filter(models.Stop.route_id == assignment.route_id).order_by(models.Stop.stop_order).all()
        stops = [{"stop_name": s.stop_name, "latitude": s.latitude, "longitude": s.longitude} for s in stops_records]

    current_stop, next_stop, eta_minutes, dist_remaining = geo_utils.calculate_route_eta(
        payload.latitude, payload.longitude, payload.speed, stops
    )

    broadcast_payload = {
        "bus_id": payload.bus_id,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "speed": payload.speed,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "current_stop": current_stop,
        "next_stop": next_stop,
        "eta_minutes": eta_minutes,
        "distance_remaining_km": dist_remaining
    }

    # 3. Broadcast via WebSockets to connected student apps
    await manager.broadcast_bus_location(payload.bus_id, broadcast_payload)
    return {"status": "success", "payload": broadcast_payload}

# --- WebSocket Endpoints ---

@app.websocket("/ws/driver/{bus_id}")
async def websocket_driver_endpoint(websocket: WebSocket, bus_id: int, db: Session = Depends(get_db)):
    """
    WebSocket endpoint for Driver Phone.
    Receives JSON telemetry, logs to bus_locations DB table, and broadcasts to Students.
    """
    await manager.connect_driver(websocket, bus_id)
    try:
        while True:
            data = await websocket.receive_text()
            payload_json = json.loads(data)

            lat = float(payload_json.get("latitude", 16.7049))
            lon = float(payload_json.get("longitude", 74.2433))
            speed = float(payload_json.get("speed", 0.0))

            # 1. Insert into bus_locations history table
            new_loc = models.BusLocation(
                bus_id=bus_id,
                latitude=lat,
                longitude=lon,
                speed=speed,
                timestamp=datetime.utcnow()
            )
            db.add(new_loc)
            db.commit()

            # 2. Fetch route stops for ETA calculations
            assignment = db.query(models.BusAssignment).filter(models.BusAssignment.bus_id == bus_id).first()
            stops = []
            if assignment:
                stops_records = db.query(models.Stop).filter(models.Stop.route_id == assignment.route_id).order_by(models.Stop.stop_order).all()
                stops = [{"stop_name": s.stop_name, "latitude": s.latitude, "longitude": s.longitude} for s in stops_records]

            curr_stop, next_stop, eta_min, dist_rem = geo_utils.calculate_route_eta(lat, lon, speed, stops)

            broadcast_payload = {
                "bus_id": bus_id,
                "latitude": lat,
                "longitude": lon,
                "speed": speed,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "current_stop": curr_stop,
                "next_stop": next_stop,
                "eta_minutes": eta_min,
                "distance_remaining_km": dist_rem
            }

            # 3. Broadcast to all connected student browsers
            await manager.broadcast_bus_location(bus_id, broadcast_payload)

    except WebSocketDisconnect:
        manager.disconnect_driver(bus_id)
    except Exception as e:
        logger.error(f"Error in driver websocket: {e}")
        manager.disconnect_driver(bus_id)

@app.websocket("/ws/student/{bus_id}")
async def websocket_student_endpoint(websocket: WebSocket, bus_id: int):
    """
    WebSocket endpoint for Student App / Browser.
    Receives live location coordinates pushed by backend.
    """
    await manager.connect_student(websocket, bus_id)
    try:
        while True:
            # Keep-alive loop
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_student(websocket, bus_id)

@app.websocket("/ws/pipeline")
async def websocket_pipeline_endpoint(websocket: WebSocket):
    """WebSocket endpoint for Architecture Pipeline Live Visualizer"""
    await manager.connect_monitor(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_monitor(websocket)
