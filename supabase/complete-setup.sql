-- =====================================================
-- SpeakJapaneseApp - 完整数据库设置脚本
-- 直接在 Supabase SQL Editor 中执行此文件
-- 执行步骤: 复制全部内容 → 粘贴到 SQL Editor → 点击 Run
-- =====================================================

-- =====================================================
-- 第 1 部分: 清空现有数据并重置
-- =====================================================

-- 清空所有数据（按依赖顺序）
TRUNCATE TABLE public.shares CASCADE;
TRUNCATE TABLE public.sentences CASCADE;
TRUNCATE TABLE public.characters CASCADE;
TRUNCATE TABLE public.courses CASCADE;

-- 重置序列
ALTER SEQUENCE public.courses_id_seq RESTART WITH 1;
ALTER SEQUENCE public.characters_id_seq RESTART WITH 1;
ALTER SEQUENCE public.sentences_id_seq RESTART WITH 1;

-- =====================================================
-- 第 2 部分: 插入课程数据 (8 个课程)
-- =====================================================

INSERT INTO public.courses (course_number, title_cn, title_jp, description, difficulty, theme, scene_image_url, total_sentences, vocab_count, grammar_count, sort_order) VALUES
(1, '初次见面', '初めての会話', '学习基本的问候语和自我介绍', 'N5', '日常会话', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', 5, 20, 5, 1),
(2, '购物场景', '買い物', '在商店购物时的实用对话', 'N5', '日常会话', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', 6, 25, 8, 2),
(3, '问路场景', '道を尋ねる', '学习如何问路和指路', 'N5', '日常会话', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800', 5, 18, 6, 3),
(4, '餐厅点餐', 'レストランで注文', '在餐厅点餐的基本对话', 'N4', '日常会话', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 7, 30, 10, 4),
(5, '职场交流', '職場でのコミュニケーション', '办公室和工作场所的交流用语', 'N4', '商务日语', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 6, 28, 9, 5),
(6, '旅行日语', '旅行の日本語', '旅行时必备的日语表达', 'N3', '旅行', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 8, 40, 15, 6),
(7, '文化体验', '文化体験', '日本文化活动相关对话', 'N3', '文化', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800', 5, 22, 8, 7),
(8, '商务谈判', 'ビジネス交渉', '正式商务谈判用语', 'N3', '商务日语', 'https://images.unsplash.com/photo-1552664730-30f0ec360682?w=800', 6, 35, 12, 8);

-- =====================================================
-- 第 3 部分: 插入角色数据 (16 个角色)
-- =====================================================

INSERT INTO public.characters (course_id, name_cn, name_jp, gender, age_range, description, avatar_url, difficulty_level) VALUES
-- 课程1: 初次见面
(1, '田中先生', '田中先生', 'male', '30-40', '一位友好的商务人士', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanaka', 'medium'),
(1, '山田小姐', '山田さん', 'female', '25-30', '温柔的办公室职员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yamada', 'easy'),
-- 课程2: 购物场景
(2, '店员', '店員さん', 'female', '20-30', '热情的商店店员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shopclerk', 'easy'),
(2, '顾客', 'お客様', 'other', '35-45', '购物的顾客', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Customer', 'medium'),
-- 课程3: 问路场景
(3, '路人', '通行人', 'male', '25-35', '路过的行人', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Passerby', 'easy'),
(3, '警察', '警察官', 'male', '30-40', '友好的警察', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Police', 'medium'),
-- 课程4: 餐厅点餐
(4, '服务员', '店員さん', 'female', '20-25', '亲切的服务员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Waitress', 'easy'),
(4, '厨师', 'シェフ', 'male', '35-45', '专业厨师', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chef', 'hard'),
-- 课程5: 职场交流
(5, '经理', 'マネージャー', 'male', '40-50', '部门经理', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager', 'hard'),
(5, '同事', '同僚さん', 'female', '28-35', '亲切的同事', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Colleague', 'medium'),
-- 课程6: 旅行日语
(6, '导游', 'ガイドさん', 'female', '25-35', '专业的导游', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guide', 'medium'),
( 6, '游客', '観光客', 'other', '30-40', '来自海外的游客', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tourist', 'easy'),
-- 课程7: 文化体验
(7, '老师', '先生', 'female', '35-45', '文化老师', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher', 'medium'),
(7, '学生', '学生さん', 'other', '20-25', '学习文化的学生', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student', 'easy'),
-- 课程8: 商务谈判
(8, '社长', '社長', 'male', '50-60', '公司社长', 'https://api.dicebear.com/7.x/avataaars/svg?seed=President', 'hard'),
(8, '秘书', '秘書さん', 'female', '30-40', '专业秘书', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Secretary', 'hard');

-- =====================================================
-- 第 4 部分: 插入句子数据 (48 个句子)
-- =====================================================

-- 课程1: 初次见面 (5 个句子)
INSERT INTO public.sentences (course_id, sentence_order, character_id, text_jp, text_cn, text_furigana, text_romaji, vocabulary, grammar_points, difficulty_level) VALUES
(1, 1, 1, 'こんにちは、はじめまして。', '你好，初次见面。', 'こんにちは、はじめまして。', 'Konnichiwa, hajimemashite.', '{"初めて": "第一次", "こんにちは": "你好"}', '{"问候语": "はじめまして"}', 'easy'),
(1, 2, 1, '田中です。よろしくお願いします。', '我是田中，请多关照。', 'たなかです。よろしくおねがいします。', 'Tanaka desu. Yoroshiku onegaishimasu.', '{"田中": "姓氏", "よろしくお願いします": "请多关照"}', '{"自己介绍": "〜です"}', 'easy'),
(1, 3, 2, '山田です。こちらこそよろしく。', '我是山田，也请多关照。', 'やまだです。こちらこそよろしく。', 'Yamada desu. Kochira koso yoroshiku.', '{"こちらこそ": "我才应该", "よろしく": "请关照"}', '{"礼貌用语": "こちらこそ"}', 'medium'),
(1, 4, 1, '日本から来ました。', '我来自日本。', 'にほんからきました。', 'Nihon kara kimashita.', '{"日本": "Japan", "来る": "来"}', '{"动词过去式": "〜た"}', 'easy'),
(1, 5, 2, '東京の会社で働いています。', '在东京的公司工作。', 'とうきょうのかいしゃではたらいています。', 'Tōkyō no kaisha de hataraite imasu.', '{"東京": "东京", "会社": "公司", "働く": "工作"}', '{"动词进行时": "〜ている"}', 'medium');

-- 课程2: 购物场景 (6 个句子)
INSERT INTO public.sentences (course_id, sentence_order, character_id, text_jp, text_cn, text_furigana, text_romaji, vocabulary, grammar_points, difficulty_level) VALUES
(2, 1, 1, 'いらっしゃいませ。', '欢迎光临。', 'いらっしゃいませ。', 'Irasshaimase.', '{"いらっしゃいませ": "欢迎光临"}', '{"商务用语": "いらっしゃいませ"}', 'easy'),
(2, 2, 1, '何をお探しですか。', '您在找什么？', 'なにをおさがしですか。', 'Nani o osagashi desu ka.', '{"探す": "寻找"}', '{"动词进行时疑问": "〜ですか"}', 'medium'),
(2, 3, 2, 'この商品はいくらですか。', '这个商品多少钱？', 'このしょうひんはいくらですか。', 'Kono shōhin wa ikura desu ka.', '{"商品": "商品", "いくら": "多少钱"}', '{"指示代词": "この"}', 'easy'),
(2, 4, 1, '1000円です。', '1000日元。', 'せんえんです。', 'Sen''en desu.', '{"1000円": "1000日元"}', '{"价格表达": "〜円です"}', 'easy'),
(2, 5, 2, '高いですね。もう少し安くしてくれませんか。', '太贵了。能便宜一点吗？', 'たかいですね。もうすこしやすくしてくれませんか。', 'Takai desu ne. Mō sukoshi yasuku shite kuremasen ka.', '{"高い": "贵", "安い": "便宜"}', '{"请求表达": "〜てくれませんか"}', 'hard'),
(2, 6, 1, 'わかりました。10％割引しましょう。', '明白了，给您打9折吧。', 'わかりました。じゅっパーセントわりびきしましょう。', 'Wakarimashita. Juppāsento waribiki shimashō.', '{"10％": "10%", "割引": "打折"}', '{"意愿表达": "〜ましょう"}', 'hard');

-- 课程3: 问路场景 (5 个句子)
INSERT INTO public.sentences (course_id, sentence_order, character_id, text_jp, text_cn, text_furigana, text_romaji, vocabulary, grammar_points, difficulty_level) VALUES
(3, 1, 1, 'すみません、駅はどこですか。', '请问，车站在哪里？', 'すみません、えきはどこですか。', 'Sumimasen, eki wa doko desu ka.', '{"駅": "车站", "どこ": "哪里"}', '{"疑问词": "どこ"}', 'easy'),
(3, 2, 2, 'まっすぐ行って、左に曲がってください。', '直走，然后左转。', 'まっすぐいって、ひだりにまがってください。', 'Massugu itte, hidari ni magatte kudasai.', '{"まっすぐ": "直", "左": "左边", "曲がる": "转弯"}', '{"动作顺序": "〜て、〜て"}', 'medium'),
(3, 3, 1, 'どのくらいかかりますか。', '需要多长时间？', 'どのくらいかかりますか。', 'Dono kurai kakarimasu ka.', '{"どのくらい": "多长时间", "かかる": "花费"}', '{"时间询问": "どのくらい"}', 'easy'),
(3, 4, 2, '歩いて5分ぐらいです。', '走路大概5分钟。', 'あるいて5ぷんぐらいです。', 'Aruite go-fun gurai desu.', '{"歩く": "走", "5分": "5分钟"}', '{"时间长度": "〜ぐらい"}', 'medium'),
(3, 5, 1, 'ありがとうございます。', '谢谢。', 'ありがとうございます。', 'Arigatō gozaimasu.', '{"ありがとうございます": "非常感谢"}', '{"礼貌用语": "ありがとうございます"}', 'easy');

-- 课程4: 餐厅点餐 (7 个句子)
INSERT INTO public.sentences (course_id, sentence_order, character_id, text_jp, text_cn, text_furigana, text_romaji, vocabulary, grammar_points, difficulty_level) VALUES
(4, 1, 1, '何をご注文なさいますか。', '您要点什么？', 'なにをごちゅうもんなさいますか。', 'Nani o gochūmon nasaimasu ka.', '{"注文": "点餐"}', '{"敬语": "なさいます"}', 'hard'),
(4, 2, 2, 'メニューを見せてください。', '请给我看一下菜单。', 'メニューをみせてください。', 'Menyū o misete kudasai.', '{"メニュー": "菜单", "見せる": "给看"}', '{"请求表达": "〜てください"}', 'medium'),
(4, 3, 2, 'ラーメンを一つお願いします。', '我要一份拉面。', 'ラーメンをひとつおねがいします。', 'Rāmen o hitotsu onegai shimasu.', '{"ラーメン": "拉面", "一つ": "一个"}', '{"数量词": "一つ"}', 'easy'),
(4, 4, 1, 'お飲み物はいかがなさいますか。', '要喝点什么吗？', 'おのみものはいかがなさいますか。', 'O-nomimono wa ikaga nasaimasu ka.', '{"飲み物": "饮料"}', '{"提议表达": "いかがですか"}', 'hard'),
(4, 5, 2, '緑茶をください。', '请给我绿茶。', 'りょくちゃをください。', 'Ryokucha o kudasai.', '{"緑茶": "绿茶"}', '{"请求表达": "〜をください"}', 'easy'),
(4, 6, 1, 'かしこまりました。', '马上就好。', 'かしこまりました。', 'Kashikomarimashita.', '{"かしこまりました": "明白了"}', '{"商务用语": "かしこまりました"}', 'medium'),
(4, 7, 2, 'おいしそうですね。楽しみにしています。', '看起来很好吃。我很期待。', 'おいしそうですね。たのしみにしています。', 'Oishisō desu ne. Tanoshimi ni shite imasu.', '{"おいしい": "好吃", "楽しみ": "期待"}', '{"感官形容词": "〜そう"}', 'hard');

-- 课程5: 职场交流 (6 个句子)
INSERT INTO public.sentences (course_id, sentence_order, character_id, text_jp, text_cn, text_furigana, text_romaji, vocabulary, grammar_points, difficulty_level) VALUES
(5, 1, 1, 'おはようございます。', '早上好。', 'おはようございます。', 'Ohayō gozaimasu.', '{"おはよう": "早安"}', '{"时间问候": "おはようございます"}', 'easy'),
(5, 2, 2, '今日は忙しいですか。', '今天忙吗？', 'きょうはいそがしいですか。', 'Kyō wa isogashii desu ka.', '{"忙しい": "忙"}', '{"形容词询问": "〜ですか"}', 'medium'),
(5, 3, 1, '会議の準備をしています。', '正在准备会议。', 'かいぎのじゅんびをしています。', 'Kaigi no junbi o shite imasu.', '{"会議": "会议", "準備": "准备"}', '{"动词进行时": "〜ている"}', 'medium'),
(5, 4, 2, '手伝いましょうか。', '要我帮忙吗？', 'てつだいましょうか。', 'Tetsudai mashō ka.', '{"手伝う": "帮忙"}', '{"提议表达": "〜ましょうか"}', 'easy'),
(5, 5, 1, 'すみません、この書類をコピーしてください。', '不好意思，请复印一下这份文件。', 'すみません、このしょるいをコピーしてください。', 'Sumimasen, kono shorui o kopī shite kudasai.', '{"書類": "文件", "コピー": "复印"}', '{"请求表达": "〜てください"}', 'medium'),
(5, 6, 2, 'わかりました。すぐやります。', '明白了，马上做。', 'わかりました。すぐやります。', 'Wakarimashita. Sugu yarimasu.', '{"すぐ": "马上", "やる": "做"}', '{"立即行动": "すぐ"}', 'easy');

-- 课程6: 旅行日语 (8 个句子)
INSERT INTO public.sentences (course_id, sentence_order, character_id, text_jp, text_cn, text_furigana, text_romaji, vocabulary, grammar_points, difficulty_level) VALUES
(6, 1, 1, '日本へようこそ。', '欢迎来到日本。', 'にほんへようこそ。', 'Nihon e yōkoso.', '{"日本": "Japan", "ようこそ": "欢迎"}', '{"欢迎语": "ようこそ"}', 'easy'),
(6, 2, 2, '空港はここですか。', '机场在这里吗？', 'くうこうはここですか。', 'Kūkō wa koko desu ka.', '{"空港": "机场", "ここ": "这里"}', '{"指示代词": "ここ"}', 'easy'),
(6, 3, 1, 'はい、そうです。タクシーはあそこです。', '是的，出租车在那里。', 'はい、そうです。タクシーはあそこです。', 'Hai, sō desu. Takushī wa asoko desu.', '{"タクシー": "出租车", "あそこ": "那里"}', '{"指示代词": "あそこ"}', 'medium'),
(6, 4, 2, 'この電車は京都に行きますか。', '这趟电车去京都吗？', 'このでんしゃはきょうとにいきますか。', 'Kono densha wa Kyōto ni ikimasu ka.', '{"電車": "电车", "京都": "京都"}', '{"动词疑问": "〜ますか"}', 'medium'),
(6, 5, 1, 'いいえ、次の電車です。', '不，是下一趟。', 'いいえ、つぎのでんしゃです。', 'Iie, tsugi no densha desu.', '{"いいえ": "不", "次": "下一个"}', '{"否定表达": "いいえ"}', 'easy'),
(6, 6, 2, 'チケットはどこで買えますか。', '在哪里可以买票？', 'チケットはどこでかえますか。', 'Chiketto wa doko de kaemasu ka.', '{"チケット": "票", "買う": "买"}', '{"可能态": "〜えます"}', 'hard'),
(6, 7, 1, 'あの自動販売機で買えます。', '可以在那个自动售货机买。', 'あのじどうはんばいきでかえます。', 'Ano jidōhanbaiki de kaemasu.', '{"自動販売機": "自动售货机"}', '{"可能态": "〜えます"}', 'hard'),
(6, 8, 2, 'ありがとうございます。助かりました。', '谢谢，帮大忙了。', 'ありがとうございます。たすかりました。', 'Arigatō gozaimasu. Tasukarimashita.', '{"助かる": "得救，帮大忙"}', '{"礼貌用语": "助かりました"}', 'medium');

-- 课程7: 文化体验 (5 个句子)
INSERT INTO public.sentences (course_id, sentence_order, character_id, text_jp, text_cn, text_furigana, text_romaji, vocabulary, grammar_points, difficulty_level) VALUES
(7, 1, 1, '今日は茶道を体験しましょう。', '今天体验茶道吧。', 'きょうはさどうをたいけんしましょう。', 'Kyō wa sadō o taiken shimashō.', '{"茶道": "茶道", "体験": "体验"}', '{"提议表达": "〜ましょう"}', 'medium'),
(7, 2, 2, 'はい、楽しみです。', '好的，很期待。', 'はい、たのしみです。', 'Hai, tanoshimi desu.', '{"楽しみ": "期待，愉快"}', '{"情感表达": "〜です"}', 'easy'),
(7, 3, 1, 'まず、お菓子を食べてください。', '首先，请吃点心。', 'まず、おかしをたべてください。', 'Mazu, okashi o tabete kudasai.', '{"お菓子": "点心", "まず": "首先"}', '{"动作顺序": "まず、〜て"}', 'medium'),
(7, 4, 2, 'お茶はどうやって飲みますか。', '茶怎么喝？', 'おちゃはどうやってのみますか。', 'O-cha wa dōyatte nomimasu ka.', '{"お茶": "茶", "どうやって": "怎么"}', '{"方法询问": "どうやって"}', 'hard'),
(7, 5, 1, '茶碗を回してから飲みます。', '转动茶碗后再喝。', 'ちゃわんをまわしてからのみます。', 'Chawan o mawashite kara nomimasu.', '{"茶碗": "茶碗", "回す": "转动"}', '{"动作顺序": "〜てから"}', 'hard');

-- 课程8: 商务谈判 (6 个句子)
INSERT INTO public.sentences (course_id, sentence_order, character_id, text_jp, text_cn, text_furigana, text_romaji, vocabulary, grammar_points, difficulty_level) VALUES
(8, 1, 1, '本日はお時間をいただき、ありがとうございます。', '感谢您今天抽出时间。', 'ほんじつはおじかんをいただき、ありがとうございます。', 'Honjitsu wa o-jikan o itadaki, arigatō gozaimasu.', '{"本日": "今天", "いただく": "收到，蒙受"}', '{"商务敬语": "いただく"}', 'hard'),
(8, 2, 2, 'こちらこそ、よろしくお願いいたします。', '我才应该请您多关照。', 'こちらこそ、よろしくおねがいいたします。', 'Kochira koso, yoroshiku onegai itashimasu.', '{"こちらこそ": "我才应该", "いたします": "做的自谦语"}', '{"商务敬语": "いたします"}', 'hard'),
(8, 3, 1, '早速ですが、提案をご説明させていただきます。', '直奔主题，请允许我说明提案。', 'さっそくですが、ていあんをごせつめいさせていただきます。', 'Sassoku desu ga, teian o gosetsumei sasete itadakimasu.', '{"早速": "直接", "提案": "提案"}', '{"商务敬语": "させていただく"}', 'hard'),
(8, 4, 2, 'ありがとうございます。詳しく聞かせてください。', '谢谢，请详细说明。', 'ありがとうございます。くわしくきかせてください。', 'Arigatō gozaimasu. Kuwashiki kikasete kudasai.', '{"詳しい": "详细的"}', '{"请求表达": "〜てください"}', 'medium'),
(8, 5, 1, '価格については交渉の余地がありますか。', '价格方面有商量的余地吗？', 'かかくについてはこうしょうのよちがありますか。', 'Kakaku ni tsuite wa kōshō no yochi ga arimasu ka.', '{"価格": "价格", "交渉": "谈判"}', '{"商务用语": "余地があります"}', 'hard'),
(8, 6, 2, 'はい、前向きに検討いたします。', '是的，我们会积极考虑。', 'はい、まえむきにけんとういたします。', 'Hai, maemuki ni kentō itashimasu.', '{"前向き": "积极", "検討": "探讨"}', '{"商务用语": "前向きに"}', 'hard');

-- =====================================================
-- 第 5 部分: 验证数据
-- =====================================================

-- 检查所有数据
SELECT 'courses' as table_name, COUNT(*) as count FROM courses
UNION ALL
SELECT 'characters', COUNT(*) FROM characters
UNION ALL
SELECT 'sentences', COUNT(*) FROM sentences;

-- 查看课程列表
SELECT id, course_number, title_cn, title_jp, difficulty
FROM courses
ORDER BY course_number;
