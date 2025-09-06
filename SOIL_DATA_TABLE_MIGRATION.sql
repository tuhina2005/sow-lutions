-- Create soil_data table for AI chatbot context
-- This table will be the primary source of context for the AI agent

CREATE TABLE IF NOT EXISTS soil_data (
    id SERIAL PRIMARY KEY,
    location TEXT NOT NULL,
    state TEXT,
    district TEXT,
    soil_type TEXT NOT NULL,
    ph_level FLOAT NOT NULL,
    organic_carbon FLOAT,
    nitrogen_content FLOAT,
    phosphorus_content FLOAT,
    potassium_content FLOAT,
    soil_depth FLOAT,
    texture TEXT,
    drainage_type TEXT,
    water_holding_capacity FLOAT,
    bulk_density FLOAT,
    cation_exchange_capacity FLOAT,
    electrical_conductivity FLOAT,
    temperature FLOAT,
    rainfall_annual FLOAT,
    humidity FLOAT,
    elevation FLOAT,
    latitude FLOAT,
    longitude FLOAT,
    suitable_crops TEXT[],
    recommended_fertilizers TEXT[],
    irrigation_requirements TEXT,
    soil_health_score FLOAT,
    improvement_recommendations TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample soil data
INSERT INTO soil_data (
    location, state, district, soil_type, ph_level, organic_carbon,
    nitrogen_content, phosphorus_content, potassium_content, soil_depth,
    texture, drainage_type, water_holding_capacity, bulk_density,
    cation_exchange_capacity, electrical_conductivity, temperature,
    rainfall_annual, humidity, elevation, latitude, longitude,
    suitable_crops, recommended_fertilizers, irrigation_requirements,
    soil_health_score, improvement_recommendations
) VALUES 
(
    'Punjab, India', 'Punjab', 'Ludhiana', 'Sandy Loam', 4.6, 1.7,
    120.5, 45.2, 180.3, 45.0, 'Sandy Loam', 'Moderate', 25.5,
    1.35, 15.2, 0.8, 28.0, 650.0, 65.0, 250.0, 30.9, 75.8,
    ARRAY['Cotton', 'Potato', 'Wheat', 'Maize'],
    ARRAY['NPK 20:20:20', 'Urea', 'DAP', 'Potash'],
    'Drip irrigation recommended',
    6.5,
    ARRAY['Add lime to increase pH', 'Increase organic matter', 'Improve drainage']
),
(
    'Maharashtra, India', 'Maharashtra', 'Nagpur', 'Black Cotton', 7.2, 2.1,
    150.8, 60.5, 220.7, 60.0, 'Clay', 'Poor', 35.2,
    1.25, 18.5, 1.2, 32.0, 800.0, 70.0, 300.0, 21.1, 79.0,
    ARRAY['Cotton', 'Sugarcane', 'Soybean', 'Wheat'],
    ARRAY['NPK 15:15:15', 'Compost', 'Vermicompost'],
    'Flood irrigation suitable',
    7.8,
    ARRAY['Improve drainage', 'Add gypsum', 'Crop rotation']
),
(
    'Tamil Nadu, India', 'Tamil Nadu', 'Coimbatore', 'Red Soil', 6.8, 1.9,
    110.2, 40.8, 160.5, 40.0, 'Sandy Clay Loam', 'Good', 28.0,
    1.40, 16.8, 0.9, 30.0, 900.0, 75.0, 400.0, 11.0, 77.0,
    ARRAY['Rice', 'Cotton', 'Sugarcane', 'Groundnut'],
    ARRAY['NPK 12:12:12', 'Farmyard manure', 'Green manure'],
    'Sprinkler irrigation',
    7.2,
    ARRAY['Add organic matter', 'Use cover crops', 'Conservation tillage']
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_soil_data_location ON soil_data(location);
CREATE INDEX IF NOT EXISTS idx_soil_data_soil_type ON soil_data(soil_type);
CREATE INDEX IF NOT EXISTS idx_soil_data_ph ON soil_data(ph_level);
CREATE INDEX IF NOT EXISTS idx_soil_data_crops ON soil_data USING GIN(suitable_crops);

-- Add comments to table
COMMENT ON TABLE soil_data IS 'Primary soil data table for AI chatbot context';
COMMENT ON COLUMN soil_data.ph_level IS 'Soil pH level (4.0-8.5)';
COMMENT ON COLUMN soil_data.organic_carbon IS 'Organic carbon percentage (0-5%)';
COMMENT ON COLUMN soil_data.soil_health_score IS 'Overall soil health score (1-10)';
COMMENT ON COLUMN soil_data.suitable_crops IS 'Array of crops suitable for this soil';
COMMENT ON COLUMN soil_data.recommended_fertilizers IS 'Array of recommended fertilizers';
COMMENT ON COLUMN soil_data.improvement_recommendations IS 'Array of soil improvement suggestions';
