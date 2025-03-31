from fastapi import FastAPI, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from db_connect import DBConnection
from aws_secret_mgt import get_db_credentials  
from fastapi.middleware.cors import CORSMiddleware
from openai_query import openai_query
from clean_query import clean_query
from validate_query import validate_query
from execute_query import execute_query
from decimal import Decimal
from datetime import datetime, timedelta

# Initialize FastAPI
app = FastAPI()

# CORS Settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://cm-react-app.s3-website.us-east-2.amazonaws.com",  # Your S3 website
        "https://cm-react-app.s3-website.us-east-2.amazonaws.com",  # HTTPS version
        "http://localhost:5173",  # Local development
        "http://127.0.0.1:5173",  # Local development alternative
        "http://18.218.227.30:8000",  # Your EC2 instance
        "*"  # Temporarily allow all origins for testing
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly list allowed methods
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"],  # Expose all headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Ensure we retrieve DB credentials on startup
DB_CREDENTIALS = get_db_credentials()
if not DB_CREDENTIALS:
    raise RuntimeError("❌ Failed to retrieve database credentials.")

# Natural Language Query request model
class QueryRequest(BaseModel):
    query: str

# Event model for response clarity
class Event(BaseModel):
    event_id_cnty: str
    event_date: str
    year: int
    time_precision: Optional[int] = None
    disorder_type: Optional[str] = None
    event_type: str
    country: str
    admin1: Optional[str] = None
    admin2: Optional[str] = None
    admin3: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geo_precision: Optional[int] = None
    source: Optional[str] = None
    source_scale: Optional[str] = None
    notes: Optional[str] = None
    fatalities: Optional[int] = None

# Utility function for decimal conversion
def convert_decimal(value):
    return float(value) if isinstance(value, Decimal) else value

# Get default date range (last 2 years)
def get_default_date_range():
    end_date = datetime.now()
    start_date = end_date - timedelta(days=730)  # Approximately 2 years
    return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")

# Battles endpoint with date filtering
@app.get("/battles", response_model=List[Event])
def get_battles(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    limit: Optional[int] = Query(100000, description="Maximum number of records to return")
):
    # Set default date range if not provided
    if not start_date or not end_date:
        default_start, default_end = get_default_date_range()
        start_date = start_date or default_start
        end_date = end_date or default_end
    
    print(f"Fetching battles from {start_date} to {end_date}")
    
    try:
        # Build query with date filter
        query = f"""
            SELECT event_id_cnty, event_date::TEXT, year, time_precision, disorder_type, event_type,
                   country, admin1, admin2, admin3, location, latitude, longitude, geo_precision,
                   source, source_scale, notes, fatalities
            FROM battles
            WHERE event_date >= '{start_date}' AND event_date <= '{end_date}'
            ORDER BY event_date DESC
            LIMIT {limit};
        """

        df_result = execute_query(query)
        result = df_result.to_dict(orient="records") if not df_result.empty else []
        print(f"Retrieved {len(result)} battles")
        return result
    
    except Exception as e:
        print(f"Error fetching battles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database fetch error: {str(e)}")

# Explosions endpoint with date filtering
@app.get("/explosions", response_model=List[Event])
def get_explosions(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    limit: Optional[int] = Query(100000, description="Maximum number of records to return")
):
    # Set default date range if not provided
    if not start_date or not end_date:
        default_start, default_end = get_default_date_range()
        start_date = start_date or default_start
        end_date = end_date or default_end
    
    print(f"Fetching explosions from {start_date} to {end_date}")
    
    try:
        # Build query with date filter
        query = f"""
            SELECT event_id_cnty, event_date::TEXT, year, time_precision, disorder_type, event_type,
                   country, admin1, admin2, admin3, location, latitude, longitude, geo_precision,
                   source, source_scale, notes, fatalities
            FROM explosions
            WHERE event_date >= '{start_date}' AND event_date <= '{end_date}'
            ORDER BY event_date DESC
            LIMIT {limit};
        """

        df_result = execute_query(query)
        result = df_result.to_dict(orient="records") if not df_result.empty else []
        print(f"Retrieved {len(result)} explosions")
        return result
    
    except Exception as e:
        print(f"Error fetching explosions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database fetch error: {str(e)}")

# VIIRS data endpoint with date filtering
@app.get("/viirs")
def get_viirs_data(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    limit: Optional[int] = Query(50000, description="Maximum number of records to return")
):
    # Set default date range if not provided
    if not start_date or not end_date:
        default_start, default_end = get_default_date_range()
        start_date = start_date or default_start
        end_date = end_date or default_end
    
    print(f"Fetching VIIRS data from {start_date} to {end_date}")
    
    try:
        # Build query with date filter
        query = f"""
            SELECT latitude, longitude, bright_ti4, bright_ti5, frp, acq_time, 
                   satellite, instrument, confidence, daynight, event_date::TEXT, 
                   created_at::TEXT
            FROM viirs_data
            WHERE event_date >= '{start_date}' AND event_date <= '{end_date}'
            ORDER BY event_date DESC, created_at DESC
            LIMIT {limit};
        """

        df_result = execute_query(query)
        if df_result.empty:
            print("No VIIRS data found for the date range")
            return []

        result = df_result.to_dict(orient="records")
        print(f"Retrieved {len(result)} VIIRS records")
        return result

    except Exception as e:
        print(f"Error fetching VIIRS data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database fetch error: {str(e)}")

# Natural Language Query endpoint
@app.post("/nlq")
def process_nlq(request: QueryRequest):
    try:
        print(f"📝 Received NLQ: {request.query}")

        generated_sql = openai_query(request.query)
        print(f"🔍 Generated SQL: {generated_sql}")

        cleaned_sql = clean_query(generated_sql)
        print(f"🧹 Cleaned SQL: {cleaned_sql}")

        validate_query(cleaned_sql)

        df_result = execute_query(cleaned_sql)
        query_result = df_result.to_dict(orient="records") if not df_result.empty else []

        print(f"📡 NLQ Query Result: {query_result}")

        return query_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLQ processing error: {str(e)}") 