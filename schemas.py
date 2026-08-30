from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str = "student"

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Location / Telemetry Schemas ---
class LocationPayload(BaseModel):
    bus_id: int
    latitude: float
    longitude: float
    speed: Optional[float] = 0.0

class LocationBroadcast(BaseModel):
    bus_id: int
    latitude: float
    longitude: float
    speed: float
    timestamp: str
    current_stop: Optional[str] = None
    next_stop: Optional[str] = None
    eta_minutes: Optional[int] = None
    distance_remaining_km: Optional[float] = None

# --- Domain Schemas ---
class StopSchema(BaseModel):
    id: int
    route_id: int
    stop_name: str
    latitude: float
    longitude: float
    stop_order: int

    class Config:
        from_attributes = True

class RouteSchema(BaseModel):
    id: int
    route_name: str
    start_location: str
    end_location: str
    stops: List[StopSchema] = []

    class Config:
        from_attributes = True

class BusSchema(BaseModel):
    id: int
    bus_number: str
    registration_number: str
    capacity: int
    status: str

    class Config:
        from_attributes = True

class DriverSchema(BaseModel):
    id: int
    name: str
    phone: str
    license_number: str

    class Config:
        from_attributes = True

class TripSchema(BaseModel):
    id: int
    bus_id: int
    route_id: int
    driver_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True
