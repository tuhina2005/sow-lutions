/*
  # Agricultural Knowledge Base Schema
  
  This migration creates tables to store domain-specific agricultural knowledge
  that will be used to provide context to the AI chatbot for more accurate
  and domain-specific responses.
*/

-- Agricultural Knowledge Categories
CREATE TABLE agricultural_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES agricultural_categories(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agricultural_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agricultural categories"
  ON agricultural_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Agricultural Knowledge Base
CREATE TABLE agricultural_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  summary text,
  category_id uuid REFERENCES agricultural_categories(id) NOT NULL,
  tags text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  region text, -- e.g., 'India', 'Tamil Nadu', 'Global'
  crop_type text, -- e.g., 'Rice', 'Wheat', 'Cotton'
  season text, -- e.g., 'Kharif', 'Rabi', 'Summer'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE agricultural_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agricultural knowledge"
  ON agricultural_knowledge
  FOR SELECT
  TO authenticated
  USING (true);

-- Agricultural FAQs
CREATE TABLE agricultural_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category_id uuid REFERENCES agricultural_categories(id),
  tags text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  region text,
  crop_type text,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE agricultural_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agricultural FAQs"
  ON agricultural_faqs
  FOR SELECT
  TO authenticated
  USING (true);

-- Agricultural Best Practices
CREATE TABLE agricultural_practices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_name text NOT NULL,
  description text NOT NULL,
  steps text[] DEFAULT '{}',
  benefits text[] DEFAULT '{}',
  requirements text[] DEFAULT '{}',
  category_id uuid REFERENCES agricultural_categories(id),
  crop_type text,
  season text,
  region text,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tags text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE agricultural_practices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agricultural practices"
  ON agricultural_practices
  FOR SELECT
  TO authenticated
  USING (true);

-- Chat Context Log (to track what context was used for responses)
CREATE TABLE chat_context_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_query text NOT NULL,
  context_used text[] DEFAULT '{}',
  response_generated text,
  category_matched text,
  confidence_score numeric(3,2),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_context_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat context log"
  ON chat_context_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default agricultural categories
INSERT INTO agricultural_categories (name, description, slug) VALUES
  ('Crop Management', 'General crop cultivation and management practices', 'crop-management'),
  ('Soil Health', 'Soil quality, fertility, and improvement techniques', 'soil-health'),
  ('Water Management', 'Irrigation, water conservation, and drainage', 'water-management'),
  ('Pest Control', 'Pest identification, prevention, and control methods', 'pest-control'),
  ('Disease Management', 'Plant disease identification and treatment', 'disease-management'),
  ('Fertilizer & Nutrients', 'Fertilizer application and nutrient management', 'fertilizer-nutrients'),
  ('Harvesting & Storage', 'Harvesting techniques and storage methods', 'harvesting-storage'),
  ('Market & Economics', 'Agricultural economics and market information', 'market-economics'),
  ('Technology & Innovation', 'Modern agricultural technology and innovations', 'technology-innovation'),
  ('Climate & Weather', 'Weather patterns and climate adaptation', 'climate-weather');

-- Insert sample agricultural knowledge
INSERT INTO agricultural_knowledge (title, content, summary, category_id, tags, keywords, difficulty_level, region, crop_type) VALUES
  (
    'Rice Cultivation in Tamil Nadu',
    'Rice is the staple food crop of Tamil Nadu, grown in three seasons: Kuruvai (June-September), Samba (August-January), and Thaladi (September-February). The state has favorable conditions with fertile delta regions and adequate water resources. Key practices include proper land preparation, seed treatment, transplanting, water management, and integrated pest management.',
    'Comprehensive guide to rice cultivation practices in Tamil Nadu covering all three seasons and key management practices.',
    (SELECT id FROM agricultural_categories WHERE slug = 'crop-management'),
    ARRAY['rice', 'tamil-nadu', 'cultivation', 'seasons'],
    ARRAY['rice cultivation', 'tamil nadu farming', 'kuruvai', 'samba', 'thaladi'],
    'intermediate',
    'Tamil Nadu',
    'Rice'
  ),
  (
    'Soil Testing and Analysis',
    'Regular soil testing is essential for maintaining soil health and optimizing crop yields. Soil tests help determine pH levels, nutrient content, organic matter, and soil structure. Farmers should test their soil every 2-3 years or when changing crops. The process involves collecting representative soil samples from different parts of the field, sending them to agricultural laboratories, and interpreting results to make informed fertilizer decisions.',
    'Importance and process of soil testing for agricultural productivity and soil health management.',
    (SELECT id FROM agricultural_categories WHERE slug = 'soil-health'),
    ARRAY['soil-testing', 'soil-health', 'nutrients', 'ph'],
    ARRAY['soil test', 'soil analysis', 'soil health', 'nutrient management'],
    'beginner',
    'India',
    NULL
  ),
  (
    'Drip Irrigation System',
    'Drip irrigation is an efficient water management technique that delivers water directly to plant roots through a network of pipes, tubes, and emitters. It reduces water wastage by 30-50% compared to traditional methods and improves crop yields by 20-30%. The system consists of main lines, sub-main lines, lateral lines, and emitters. Regular maintenance includes cleaning filters, checking emitters, and monitoring water pressure.',
    'Complete guide to drip irrigation system installation, benefits, and maintenance for efficient water management.',
    (SELECT id FROM agricultural_categories WHERE slug = 'water-management'),
    ARRAY['drip-irrigation', 'water-management', 'efficiency'],
    ARRAY['drip irrigation', 'water conservation', 'irrigation system', 'water efficiency'],
    'intermediate',
    'India',
    NULL
  );

-- Insert sample FAQs
INSERT INTO agricultural_faqs (question, answer, category_id, tags, keywords, region, crop_type, difficulty_level) VALUES
  (
    'What is the best time to plant rice in Tamil Nadu?',
    'Rice can be planted in Tamil Nadu during three seasons: Kuruvai (June-September), Samba (August-January), and Thaladi (September-February). The best time depends on water availability and local conditions. Kuruvai is ideal when there is good rainfall, while Samba is preferred for long-duration varieties.',
    (SELECT id FROM agricultural_categories WHERE slug = 'crop-management'),
    ARRAY['rice', 'planting', 'tamil-nadu', 'seasons'],
    ARRAY['rice planting', 'tamil nadu rice', 'planting time', 'rice seasons'],
    'Tamil Nadu',
    'Rice',
    'beginner'
  ),
  (
    'How often should I test my soil?',
    'Soil should be tested every 2-3 years or whenever you change crops. Regular testing helps maintain soil health and optimize fertilizer use. Test before the growing season to allow time for any necessary soil amendments.',
    (SELECT id FROM agricultural_categories WHERE slug = 'soil-health'),
    ARRAY['soil-testing', 'frequency', 'soil-health'],
    ARRAY['soil test frequency', 'soil testing', 'soil health'],
    'India',
    NULL,
    'beginner'
  ),
  (
    'What are the benefits of drip irrigation?',
    'Drip irrigation offers several benefits: 30-50% water savings, 20-30% higher crop yields, reduced weed growth, lower labor costs, precise nutrient application, and suitability for various soil types and terrains.',
    (SELECT id FROM agricultural_categories WHERE slug = 'water-management'),
    ARRAY['drip-irrigation', 'benefits', 'water-saving'],
    ARRAY['drip irrigation benefits', 'water saving', 'irrigation advantages'],
    'India',
    NULL,
    'beginner'
  );

-- Insert sample agricultural practices
INSERT INTO agricultural_practices (practice_name, description, steps, benefits, requirements, category_id, crop_type, season, region, difficulty_level, tags, keywords) VALUES
  (
    'Integrated Pest Management (IPM)',
    'IPM is an ecosystem-based strategy that focuses on long-term prevention of pests through a combination of techniques such as biological control, habitat manipulation, modification of cultural practices, and use of resistant varieties.',
    ARRAY['Monitor pest populations regularly', 'Use biological control agents', 'Implement cultural practices', 'Apply chemical control only when necessary', 'Evaluate and adjust strategies'],
    ARRAY['Reduces pesticide use', 'Maintains ecological balance', 'Cost-effective long-term', 'Improves soil health', 'Reduces pest resistance'],
    ARRAY['Regular monitoring equipment', 'Knowledge of pest life cycles', 'Access to biological control agents', 'Proper timing of interventions'],
    (SELECT id FROM agricultural_categories WHERE slug = 'pest-control'),
    NULL,
    NULL,
    'India',
    'intermediate',
    ARRAY['ipm', 'pest-management', 'sustainable'],
    ARRAY['integrated pest management', 'pest control', 'sustainable farming']
  ),
  (
    'Crop Rotation',
    'Crop rotation is the practice of growing different crops in the same area in sequential seasons to improve soil health, reduce pest and disease pressure, and increase crop yields.',
    ARRAY['Plan rotation sequence', 'Choose complementary crops', 'Consider nutrient requirements', 'Time planting and harvesting', 'Monitor soil health'],
    ARRAY['Improves soil fertility', 'Reduces pest pressure', 'Breaks disease cycles', 'Increases biodiversity', 'Reduces fertilizer needs'],
    ARRAY['Knowledge of crop compatibility', 'Proper timing', 'Adequate land area', 'Market demand for crops'],
    (SELECT id FROM agricultural_categories WHERE slug = 'crop-management'),
    NULL,
    NULL,
    'India',
    'beginner',
    ARRAY['crop-rotation', 'soil-health', 'sustainable'],
    ARRAY['crop rotation', 'soil fertility', 'sustainable agriculture']
  );

-- Create indexes for better performance
CREATE INDEX idx_agricultural_knowledge_category ON agricultural_knowledge(category_id);
CREATE INDEX idx_agricultural_knowledge_tags ON agricultural_knowledge USING GIN(tags);
CREATE INDEX idx_agricultural_knowledge_keywords ON agricultural_knowledge USING GIN(keywords);
CREATE INDEX idx_agricultural_knowledge_crop_type ON agricultural_knowledge(crop_type);
CREATE INDEX idx_agricultural_knowledge_region ON agricultural_knowledge(region);

CREATE INDEX idx_agricultural_faqs_category ON agricultural_faqs(category_id);
CREATE INDEX idx_agricultural_faqs_tags ON agricultural_faqs USING GIN(tags);
CREATE INDEX idx_agricultural_faqs_keywords ON agricultural_faqs USING GIN(keywords);

CREATE INDEX idx_agricultural_practices_category ON agricultural_practices(category_id);
CREATE INDEX idx_agricultural_practices_tags ON agricultural_practices USING GIN(tags);
CREATE INDEX idx_agricultural_practices_keywords ON agricultural_practices USING GIN(keywords);
