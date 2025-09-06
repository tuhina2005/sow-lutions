-- Quick Database Fix - Essential Tables Only
-- Run this in Supabase SQL Editor if the full migration fails

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (essential)
CREATE TABLE IF NOT EXISTS Users (
    user_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    location TEXT NOT NULL,
    state TEXT,
    district TEXT,
    preferred_language TEXT DEFAULT 'en',
    farm_size FLOAT,
    farming_experience_years INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Farms table (essential)
CREATE TABLE IF NOT EXISTS User_Farms (
    farm_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    farm_name TEXT,
    soil_type TEXT,
    ph FLOAT,
    organic_carbon FLOAT,
    irrigation_available BOOLEAN DEFAULT FALSE,
    irrigation_type TEXT,
    farm_area FLOAT,
    latitude FLOAT,
    longitude FLOAT,
    elevation FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crops table (essential)
CREATE TABLE IF NOT EXISTS Crops (
    crop_id SERIAL PRIMARY KEY,
    crop_name TEXT NOT NULL,
    crop_name_hindi TEXT,
    crop_name_tamil TEXT,
    soil_type TEXT NOT NULL,
    ph_min FLOAT NOT NULL,
    ph_max FLOAT NOT NULL,
    rainfall_min INT NOT NULL,
    rainfall_max INT NOT NULL,
    temp_min FLOAT NOT NULL,
    temp_max FLOAT NOT NULL,
    irrigation_needs TEXT NOT NULL,
    season TEXT NOT NULL,
    planting_months TEXT[],
    harvesting_months TEXT[],
    fertilizer_needs TEXT,
    pest_management TEXT,
    yield_per_hectare FLOAT,
    market_price_range TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Soil Properties table (essential)
CREATE TABLE IF NOT EXISTS Soil_Properties (
    soil_id SERIAL PRIMARY KEY,
    soil_name TEXT NOT NULL,
    soil_name_hindi TEXT,
    soil_name_tamil TEXT,
    texture TEXT NOT NULL,
    fertility TEXT NOT NULL,
    water_retention TEXT NOT NULL,
    ph_range TEXT,
    organic_matter_content TEXT,
    drainage_capacity TEXT,
    suitable_crops TEXT[],
    improvement_methods TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- User History table (for chat logs)
CREATE TABLE IF NOT EXISTS User_History (
    history_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    session_id TEXT,
    query TEXT NOT NULL,
    query_language TEXT,
    response TEXT NOT NULL,
    response_language TEXT,
    context_used TEXT,
    confidence_score FLOAT,
    processing_time_ms INT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Disable RLS temporarily for testing
ALTER TABLE Users DISABLE ROW LEVEL SECURITY;
ALTER TABLE User_Farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE Crops DISABLE ROW LEVEL SECURITY;
ALTER TABLE Soil_Properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE User_History DISABLE ROW LEVEL SECURITY;

-- Insert sample crops data
INSERT INTO Crops (crop_name, crop_name_hindi, crop_name_tamil, soil_type, ph_min, ph_max, rainfall_min, rainfall_max, temp_min, temp_max, irrigation_needs, season, planting_months, harvesting_months, fertilizer_needs, pest_management, yield_per_hectare, market_price_range) VALUES
('Rice', 'चावल', 'அரிசி', 'Clay', 5.5, 7.5, 1000, 2000, 20, 35, 'High', 'Kharif', ARRAY['June', 'July'], ARRAY['October', 'November'], 'NPK 120:60:60', 'Brown plant hopper, Blast disease', 4000, '₹2000-3000/quintal'),
('Wheat', 'गेहूं', 'கோதுமை', 'Loamy', 6.0, 8.0, 400, 800, 15, 25, 'Medium', 'Rabi', ARRAY['November', 'December'], ARRAY['March', 'April'], 'NPK 100:50:50', 'Aphids, Rust disease', 3500, '₹2500-3500/quintal'),
('Cotton', 'कपास', 'பருத்தி', 'Sandy Loam', 5.8, 8.0, 500, 1000, 20, 40, 'Medium', 'Kharif', ARRAY['May', 'June'], ARRAY['October', 'November'], 'NPK 80:40:40', 'Bollworm, Whitefly', 1500, '₹6000-8000/quintal'),
('Sugarcane', 'गन्ना', 'கரும்பு', 'Clay Loam', 6.0, 7.5, 1000, 1500, 25, 35, 'High', 'Year-round', ARRAY['October', 'November'], ARRAY['December', 'March'], 'NPK 150:75:75', 'Red rot, Borer', 80000, '₹300-350/quintal'),
('Maize', 'मक्का', 'சோளம்', 'Loamy', 5.5, 7.5, 500, 800, 18, 30, 'Medium', 'Kharif', ARRAY['June', 'July'], ARRAY['September', 'October'], 'NPK 100:50:50', 'Stem borer, Leaf blight', 3000, '₹2000-2500/quintal'),
('Tomato', 'टमाटर', 'தக்காளி', 'Loamy', 6.0, 7.0, 600, 1000, 20, 30, 'High', 'Year-round', ARRAY['January', 'February', 'August'], ARRAY['April', 'May', 'November'], 'NPK 120:60:60', 'Fruit borer, Blight', 40000, '₹20-50/kg'),
('Potato', 'आलू', 'உருளைக்கிழங்கு', 'Sandy Loam', 5.0, 6.5, 300, 600, 15, 25, 'Medium', 'Rabi', ARRAY['October', 'November'], ARRAY['February', 'March'], 'NPK 100:50:50', 'Late blight, Aphids', 25000, '₹15-30/kg'),
('Onion', 'प्याज', 'வெங்காயம்', 'Loamy', 6.0, 7.5, 400, 800, 15, 30, 'Medium', 'Rabi', ARRAY['November', 'December'], ARRAY['March', 'April'], 'NPK 80:40:40', 'Thrips, Purple blotch', 20000, '₹30-60/kg');

-- Insert sample soil properties
INSERT INTO Soil_Properties (soil_name, soil_name_hindi, soil_name_tamil, texture, fertility, water_retention, ph_range, organic_matter_content, drainage_capacity, suitable_crops, improvement_methods) VALUES
('Clay Soil', 'चिकनी मिट्टी', 'களிமண் மண்', 'Fine', 'High', 'High', '6.0-8.0', '2-4%', 'Poor', ARRAY['Rice', 'Sugarcane', 'Wheat'], ARRAY['Add sand', 'Improve drainage', 'Add organic matter']),
('Sandy Soil', 'बलुई मिट्टी', 'மணல் மண்', 'Coarse', 'Low', 'Low', '5.5-7.5', '0.5-1.5%', 'Excellent', ARRAY['Cotton', 'Groundnut', 'Maize'], ARRAY['Add clay', 'Add organic matter', 'Mulching']),
('Loamy Soil', 'दोमट मिट्टी', 'வண்டல் மண்', 'Medium', 'Medium', 'Medium', '6.0-7.5', '1-3%', 'Good', ARRAY['Wheat', 'Tomato', 'Potato'], ARRAY['Maintain organic matter', 'Balanced fertilization']),
('Sandy Loam', 'बलुई दोमट', 'மணல் வண்டல்', 'Medium-Fine', 'Medium', 'Medium', '5.8-7.0', '1-2%', 'Good', ARRAY['Cotton', 'Maize', 'Onion'], ARRAY['Add organic matter', 'Mulching', 'Cover crops']),
('Clay Loam', 'चिकनी दोमट', 'களிமண் வண்டல்', 'Fine-Medium', 'High', 'High', '6.0-7.5', '2-4%', 'Moderate', ARRAY['Rice', 'Sugarcane', 'Wheat'], ARRAY['Improve drainage', 'Add sand', 'Deep tillage']);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crops_soil_type ON Crops(soil_type);
CREATE INDEX IF NOT EXISTS idx_crops_season ON Crops(season);
CREATE INDEX IF NOT EXISTS idx_crops_ph_range ON Crops(ph_min, ph_max);
CREATE INDEX IF NOT EXISTS idx_crops_temp_range ON Crops(temp_min, temp_max);
CREATE INDEX IF NOT EXISTS idx_user_farms_user_id ON User_Farms(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON User_History(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_timestamp ON User_History(timestamp);
