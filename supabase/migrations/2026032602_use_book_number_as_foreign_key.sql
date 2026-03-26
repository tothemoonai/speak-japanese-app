-- 修改courses表，使用业务键book_number而不是主键id
-- 这样更符合数据库设计最佳实践

-- 1. 删除旧的外键约束
ALTER TABLE courses DROP CONSTRAINT IF EXISTS fk_courses_book;

-- 2. 添加book_number列（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'courses' AND column_name = 'book_number'
    ) THEN
        ALTER TABLE courses ADD COLUMN book_number INT NOT NULL DEFAULT 1;
    END IF;
END $$;

-- 3. 从books表复制book_number数据（基于旧的book_id）
UPDATE courses c
SET book_number = b.book_number
FROM books b
WHERE c.book_id = b.id;

-- 4. 删除旧的book_id列
ALTER TABLE courses DROP COLUMN IF EXISTS book_id;

-- 5. 创建新的外键约束（使用book_number）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_courses_book_number'
    ) THEN
        ALTER TABLE courses
        ADD CONSTRAINT fk_courses_book_number
        FOREIGN KEY (book_number) REFERENCES books(book_number) ON DELETE RESTRICT;
    END IF;
END $$;

-- 6. 创建索引
CREATE INDEX IF NOT EXISTS idx_courses_book_number ON courses(book_number);

-- 7. 更新复合索引
DROP INDEX IF EXISTS idx_courses_book_order;
CREATE INDEX idx_courses_book_order ON courses(book_number, sort_order);
