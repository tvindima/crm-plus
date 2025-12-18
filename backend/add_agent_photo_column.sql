-- Adicionar coluna photo à tabela agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS photo VARCHAR(500);

-- Verificar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agents'
ORDER BY ordinal_position;
