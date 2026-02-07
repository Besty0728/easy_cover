'use client';

import React from 'react';
import { useCoverStore, RATIOS, AspectRatio } from '@/store/useCoverStore';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconPicker } from '@/components/cover/IconPicker';
import { Separator } from '@/components/ui/separator';
import { Download, RotateCcw, Maximize, Github, ExternalLink, Settings2, Link as LinkIcon, Link2, Upload, Plus, Copy, Trash } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

// Helper component for Reset Button
const ResetButton = ({ onClick, tooltip = "重置" }: { onClick: () => void, tooltip?: string }) => (
    <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 ml-2" 
        onClick={onClick}
        title={tooltip}
    >
        <RotateCcw className="h-3 w-3" />
    </Button>
);

const SPLIT_PRESETS = [
    { name: '默认', left: { x: 0, y: 0 }, right: { x: 0, y: 0 } },
    { name: '上下错位', left: { x: 0, y: -40 }, right: { x: 0, y: 40 } },
    { name: '左右分离', left: { x: -60, y: 0 }, right: { x: 60, y: 0 } },
    { name: '对角分离', left: { x: -40, y: -40 }, right: { x: 40, y: 40 } },
    { name: '聚拢', left: { x: 20, y: 0 }, right: { x: -20, y: 0 } },
];

const FONTS = [
    { name: 'Inter (默认)', value: 'Inter, sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: 'MiSans', value: 'MiSans, sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: 'HarmonyOS Sans', value: '"HarmonyOS Sans", sans-serif', weights: [100, 400, 700] },
    { name: '得意黑 (Smiley Sans)', value: 'SmileySans, sans-serif', weights: [400] },
    { name: 'OPPO Sans', value: 'OPPOSans, sans-serif', weights: [400] },
    { name: 'Geist Sans', value: 'var(--font-geist-sans), sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: 'Geist Mono', value: 'var(--font-geist-mono), monospace', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: 'Arial', value: 'Arial, sans-serif', weights: [400, 700] },
    { name: 'Times New Roman', value: '"Times New Roman", serif', weights: [400, 700] },
    { name: 'Courier New', value: '"Courier New", monospace', weights: [400, 700] },
    { name: '微软雅黑', value: '"Microsoft YaHei", sans-serif', weights: [300, 400, 700] },
    { name: '黑体', value: 'SimHei, sans-serif', weights: [400] },
    { name: '楷体', value: 'KaiTi, serif', weights: [400] },
];

const WEIGHTS = {
    100: 'Thin (100)',
    200: 'ExtraLight (200)',
    300: 'Light (300)',
    400: 'Regular (400)',
    500: 'Medium (500)',
    600: 'SemiBold (600)',
    700: 'Bold (700)',
    800: 'ExtraBold (800)',
    900: 'Black (900)',
};

const AI_ICONS = [
    { name: 'Claude', src: '/icons/claude-color.svg' },
    { name: 'OpenAI', src: '/icons/openai-2.svg' },
    { name: 'Gemini', src: '/icons/gemini-color.svg' },
    { name: 'DeepSeek', src: '/icons/deepseek-2.svg' },
    { name: 'Qwen', src: '/icons/qwen-color.svg' },
    { name: 'Grok', src: '/icons/grok.svg' },
    { name: 'Sora', src: '/icons/sora-color.svg' },
    { name: 'Moonshot', src: '/icons/moonshot.svg' },
    { name: 'Midjourney', src: '/icons/midjourney.svg' },
    { name: 'Gemini CLI', src: '/icons/geminicli.png' },
    { name: 'GitHub', src: '/icons/github.png' },
    { name: 'Zai', src: '/icons/zai.svg' },
    { name: 'Cloudflare', src: '/icons/cloudflare.svg' },
    { name: 'Vercel (Dark)', src: '/icons/vercel-dark.svg' },
    { name: 'Vercel (Light)', src: '/icons/vercel-light.svg' },
    { name: '腾讯云', src: '/icons/tencentcloud-color.svg' },
    { name: 'EdgeOne', src: '/icons/edgeone.png' },
    { name: 'Cloudreve', src: '/icons/cloudreve.png' },
    { name: 'OpenWebUI', src: '/icons/openwebuilogo.png' },
    { name: '雨云', src: '/icons/yuyunlogo.png' },
    { name: 'Antigravity', src: '/icons/antigravity-logo.png' },
];

const SliderWithInput = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1
}: {
    label: string,
    value: number,
    onChange: (val: number) => void,
    min: number,
    max: number,
    step?: number
}) => {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <Label className="text-sm text-muted-foreground">{label}</Label>
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) onChange(val);
                    }}
                    className="h-7 w-14 text-sm px-2 text-right"
                />
            </div>
            <Slider
                value={[value]}
                min={min}
                max={max}
                step={step}
                onValueChange={(v) => onChange(v[0])}
            />
        </div>
    );
};

export default function Controls() {
  const store = useCoverStore();

  const selectedText = store.texts.find(t =>
    t.id === store.selectedElementId && store.selectedElementType === 'text'
  );

  const selectedIcon = store.icons.find(i =>
    i.id === store.selectedElementId && store.selectedElementType === 'icon'
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      store.updateBackground({ type: 'image', imageUrl: url });
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedIcon) {
      const url = URL.createObjectURL(file);
      store.updateIcon(selectedIcon.id, { customIconUrl: url });
    }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedText) {
        try {
            const fontName = `CustomFont_${Date.now()}`;
            const url = URL.createObjectURL(file);
            const font = new FontFace(fontName, `url(${url})`);
            await font.load();
            document.fonts.add(font);
            store.updateText(selectedText.id, { font: fontName });
        } catch (err) {
            console.error('Failed to load font', err);
            alert('字体加载失败，请尝试其他字体文件');
        }
    }
  };

  const handleExport = async () => {
    const prevSelectedId = store.selectedElementId;
    const prevSelectedType = store.selectedElementType;
    store.selectElement(null, null);

    await new Promise(resolve => setTimeout(resolve, 50));

    const node = document.getElementById('canvas-export-target');
    if (!node) return;

    try {
      const dataUrl = await toPng(node as HTMLElement, {
          quality: 0.95,
          pixelRatio: 1,
          filter: (node) => {
              if (node.classList && node.classList.contains('export-exclude')) {
                  return false;
              }
              return true;
          }
      });
      const link = document.createElement('a');
      link.download = 'easy-cover.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }

    store.selectElement(prevSelectedId, prevSelectedType);
  };

  const handleFit = (mode: 'contain' | 'cover') => {
      // Always reset position and rotation
      const updates: any = { positionX: 50, positionY: 50, rotation: 0 };
      
      // We will simply reset scale to 1 and let user manually adjust if they want 'contain'.
      // But for 'cover', we try to calculate a scale that fills the canvas.
      
      if (mode === 'contain') {
          updates.scale = 1;
      } else {
          // Calculate scale to cover
          // 1. Get current canvas dimensions
          const activeRatios = RATIOS.filter((r) => store.selectedRatios.includes(r.label));
          if (activeRatios.length > 0 && store.background.imageUrl) {
               const maxWidth = Math.max(...activeRatios.map((r) => r.width));
               const maxHeight = Math.max(...activeRatios.map((r) => r.height));
               const canvasRatio = maxWidth / maxHeight;

               // 2. Get image dimensions
               const img = new Image();
               img.src = store.background.imageUrl;
               img.onload = () => {
                   const imgRatio = img.naturalWidth / img.naturalHeight;
                   
                   let newScale = 1;
                   if (imgRatio > canvasRatio) {
                       // Image is wider than canvas: Scale based on Height
                       // Contain logic makes width match canvas (if img wider? No.)
                       // Let's revisit: 
                       // In 'contain' (object-fit), img is scaled so it fits inside.
                       // If imgRatio > canvasRatio (Image is flatter):
                       //   It hits the sides first. Width = CanvasWidth. Height = Width / imgRatio.
                       //   To cover, we need Height = CanvasHeight.
                       //   Scale = CanvasHeight / CurrentHeight = CanvasHeight / (CanvasWidth / imgRatio)
                       //         = (CanvasHeight / CanvasWidth) * imgRatio = imgRatio / canvasRatio.
                       newScale = imgRatio / canvasRatio;
                   } else {
                       // Image is taller than canvas:
                       //   It hits top/bottom first. Height = CanvasHeight. Width = Height * imgRatio.
                       //   To cover, we need Width = CanvasWidth.
                       //   Scale = CanvasWidth / CurrentWidth = CanvasWidth / (CanvasHeight * imgRatio)
                       //         = (CanvasWidth / CanvasHeight) / imgRatio = canvasRatio / imgRatio.
                       newScale = canvasRatio / imgRatio;
                   }
                   
                   // Apply with a slight buffer to avoid sub-pixel gaps
                   store.updateBackground({ ...updates, scale: newScale * 1.01 });
               };
               return; // Async update
          } else {
              // Fallback
              updates.scale = 1;
          }
      }
      store.updateBackground(updates);
  };

  const [activeTab, setActiveTab] = React.useState('picker');
  const [syncOffsets, setSyncOffsets] = React.useState(true);

  // Sync effect for left offset changes
  const handleLeftOffsetChange = (axis: 'x' | 'y', val: number) => {
      if (!selectedText) return;
      const updates: any = { [axis === 'x' ? 'leftOffsetX' : 'leftOffsetY']: val };
      if (syncOffsets) {
          updates[axis === 'x' ? 'rightOffsetX' : 'rightOffsetY'] = -val;
      }
      store.updateText(selectedText.id, updates);
  };

  // Sync effect for right offset changes
  const handleRightOffsetChange = (axis: 'x' | 'y', val: number) => {
      if (!selectedText) return;
      const updates: any = { [axis === 'x' ? 'rightOffsetX' : 'rightOffsetY']: val };
      if (syncOffsets) {
          updates[axis === 'x' ? 'leftOffsetX' : 'leftOffsetY'] = -val;
      }
      store.updateText(selectedText.id, updates);
  };

  return (
    <div className="w-full md:w-[360px] h-1/2 md:h-full border-t md:border-t-0 md:border-r border-border bg-background flex flex-col z-10">
      <div className="flex-1 min-h-0 w-full">
        <ScrollArea className="h-full">
            <div className="p-4 space-y-5">

          {/* Layout Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              布局设置
            </h3>

            <div className="space-y-2">
              <Label className="text-sm">图片比例</Label>
              <div className="grid grid-cols-3 gap-2">
                {RATIOS.map((r) => (
                  <div key={r.label} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ratio-${r.label}`}
                      checked={store.selectedRatios.includes(r.label)}
                      onCheckedChange={() => store.toggleRatio(r.label)}
                    />
                    <label htmlFor={`ratio-${r.label}`} className="text-sm font-medium leading-none cursor-pointer">
                      {r.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-ruler" className="text-sm">显示标尺 / 网格</Label>
              <Switch
                id="show-ruler"
                checked={store.showRuler}
                onCheckedChange={store.setShowRuler}
              />
            </div>
          </section>

          <Separator />

          {/* Text Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center font-bold">T</span>
              文字设置
            </h3>

            {/* 文字列表 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">文字列表</h4>
                <Button size="sm" variant="outline" className="h-8 text-sm" onClick={() => store.addText()}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
              </div>

              <div className="space-y-1.5">
                {store.texts.map((text, index) => (
                  <div
                    key={text.id}
                    className={cn(
                      "px-3 py-2.5 border rounded-md cursor-pointer transition-all",
                      store.selectedElementId === text.id && store.selectedElementType === 'text'
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                    onClick={() => store.selectElement(text.id, 'text')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1 font-medium">{text.content || '空文字'}</span>
                      <div className="flex gap-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            store.duplicateText(text.id);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (store.texts.length > 1) {
                              store.removeText(text.id);
                            }
                          }}
                          disabled={store.texts.length === 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* 当前选中文字的设置 */}
            {selectedText && (
              <>
            <div className="space-y-2">
              <Label>内容</Label>
              <Input
                value={selectedText.content}
                onChange={(e) => store.updateText(selectedText.id, { content: e.target.value })}
              />
            </div>

            <div className="space-y-2">
               <Label>字体</Label>
               <div className="flex gap-2">
                   <Select value={selectedText.font.startsWith('CustomFont') ? 'custom' : selectedText.font} onValueChange={(v) => {
                       if (v !== 'custom') store.updateText(selectedText.id, { font: v });
                   }}>
                       <SelectTrigger className="flex-1">
                           <SelectValue placeholder="选择字体" />
                       </SelectTrigger>
                       <SelectContent>
                           {FONTS.map((font) => (
                               <SelectItem key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                                   {font.name}
                               </SelectItem>
                           ))}
                           {selectedText.font.startsWith('CustomFont') && (
                               <SelectItem value="custom">自定义字体</SelectItem>
                           )}
                       </SelectContent>
                   </Select>

                   <div className="relative">
                       <Input
                           type="file"
                           accept=".ttf,.otf,.woff,.woff2"
                           className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                           onChange={handleFontUpload}
                           title="上传字体"
                       />
                       <Button variant="outline" size="icon" className="w-10 px-0">
                           <Upload className="h-4 w-4" />
                       </Button>
                   </div>
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label>字重 ({selectedText.fontWeight})</Label>
                   <ResetButton onClick={() => store.updateText(selectedText.id, { fontWeight: 700 })} />
               </div>
               <Select value={String(selectedText.fontWeight)} onValueChange={(v) => store.updateText(selectedText.id, { fontWeight: parseInt(v) })}>
                   <SelectTrigger>
                       <SelectValue placeholder="选择字重" />
                   </SelectTrigger>
                   <SelectContent>
                       {(() => {
                           const currentFont = FONTS.find(f => f.value === selectedText.font);
                           const availableWeights = currentFont?.weights || [100, 200, 300, 400, 500, 600, 700, 800, 900];

                           return availableWeights.map(w => (
                               <SelectItem key={w} value={String(w)}>
                                   {WEIGHTS[w as keyof typeof WEIGHTS]}
                               </SelectItem>
                           ));
                       })()}
                   </SelectContent>
               </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label>大小 ({selectedText.fontSize}px)</Label>
                 <ResetButton onClick={() => store.updateText(selectedText.id, { fontSize: 160 })} />
              </div>
              <Slider
                value={[selectedText.fontSize]}
                min={12}
                max={2500}
                step={1}
                onValueChange={(v) => store.updateText(selectedText.id, { fontSize: v[0] })}
              />
            </div>

            <div className="flex items-center justify-between">
               <Label>颜色</Label>
               <ColorPicker color={selectedText.color} onChange={(c) => store.updateText(selectedText.id, { color: c })} />
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label>描边宽度</Label>
                   <ResetButton onClick={() => store.updateText(selectedText.id, { strokeWidth: 0 })} />
               </div>
               <Slider
                 value={[selectedText.strokeWidth]}
                 min={0}
                 max={10}
                 step={0.5}
                 onValueChange={(v) => store.updateText(selectedText.id, { strokeWidth: v[0] })}
               />
            </div>

             <div className="flex items-center justify-between">
               <Label>描边颜色</Label>
               <ColorPicker color={selectedText.strokeColor} onChange={(c) => store.updateText(selectedText.id, { strokeColor: c })} />
            </div>

            <div className="flex items-center justify-between">
               <Label htmlFor="text-split">文字错位 / 分离</Label>
               <Switch
                 id="text-split"
                 checked={selectedText.isSplit}
                 onCheckedChange={(c) => store.updateText(selectedText.id, { isSplit: c })}
               />
            </div>

            {selectedText.isSplit && (
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                    <div className="grid grid-cols-3 gap-1 mb-2">
                        {SPLIT_PRESETS.map((preset) => (
                            <Button
                                key={preset.name}
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-2"
                                onClick={() => store.updateText(selectedText.id, {
                                    leftOffsetX: preset.left.x,
                                    leftOffsetY: preset.left.y,
                                    rightOffsetX: preset.right.x,
                                    rightOffsetY: preset.right.y
                                })}
                            >
                                {preset.name}
                            </Button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1 pb-2">
                            <Label htmlFor="sync-offsets" className="text-sm font-medium">同步调整 (中心对称)</Label>
                            <Switch
                                id="sync-offsets"
                                checked={syncOffsets}
                                onCheckedChange={setSyncOffsets}
                            />
                        </div>

                        <Label className="text-sm font-semibold">左侧文字</Label>
                        <SliderWithInput
                            label="水平偏移"
                            value={selectedText.leftOffsetX}
                            min={-200}
                            max={200}
                            onChange={(v) => handleLeftOffsetChange('x', v)}
                        />
                        <SliderWithInput
                            label="垂直偏移"
                            value={selectedText.leftOffsetY}
                            min={-200}
                            max={200}
                            onChange={(v) => handleLeftOffsetChange('y', v)}
                        />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-dashed">
                        <Label className="text-sm font-semibold">右侧文字</Label>
                        <SliderWithInput
                            label="水平偏移"
                            value={selectedText.rightOffsetX}
                            min={-200}
                            max={200}
                            onChange={(v) => handleRightOffsetChange('x', v)}
                        />
                        <SliderWithInput
                            label="垂直偏移"
                            value={selectedText.rightOffsetY}
                            min={-200}
                            max={200}
                            onChange={(v) => handleRightOffsetChange('y', v)}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label>旋转 ({selectedText.rotation}°)</Label>
                   <ResetButton onClick={() => store.updateText(selectedText.id, { rotation: 0 })} />
               </div>
               <Slider
                 value={[selectedText.rotation]}
                 min={0}
                 max={360}
                 step={1}
                 onValueChange={(v) => store.updateText(selectedText.id, { rotation: v[0] })}
               />
            </div>
            </>
            )}
          </section>

          <Separator />

          {/* Icon Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center">⬡</span>
              图标设置
            </h3>

            {/* 图标列表 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">图标列表</h4>
                <Button size="sm" variant="outline" className="h-8 text-sm" onClick={() => store.addIcon()}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
              </div>

              <div className="space-y-1.5">
                {store.icons.map((icon, index) => (
                  <div
                    key={icon.id}
                    className={cn(
                      "px-3 py-2.5 border rounded-md cursor-pointer transition-all",
                      store.selectedElementId === icon.id && store.selectedElementType === 'icon'
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                    onClick={() => store.selectElement(icon.id, 'icon')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {icon.customIconUrl ? (
                          <img src={icon.customIconUrl} alt="Icon" className="w-6 h-6 object-contain" />
                        ) : (
                          <Icon icon={icon.name} width={24} height={24} />
                        )}
                        <span className="text-sm font-medium">图标 {index + 1}</span>
                      </div>
                      <div className="flex gap-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            store.duplicateIcon(icon.id);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (store.icons.length > 1) {
                              store.removeIcon(icon.id);
                            }
                          }}
                          disabled={store.icons.length === 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* 当前选中图标的设置 */}
            {selectedIcon && (
              <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ai">自用图标</TabsTrigger>
                    <TabsTrigger value="picker">搜索图标</TabsTrigger>
                    <TabsTrigger value="upload">上传图标</TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="space-y-2 mt-2">
                    <div className="space-y-2">
                      <Label>快速选择自用图标</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {AI_ICONS.map((icon) => (
                          <button
                            key={icon.name}
                            className={cn(
                              "p-3 border rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center gap-1",
                              selectedIcon.customIconUrl === icon.src ? "border-primary bg-primary/5" : "border-border"
                            )}
                            onClick={() => store.updateIcon(selectedIcon.id, { customIconUrl: icon.src, name: '' })}
                            title={icon.name}
                          >
                            <img src={icon.src} alt={icon.name} className="w-10 h-10 object-contain" />
                          </button>
                        ))}
                      </div>
                    </div>
                </TabsContent>

                <TabsContent value="picker" className="space-y-2 mt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>搜索图标</Label>
                        <a
                            href="https://yesicon.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground flex items-center hover:text-primary hover:underline"
                        >
                            查找图标名称 <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                      <IconPicker
                        value={selectedIcon.name}
                        onChange={(v) => {
                            store.updateIcon(selectedIcon.id, { name: v, customIconUrl: '' });
                        }}
                      />
                      <div className="text-center pt-1">
                          <button
                            className="text-xs text-muted-foreground hover:text-primary hover:underline cursor-pointer"
                            onClick={() => setActiveTab('upload')}
                          >
                            没有找到想要的？手动上传！
                          </button>
                      </div>
                    </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-2 mt-2">
                    <div className="space-y-2">
                        <Label>上传图片</Label>
                        <Input type="file" accept="image/*" onChange={handleIconUpload} />
                        {selectedIcon.customIconUrl && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>图片圆角 ({selectedIcon.customIconRadius}px)</Label>
                                        <ResetButton onClick={() => store.updateIcon(selectedIcon.id, { customIconRadius: 0 })} />
                                    </div>
                                    <Slider
                                        value={[selectedIcon.customIconRadius]}
                                        min={0}
                                        max={1000}
                                        step={5}
                                        onValueChange={(v) => store.updateIcon(selectedIcon.id, { customIconRadius: v[0] })}
                                    />
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-sm"
                                    onClick={() => store.updateIcon(selectedIcon.id, { customIconUrl: '', name: 'logos:react' })}
                                >
                                    清除自定义图标 (使用默认图标)
                                </Button>
                            </>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label>大小 ({selectedIcon.size}px)</Label>
                   <ResetButton onClick={() => store.updateIcon(selectedIcon.id, { size: 120 })} />
               </div>
               <Slider
                 value={[selectedIcon.size]}
                 min={20}
                 max={2500}
                 step={5}
                 onValueChange={(v) => store.updateIcon(selectedIcon.id, { size: v[0] })}
               />
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label>旋转 ({selectedIcon.rotation}°)</Label>
                   <ResetButton onClick={() => store.updateIcon(selectedIcon.id, { rotation: 0 })} />
               </div>
               <Slider
                 value={[selectedIcon.rotation]}
                 min={0}
                 max={360}
                 step={1}
                 onValueChange={(v) => store.updateIcon(selectedIcon.id, { rotation: v[0] })}
               />
            </div>

            <div className="flex items-center justify-between">
               <Label>图标着色</Label>
               <ColorPicker color={selectedIcon.color} onChange={(c) => store.updateIcon(selectedIcon.id, { color: c })} />
            </div>

             <div className="flex items-center justify-between">
              <Label htmlFor="icon-shadow">阴影</Label>
              <Switch
                id="icon-shadow"
                checked={selectedIcon.shadow}
                onCheckedChange={(c) => store.updateIcon(selectedIcon.id, { shadow: c })}
              />
            </div>

            {selectedIcon.shadow && (
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between">
                       <Label>阴影颜色</Label>
                       <ColorPicker color={selectedIcon.shadowColor} onChange={(c) => store.updateIcon(selectedIcon.id, { shadowColor: c })} />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <Label>模糊 ({selectedIcon.shadowBlur}px)</Label>
                            <ResetButton onClick={() => store.updateIcon(selectedIcon.id, { shadowBlur: 6 })} />
                        </div>
                        <Slider
                            value={[selectedIcon.shadowBlur]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(v) => store.updateIcon(selectedIcon.id, { shadowBlur: v[0] })}
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <Label>垂直偏移 ({selectedIcon.shadowOffsetY}px)</Label>
                            <ResetButton onClick={() => store.updateIcon(selectedIcon.id, { shadowOffsetY: 4 })} />
                        </div>
                        <Slider
                            value={[selectedIcon.shadowOffsetY]}
                            min={-50}
                            max={50}
                            step={1}
                            onValueChange={(v) => store.updateIcon(selectedIcon.id, { shadowOffsetY: v[0] })}
                        />
                    </div>
                </div>
            )}

            <Separator className="my-2"/>

            <div className="space-y-2">
                <Label>图标容器形状</Label>
                <Select value={selectedIcon.bgShape} onValueChange={(v) => store.updateIcon(selectedIcon.id, { bgShape: v as any })}>
                    <SelectTrigger>
                        <SelectValue placeholder="容器形状" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">无</SelectItem>
                        <SelectItem value="circle">圆形</SelectItem>
                        <SelectItem value="square">方形</SelectItem>
                        <SelectItem value="rounded-square">圆角矩形</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {selectedIcon.bgShape !== 'none' && (
                <>
                    <div className="flex items-center justify-between">
                        <Label>容器颜色</Label>
                        <ColorPicker color={selectedIcon.bgColor} onChange={(c) => store.updateIcon(selectedIcon.id, { bgColor: c })} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>内边距 ({selectedIcon.padding}px)</Label>
                            <ResetButton onClick={() => store.updateIcon(selectedIcon.id, { padding: 40 })} />
                        </div>
                        <Slider
                            value={[selectedIcon.padding]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={(v) => store.updateIcon(selectedIcon.id, { padding: v[0] })}
                        />
                    </div>
                    {selectedIcon.bgShape === 'rounded-square' && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>容器圆角 ({selectedIcon.radius}px)</Label>
                                <ResetButton onClick={() => store.updateIcon(selectedIcon.id, { radius: 40 })} />
                            </div>
                            <Slider
                                value={[selectedIcon.radius]}
                                min={0}
                                max={200}
                                step={5}
                                onValueChange={(v) => store.updateIcon(selectedIcon.id, { radius: v[0] })}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>容器透明度 ({(selectedIcon.bgOpacity * 100).toFixed(0)}%)</Label>
                            <ResetButton onClick={() => store.updateIcon(selectedIcon.id, { bgOpacity: 1 })} />
                        </div>
                        <Slider
                            value={[selectedIcon.bgOpacity]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={(v) => store.updateIcon(selectedIcon.id, { bgOpacity: v[0] })}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>容器模糊 ({(selectedIcon.bgBlur)}px)</Label>
                            <ResetButton onClick={() => store.updateIcon(selectedIcon.id, { bgBlur: 0 })} />
                        </div>
                        <Slider
                            value={[selectedIcon.bgBlur]}
                            min={0}
                            max={50}
                            step={1}
                            onValueChange={(v) => store.updateIcon(selectedIcon.id, { bgBlur: v[0] })}
                        />
                    </div>
                </>
            )}
            </>
            )}
          </section>

          <Separator />

          {/* Background Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center">◧</span>
              背景设置
            </h3>

            <Tabs defaultValue={store.background.type} onValueChange={(v) => store.updateBackground({ type: v as 'solid' | 'image' })}>
                <TabsList className="grid w-full grid-cols-2 h-9">
                    <TabsTrigger value="solid" className="text-sm">纯色背景</TabsTrigger>
                    <TabsTrigger value="image" className="text-sm">图片背景</TabsTrigger>
                </TabsList>

                <TabsContent value="solid" className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                        <Label>颜色</Label>
                        <ColorPicker color={store.background.color} onChange={(c) => store.updateBackground({ color: c })} />
                    </div>
                </TabsContent>
                
                <TabsContent value="image" className="space-y-2 mt-2">
                     <Input type="file" accept="image/*" onChange={handleImageUpload} />

                     <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>高斯模糊 ({store.background.blur}px)</Label>
                            <ResetButton onClick={() => store.updateBackground({ blur: 0 })} />
                        </div>
                        <Slider
                            value={[store.background.blur]}
                            min={0}
                            max={50}
                            step={1}
                            onValueChange={(v) => store.updateBackground({ blur: v[0] })}
                        />
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                            <Label className="text-sm font-semibold text-muted-foreground w-full mb-1">图片变换</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-sm flex-1"
                                onClick={() => handleFit('contain')}
                            >
                                <Maximize className="w-4 h-4 mr-1" />
                                适应
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-sm flex-1"
                                onClick={() => handleFit('cover')}
                            >
                                <Maximize className="w-4 h-4 mr-1 rotate-90" />
                                铺满
                            </Button>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Label>缩放 ({store.background.scale.toFixed(1)}x)</Label>
                                <ResetButton onClick={() => store.updateBackground({ scale: 1 })} />
                            </div>
                            <Slider
                                value={[store.background.scale]}
                                min={0.1}
                                max={10}
                                step={0.1}
                                onValueChange={(v) => store.updateBackground({ scale: v[0] })}
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Label>水平位置 ({store.background.positionX}%)</Label>
                                <ResetButton onClick={() => store.updateBackground({ positionX: 50 })} />
                            </div>
                            <Slider
                                value={[store.background.positionX]}
                                min={-500}
                                max={500}
                                step={1}
                                onValueChange={(v) => store.updateBackground({ positionX: v[0] })}
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Label>垂直位置 ({store.background.positionY}%)</Label>
                                <ResetButton onClick={() => store.updateBackground({ positionY: 50 })} />
                            </div>
                            <Slider
                                value={[store.background.positionY]}
                                min={-500}
                                max={500}
                                step={1}
                                onValueChange={(v) => store.updateBackground({ positionY: v[0] })}
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Label>旋转 ({store.background.rotation}°)</Label>
                                <ResetButton onClick={() => store.updateBackground({ rotation: 0 })} />
                            </div>
                            <Slider
                                value={[store.background.rotation]}
                                min={0}
                                max={360}
                                step={1}
                                onValueChange={(v) => store.updateBackground({ rotation: v[0] })}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between mt-2">
              <Label htmlFor="bg-shadow">背景阴影</Label>
              <Switch 
                id="bg-shadow" 
                checked={store.background.shadow} 
                onCheckedChange={(c) => store.updateBackground({ shadow: c })} 
              />
            </div>

            {store.background.shadow && (
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg border mt-2">
                    <div className="flex items-center justify-between">
                       <Label>阴影颜色</Label>
                       <ColorPicker color={store.background.shadowColor} onChange={(c) => store.updateBackground({ shadowColor: c })} />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <Label>模糊 ({store.background.shadowBlur}px)</Label>
                            <ResetButton onClick={() => store.updateBackground({ shadowBlur: 30 })} />
                        </div>
                        <Slider
                            value={[store.background.shadowBlur]}
                            min={0}
                            max={200}
                            step={1}
                            onValueChange={(v) => store.updateBackground({ shadowBlur: v[0] })}
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <Label>垂直偏移 ({store.background.shadowOffsetY}px)</Label>
                            <ResetButton onClick={() => store.updateBackground({ shadowOffsetY: 10 })} />
                        </div>
                        <Slider
                            value={[store.background.shadowOffsetY]}
                            min={-100}
                            max={100}
                            step={1}
                            onValueChange={(v) => store.updateBackground({ shadowOffsetY: v[0] })}
                        />
                    </div>
                </div>
            )}
          </section>

        </div>
      </ScrollArea>
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
         <Button className="w-full h-10 font-medium" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出封面图
         </Button>
      </div>
    </div>
  );
}
