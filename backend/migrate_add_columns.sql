-- Add missing columns to properties table in PostgreSQL
-- Run this on Railway database if columns don't exist

-- Add business_type column (venda/arrendamento)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS business_type VARCHAR;

-- Add property_type column (apartamento/moradia/etc)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type VARCHAR;

-- Add typology column (T1, T2, T3, etc)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS typology VARCHAR;

-- Add description column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS description TEXT;

-- Add observations column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS observations TEXT;

-- Add usable_area column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS usable_area FLOAT;

-- Add land_area column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS land_area FLOAT;

-- Add municipality column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS municipality VARCHAR;

-- Add parish column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parish VARCHAR;

-- Add condition column (novo/usado/renovado)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS condition VARCHAR;

-- Add energy_certificate column (A+, A, B, C, D, E, F, G)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS energy_certificate VARCHAR;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;
