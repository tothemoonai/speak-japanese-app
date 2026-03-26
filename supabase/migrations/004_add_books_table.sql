-- 创建 books 表
-- 用于管理日语学习课本

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

-- 创建索引以优化查询性能
CREATE INDEX idx_books_difficulty ON books(difficulty);
CREATE INDEX idx_books_sort_order ON books(sort_order);
CREATE INDEX idx_books_published ON books(is_published);

-- 添加更新时间戳触发器
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 修改 courses 表，添加 book_id 外键
ALTER TABLE courses
ADD COLUMN book_id INT NOT NULL DEFAULT 1,
ADD CONSTRAINT fk_courses_book
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT;

-- 创建索引优化课程按书本查询
CREATE INDEX idx_courses_book_order ON courses(book_id, sort_order);

-- 添加注释
COMMENT ON TABLE books IS '日语学习课本表';
COMMENT ON COLUMN books.id IS '课本唯一标识';
COMMENT ON COLUMN books.book_number IS '课本编号（唯一）';
COMMENT ON COLUMN books.title_cn IS '课本中文名称';
COMMENT ON COLUMN books.title_jp IS '课本日文名称';
COMMENT ON COLUMN books.description IS '课本描述';
COMMENT ON COLUMN books.cover_image_url IS '封面图片URL';
COMMENT ON COLUMN books.difficulty IS '难度级别（N5-N1）';
COMMENT ON COLUMN books.target_audience IS '目标受众';
COMMENT ON COLUMN books.total_courses IS '课程总数';
COMMENT ON COLUMN books.sort_order IS '排序顺序';
COMMENT ON COLUMN books.is_published IS '是否已发布';
COMMENT ON COLUMN courses.book_id IS '所属课本ID';
