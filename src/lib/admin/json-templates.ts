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

export const COURSE_FILE_TEMPLATE = {
  book_number: 1,
  course_number: 1,
  title_jp: "応募問合せ",
  title_cn: "应聘咨询",
  description: "求人問合せの電話をかける時の日本語表現を学ぶ",
  difficulty: "N2",
  theme: "IT業務日本語",
  sentences: [
    {
      sentence_order: 1,
      character_id: 1,
      text_jp: "はい、〇〇社でございます。",
      text_cn: "您好，这里是〇〇公司。",
      text_furigana: "はい、〇〇しゃでございます。",
      text_romaji: "Hai, 〇〇 sha de gozaimasu.",
      difficulty_level: "medium"
    },
    {
      sentence_order: 2,
      character_id: 2,
      text_jp: "すみません、求人の件でお聞きしたいことがあります。",
      text_cn: "您好，有关招聘的事情想咨询一下。",
      text_furigana: "すみません、きゅうじんのけんでおききしたいことがあります。",
      text_romaji: "Sumimasen, kyūjin no ken de okiki shitai koto ga arimasu.",
      difficulty_level: "medium"
    }
  ]
};
