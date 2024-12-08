-- Add parent_id to profiles if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES auth.users(id);

-- Create index for parent_id
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id ON profiles(parent_id);

-- Update evaluation policies
DROP POLICY IF EXISTS "evaluations_select_policy" ON evaluations;
DROP POLICY IF EXISTS "evaluations_insert_policy" ON evaluations;

-- New policies for evaluations
CREATE POLICY "evaluations_select_policy" ON evaluations
    FOR SELECT USING (
        auth.uid() = evaluator_id OR 
        auth.uid() = evaluatee_id OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND (
                role = 'admin' OR
                id IN (
                    SELECT parent_id FROM profiles 
                    WHERE id = evaluations.evaluatee_id
                )
            )
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
                    WHERE p2.id = NEW.evaluatee_id AND p2.parent_id = auth.uid()
                )
            )
        )
    );

-- Function to get subordinates
CREATE OR REPLACE FUNCTION get_subordinates(user_id UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    department TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.email,
        p.department
    FROM profiles p
    WHERE p.parent_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can evaluate
CREATE OR REPLACE FUNCTION can_evaluate(evaluator_id UUID, evaluatee_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = evaluator_id AND (
            p.role = 'admin' OR
            evaluatee_id IN (
                SELECT s.id FROM get_subordinates(evaluator_id) s
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;