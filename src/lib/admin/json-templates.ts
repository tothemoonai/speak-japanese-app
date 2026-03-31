export const NESTED_TEMPLATE = {
  books: [
    {
      book_number: 1,
      title_jp: "みんなの日本語",
      title_cn: "大家的日语",
      description: "初级日语教材",
      difficulty: "N5",
      is_published: true,
      sort_order: 1,
      courses: [
        {
          course_number: 1,
          title_jp: "初めまして",
          title_cn: "初次见面",
          description: "学习自我介绍",
          difficulty: "N5",
          theme: "日常",
          characters: [
            {
              name_jp: "田中",
              name_cn: "田中",
              gender: "male",
              description: "日语老师"
            }
          ],
          sentences: [
            {
              sentence_order: 1,
              character_name: "田中",
              text_jp: "こんにちは。",
              text_cn: "你好。",
              text_furigana: "こんにちは。",
              text_romaji: "konnichiwa.",
              difficulty_level: "easy"
            }
          ]
        }
      ]
    }
  ]
};

export const BOOKS_TEMPLATE = {
  books: [
    {
      book_number: 1,
      title_jp: "书名（日文）",
      title_cn: "书名（中文）",
      description: "书本描述",
      difficulty: "N5",
      is_published: true,
      sort_order: 1
    }
  ]
};

export const COURSES_TEMPLATE = {
  courses: [
    {
      book_id: 1,
      course_number: 1,
      title_jp: "课程名（日文）",
      title_cn: "课程名（中文）",
      description: "课程描述",
      difficulty: "N5",
      theme: "日常"
    }
  ]
};

export const CHARACTERS_TEMPLATE = {
  characters: [
    {
      name_jp: "名前",
      name_cn: "名字",
      gender: "male",
      description: "角色描述"
    }
  ]
};

export const SENTENCES_TEMPLATE = {
  sentences: [
    {
      book_id: 1,
      course_id: 1,
      sentence_order: 1,
      character_id: 1,
      text_jp: "日本語の文",
      text_cn: "中文翻译",
      text_furigana: "にほんごのぶん",
      text_romaji: "nihongo no bun",
      difficulty_level: "easy"
    }
  ]
};
