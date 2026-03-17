'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Target, TrendingUp, AlertCircle, CheckCircle, Info, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-10" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4" style={{ paddingTop: '0' }}>
          <h1 className="text-xl sm:text-2xl font-bold">帮助中心</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">

        {/* 用户等级系统 */}
        <section className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-6 w-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold">用户等级系统</h2>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                等级说明
              </CardTitle>
              <CardDescription>
                系统会根据您的学习进度自动计算等级，无需手动设置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-secondary/30 p-4 rounded-lg">
                <p className="text-sm">
                  <strong className="text-primary">重要提示：</strong>
                  您的用户等级是根据您的实际学习表现自动评定的，系统会在您达到要求后自动升级。
                  练习次数越多、平均分数越高、完成的课程越多，等级提升就越快！
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 初级 */}
                <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-green-500 text-white">初级</Badge>
                    <span className="text-xs text-muted-foreground">Beginner</span>
                  </div>
                  <h3 className="font-bold mb-2 text-green-700 dark:text-green-300">新手上路</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    适合刚开始学习IT日语的用户
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>练习次数：0-4次</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>平均分数：0-79分</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>完成课程：0-1门</span>
                    </div>
                  </div>
                </div>

                {/* 中级 */}
                <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-blue-500 text-white">中级</Badge>
                    <span className="text-xs text-muted-foreground">Intermediate</span>
                  </div>
                  <h3 className="font-bold mb-2 text-blue-700 dark:text-blue-300">稳步前进</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    具备一定的日语基础和IT词汇量
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">升级要求：</span>
                    </div>
                    <div className="pl-6 space-y-1">
                      <div>• 练习次数：≥5次</div>
                      <div>• 平均分数：≥80分</div>
                      <div>• 完成课程：≥2门</div>
                    </div>
                  </div>
                </div>

                {/* 高级 */}
                <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-purple-500 text-white">高级</Badge>
                    <span className="text-xs text-muted-foreground">Advanced</span>
                  </div>
                  <h3 className="font-bold mb-2 text-purple-700 dark:text-purple-300">日语达人</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    掌握流利的日语和专业的IT知识
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">升级要求：</span>
                    </div>
                    <div className="pl-6 space-y-1">
                      <div>• 练习次数：≥20次</div>
                      <div>• 平均分数：≥85分</div>
                      <div>• 完成课程：≥5门</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 升级提示 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                如何快速升级？
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    多练习
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 每天坚持完成3次练习</li>
                    <li>• 认真对待每次练习，争取高分</li>
                    <li>• 尝试不同的课程和场景</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    提高分数
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 语音清晰，发音标准</li>
                    <li>• 完整回答问题，不要遗漏</li>
                    <li>• 使用正确的日语表达</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 等级计算规则 */}
          <Card>
            <CardHeader>
              <CardTitle>等级自动计算规则</CardTitle>
              <CardDescription>
                系统会在您完成每次练习后自动检查是否符合升级条件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-medium text-green-700 dark:text-green-300 mb-2">初级 → 中级</p>
                  <p className="text-muted-foreground">
                    当您的练习次数达到 <strong>5次</strong>，平均分数达到 <strong>80分</strong>，且已完成 <strong>2门</strong>课程时，系统会自动将您升级为中级用户。
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium text-blue-700 dark:text-blue-300 mb-2">中级 → 高级</p>
                  <p className="text-muted-foreground">
                    当您的练习次数达到 <strong>20次</strong>，平均分数达到 <strong>85分</strong>，且已完成 <strong>5门</strong>课程时，系统会自动将您升级为高级用户。
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">注意事项</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        等级只会自动上升，不会下降。即使某次练习分数较低，也不会影响您的等级。但平均分数会影响升级速度，所以请尽量保持稳定的发挥。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* API配置说明 */}
        <section className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold">API 配置说明</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>语音识别服务配置</CardTitle>
              <CardDescription>
                本应用使用阿里云 DashScope 的 qwen3-asr-flash 模型进行语音识别
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">当前使用的模型</h4>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">模型名称：</span>
                      <span className="ml-2 font-mono font-medium">qwen3-asr-flash</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">API提供商：</span>
                      <span className="ml-2">阿里云 DashScope</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">部署区域：</span>
                      <span className="ml-2">
                        <Badge variant="outline">国际部署优先</Badge>
                        <Badge variant="outline">内地部署备用</Badge>
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">支持语言：</span>
                      <span className="ml-2">日语、中文、英语（自动检测）</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">如何获取 API Key</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                  <li>访问阿里云百炼平台：<a href="https://bailian.console.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://bailian.console.aliyun.com/</a></li>
                  <li>登录或注册阿里云账号</li>
                  <li>进入"API-KEY管理"页面</li>
                  <li>创建新的 API Key（选择"通用型-百度千帆平台"）</li>
                  <li>复制生成的 API Key（格式：sk-xxxxxxxxxxxxxxxxxxxxxxxx）</li>
                  <li>在应用的"设置"页面中粘贴并保存</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">费用说明</h4>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>提示：</strong>
                    阿里云 DashScope 提供免费额度，新用户通常会获得一定的免费调用次数。具体费用和额度请查看阿里云官方文档。
                    本应用不会额外收费，所有API调用费用由阿里云直接向您收取。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 常见问题 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold">常见问题</h2>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">为什么我的等级没有提升？</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>等级是自动计算的，需要同时满足练习次数、平均分数和完成课程数三个条件。您可以在 Dashboard 页面查看当前的统计数据，对比升级要求。如果三项指标都达到了，系统会自动升级。</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">语音识别不准确怎么办？</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>请确保：</p>
                <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                  <li>环境安静，没有背景噪音</li>
                  <li>发音清晰，语速适中</li>
                  <li>麦克风距离适当（约10-20cm）</li>
                  <li>API Key 配置正确且有效</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">如何查看我的学习进度？</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>在 Dashboard 页面可以看到您的总练习次数、平均分数、已完成课程等统计信息。在"学习报告"页面可以查看更详细的学习数据和成绩趋势。</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Key 可以分享给他人吗？</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p><strong>不可以！</strong> API Key 是您的个人凭证，与他人共享会导致：</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>您的使用额度被他人消耗</li>
                  <li>可能产生额外费用</li>
                  <li>安全隐患</li>
                </ul>
                <p className="mt-2">请妥善保管您的 API Key，不要在任何公开场合分享。</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 联系支持 */}
        <section className="mt-8 sm:mt-12">
          <Card>
            <CardHeader>
              <CardTitle>需要更多帮助？</CardTitle>
              <CardDescription>
                如果您在使用过程中遇到问题，可以通过以下方式联系我们
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-4 border rounded-lg">
                  <p className="font-medium mb-2">GitHub Issues</p>
                  <p className="text-muted-foreground text-xs">
                    在项目仓库提交问题
                  </p>
                  <a href="https://github.com/tothemoonai/speak-japanese-app/issues" target="_blank" rel="noopener noreferrer"
                     className="text-primary hover:underline text-xs mt-2 inline-block">
                    提交问题 →
                  </a>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="font-medium mb-2">文档查看</p>
                  <p className="text-muted-foreground text-xs">
                    查看完整的使用文档
                  </p>
                  <a href="/docs" className="text-primary hover:underline text-xs mt-2 inline-block">
                    查看文档 →
                  </a>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="font-medium mb-2">在线反馈</p>
                  <p className="text-muted-foreground text-xs">
                    通过设置页面反馈
                  </p>
                  <a href="/settings" className="text-primary hover:underline text-xs mt-2 inline-block">
                    前往设置 →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
