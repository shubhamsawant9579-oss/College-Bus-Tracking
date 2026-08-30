from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class UserRole(str, enum.Enum):
    DRIVER = "driver"
    STUDENT = "student"
    ADMIN = "admin"

class BusStatus(str, enum.Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    INACTIVE = "inactive"

class TripStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    ONGOING = "ongoing"
    COMPLETED = "completed"

# 1. users
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="student")  # driver, student, admin
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    driver_profile = relationship("Driver", back_populates="user", uselist=False)
    student_profile = relationship("Student", back_populates="user", uselist=False)

# 2. buses
class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String, unique=True, index=True, nullable=False)
    registration_number = Column(String, nullable=False)
    capacity = Column(Integer, default=50)
    status = Column(String, default="active")

    assignments = relationship("BusAssignment", back_populates="bus")
    trips = relationship("Trip", back_populates="bus")
    locations = relationship("BusLocation", back_populates="bus")

# 3. drivers
class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    license_number = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="driver_profile")
    assignments = relationship("BusAssignment", back_populates="driver")
    trips = relationship("Trip", back_populates="driver")

# 4. students
class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    roll_number = Column(String, nullable=False)
    stop_id = Column(Integer, ForeignKey("stops.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="student_profile")
    assigned_stop = relationship("Stop")

# 5. routes
class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String, nullable=False)
    start_location = Column(String, nullable=False)
    end_location = Column(String, nullable=False)

    stops = relationship("Stop", back_populates="route")
    route_stops = relationship("RouteStop", back_populates="route")
    assignments = relationship("BusAssignment", back_populates="route")
    trips = relationship("Trip", back_populates="route")

# 6. stops
class Stop(Base):
    __tablename__ = "stops"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    stop_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    stop_order = Column(Integer, nullable=False)

    route = relationship("Route", back_populates="stops")
    route_stops = relationship("RouteStop", back_populates="stop")

# 7. route_stops
class RouteStop(Base):
    __tablename__ = "route_stops"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    stop_id = Column(Integer, ForeignKey("stops.id"), nullable=False)
    stop_order = Column(Integer, nullable=False)
    estimated_time_minutes = Column(Integer, default=5)

    route = relationship("Route", back_populates="route_stops")
    stop = relationship("Stop", back_populates="route_stops")

# 8. bus_assignments
class BusAssignment(Base):
    __tablename__ = "bus_assignments"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    assigned_date = Column(DateTime, default=datetime.utcnow)

    bus = relationship("Bus", back_populates="assignments")
    driver = relationship("Driver", back_populates="assignments")
    route = relationship("Route", back_populates="assignments")

# 9. trips
class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    status = Column(String, default="ongoing")  # ongoing, completed

    bus = relationship("Bus", back_populates="trips")
    route = relationship("Route", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")

# 10. bus_locations (GPS History table)
class BusLocation(Base):
    __tablename__ = "bus_locations"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    bus = relationship("Bus", back_populates="locations")
