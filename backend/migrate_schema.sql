-- Add missing columns to properties table if they don't exist
DO $$ 
BEGIN
    -- Add business_type if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='properties' AND column_name='business_type'
    ) THEN
        ALTER TABLE properties ADD COLUMN business_type VARCHAR;
    END IF;

    -- Add property_type if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='properties' AND column_name='property_type'
    ) THEN
        ALTER TABLE properties ADD COLUMN property_type VARCHAR;
    END IF;

    -- Add typology if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='properties' AND column_name='typology'
    ) THEN
        ALTER TABLE properties ADD COLUMN typology VARCHAR;
    END IF;

    -- Add observations if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='properties' AND column_name='observations'
    ) THEN
        ALTER TABLE properties ADD COLUMN observations TEXT;
    END IF;
END $$;
