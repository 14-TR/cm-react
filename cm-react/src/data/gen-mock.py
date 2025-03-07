import json
import random
import datetime

def generate_mock_data(num_records=25):
    """
    Generates mock event data within Ukraine's approximate lat/lon bounding box:
      Latitude between ~44.4 and ~52.4
      Longitude between ~22.1 and ~40.2
    Event types: battle, explosion, viirs
    - If 'battle' or 'explosion', set random 'fatalities'
    - If 'viirs', set random 'frp'
    - Also sets a random date in 2023
    """
    data = []

    # Approximate bounding box for Ukraine
    min_lat, max_lat = 44.4, 52.4
    min_lon, max_lon = 22.1, 40.2

    # Possible event types
    event_types = ["battle", "explosion", "viirs"]

    # For random date generation in 2023
    start_date = datetime.date(2023, 1, 1)
    end_date   = datetime.date(2023, 12, 31)
    delta_days = (end_date - start_date).days

    for i in range(num_records):
        event_type = random.choice(event_types)
        lat = random.uniform(min_lat, max_lat)
        lon = random.uniform(min_lon, max_lon)

        # Random date in 2023
        random_day_offset = random.randint(0, delta_days)
        event_date = start_date + datetime.timedelta(days=random_day_offset)
        date_str = event_date.isoformat()  # "YYYY-MM-DD"

        record = {
            "event_id": i + 1,
            "event_type": event_type,
            "latitude": round(lat, 4),
            "longitude": round(lon, 4),
            "event_date": date_str,
            "notes": f"Mock data #{i+1}"
        }

        if event_type == "viirs":
            # Give it a VIIRS ID and a random FRP
            record["viirs_id"] = f"viirs_{i+1:03d}"
            record["frp"] = round(random.uniform(0.1, 30.0), 1)
        else:
            # It's battle or explosion; random fatalities
            record["fatalities"] = random.randint(0, 10)

        data.append(record)

    return data

if __name__ == "__main__":
    mock_data = generate_mock_data(100)
    print(json.dumps(mock_data, indent=2))
