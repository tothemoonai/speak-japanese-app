'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  NESTED_TEMPLATE,
  BOOKS_TEMPLATE,
  COURSES_TEMPLATE,
  CHARACTERS_TEMPLATE,
  SENTENCES_TEMPLATE,
  COURSE_FILE_TEMPLATE,
} from '@/lib/admin/json-templates';

// ─── Types ───────────────────────────────────────────────────────────────────

type Entity = 'books' | 'courses' | 'characters' | 'sentences';

interface BookRecord {
  id: number;
  book_number: number;
  title_jp: string;
  title_cn: string;
  description: string | null;
  difficulty: string | null;
  is_published: boolean;
  sort_order: number | null;
  [key: string]: unknown;
}

interface CourseRecord {
  id: number;
  book_id: number;
  course_number: number;
  title_jp: string;
  title_cn: string;
  description: string | null;
  difficulty: string;
  theme: string | null;
  [key: string]: unknown;
}

interface CharacterRecord {
  id: number;
  name_jp: string;
  name_cn: string;
  gender: string | null;
  description: string | null;
  [key: string]: unknown;
}

interface SentenceRecord {
  id: number;
  book_id: number;
  course_id: number;
  sentence_order: number;
  character_id: number;
  text_jp: string;
  text_cn: string;
  text_furigana: string | null;
  text_romaji: string | null;
  difficulty_level: string | null;
  [key: string]: unknown;
}

type AnyRecord = BookRecord | CourseRecord | CharacterRecord | SentenceRecord;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  const { data } = await supabase().auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch(entity: Entity, method: string, body?: unknown) {
  const token = await getToken();
  if (!token) throw new Error('未登录');
  const res = await fetch(`/api/admin/${entity}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || '请求失败');
  return json;
}

function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data per entity
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [characters, setCharacters] = useState<CharacterRecord[]>([]);
  const [sentences, setSentences] = useState<SentenceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<Entity>('books');

  // Dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AnyRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; entity: Entity } | null>(null);

  // Import state
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guide state
  const [guideOpen, setGuideOpen] = useState(false);

  // Dialogue import state
  const [dialogueText, setDialogueText] = useState('');
  const [dialogueBookId, setDialogueBookId] = useState<number>(1);
  const [dialogueCourseTitle, setDialogueCourseTitle] = useState('');
  const [dialogueImporting, setDialogueImporting] = useState(false);

  // ─── Auth Guard ──────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase().auth.getSession();
        const token = data.session?.access_token;
        if (!token) { router.replace('/'); return; }

        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: token }),
        });
        const json = await res.json();
        if (!json.isAdmin) { router.replace('/'); return; }

        setIsAdmin(true);
      } catch {
        router.replace('/');
      }
    })();
  }, [router]);

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const fetchData = useCallback(async (entity: Entity) => {
    try {
      const json = await apiFetch(entity, 'GET');
      switch (entity) {
        case 'books': setBooks(json.data || []); break;
        case 'courses': setCourses(json.data || []); break;
        case 'characters': setCharacters(json.data || []); break;
        case 'sentences': setSentences(json.data || []); break;
      }
    } catch (e: any) {
      toast.error(`加载失败: ${e.message}`);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData(activeTab);
  }, [isAdmin, activeTab, fetchData]);

  // ─── CRUD Handlers ─────────────────────────────────────────────────────

  const handleSave = async () => {
    try {
      const method = editingRecord ? 'PUT' : 'POST';
      await apiFetch(activeTab, method, formData);
      toast.success(editingRecord ? '更新成功' : '创建成功');
      setEditOpen(false);
      setEditingRecord(null);
      setFormData({});
      fetchData(activeTab);
    } catch (e: any) {
      toast.error(`保存失败: ${e.message}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(deleteTarget.entity, 'DELETE', { id: deleteTarget.id });
      toast.success('删除成功');
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchData(deleteTarget.entity);
    } catch (e: any) {
      toast.error(`删除失败: ${e.message}`);
    }
  };

  const openEdit = (record: AnyRecord) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setEditOpen(true);
  };

  const openAdd = () => {
    setEditingRecord(null);
    setFormData({});
    setEditOpen(true);
  };

  // ─── Import Handler ────────────────────────────────────────────────────

  const handleImport = async () => {
    setImporting(true);
    try {
      const data = JSON.parse(importText);
      const token = await getToken();
      if (!token) throw new Error('未登录');

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '导入失败');

      toast.success(
        `导入完成: ${json.stats.books}本书, ${json.stats.courses}门课, ${json.stats.characters}个角色, ${json.stats.sentences}个句子`
      );
      if (json.errors?.length) {
        toast.warning(`${json.errors.length} 个错误`);
      }
      setImportOpen(false);
      setImportText('');
      fetchData(activeTab);
    } catch (e: any) {
      toast.error(`导入失败: ${e.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportText(ev.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  // ─── Dialogue Import Handler ─────────────────────────────────────────────

  const handleDialogueImport = async () => {
    if (!dialogueText.trim()) return;
    setDialogueImporting(true);
    try {
      // 1. Parse dialogue text
      const lines = dialogueText.trim().split('\n').filter(l => l.trim());
      const parsed: { order: number; name: string; textJp: string; textCn: string }[] = [];
      let i = 0;

      while (i < lines.length) {
        const line = lines[i].trim();
        if (/^[（(]/.test(line)) { i++; continue; }
        const match = line.match(/^(.+?)[：:]\s*(.+)$/);
        if (!match) { i++; continue; }
        const [, name, textJp] = match;
        let textCn = '';
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          const cnMatch = nextLine.match(/^[（(]\s*(.+?)[：:]\s*(.+?)[）)]\s*$/);
          if (cnMatch) { textCn = cnMatch[2].trim(); i++; }
        }
        parsed.push({ order: parsed.length + 1, name: name.trim(), textJp: textJp.trim(), textCn });
        i++;
      }

      if (parsed.length === 0) {
        toast.error('未检测到对话。格式: 名前：日本語文，下一行（名前：中文翻译）');
        return;
      }

      // 2. Fetch fresh courses & characters from API (local state may be stale)
      const [freshCoursesRes, freshCharsRes] = await Promise.all([
        apiFetch('courses', 'GET'),
        apiFetch('characters', 'GET'),
      ]);
      const freshCourses: any[] = freshCoursesRes.data || [];
      const freshChars: any[] = freshCharsRes.data || [];

      const bookCoursesCount = freshCourses.filter(c => c.book_id === dialogueBookId).length;
      const courseNumber = bookCoursesCount + 1;
      let courseId: number;
      try {
        const courseRes = await apiFetch('courses', 'POST', {
          book_id: dialogueBookId,
          course_number: courseNumber,
          title_jp: dialogueCourseTitle || `レッスン${courseNumber}`,
          title_cn: dialogueCourseTitle || `第${courseNumber}课`,
          description: '',
          difficulty: 'N2',
          theme: 'IT業務日本語',
        });
        courseId = courseRes.data?.course_number ?? courseNumber;
      } catch (e: any) {
        toast.error(`创建课程失败: ${e.message}`);
        return;
      }

      // 3. Resolve characters (find existing or create new)
      const charIdMap: Record<string, number> = {};
      const uniqueNames = [...new Set(parsed.map(s => s.name))];
      let newChars = 0;

      for (const name of uniqueNames) {
        // Check existing characters (from fresh API data)
        const existing = freshChars.find(c => c.name_jp === name || c.name_cn === name);
        if (existing) {
          charIdMap[name] = existing.id;
          continue;
        }
        // Create new character
        try {
          const charRes = await apiFetch('characters', 'POST', {
            name_jp: name,
            name_cn: name,
          });
          if (charRes.data?.id) {
            charIdMap[name] = charRes.data.id;
            newChars++;
          }
        } catch {
          // Character might already exist (stale state) — try refetch
          try {
            const allCharsRes = await apiFetch('characters', 'GET');
            const found = allCharsRes.data?.find((c: any) => c.name_jp === name || c.name_cn === name);
            if (found) { charIdMap[name] = found.id; }
            else { toast.warning(`角色「${name}」创建失败`); }
          } catch { toast.warning(`角色「${name}」无法创建或查找`); }
        }
      }

      // 4. Create sentences
      let created = 0;
      const errors: string[] = [];
      for (const s of parsed) {
        const charId = charIdMap[s.name];
        if (!charId) { errors.push(`第${s.order}句: 角色未找到`); continue; }
        try {
          await apiFetch('sentences', 'POST', {
            book_id: dialogueBookId,
            course_id: courseNumber,
            sentence_order: s.order,
            character_id: charId,
            text_jp: s.textJp,
            text_cn: s.textCn,
            text_furigana: '',
            text_romaji: '',
            difficulty_level: 'medium',
          });
          created++;
        } catch (e: any) {
          errors.push(`第${s.order}句: ${e.message}`);
        }
      }

      // 5. Report results
      if (created === 0) {
        toast.error(`导入失败，0个句子被创建。${errors.slice(0, 3).join('; ')}`);
        console.error('Dialogue import errors:', errors);
      } else {
        toast.success(`导入完成: 课${courseNumber}, ${created}句, ${newChars}个新角色`);
        if (errors.length) toast.warning(`${errors.length}个句子有错误`);
        setDialogueText('');
        setDialogueCourseTitle('');
        fetchData('courses');
        fetchData('sentences');
        fetchData('characters');
      }
    } catch (e: any) {
      toast.error(`导入失败: ${e.message}`);
    } finally {
      setDialogueImporting(false);
    }
  };

  // ─── Render Helpers ────────────────────────────────────────────────────

  const getFormFields = (): { key: string; label: string; type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox'; options?: string[] }[] => {
    switch (activeTab) {
      case 'books':
        return [
          { key: 'book_number', label: '书本编号', type: 'number' },
          { key: 'title_jp', label: '日文标题', type: 'text' },
          { key: 'title_cn', label: '中文标题', type: 'text' },
          { key: 'description', label: '描述', type: 'textarea' },
          { key: 'difficulty', label: '难度', type: 'select', options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
          { key: 'is_published', label: '已发布', type: 'checkbox' },
          { key: 'sort_order', label: '排序', type: 'number' },
        ];
      case 'courses':
        return [
          { key: 'book_id', label: '书本编号(book_number)', type: 'number' },
          { key: 'course_number', label: '课程编号', type: 'number' },
          { key: 'title_jp', label: '日文标题', type: 'text' },
          { key: 'title_cn', label: '中文标题', type: 'text' },
          { key: 'description', label: '描述', type: 'textarea' },
          { key: 'difficulty', label: '难度', type: 'select', options: ['N5', 'N4', 'N3', 'N2', 'N1'] },
          { key: 'theme', label: '主题', type: 'text' },
        ];
      case 'characters':
        return [
          { key: 'name_jp', label: '日文名', type: 'text' },
          { key: 'name_cn', label: '中文名', type: 'text' },
          { key: 'gender', label: '性别', type: 'select', options: ['male', 'female', 'other'] },
          { key: 'description', label: '描述', type: 'textarea' },
        ];
      case 'sentences':
        return [
          { key: 'book_id', label: '书本编号', type: 'number' },
          { key: 'course_id', label: '课程编号', type: 'number' },
          { key: 'sentence_order', label: '句子序号', type: 'number' },
          { key: 'character_id', label: '角色ID', type: 'number' },
          { key: 'text_jp', label: '日文', type: 'textarea' },
          { key: 'text_cn', label: '中文', type: 'textarea' },
          { key: 'text_furigana', label: '假名注音', type: 'text' },
          { key: 'text_romaji', label: '罗马音', type: 'text' },
          { key: 'difficulty_level', label: '难度', type: 'select', options: ['easy', 'medium', 'hard'] },
        ];
    }
  };

  // ─── Loading / Not Admin ───────────────────────────────────────────────

  if (loading && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-50 header-gradient">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4 -mx-4 md:-mx-8 w-[calc(100%+2rem)] md:w-[calc(100%+4rem)]">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/')} className="text-primary active:scale-95 duration-200">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: 24 }}>arrow_back</span>
              </button>
              <h1 className="font-headline font-bold text-primary tracking-tighter text-xl">
                コンテンツ管理
              </h1>
            </div>
          </div>
        </header>

        {/* Import Guide Section */}
        <div className="mt-6 border border-outline-variant/15 rounded-lg bg-surface-container-low overflow-hidden">
          <button
            onClick={() => setGuideOpen(!guideOpen)}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-headline font-bold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span>导入指南 &amp; JSON模板</span>
            <span>{guideOpen ? '▲' : '▼'}</span>
          </button>
          {guideOpen && (
            <div className="p-4 border-t border-outline-variant/15 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-headline font-bold mb-2 text-on-surface">課程ファイル（推奨）</h3>
                  <p className="text-sm text-secondary mb-2">
                    1つのJSONファイルに1課分の全文章をまとめられます。書本・コース・文章を自動で作成します。character_idは既存のIDを使用。
                  </p>
                  <Button size="sm" variant="outline" onClick={() => downloadJson(COURSE_FILE_TEMPLATE, 'course-template.json')}>
                    課程テンプレート
                  </Button>
                </div>
                <div>
                  <h3 className="font-headline font-bold mb-2 text-on-surface">嵌套模板</h3>
                  <p className="text-sm text-secondary mb-2">
                    一个JSON文件包含书本→课程→角色→句子的完整层级。支持自动关联。
                  </p>
                  <Button size="sm" variant="outline" onClick={() => downloadJson(NESTED_TEMPLATE, 'nested-template.json')}>
                    下载嵌套模板
                  </Button>
                </div>
                <div>
                  <h3 className="font-headline font-bold mb-2 text-on-surface">独立模板</h3>
                  <p className="text-sm text-secondary mb-2">
                    每种实体单独导入，需要手动指定关联ID。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadJson(BOOKS_TEMPLATE, 'books-template.json')}>书本</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadJson(COURSES_TEMPLATE, 'courses-template.json')}>课程</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadJson(CHARACTERS_TEMPLATE, 'characters-template.json')}>角色</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadJson(SENTENCES_TEMPLATE, 'sentences-template.json')}>句子</Button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-headline font-bold mb-2 text-on-surface">字段说明</h3>
                <div className="text-sm text-secondary space-y-1">
                  <p><code className="bg-surface-container-high px-1 rounded">book_number</code> - 书本业务编号（唯一键）</p>
                  <p><code className="bg-surface-container-high px-1 rounded">course_number</code> - 课程编号（同一本书内唯一）</p>
                  <p><code className="bg-surface-container-high px-1 rounded">character_name</code> - 嵌套导入时用角色名自动匹配（无需ID）</p>
                  <p><code className="bg-surface-container-high px-1 rounded">book_id / course_id</code> - 独立导入时填编号（非数据库ID）</p>
                  <p><code className="bg-surface-container-high px-1 rounded">difficulty</code> - 书: N5-N1, 课程: N5-N3</p>
                  <p><code className="bg-surface-container-high px-1 rounded">difficulty_level</code> - 句子: easy/medium/hard</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialogue Import Section */}
        <div className="mt-4 border border-outline-variant/15 rounded-lg bg-surface-container-low p-4 space-y-3">
          <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: 20 }}>chat</span>
            对话导入
          </h3>
          <p className="text-sm text-secondary">
            粘贴对话文本，日文行后紧跟中文翻译行（用括号括起）。自动创建课程和角色。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-sm text-secondary mb-1 block">书本</Label>
              <Select value={String(dialogueBookId)} onValueChange={(v) => setDialogueBookId(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {books.map((b) => (
                    <SelectItem key={b.id} value={String(b.book_number)}>{b.book_number}. {b.title_cn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm text-secondary mb-1 block">课程标题（可选）</Label>
              <Input
                value={dialogueCourseTitle}
                onChange={(e) => setDialogueCourseTitle(e.target.value)}
                placeholder="默认自动编号"
              />
            </div>
          </div>

          <Textarea
            placeholder={`田口：はい、お電話替わりました。人事部の田口です。\n（田口：是的，电话转接好了。我是人事部的田口。）\nラジュ：あ、おはようございます。ラジュと申します。求人の件でお聞きしたいことがあるんですが。\n（拉朱：啊，早上好。我叫拉朱。我想咨询一下招聘相关的事宜。）\n田口：何でしょうか\n（田口：请问是什么事？）`}
            value={dialogueText}
            onChange={(e) => setDialogueText(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />

          {dialogueText.trim() && (
            <div className="text-sm text-secondary bg-surface-container-high p-2 rounded">
              预览: {(() => {
                const allLines = dialogueText.trim().split('\n').filter(l => l.trim());
                const jpLines = allLines.filter(l => !/^[（(]/.test(l.trim()) && l.match(/^.+?[：:]/));
                const cnLines = allLines.filter(l => /^[（(]/.test(l.trim()));
                const names = new Set(jpLines.map(l => l.match(/^(.+?)[：:]/)?.[1]?.trim()).filter(Boolean));
                return `${jpLines.length} 句, ${cnLines.length} 条中文翻译, ${names.size} 个角色 (${[...names].join(', ')})`;
              })()}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleDialogueImport} disabled={!dialogueText.trim() || dialogueImporting}>
              {dialogueImporting ? '导入中...' : '导入对话'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Entity)} className="mt-6">
          <TabsList>
            <TabsTrigger value="books">书本</TabsTrigger>
            <TabsTrigger value="courses">课程</TabsTrigger>
            <TabsTrigger value="characters">角色</TabsTrigger>
            <TabsTrigger value="sentences">句子</TabsTrigger>
          </TabsList>

          {/* ─── Books Tab ─── */}
          <TabsContent value="books">
            <EntityTab
              entity="books"
              data={books}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={(id) => { setDeleteTarget({ id, entity: 'books' }); setDeleteOpen(true); }}
              onImport={() => setImportOpen(true)}
              columns={[
                { key: 'book_number', label: '编号' },
                { key: 'title_jp', label: '日文标题' },
                { key: 'title_cn', label: '中文标题' },
                { key: 'difficulty', label: '难度' },
                { key: 'is_published', label: '已发布', render: (r: AnyRecord) => (r as BookRecord).is_published ? '✓' : '✗' },
              ]}
            />
          </TabsContent>

          {/* ─── Courses Tab ─── */}
          <TabsContent value="courses">
            <EntityTab
              entity="courses"
              data={courses}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={(id) => { setDeleteTarget({ id, entity: 'courses' }); setDeleteOpen(true); }}
              onImport={() => setImportOpen(true)}
              columns={[
                { key: 'book_id', label: '书本' },
                { key: 'course_number', label: '课号' },
                { key: 'title_jp', label: '日文标题' },
                { key: 'title_cn', label: '中文标题' },
                { key: 'difficulty', label: '难度' },
                { key: 'theme', label: '主题' },
              ]}
            />
          </TabsContent>

          {/* ─── Characters Tab ─── */}
          <TabsContent value="characters">
            <EntityTab
              entity="characters"
              data={characters}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={(id) => { setDeleteTarget({ id, entity: 'characters' }); setDeleteOpen(true); }}
              onImport={() => setImportOpen(true)}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'name_jp', label: '日文名' },
                { key: 'name_cn', label: '中文名' },
                { key: 'gender', label: '性别' },
              ]}
            />
          </TabsContent>

          {/* ─── Sentences Tab ─── */}
          <TabsContent value="sentences">
            <EntityTab
              entity="sentences"
              data={sentences}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={(id) => { setDeleteTarget({ id, entity: 'sentences' }); setDeleteOpen(true); }}
              onImport={() => setImportOpen(true)}
              columns={[
                { key: 'book_id', label: '书本' },
                { key: 'course_id', label: '课程' },
                { key: 'sentence_order', label: '序号' },
                { key: 'text_jp', label: '日文', truncate: 40 },
                { key: 'text_cn', label: '中文', truncate: 40 },
                { key: 'difficulty_level', label: '难度' },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Edit/Add Dialog ─── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? '编辑' : '新增'} {activeTab === 'books' ? '书本' : activeTab === 'courses' ? '课程' : activeTab === 'characters' ? '角色' : '句子'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {getFormFields().map((field) => (
              <div key={field.key}>
                <Label className="text-sm">{field.label}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    value={(formData[field.key] as string) ?? ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={(formData[field.key] as string) ?? ''}
                    onValueChange={(v) => setFormData({ ...formData, [field.key]: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      checked={!!formData[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-secondary">
                      {formData[field.key] ? '是' : '否'}
                    </span>
                  </div>
                ) : (
                  <Input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={(formData[field.key] as string | number) ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [field.key]: field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value,
                    })}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可撤销。确定要删除这条记录吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Import Dialog ─── */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>导入 JSON</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                选择 JSON 文件
              </Button>
            </div>
            <Textarea
              placeholder="或在此粘贴 JSON 内容..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={10}
              className="font-mono text-xs"
            />
            {importText && (
              <ImportPreview text={importText} />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setImportOpen(false); setImportText(''); }}>取消</Button>
            <Button onClick={handleImport} disabled={!importText || importing}>
              {importing ? '导入中...' : '导入'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── EntityTab Component ─────────────────────────────────────────────────────

interface ColumnDef {
  key: string;
  label: string;
  truncate?: number;
  render?: (record: AnyRecord) => React.ReactNode;
}

function EntityTab({
  data,
  onAdd,
  onEdit,
  onDelete,
  onImport,
  columns,
}: {
  entity: Entity;
  data: AnyRecord[];
  onAdd: () => void;
  onEdit: (record: AnyRecord) => void;
  onDelete: (id: number) => void;
  onImport: () => void;
  columns: ColumnDef[];
}) {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">
        <Button size="sm" onClick={onAdd}>+ 新增</Button>
        <Button size="sm" variant="outline" onClick={onImport}>导入 JSON</Button>
      </div>
      <div className="border border-outline-variant/15 rounded-lg bg-surface-container-low">
        <ScrollArea className="max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center text-secondary/40 py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                data.map((record) => (
                  <TableRow key={record.id}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {col.render
                          ? col.render(record)
                          : truncate(String(record[col.key] ?? ''), col.truncate)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => onEdit(record)}>编辑</Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(record.id)}>删除</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      <div className="text-sm text-secondary/60">
        共 {data.length} 条记录
      </div>
    </div>
  );
}

// ─── ImportPreview Component ─────────────────────────────────────────────────

function ImportPreview({ text }: { text: string }) {
  try {
    const data = JSON.parse(text);
    const counts: Record<string, number> = {};
    if (data.books) {
      counts['书本'] = data.books.length;
      let courses = 0, chars = 0, sents = 0;
      for (const b of data.books) {
        if (b.courses) {
          courses += b.courses.length;
          for (const c of b.courses) {
            if (c.characters) chars += c.characters.length;
            if (c.sentences) sents += c.sentences.length;
          }
        }
      }
      if (courses) counts['课程'] = courses;
      if (chars) counts['角色'] = chars;
      if (sents) counts['句子'] = sents;
    }
    if (data.courses) counts['课程'] = data.courses.length;
    if (data.characters) counts['角色'] = data.characters.length;
    if (data.sentences) counts['句子'] = data.sentences.length;

    return (
      <div className="text-sm text-secondary bg-surface-container-high p-2 rounded">
        预览: {Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ') || '无有效数据'}
      </div>
    );
  } catch {
    return <div className="text-sm text-destructive">JSON 格式错误</div>;
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function truncate(str: string, max?: number): string {
  if (!max || str.length <= max) return str;
  return str.slice(0, max) + '...';
}
