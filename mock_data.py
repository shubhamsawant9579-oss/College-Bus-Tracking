from sqlalchemy.orm import Session
from . import models, auth

def seed_database(db: Session):

    # 1. Create Default Users
    driver_user = db.query(models.User).filter(models.User.email == "driver@college.edu").first()
    if not driver_user:
        driver_user = models.User(
            email="driver@college.edu",
            name="Rajesh Patil",
            password_hash=auth.get_password_hash("driver123"),
            role="driver"
        )
        db.add(driver_user)
        db.commit()

    student_user = db.query(models.User).filter(models.User.email == "student@college.edu").first()
    if not student_user:
        student_user = models.User(
            email="student@college.edu",
            name="Aarav Sharma",
            password_hash=auth.get_password_hash("student123"),
            role="student"
        )
        db.add(student_user)
        db.commit()

    # 2. Create Buses
    bus1 = db.query(models.Bus).filter(models.Bus.bus_number == "BUS-05").first()
    if not bus1:
        bus1 = models.Bus(
            bus_number="BUS-05",
            registration_number="MH-09-CB-1005",
            capacity=52,
            status="active"
        )
        db.add(bus1)
        db.commit()

    bus2 = db.query(models.Bus).filter(models.Bus.bus_number == "BUS-12").first()
    if not bus2:
        bus2 = models.Bus(
            bus_number="BUS-12",
            registration_number="MH-11-AB-2012",
            capacity=48,
            status="active"
        )
        db.add(bus2)
        db.commit()

    # 3. Create Drivers
    driver1 = db.query(models.Driver).filter(models.Driver.name == "Rajesh Patil").first()
    if not driver1:
        driver1 = models.Driver(
            name="Rajesh Patil",
            phone="+91 98765 43210",
            license_number="MH09201900452",
            user_id=driver_user.id
        )
        db.add(driver1)
        db.commit()

    driver2 = db.query(models.Driver).filter(models.Driver.name == "Suresh Deshmukh").first()
    if not driver2:
        driver2 = models.Driver(
            name="Suresh Deshmukh",
            phone="+91 98220 11223",
            license_number="MH11201800987",
            user_id=driver_user.id
        )
        db.add(driver2)
        db.commit()

    # 4. Route 1: Kolhapur Route
    route1 = db.query(models.Route).filter(models.Route.route_name == "Route #5 - Kolhapur City to Campus").first()
    if not route1:
        route1 = models.Route(
            route_name="Route #5 - Kolhapur City to Campus",
            start_location="Central Bus Stand (CBS)",
            end_location="Engineering College Campus"
        )
        db.add(route1)
        db.commit()

        stops_data1 = [
            {"stop_name": "Central Bus Stand (CBS)", "lat": 16.7080, "lon": 74.2380, "order": 1},
            {"stop_name": "Railway Station Circle", "lat": 16.7049, "lon": 74.2433, "order": 2},
            {"stop_name": "Tarabai Park Stop", "lat": 16.7010, "lon": 74.2490, "order": 3},
            {"stop_name": "University Main Gate", "lat": 16.6950, "lon": 74.2540, "order": 4},
            {"stop_name": "Engineering College Campus 🏫", "lat": 16.6890, "lon": 74.2600, "order": 5}
        ]

        for s_data in stops_data1:
            stop = models.Stop(
                route_id=route1.id,
                stop_name=s_data["stop_name"],
                latitude=s_data["lat"],
                longitude=s_data["lon"],
                stop_order=s_data["order"]
            )
            db.add(stop)
            db.commit()
            route_stop = models.RouteStop(
                route_id=route1.id,
                stop_id=stop.id,
                stop_order=s_data["order"],
                estimated_time_minutes=s_data["order"] * 5
            )
            db.add(route_stop)
        db.commit()

    # 5. Route 2: Karad to ABIT Polytechnic Satara via NH48 (National Highway 48)
    route2 = db.query(models.Route).filter(models.Route.route_name == "Route #12 - Karad to ABIT Polytechnic Satara (via NH48)").first()
    if not route2:
        route2 = models.Route(
            route_name="Route #12 - Karad to ABIT Polytechnic Satara (via NH48)",
            start_location="Karad Central Bus Stand",
            end_location="ABIT Polytechnic Satara Campus"
        )
        db.add(route2)
        db.commit()

        # High density stops strictly following NH48 (National Highway 48)
        stops_data2 = [
            {"stop_name": "Karad Central Bus Stand (CBS)", "lat": 17.2833, "lon": 74.1825, "order": 1},
            {"stop_name": "Karad NH48 Highway Flyover Junction", "lat": 17.2915, "lon": 74.1780, "order": 2},
            {"stop_name": "Ohar Village NH48", "lat": 17.3450, "lon": 74.1420, "order": 3},
            {"stop_name": "Umbraj NH48 Flyover Junction", "lat": 17.4015, "lon": 74.1030, "order": 4},
            {"stop_name": "Chinchani NH48 Stretch", "lat": 17.4580, "lon": 74.0780, "order": 5},
            {"stop_name": "Kashil Phata NH48", "lat": 17.5180, "lon": 74.0550, "order": 6},
            {"stop_name": "Nagthane NH48 Flyover", "lat": 17.5650, "lon": 74.0320, "order": 7},
            {"stop_name": "Varna Phata NH48", "lat": 17.6010, "lon": 74.0220, "order": 8},
            {"stop_name": "Shendre Fata NH48 Exit (Satara)", "lat": 17.6320, "lon": 74.0150, "order": 9},
            {"stop_name": "ABIT Polytechnic Satara Campus 🏫", "lat": 17.6550, "lon": 74.0100, "order": 10}
        ]

        for s_data in stops_data2:
            stop = models.Stop(
                route_id=route2.id,
                stop_name=s_data["stop_name"],
                latitude=s_data["lat"],
                longitude=s_data["lon"],
                stop_order=s_data["order"]
            )
            db.add(stop)
            db.commit()
            route_stop = models.RouteStop(
                route_id=route2.id,
                stop_id=stop.id,
                stop_order=s_data["order"],
                estimated_time_minutes=s_data["order"] * 5
            )
            db.add(route_stop)
        db.commit()

    # Assignments & Trips
    assignment1 = db.query(models.BusAssignment).filter(models.BusAssignment.bus_id == bus1.id).first()
    if not assignment1:
        db.add(models.BusAssignment(bus_id=bus1.id, driver_id=driver1.id, route_id=route1.id))
        db.commit()

    assignment2 = db.query(models.BusAssignment).filter(models.BusAssignment.bus_id == bus2.id).first()
    if not assignment2 and route2:
        db.add(models.BusAssignment(bus_id=bus2.id, driver_id=driver2.id, route_id=route2.id))
        db.commit()

    # Initial Location for Bus-05
    loc1 = db.query(models.BusLocation).filter(models.BusLocation.bus_id == bus1.id).first()
    if not loc1:
        db.add(models.BusLocation(bus_id=bus1.id, latitude=16.7049, longitude=74.2433, speed=32.5))
        db.commit()

    # Initial Location for Bus-12 (Karad to ABIT Satara via NH48)
    loc2 = db.query(models.BusLocation).filter(models.BusLocation.bus_id == bus2.id).first()
    if not loc2:
        db.add(models.BusLocation(bus_id=bus2.id, latitude=17.2833, longitude=74.1825, speed=55.0))
        db.commit()
