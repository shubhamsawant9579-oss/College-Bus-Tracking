import math
from typing import List, Dict, Tuple, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the great-circle distance between two points in kilometers."""
    R = 6371.0  # Earth's radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def calculate_route_eta(
    curr_lat: float,
    curr_lon: float,
    curr_speed: float,
    stops: List[Dict]
) -> Tuple[Optional[str], Optional[str], Optional[int], Optional[float]]:
    """
    Given current bus lat/lon/speed and sorted route stops, calculates:
    - current_stop (if within 100m)
    - next_stop name
    - eta_minutes to next_stop
    - distance_remaining_km to final stop (College)
    """
    if not stops:
        return None, None, None, None

    # Default speed fallback if idle (e.g. 25 km/h)
    speed_kmh = max(curr_speed, 20.0)

    closest_stop_idx = 0
    min_dist = float('inf')

    for i, stop in enumerate(stops):
        d = haversine_distance(curr_lat, curr_lon, stop['latitude'], stop['longitude'])
        if d < min_dist:
            min_dist = d
            closest_stop_idx = i

    current_stop_name = None
    if min_dist < 0.15:  # Within 150 meters of a stop
        current_stop_name = stops[closest_stop_idx]['stop_name']

    # Next stop is either the closest ahead, or the next stop index
    next_stop_idx = min(closest_stop_idx + (1 if min_dist < 0.1 else 0), len(stops) - 1)
    next_stop_name = stops[next_stop_idx]['stop_name']

    dist_to_next = haversine_distance(
        curr_lat, curr_lon,
        stops[next_stop_idx]['latitude'], stops[next_stop_idx]['longitude']
    )
    eta_hours = dist_to_next / speed_kmh
    eta_minutes = math.ceil(eta_hours * 60)

    # Distance remaining to final college destination
    final_stop = stops[-1]
    dist_remaining = haversine_distance(
        curr_lat, curr_lon,
        final_stop['latitude'], final_stop['longitude']
    )

    return current_stop_name, next_stop_name, eta_minutes, round(dist_remaining, 2)
