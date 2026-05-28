CREATE TABLE food_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  food_name TEXT NOT NULL,
  quantity_g NUMERIC NOT NULL,
  kcal NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE water_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  amount_ml INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE weight_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  weight_kg NUMERIC NOT NULL,
  body_fat_pct NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kcal_goal INTEGER NOT NULL DEFAULT 2000,
  protein_goal INTEGER NOT NULL DEFAULT 150,
  carbs_goal INTEGER NOT NULL DEFAULT 200,
  fat_goal INTEGER NOT NULL DEFAULT 65,
  water_goal_ml INTEGER NOT NULL DEFAULT 2500,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE diet_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_type TEXT NOT NULL,
  food_name TEXT NOT NULL,
  quantity_g NUMERIC NOT NULL,
  kcal NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  notes TEXT,
  substitutions_json TEXT,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE food_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  kcal_per_100g NUMERIC NOT NULL,
  protein_per_100g NUMERIC NOT NULL,
  carbs_per_100g NUMERIC NOT NULL,
  fat_per_100g NUMERIC NOT NULL,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS desabilitado (app pessoal sem auth)
ALTER TABLE food_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE water_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE weight_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE diet_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_cache DISABLE ROW LEVEL SECURITY;
