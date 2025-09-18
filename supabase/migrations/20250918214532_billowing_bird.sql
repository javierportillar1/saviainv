/*
  # Update menu_items table for inventory system

  1. Changes to existing table
    - Add `inventariocategoria` column (Inventariables/No inventariables)
    - Add `inventariotipo` column (cantidad/gramos)
    - Add `unidadmedida` column (kg/g/mg)
    - Update existing records to set default values

  2. Security
    - Policies already exist for menu_items table
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'inventariocategoria'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN inventariocategoria text DEFAULT 'No inventariables';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'inventariotipo'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN inventariotipo text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'unidadmedida'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN unidadmedida text;
  END IF;
END $$;

-- Update existing records to have default inventory category
UPDATE menu_items 
SET inventariocategoria = 'No inventariables' 
WHERE inventariocategoria IS NULL;