'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Settings, Sparkles, Upload, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAIStore } from '@/store/useAIStore';
import { useCoverStore } from '@/store/useCoverStore';
import { geminiGenerateImage, geminiEditImage } from '@/lib/ai-service';

const GEMINI_MODELS = [
  { value: 'gemini-2.0-flash-exp-image-generation', label: 'Gemini 2.0 Flash (实验)' },
  { value: 'gemini-2.5-flash-preview-native-audio-dialog', label: 'Gemini 2.5 Flash Preview' },
];

export default function AIPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { config, updateConfig, isGenerating, generatedImages, error, setGenerating, addGeneratedImage, setError, clearImages } = useAIStore();
  const { updateBackground } = useCoverStore();

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSourceImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 生成图片
  const handleGenerate = async () => {
    if (!prompt.trim() || !config.apiKey) {
      setError(config.apiKey ? '请输入提示词' : '请先配置 API Key');
      return;
    }
    if (mode === 'edit' && !sourceImage) {
      setError('请先上传源图片');
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      const images = mode === 'generate'
        ? await geminiGenerateImage(config.endpoint, config.apiKey, config.model, prompt)
        : await geminiEditImage(config.endpoint, config.apiKey, config.model, sourceImage!, prompt);

      images.forEach(addGeneratedImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  // 应用图片到背景
  const applyToBackground = (imageUrl: string) => {
    updateBackground({ type: 'image', imageUrl });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-foreground px-2 py-4 rounded-l-lg shadow-lg hover:bg-primary/90 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mb-2" />
        <span className="writing-mode-vertical text-xs">AI 助手</span>
      </button>
    );
  }

  return (
    <div className="w-80 border-l border-border bg-background flex flex-col shrink-0 h-full overflow-hidden">
      {/* 头部 */}
      <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">AI 助手</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowConfig(!showConfig)}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* API 配置 */}
        {showConfig && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <Label className="text-xs font-medium">API 配置</Label>
            <div className="space-y-2">
              <Input
                placeholder="API 端点"
                value={config.endpoint}
                onChange={(e) => updateConfig({ endpoint: e.target.value })}
                className="h-8 text-xs"
              />
              <Input
                type="password"
                placeholder="API Key"
                value={config.apiKey}
                onChange={(e) => updateConfig({ apiKey: e.target.value })}
                className="h-8 text-xs"
              />
              <Select value={config.model} onValueChange={(v) => updateConfig({ model: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GEMINI_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* 模式选择 */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'generate' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => setMode('generate')}
          >
            文生图
          </Button>
          <Button
            variant={mode === 'edit' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => setMode('edit')}
          >
            图生图
          </Button>
        </div>

        {/* 图生图：上传源图 */}
        {mode === 'edit' && (
          <div className="space-y-2">
            <Label className="text-xs">源图片</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {sourceImage ? (
              <div className="relative">
                <img src={sourceImage} alt="源图" className="w-full rounded-lg border" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => setSourceImage(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-20 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                上传图片
              </Button>
            )}
          </div>
        )}

        {/* 提示词输入 */}
        <div className="space-y-2">
          <Label className="text-xs">{mode === 'generate' ? '描述你想要的图片' : '描述如何修改'}</Label>
          <Textarea
            placeholder={mode === 'generate' ? '例如：一个简约的渐变背景，蓝紫色调...' : '例如：将背景改为夜晚星空...'}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[80px] text-xs resize-none"
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}

        {/* 生成按钮 */}
        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              生成图片
            </>
          )}
        </Button>

        {/* 生成结果 */}
        {generatedImages.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">生成结果</Label>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearImages}>
                清空
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {generatedImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt={`生成 ${i + 1}`} className="w-full rounded-lg border" />
                  <Button
                    size="icon"
                    className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => applyToBackground(img)}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
