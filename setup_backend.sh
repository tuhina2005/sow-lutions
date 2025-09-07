#!/bin/bash

# Setup script for soil data processing backend
echo "Setting up soil data processing backend..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install earthengine-api supabase

# Check if Earth Engine is authenticated
echo "Checking Earth Engine authentication..."
if ! python3 -c "import ee; ee.Initialize()" 2>/dev/null; then
    echo "Warning: Earth Engine is not authenticated."
    echo "Please run: earthengine authenticate"
    echo "And make sure to set your project ID in the soil_param_script.py"
fi

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "Setup complete!"
echo ""
echo "⚠️  IMPORTANT: Set up environment variables for database integration:"
echo "   Create a .env file with:"
echo "   SUPABASE_URL=your_supabase_url"
echo "   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
echo ""
echo "To start the backend server:"
echo "  npm run server"
echo ""
echo "To start the frontend:"
echo "  npm run dev"
echo ""
echo "Make sure both servers are running:"
echo "  - Backend: http://localhost:3000"
echo "  - Frontend: http://localhost:5173"
echo ""
echo "The system will now:"
echo "  1. Process soil data with Earth Engine"
echo "  2. Automatically insert results into Supabase database"
echo "  3. Return comprehensive soil analysis to frontend"
