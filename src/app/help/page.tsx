'use client';

import Link from 'next/link';
import { BottomNavBar } from '@/components/ui/zen/BottomNavBar';
import { Icon } from '@/components/ui/zen/Icon';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const levels = [
  {
    name: '初級',
    nameEn: 'Beginner',
    description: 'IT日本語の学習を始めたばかりの方',
    color: 'primary',
    requirements: ['練習回数：0-4回', '平均スコア：0-79点', '完了コース：0-1コース'],
  },
  {
    name: '中級',
    nameEn: 'Intermediate',
    description: '日本語の基礎とIT語彙を備えた方',
    color: 'secondary',
    requirements: ['練習回数：≥5回', '平均スコア：≥80点', '完了コース：≥2コース'],
  },
  {
    name: '上級',
    nameEn: 'Advanced',
    description: '流暢な日本語と専門IT知識を持つ方',
    color: 'tertiary',
    requirements: ['練習回数：≥20回', '平均スコア：≥85点', '完了コース：≥5コース'],
  },
];

const faqs = [
  {
    q: 'レベルが上がらないのはなぜですか？',
    a: 'レベルは練習回数、平均スコア、完了コース数の3つの条件を同時に満たす必要があります。ダッシュボードで現在の統計を確認し、アップグレード要件と比較してください。',
  },
  {
    q: '音声認識が正確でない場合はどうすればよいですか？',
    a: '以下を確認してください：①静かな環境で録音する ②明瞭に発音する ③適切なマイク距離（10-20cm） ④APIキーが正しく設定されている',
  },
  {
    q: '学習進度を確認するには？',
    a: 'ダッシュボードで総練習回数、平均スコア、完了コースなどの統計を確認できます。「学習レポート」ページでは、より詳細なデータと成績推移を閲覧できます。',
  },
  {
    q: 'APIキーを他人と共有できますか？',
    a: 'いいえ。APIキーは個人の認証情報です。共有すると、使用量が消費され、追加費用が発生する可能性があり、セキュリティ上のリスクもあります。',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#161f35] to-[#0b1326] flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <Icon name="help" size={20} className="text-primary" />
          <h1 className="font-headline font-bold text-primary tracking-tighter text-xl">ヘルプセンター</h1>
        </div>
      </header>

      <main className="px-6 pt-6 pb-32 max-w-4xl mx-auto space-y-12">
        {/* User Level System */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Icon name="emoji_events" size={24} className="text-tertiary" />
            <h2 className="font-headline text-2xl font-bold tracking-tight">ユーザーレベル</h2>
          </div>

          <div className="bg-surface-container-low p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <Icon name="info" size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-secondary/70 font-body">
                レベルは実際の学習実績に基づいて自動的に計算されます。練習回数が多く、平均スコアが高く、完了コースが多いほど、レベルが上がりやすくなります！
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levels.map((level) => (
              <div
                key={level.name}
                className={cn(
                  'bg-surface-container-low p-6 rounded-2xl space-y-4',
                  level.color === 'primary' && 'border border-primary/10',
                  level.color === 'secondary' && 'border border-secondary/10',
                  level.color === 'tertiary' && 'border border-tertiary/10',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'px-3 py-1 rounded-lg font-label text-xs font-bold tracking-widest',
                    level.color === 'primary' && 'bg-primary/15 text-primary',
                    level.color === 'secondary' && 'bg-secondary/15 text-secondary',
                    level.color === 'tertiary' && 'bg-tertiary/15 text-tertiary',
                  )}>
                    {level.name}
                  </span>
                  <span className="text-secondary/30 text-[10px] font-label">{level.nameEn}</span>
                </div>
                <p className="text-sm text-secondary/60 font-body">{level.description}</p>
                <div className="space-y-2 pt-2 border-t border-outline-variant/10">
                  {level.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Icon name="check_circle" size={14} className={cn(
                        'mt-0.5 flex-shrink-0',
                        level.color === 'primary' && 'text-primary',
                        level.color === 'secondary' && 'text-secondary',
                        level.color === 'tertiary' && 'text-tertiary',
                      )} fill />
                      <span className="text-xs text-secondary/50 font-body">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Level Up Rules */}
          <div className="bg-surface-container-low p-6 rounded-2xl space-y-4">
            <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
              <Icon name="trending_up" size={18} className="text-primary" />
              アップグレードルール
            </h3>
            <div className="space-y-3">
              <div className="border-l-2 border-primary pl-4">
                <p className="font-headline font-bold text-primary text-sm mb-1">初級 → 中級</p>
                <p className="text-xs text-secondary/50 font-body">
                  練習回数 <strong className="text-on-surface">5回</strong>、平均スコア <strong className="text-on-surface">80点</strong>、完了コース <strong className="text-on-surface">2コース</strong> を達成すると自動的に中級にアップグレードされます。
                </p>
              </div>
              <div className="border-l-2 border-tertiary pl-4">
                <p className="font-headline font-bold text-tertiary text-sm mb-1">中級 → 上級</p>
                <p className="text-xs text-secondary/50 font-body">
                  練習回数 <strong className="text-on-surface">20回</strong>、平均スコア <strong className="text-on-surface">85点</strong>、完了コース <strong className="text-on-surface">5コース</strong> を達成すると自動的に上級にアップグレードされます。
                </p>
              </div>
            </div>
            <div className="bg-tertiary/5 px-4 py-3 rounded-xl flex items-start gap-2">
              <Icon name="warning" size={16} className="text-tertiary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-tertiary/70 font-body">
                レベルは上がるだけで、下がることはありません。一度の低いスコアはレベルに影響しませんが、平均スコアがアップグレード速度に影響するため、安定した成績を心がけてください。
              </p>
            </div>
          </div>
        </section>

        {/* API Configuration */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Icon name="api" size={24} className="text-primary" />
            <h2 className="font-headline text-2xl font-bold tracking-tight">API設定ガイド</h2>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-secondary/40 mb-1">モデル名</p>
                <p className="font-mono text-sm text-on-surface font-medium">qwen3-asr-flash</p>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-secondary/40 mb-1">APIプロバイダー</p>
                <p className="text-sm text-on-surface font-medium">Alibaba Cloud DashScope</p>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-secondary/40 mb-1">対応言語</p>
                <p className="text-sm text-on-surface font-medium">日本語・中国語・英語（自動検出）</p>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-secondary/40 mb-1">デプロイ</p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-label bg-primary/10 text-primary">国際版優先</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-label bg-surface-container-highest text-secondary/50">国内版予備</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/10">
              <h4 className="font-headline font-bold text-on-surface text-sm mb-3">APIキーの取得方法</h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-secondary/60 font-body ml-2">
                <li>Alibaba Cloud Bailianにアクセス：<a href="https://bailian.console.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">bailian.console.aliyun.com</a></li>
                <li>Alibaba Cloudアカウントにログインまたは登録</li>
                <li>「API-KEY管理」ページに移動</li>
                <li>新しいAPIキーを作成</li>
                <li>生成されたAPIキーをコピー（形式：sk-xxxx）</li>
                <li>アプリの「設定」ページに貼り付けて保存</li>
              </ol>
            </div>

            <div className="bg-primary/5 px-4 py-3 rounded-xl flex items-start gap-2">
              <Icon name="info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-primary/70 font-body">
                Alibaba Cloud DashScopeは無料枠を提供しています。新規ユーザーには一定の無料呼び出し回数が付与されます。本アプリは追加料金を請求しません。すべてのAPI呼び出し費用はAlibaba Cloudから直接請求されます。
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Icon name="quiz" size={24} className="text-primary" />
            <h2 className="font-headline text-2xl font-bold tracking-tight">よくある質問</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface-container-low p-5 rounded-2xl">
                <h4 className="font-headline font-bold text-on-surface text-sm mb-2">{faq.q}</h4>
                <p className="text-sm text-secondary/60 font-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-surface-container-low p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="support_agent" size={18} className="text-primary" />
            <h3 className="font-headline font-bold text-on-surface">さらにサポートが必要ですか？</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'GitHub Issues', desc: 'プロジェクトリポジトリに問題を報告', href: 'https://github.com/tothemoonai/speak-japanese-app/issues', icon: 'code' },
              { label: 'ドキュメント', desc: '完全な使用ドキュメントを参照', href: '/docs', icon: 'description' },
              { label: '設定ページ', desc: '設定ページからフィードバック', href: '/settings', icon: 'settings' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="block">
                <div className="bg-surface-container-high p-4 rounded-xl text-center hover:bg-surface-container-highest transition-all cursor-pointer group">
                  <Icon name={item.icon} size={24} className="text-secondary/40 mx-auto mb-2 group-hover:text-primary transition-colors" />
                  <p className="font-headline font-bold text-on-surface text-sm mb-1">{item.label}</p>
                  <p className="text-[10px] text-secondary/40 font-label">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
