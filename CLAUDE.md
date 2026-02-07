# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

EasyCover 是一个纯客户端的封面图生成工具，基于 Next.js 构建。所有图片处理在浏览器完成，无需服务器。

## 技术栈

- **框架**: Next.js 16 (静态导出模式)
- **UI**: Tailwind CSS 4 + Shadcn/ui (Radix UI)
- **状态管理**: Zustand
- **图标**: Iconify (@iconify/react)
- **图片导出**: html-to-image
- **交互**: react-moveable (拖拽/旋转元素)

## 常用命令

```bash
# 开发
npm run dev          # 或 pnpm dev
# 访问 http://localhost:3000

# 构建（静态导出到 out/ 目录）
npm run build

# 代码检查
npm run lint
```

## 核心架构

### 状态管理 (store/useCoverStore.ts)

使用 Zustand 管理全局状态，包含三个主要配置对象：

- **text**: 文字设置（内容、字体、大小、颜色、描边、位置、旋转、分割模式）
- **icon**: 图标设置（图标名称、大小、颜色、阴影、容器形状、毛玻璃效果、自定义图片）
- **background**: 背景设置（纯色/图片、模糊、阴影、图片变换）

支持的封面比例定义在 `RATIOS` 常量中：1:1, 16:9, 21:9, 4:3, 2:1

### 组件结构

```
app/
  page.tsx              # 主页面：Controls + Canvas 布局
  layout.tsx            # 全局布局和字体配置
  globals.css           # 全局样式和字体导入

components/
  cover/
    Controls.tsx        # 左侧控制面板（所有配置选项）
    Canvas.tsx          # 右侧画布（实时预览和导出）
    IconPicker.tsx      # 图标选择器（Iconify 搜索）
  ui/                   # Shadcn/ui 组件

store/
  useCoverStore.ts      # Zustand 状态管理
```

### 关键功能实现

**Canvas.tsx**:
- 使用 `html-to-image` 的 `toPng()` 导出封面图
- 导出时自动隐藏标尺和辅助线（通过 `data-export-hide` 属性）
- 支持多比例同时预览（通过 `selectedRatios` 数组）
- 自动缩放以适应视口

**Controls.tsx**:
- 使用 Tabs 组织配置面板（布局、文字、图标、背景）
- 文字分割模式：将文字拆分为左右两部分，独立控制偏移
- 图标容器支持毛玻璃效果（bgOpacity + bgBlur）
- 背景图片支持缩放、平移、旋转、模糊
- 快速预设功能（文字分割预设、背景图片适应/铺满）

### 字体系统

项目支持多种字体，在 `app/globals.css` 中通过 `@font-face` 导入：
- Inter (默认)
- MiSans
- HarmonyOS Sans
- 得意黑 (Smiley Sans)
- OPPO Sans
- Geist Sans/Mono

字体文件位于 `public/fonts/` 目录。

### 静态导出配置

`next.config.ts` 配置了 `output: 'export'` 和 `images.unoptimized: true`，生成纯静态站点到 `out/` 目录，可部署到任何静态托管服务。

## 开发注意事项

- 所有组件使用 `'use client'` 指令（客户端渲染）
- 路径别名 `@/` 指向项目根目录
- 导出功能依赖 DOM 元素的 `id="cover-canvas"`
- 修改状态使用 Zustand 的 `updateText/updateIcon/updateBackground` 方法
- 添加新图标容器形状需同时修改 `useCoverStore.ts` 类型和 `Canvas.tsx` 渲染逻辑
