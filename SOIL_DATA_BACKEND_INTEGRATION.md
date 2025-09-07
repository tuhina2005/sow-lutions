# Soil Data Processing Backend Integration

This document explains how to use the new backend server that integrates the FarmDataEntry form with the soil parameter script.

## Overview

The backend server provides an API endpoint that:
1. Receives farm data (coordinates, NPK values, location) from the frontend
2. Executes the Python soil parameter script with the provided coordinates
3. Automatically runs the database insertion script to store results
4. Returns processed soil data including static and dynamic properties

## Architecture

```
Frontend (FarmDataEntry.tsx) 
    ↓ HTTP POST /api/soil-data/process
Backend Server (Express.js)
    ↓ Spawns Python process
Python Script (soil_param_script.py)
    ↓ Uses Google Earth Engine
Soil Data Results (JSON)
    ↓ Automatically runs insert_farm_info.py
Database Insertion (Supabase)
    ↓ Maps JSON to table columns
Soil Data Stored in Database
    ↓ Returns to Frontend
Frontend displays results
```

## Setup Instructions

### 1. Install Dependencies

Run the setup script:
```bash
./setup_backend.sh
```

Or manually:
```bash
# Install Python dependencies (using virtual environment)
python3 -m venv venv
source venv/bin/activate
pip install earthengine-api supabase

# Install Node.js dependencies
npm install
```

### 2. Configure Earth Engine

Make sure Google Earth Engine is authenticated:
```bash
earthengine authenticate
```

Update the project ID in `src/services/soil_param_script.py`:
```python
ee.Initialize(project='your-actual-project-id')
```

### 3. Configure Database (Optional)

For automatic database insertion, set up environment variables:
```bash
# Create .env file
echo "SUPABASE_URL=your_supabase_url" >> .env
echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" >> .env
```

**Note**: Database insertion is optional. If not configured, soil data processing will still work and return results to the frontend.

### 4. Start the Servers

**Terminal 1 - Backend Server:**
```bash
npm run server
```
Server runs on: http://localhost:3000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

## API Endpoints

### POST /api/soil-data/process

Processes soil data for given coordinates and NPK values.

**Request Body:**
```json
{
  "coordinates": {
    "lat": 31.583,
    "lon": 75.983
  },
  "npk": {
    "nitrogen": 120,
    "phosphorus": 80,
    "potassium": 150
  },
  "location": {
    "state": "Punjab",
    "district": "Ludhiana",
    "tehsil": "Ludhiana East"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Soil data processed successfully",
  "data": {
    "soilData": {
      "static": { /* static soil properties */ },
      "dynamic": { /* dynamic soil data */ },
      "location": { /* location info */ }
    },
    "request": { /* original request data */ },
    "metadata": {
      "processingTime": 15000,
      "timestamp": "2024-01-05T10:30:00.000Z",
      "scriptVersion": "1.0"
    }
  },
  "processingTime": 15000
}
```

### GET /api/soil-data/status

Check if the soil data processing service is running.

**Response:**
```json
{
  "success": true,
  "message": "Soil data processing service is running",
  "timestamp": "2024-01-05T10:30:00.000Z",
  "version": "1.0"
}
```

## Usage

1. Open the Farm Data Entry page in your browser
2. Select district and tehsil from dropdowns
3. Enter NPK values (nitrogen, phosphorus, potassium)
4. Click "Submit Farm Data"
5. Wait for processing (may take 30-60 seconds)
6. View results displayed below the form

## Features

- **Real-time Processing**: Coordinates are fetched from OpenStreetMap Nominatim API
- **Earth Engine Integration**: Uses Google Earth Engine for soil data analysis
- **Comprehensive Results**: Returns both static and dynamic soil properties
- **Error Handling**: Proper error messages and timeout handling
- **Progress Indication**: Loading states and processing time display
- **Results Display**: Formatted display of soil data with collapsible raw data

## File Structure

```
src/
├── server/
│   ├── services/
│   │   └── soilDataProcessor.ts    # Main processing service
│   ├── routes/
│   │   └── soilData.ts             # API routes
│   └── index.ts                    # Server entry point
├── services/
│   └── soil_param_script.py        # Python Earth Engine script
└── pages/
    └── FarmDataEntry.tsx           # Updated frontend form
```

## Troubleshooting

### Common Issues

1. **Earth Engine Authentication Error**
   - Run: `earthengine authenticate`
   - Check project ID in soil_param_script.py

2. **Python Script Execution Error**
   - Ensure Python 3 is installed
   - Check earthengine-api is installed: `pip3 install earthengine-api`

3. **Backend Server Not Starting**
   - Check if port 3000 is available
   - Install dependencies: `npm install`

4. **Frontend Can't Connect to Backend**
   - Ensure backend is running on port 3000
   - Check CORS configuration in server config

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=soil-processor npm run server
```

## Performance Notes

- Processing time: 30-60 seconds (depends on Earth Engine API response)
- Timeout: 5 minutes maximum
- Buffer radius: 2000 meters around coordinates
- Scale: 250m for static data, 10km for dynamic data

## Security Considerations

- Input validation on all API endpoints
- Temporary file cleanup after processing
- Error message sanitization
- CORS configuration for frontend access only
