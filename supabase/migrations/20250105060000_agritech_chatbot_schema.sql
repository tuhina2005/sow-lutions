/*
  # MVP Agritech Chatbot Database Schema
  
  This migration creates the complete database schema for the agritech chatbot
  including PostgreSQL tables, pgvector extension, and sample data.
*/

-- Enable pgvector extension for vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Crops table for structured crop information
CREATE TABLE Crops (
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

-- Soil Properties table
CREATE TABLE Soil_Properties (
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

-- Users table
CREATE TABLE Users (
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

-- User Farms table
CREATE TABLE User_Farms (
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

-- User History table for chat logs
CREATE TABLE User_History (
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

-- Vector Documents table for unstructured knowledge
CREATE TABLE Vector_Documents (
    doc_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'agricultural_knowledge',
    language TEXT DEFAULT 'en',
    region TEXT,
    crop_category TEXT,
    embedding vector(1536), -- OpenAI embedding dimension
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Weather Cache table
CREATE TABLE Weather_Cache (
    cache_id SERIAL PRIMARY KEY,
    location TEXT NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    weather_data JSONB NOT NULL,
    cached_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Agricultural Recommendations table
CREATE TABLE Agricultural_Recommendations (
    rec_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    farm_id INT REFERENCES User_Farms(farm_id),
    crop_id INT REFERENCES Crops(crop_id),
    recommendation_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE Crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE Soil_Properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE User_Farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE User_History ENABLE ROW LEVEL SECURITY;
ALTER TABLE Vector_Documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE Weather_Cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE Agricultural_Recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view crops" ON Crops FOR SELECT USING (true);
CREATE POLICY "Anyone can view soil properties" ON Soil_Properties FOR SELECT USING (true);

CREATE POLICY "Users can view own data" ON Users FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own data" ON Users FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own farms" ON User_Farms FOR SELECT USING (user_id IN (SELECT user_id FROM Users WHERE auth.uid()::text = user_id::text));
CREATE POLICY "Users can update own farms" ON User_Farms FOR UPDATE USING (user_id IN (SELECT user_id FROM Users WHERE auth.uid()::text = user_id::text));

CREATE POLICY "Users can view own history" ON User_History FOR SELECT USING (user_id IN (SELECT user_id FROM Users WHERE auth.uid()::text = user_id::text));
CREATE POLICY "Users can insert own history" ON User_History FOR INSERT WITH CHECK (user_id IN (SELECT user_id FROM Users WHERE auth.uid()::text = user_id::text));

CREATE POLICY "Anyone can view vector documents" ON Vector_Documents FOR SELECT USING (true);
CREATE POLICY "Anyone can view weather cache" ON Weather_Cache FOR SELECT USING (true);

CREATE POLICY "Users can view own recommendations" ON Agricultural_Recommendations FOR SELECT USING (user_id IN (SELECT user_id FROM Users WHERE auth.uid()::text = user_id::text));

-- Indexes for performance
CREATE INDEX idx_crops_soil_type ON Crops(soil_type);
CREATE INDEX idx_crops_season ON Crops(season);
CREATE INDEX idx_crops_ph_range ON Crops(ph_min, ph_max);
CREATE INDEX idx_crops_temp_range ON Crops(temp_min, temp_max);

CREATE INDEX idx_user_farms_user_id ON User_Farms(user_id);
CREATE INDEX idx_user_farms_location ON User_Farms(latitude, longitude);

CREATE INDEX idx_user_history_user_id ON User_History(user_id);
CREATE INDEX idx_user_history_timestamp ON User_History(timestamp);
CREATE INDEX idx_user_history_session ON User_History(session_id);

CREATE INDEX idx_vector_docs_embedding ON Vector_Documents USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_vector_docs_content_type ON Vector_Documents(content_type);
CREATE INDEX idx_vector_docs_language ON Vector_Documents(language);

CREATE INDEX idx_weather_cache_location ON Weather_Cache(location);
CREATE INDEX idx_weather_cache_expires ON Weather_Cache(expires_at);

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

-- Insert sample vector documents (agricultural knowledge)
INSERT INTO Vector_Documents (title, content, content_type, language, region, crop_category, metadata) VALUES
('Rice Cultivation in North India', 'Rice is the staple food crop of North India, grown primarily in Punjab, Haryana, and Uttar Pradesh. The crop requires clay soil with good water retention capacity. Optimal temperature range is 20-35°C with rainfall between 1000-2000mm. Key practices include proper land preparation, transplanting, water management, and integrated pest management. Common pests include brown plant hopper and diseases like blast. Yield can reach 4000 kg/hectare with proper management.', 'agricultural_knowledge', 'en', 'North India', 'Rice', '{"season": "Kharif", "soil_type": "Clay", "irrigation": "High"}'),
('Wheat Farming Techniques', 'Wheat is the main Rabi crop in India, grown in loamy soils with pH 6.0-8.0. It requires moderate irrigation and temperature between 15-25°C. Key management practices include timely sowing, proper fertilization with NPK 100:50:50, weed control, and disease management. Common diseases include rust and pests like aphids. Harvesting should be done at proper moisture content to avoid losses.', 'agricultural_knowledge', 'en', 'India', 'Wheat', '{"season": "Rabi", "soil_type": "Loamy", "irrigation": "Medium"}'),
('Soil Health Management', 'Maintaining soil health is crucial for sustainable agriculture. Key indicators include pH, organic matter content, nutrient availability, and soil structure. Regular soil testing every 2-3 years helps in proper nutrient management. Adding organic matter through compost, green manure, and crop residues improves soil structure and fertility. Avoiding excessive use of chemical fertilizers and pesticides helps maintain soil biodiversity.', 'agricultural_knowledge', 'en', 'India', 'General', '{"topic": "soil_health", "importance": "high"}'),
('Irrigation Water Management', 'Efficient water management is essential for sustainable agriculture. Drip irrigation can save 30-50% water compared to flood irrigation. Scheduling irrigation based on crop water requirements and soil moisture levels optimizes water use. Mulching helps retain soil moisture and reduces evaporation. Rainwater harvesting and water storage systems help during dry periods.', 'agricultural_knowledge', 'en', 'India', 'General', '{"topic": "irrigation", "efficiency": "high"}'),
('Integrated Pest Management', 'IPM combines biological, cultural, and chemical methods to control pests effectively while minimizing environmental impact. Key components include pest monitoring, use of resistant varieties, biological control agents, cultural practices, and judicious use of pesticides. This approach reduces pesticide residues and promotes sustainable agriculture.', 'agricultural_knowledge', 'en', 'India', 'General', '{"topic": "pest_management", "approach": "integrated"}');

-- Create functions for common queries
CREATE OR REPLACE FUNCTION get_crops_by_soil_and_climate(
    p_soil_type TEXT,
    p_ph FLOAT,
    p_rainfall INT,
    p_temp_min FLOAT,
    p_temp_max FLOAT
) RETURNS TABLE (
    crop_id INT,
    crop_name TEXT,
    crop_name_hindi TEXT,
    crop_name_tamil TEXT,
    suitability_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.crop_id,
        c.crop_name,
        c.crop_name_hindi,
        c.crop_name_tamil,
        CASE 
            WHEN c.soil_type = p_soil_type THEN 1.0
            ELSE 0.5
        END +
        CASE 
            WHEN p_ph BETWEEN c.ph_min AND c.ph_max THEN 1.0
            ELSE 0.3
        END +
        CASE 
            WHEN p_rainfall BETWEEN c.rainfall_min AND c.rainfall_max THEN 1.0
            ELSE 0.5
        END +
        CASE 
            WHEN p_temp_min >= c.temp_min AND p_temp_max <= c.temp_max THEN 1.0
            ELSE 0.5
        END as suitability_score
    FROM Crops c
    WHERE 
        (c.soil_type = p_soil_type OR c.soil_type = 'Any') AND
        p_ph BETWEEN c.ph_min AND c.ph_max AND
        p_rainfall BETWEEN c.rainfall_min AND c.rainfall_max AND
        p_temp_min >= c.temp_min AND p_temp_max <= c.temp_max
    ORDER BY suitability_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user context
CREATE OR REPLACE FUNCTION get_user_context(p_user_id INT) RETURNS JSONB AS $$
DECLARE
    user_data JSONB;
    farm_data JSONB;
BEGIN
    SELECT to_jsonb(u.*) INTO user_data
    FROM Users u
    WHERE u.user_id = p_user_id;
    
    SELECT jsonb_agg(to_jsonb(uf.*)) INTO farm_data
    FROM User_Farms uf
    WHERE uf.user_id = p_user_id;
    
    RETURN jsonb_build_object(
        'user', user_data,
        'farms', farm_data
    );
END;
$$ LANGUAGE plpgsql;
