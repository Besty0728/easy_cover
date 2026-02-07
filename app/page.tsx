'use client';

import dynamic from 'next/dynamic';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const Controls = dynamic(() => import("@/components/cover/Controls"), {
  ssr: false,
});

const Canvas = dynamic(() => import("@/components/cover/Canvas"), {
  ssr: false,
});

const AIPanel = dynamic(() => import("@/components/cover/AIPanel"), {
  ssr: false,
});

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 检查系统主题偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  return (
    <main className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* 顶部导航栏 */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">E</span>
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">EasyCover</h1>
            <p className="text-[10px] text-muted-foreground hidden sm:block">简单、优雅的封面图生成器</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <a
            href="https://github.com/afoim/easy_cover"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex flex-col-reverse md:flex-row flex-1 overflow-hidden">
        <Controls />
        <Canvas />
        <AIPanel />
      </div>
    </main>
  );
}
