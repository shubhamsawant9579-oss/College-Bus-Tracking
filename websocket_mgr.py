from fastapi import WebSocket
from typing import Dict, List
import json
import logging

logger = logging.getLogger("websocket_manager")

class ConnectionManager:
    def __init__(self):
        # Maps bus_id -> list of student WebSockets
        self.active_students: Dict[int, List[WebSocket]] = {}
        # Maps bus_id -> active driver WebSocket (if connected)
        self.active_drivers: Dict[int, WebSocket] = {}
        # Pipeline monitor WebSockets
        self.active_monitors: List[WebSocket] = []

    async def connect_driver(self, websocket: WebSocket, bus_id: int):
        await websocket.accept()
        self.active_drivers[bus_id] = websocket
        logger.info(f"Driver connected for Bus #{bus_id}")

    def disconnect_driver(self, bus_id: int):
        if bus_id in self.active_drivers:
            del self.active_drivers[bus_id]
            logger.info(f"Driver disconnected for Bus #{bus_id}")

    async def connect_student(self, websocket: WebSocket, bus_id: int):
        await websocket.accept()
        if bus_id not in self.active_students:
            self.active_students[bus_id] = []
        self.active_students[bus_id].append(websocket)
        logger.info(f"Student connected for Bus #{bus_id}. Total students: {len(self.active_students[bus_id])}")

    def disconnect_student(self, websocket: WebSocket, bus_id: int):
        if bus_id in self.active_students and websocket in self.active_students[bus_id]:
            self.active_students[bus_id].remove(websocket)
            logger.info(f"Student disconnected from Bus #{bus_id}")

    async def connect_monitor(self, websocket: WebSocket):
        await websocket.accept()
        self.active_monitors.append(websocket)

    def disconnect_monitor(self, websocket: WebSocket):
        if websocket in self.active_monitors:
            self.active_monitors.remove(websocket)

    async def broadcast_bus_location(self, bus_id: int, payload: dict):
        """Broadcasts GPS update payload to all students listening to this bus_id"""
        message_str = json.dumps(payload)
        
        # Send to students
        if bus_id in self.active_students:
            disconnected = []
            for connection in self.active_students[bus_id]:
                try:
                    await connection.send_text(message_str)
                except Exception:
                    disconnected.append(connection)
            for conn in disconnected:
                self.disconnect_student(conn, bus_id)

        # Broadcast to pipeline monitors
        disconnected_monitors = []
        for monitor in self.active_monitors:
            try:
                await monitor.send_text(message_str)
            except Exception:
                disconnected_monitors.append(monitor)
        for conn in disconnected_monitors:
            self.disconnect_monitor(conn)

manager = ConnectionManager()
