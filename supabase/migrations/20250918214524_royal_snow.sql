/*
  # Create empleados table

  1. New Tables
    - `empleados`
      - `id` (uuid, primary key)
      - `nombre` (text, required)
      - `telefono` (text, optional)
      - `email` (text, optional)
      - `horas_dia` (integer, default 8)
      - `dias_semana` (integer, default 5)
      - `salario_hora` (numeric, default 0)
      - `activo` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `empleados` table
    - Add policy for authenticated users to perform CRUD operations
*/

CREATE TABLE IF NOT EXISTS empleados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  telefono text,
  email text,
  horas_dia integer DEFAULT 8,
  dias_semana integer DEFAULT 5,
  salario_hora numeric DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can perform CRUD operations on empleados"
  ON empleados
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);