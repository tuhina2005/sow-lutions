#!/usr/bin/env python3

import json
import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

def map_json_to_table(farm_data):
    """
    Map the nested JSON structure to the existing table columns
    """
    mapped_data = {}
    
    # Map dynamic data
    if 'dynamic' in farm_data:
        dynamic = farm_data['dynamic']
        mapped_data['era5_date'] = dynamic.get('ERA5_date')
        mapped_data['era5_moisture_band'] = dynamic.get('ERA5_moisture_band')
        mapped_data['era5_temp_band'] = dynamic.get('ERA5_temp_band')
        mapped_data['smap_date'] = dynamic.get('SMAP_date')
        mapped_data['smap_sm_band'] = dynamic.get('SMAP_sm_band')
        mapped_data['skin_temperature'] = dynamic.get('skin_temperature')
        mapped_data['sm_surface'] = dynamic.get('sm_surface')
        mapped_data['volumetric_soil_water_layer_2'] = dynamic.get('volumetric_soil_water_layer_2')
    
    # Map location data
    if 'location' in farm_data:
        location = farm_data['location']
        mapped_data['buffer_m'] = location.get('buffer_m')
        mapped_data['mode'] = location.get('mode')
        
        if 'coordinates' in location:
            coords = location['coordinates']
            mapped_data['lat'] = coords.get('lat')
            mapped_data['lon'] = coords.get('lon')
    
    # Map static data (all the soil properties)
    if 'static' in farm_data:
        static = farm_data['static']
        
        # All the bdod columns
        mapped_data['bdod_0to5cm'] = static.get('bdod_0to5cm')
        mapped_data['bdod_100to200cm'] = static.get('bdod_100to200cm')
        mapped_data['bdod_15to30cm'] = static.get('bdod_15to30cm')
        mapped_data['bdod_30to60cm'] = static.get('bdod_30to60cm')
        mapped_data['bdod_5to15cm'] = static.get('bdod_5to15cm')
        mapped_data['bdod_60to100cm'] = static.get('bdod_60to100cm')
        
        # All the cec columns
        mapped_data['cec_0to5cm'] = static.get('cec_0to5cm')
        mapped_data['cec_100to200cm'] = static.get('cec_100to200cm')
        mapped_data['cec_15to30cm'] = static.get('cec_15to30cm')
        mapped_data['cec_30to60cm'] = static.get('cec_30to60cm')
        mapped_data['cec_5to15cm'] = static.get('cec_5to15cm')
        mapped_data['cec_60to100cm'] = static.get('cec_60to100cm')
        
        # All the clay columns
        mapped_data['clay_0to5cm'] = static.get('clay_0to5cm')
        mapped_data['clay_100to200cm'] = static.get('clay_100to200cm')
        mapped_data['clay_15to30cm'] = static.get('clay_15to30cm')
        mapped_data['clay_30to60cm'] = static.get('clay_30to60cm')
        mapped_data['clay_5to15cm'] = static.get('clay_5to15cm')
        mapped_data['clay_60to100cm'] = static.get('clay_60to100cm')
        
        # All the phh2o columns
        mapped_data['phh2o_0to5cm'] = static.get('phh2o_0to5cm')
        mapped_data['phh2o_100to200cm'] = static.get('phh2o_100to200cm')
        mapped_data['phh2o_15to30cm'] = static.get('phh2o_15to30cm')
        mapped_data['phh2o_30to60cm'] = static.get('phh2o_30to60cm')
        mapped_data['phh2o_5to15cm'] = static.get('phh2o_5to15cm')
        mapped_data['phh2o_60to100cm'] = static.get('phh2o_60to100cm')
        
        # All the sand columns
        mapped_data['sand_0to5cm'] = static.get('sand_0to5cm')
        mapped_data['sand_100to200cm'] = static.get('sand_100to200cm')
        mapped_data['sand_15to30cm'] = static.get('sand_15to30cm')
        mapped_data['sand_30to60cm'] = static.get('sand_30to60cm')
        mapped_data['sand_5to15cm'] = static.get('sand_5to15cm')
        mapped_data['sand_60to100cm'] = static.get('sand_60to100cm')
        
        # All the silt columns
        mapped_data['silt_0to5cm'] = static.get('silt_0to5cm')
        mapped_data['silt_100to200cm'] = static.get('silt_100to200cm')
        mapped_data['silt_15to30cm'] = static.get('silt_15to30cm')
        mapped_data['silt_30to60cm'] = static.get('silt_30to60cm')
        mapped_data['silt_5to15cm'] = static.get('silt_5to15cm')
        mapped_data['silt_60to100cm'] = static.get('silt_60to100cm')
        
        # All the soc columns
        mapped_data['soc_0to5cm'] = static.get('soc_0to5cm')
        mapped_data['soc_100to200cm'] = static.get('soc_100to200cm')
        mapped_data['soc_15to30cm'] = static.get('soc_15to30cm')
        mapped_data['soc_30to60cm'] = static.get('soc_30to60cm')
        mapped_data['soc_5to15cm'] = static.get('soc_5to15cm')
        mapped_data['soc_60to100cm'] = static.get('soc_60to100cm')
    
    # Remove any None values
    mapped_data = {k: v for k, v in mapped_data.items() if v is not None}
    
    return mapped_data

def main():
    # Get environment variables
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Error: Missing environment variables")
        print("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)
    
    # Get file path from command line argument or use default
    file_path = sys.argv[1] if len(sys.argv) > 1 else "soil_data_results.json"
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"❌ Error: File '{file_path}' not found.")
        print(f"📝 Current directory: {os.getcwd()}")
        print("📂 Files in current directory:")
        for file in os.listdir('.'):
            print(f"   - {file}")
        sys.exit(1)
    
    # Read and parse JSON file
    try:
        with open(file_path, 'r') as f:
            farm_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        sys.exit(1)
    
    print("🔍 Original nested data structure:")
    print(json.dumps(farm_data, indent=2))
    
    # Map the data to table columns
    mapped_data = map_json_to_table(farm_data)
    
    print(f"\n📊 Mapped data for your existing table ({len(mapped_data)} fields):")
    print(json.dumps(mapped_data, indent=2))
    
    # Create Supabase client
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
    except Exception as e:
        print(f"❌ Error creating Supabase client: {e}")
        sys.exit(1)
    
    print(f"\n🚀 Attempting to insert {len(mapped_data)} fields into soil_data table...")
    
    # Insert data
    try:
        result = supabase.table("soil_data").insert(mapped_data).execute()
        print("✅ Successfully inserted data!")
        if result.data:
            row_id = result.data[0].get('id', 'N/A')
            print(f"📝 Inserted row with ID: {row_id}")
            print(f"🌍 Location: lat={mapped_data.get('lat')}, lon={mapped_data.get('lon')}")
            print(f"📅 ERA5 Date: {mapped_data.get('era5_date')}")
            print(f"📅 SMAP Date: {mapped_data.get('smap_date')}")
    except Exception as e:
        print(f"❌ Error inserting data: {e}")
        print("\n💡 Troubleshooting tips:")
        print("1. Verify your service role key has INSERT permissions")
        print("2. Check if Row Level Security (RLS) is blocking the insert")
        print("3. Make sure date fields are in correct format (YYYY-MM-DD)")
        sys.exit(1)

if __name__ == "__main__":
    main()
