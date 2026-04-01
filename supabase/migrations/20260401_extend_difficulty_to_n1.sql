-- Extend courses difficulty constraint to include N2 and N1
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_difficulty_check;
ALTER TABLE courses ADD CONSTRAINT courses_difficulty_check CHECK (difficulty IN ('N5', 'N4', 'N3', 'N2', 'N1'));
