/*
  # Create gastos table

  1. New Tables
    - `gastos`
      - `id` (uuid, primary key)
      - `descripcion` (text, required)
      - `monto` (numeric, required)
      - `categoria` (text, required)
      - `fecha` (date, required)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `gastos` table
    - Add policy for authenticated users to perform CRUD operations
*/

CREATE TABLE IF NOT EXISTS gastos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descripcion text NOT NULL,
  monto numeric NOT NULL,
  categoria text NOT NULL,
  fecha date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can perform CRUD operations on gastos"
  ON gastos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);