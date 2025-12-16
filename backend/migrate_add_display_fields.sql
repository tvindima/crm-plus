-- Adicionar novos campos na tabela properties do Railway PostgreSQL
-- Execute este script diretamente no Railway Dashboard > PostgreSQL > Query

ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS is_published INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_featured INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS latitude REAL,
  ADD COLUMN IF NOT EXISTS longitude REAL,
  ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
  ADD COLUMN IF NOT EXISTS bathrooms INTEGER,
  ADD COLUMN IF NOT EXISTS parking_spaces INTEGER;

-- Verificar as colunas adicionadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;
