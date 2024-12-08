-- Create evaluation_types table
CREATE TABLE public.evaluation_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create evaluations table
CREATE TABLE public.evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    evaluator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    evaluatee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type_id UUID REFERENCES evaluation_types(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create evaluation_criteria table
CREATE TABLE public.evaluation_criteria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    weight NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create evaluation_responses table
CREATE TABLE public.evaluation_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    criteria_id UUID REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 1 AND score <= 5),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE evaluation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_responses ENABLE ROW LEVEL SECURITY;

-- Policies for evaluation_types
CREATE POLICY "evaluation_types_select_policy" ON evaluation_types
    FOR SELECT USING (true);

CREATE POLICY "evaluation_types_insert_policy" ON evaluation_types
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policies for evaluations
CREATE POLICY "evaluations_select_policy" ON evaluations
    FOR SELECT USING (
        auth.uid() = evaluator_id OR 
        auth.uid() = evaluatee_id OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "evaluations_insert_policy" ON evaluations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p1
            WHERE p1.id = auth.uid() AND (
                p1.role = 'admin' OR
                EXISTS (
                    SELECT 1 FROM profiles p2
                    WHERE p2.id = NEW.evaluatee_id AND p2.parent = auth.uid()
                )
            )
        )
    );

-- Policies for evaluation_criteria
CREATE POLICY "evaluation_criteria_select_policy" ON evaluation_criteria
    FOR SELECT USING (true);

CREATE POLICY "evaluation_criteria_insert_policy" ON evaluation_criteria
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policies for evaluation_responses
CREATE POLICY "evaluation_responses_select_policy" ON evaluation_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM evaluations e
            WHERE e.id = evaluation_id AND (
                e.evaluator_id = auth.uid() OR
                e.evaluatee_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "evaluation_responses_insert_policy" ON evaluation_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM evaluations e
            WHERE e.id = evaluation_id AND e.evaluator_id = auth.uid()
        )
    );

-- Insert default evaluation types
INSERT INTO evaluation_types (name, description) VALUES
    ('self', 'Autoevaluación - El empleado se evalúa a sí mismo'),
    ('peer', 'Evaluación de pares - Evaluación entre compañeros del mismo nivel'),
    ('supervisor', 'Evaluación del supervisor - Evaluación del jefe directo'),
    ('subordinate', 'Evaluación de subordinados - Evaluación de los empleados a cargo');

-- Insert default evaluation criteria
INSERT INTO evaluation_criteria (name, description, category, weight) VALUES
    ('Comunicación', 'Capacidad para transmitir ideas y escuchar activamente', 'Habilidades Interpersonales', 1.0),
    ('Trabajo en Equipo', 'Habilidad para colaborar efectivamente con otros', 'Habilidades Interpersonales', 1.0),
    ('Liderazgo', 'Capacidad para guiar y motivar a otros', 'Habilidades de Liderazgo', 1.0),
    ('Resolución de Problemas', 'Capacidad para identificar y resolver problemas', 'Habilidades Técnicas', 1.0),
    ('Iniciativa', 'Capacidad para actuar proactivamente', 'Actitud', 1.0),
    ('Gestión del Tiempo', 'Habilidad para organizar y priorizar tareas', 'Habilidades Organizacionales', 1.0),
    ('Adaptabilidad', 'Flexibilidad para adaptarse a cambios', 'Actitud', 1.0),
    ('Conocimiento Técnico', 'Dominio de habilidades técnicas requeridas', 'Habilidades Técnicas', 1.0),
    ('Innovación', 'Capacidad para generar nuevas ideas y soluciones', 'Habilidades Técnicas', 1.0),
    ('Profesionalismo', 'Comportamiento ético y profesional', 'Actitud', 1.0);