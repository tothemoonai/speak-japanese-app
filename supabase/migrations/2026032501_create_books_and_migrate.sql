-- 创建 books 表
CREATE TABLE IF NOT EXISTS books (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  book_number INT UNIQUE NOT NULL,
  title_cn VARCHAR(100) NOT NULL,
  title_jp VARCHAR(100) NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(255),
  difficulty VARCHAR(10) CHECK (difficulty IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  target_audience VARCHAR(50),
  total_courses INT DEFAULT 0,
  sort_order INT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_books_difficulty ON books(difficulty);
CREATE INDEX IF NOT EXISTS idx_books_sort_order ON books(sort_order);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(is_published);

-- 添加触发器
CREATE TRIGGER IF NOT EXISTS update_books_updated_at
BEFORE UPDATE ON books
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 修改 courses 表
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS book_id INT NOT NULL DEFAULT 1,
ADD CONSTRAINT fk_courses_book
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_courses_book_order ON courses(book_id, sort_order);

-- 创建 RLS 策略
DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;
CREATE POLICY "Books are viewable by everyone"
ON books
FOR SELECT
TO authenticated
USING (true);

-- 插入测试课本
INSERT INTO books (id, book_number, title_cn, title_jp, description, difficulty, total_courses, sort_order, is_published)
VALUES (
  1,
  1,
  '测试课本',
  'テスト教科書',
  '用于测试的课本，包含现有的所有课程',
  'N5',
  (SELECT COUNT(*) FROM courses),
  1,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 更新课程的 book_id
UPDATE courses
SET book_id = 1
WHERE book_id IS NULL OR book_id NOT IN (SELECT id FROM books);

-- 更新书本的课程总数
UPDATE books
SET total_courses = (
  SELECT COUNT(*)
  FROM courses
  WHERE courses.book_id = books.id
);
