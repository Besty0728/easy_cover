'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useCoverStore, RATIOS } from '@/store/useCoverStore';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

export default function Canvas() {
  const {
    selectedRatios,
    showRuler,
    texts,
    icons,
    background,
    selectedElementId,
    selectedElementType,
    selectElement,
    updateText,
    updateIcon,
  } = useCoverStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState<{
    id: string;
    type: 'text' | 'icon';
    startX: number;
    startY: number;
    elementX: number;
    elementY: number;
  } | null>(null);

  // Calculate the bounding box required for all selected ratios
  const dimensions = useMemo(() => {
    const activeRatios = RATIOS.filter((r) => selectedRatios.includes(r.label));
    if (activeRatios.length === 0) return { width: 1000, height: 1000 };

    const maxWidth = Math.max(...activeRatios.map((r) => r.width));
    const maxHeight = Math.max(...activeRatios.map((r) => r.height));

    return { width: maxWidth, height: maxHeight };
  }, [selectedRatios]);

  // Auto-scale to fit container
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;

      const padding = 80;
      const availableWidth = parent.clientWidth - padding;
      const availableHeight = parent.clientHeight - padding;

      const scaleX = availableWidth / dimensions.width;
      const scaleY = availableHeight / dimensions.height;
      setScale(Math.min(scaleX, scaleY) * 0.9);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dimensions]);

  // 拖拽处理
  const handleMouseDown = (
    e: React.MouseEvent,
    id: string,
    type: 'text' | 'icon',
    currentX: number,
    currentY: number
  ) => {
    e.stopPropagation();
    selectElement(id, type);
    setDragging({
      id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      elementX: currentX,
      elementY: currentY,
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragging.startX;
      const deltaY = e.clientY - dragging.startY;

      const newX = dragging.elementX + deltaX / scale;
      const newY = dragging.elementY + deltaY / scale;

      if (dragging.type === 'text') {
        updateText(dragging.id, { x: newX, y: newY });
      } else {
        updateIcon(dragging.id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, scale, updateText, updateIcon]);

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Helper to render the Icon content
  const renderIconContent = (icon: any) => {
    const bgColor = icon.bgShape !== 'none'
      ? hexToRgba(icon.bgColor, icon.bgOpacity)
      : 'transparent';

    const hasCustomIcon = icon.customIconUrl && icon.customIconUrl.length > 0;
    const hasIconifyIcon = icon.name && icon.name.length > 0;

    return (
      <div
        className="flex items-center justify-center pointer-events-none"
        style={{
          transform: `rotate(${icon.rotation}deg)`,
          filter: icon.shadow ? `drop-shadow(0 ${icon.shadowOffsetY}px ${icon.shadowBlur}px ${icon.shadowColor})` : 'none',
          backgroundColor: bgColor,
          backdropFilter: icon.bgBlur > 0 ? `blur(${icon.bgBlur}px)` : 'none',
          WebkitBackdropFilter: icon.bgBlur > 0 ? `blur(${icon.bgBlur}px)` : 'none',
          padding: icon.bgShape !== 'none' ? `${icon.padding}px` : 0,
          borderRadius: icon.bgShape === 'circle' ? '50%' : icon.bgShape === 'rounded-square' ? `${icon.radius}px` : '0',
          overflow: 'visible',
        }}
      >
        {hasCustomIcon ? (
          <img
            src={icon.customIconUrl}
            alt="Custom Icon"
            style={{
              height: icon.size,
              width: 'auto',
              maxWidth: 'none',
              borderRadius: icon.customIconRadius,
              display: 'block',
              objectFit: 'contain',
            }}
          />
        ) : hasIconifyIcon ? (
          <Icon icon={icon.name} width={icon.size} height={icon.size} color={icon.color} />
        ) : (
          <Icon icon="logos:react" width={icon.size} height={icon.size} />
        )}
      </div>
    );
  };

  // Helper to render Text content
  const renderTextContent = (text: any, content: string, offsetX: number = 0, offsetY: number = 0) => (
    <div
      className="whitespace-pre text-center leading-tight"
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px) rotate(${text.rotation}deg)`,
        fontSize: `${text.fontSize}px`,
        color: text.color,
        fontWeight: text.fontWeight,
        fontFamily: text.font,
        WebkitTextStroke: text.strokeWidth > 0 ? `${text.strokeWidth}px ${text.strokeColor}` : undefined,
      }}
    >
      {content}
    </div>
  );

  // Render content - 使用原来的 grid 布局
  const renderContent = () => {
    return (
      <>
        {/* 渲染所有文字 */}
        {texts.map((text) => {
          const isSelected = selectedElementId === text.id && selectedElementType === 'text';

          let leftContent = text.content;
          let rightContent = '';
          if (text.isSplit && text.content.length > 1) {
            const mid = Math.ceil(text.content.length / 2);
            leftContent = text.content.slice(0, mid);
            rightContent = text.content.slice(mid);
          }

          return (
            <div
              key={text.id}
              className="absolute z-10 cursor-move select-none"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${text.x}px, ${text.y}px)`,
                outline: isSelected ? '2px dashed #3b82f6' : 'none',
                outlineOffset: '4px',
              }}
              onMouseDown={(e) => handleMouseDown(e, text.id, 'text', text.x, text.y)}
            >
              <div className="flex items-center justify-center">
                {text.isSplit ? (
                  <>
                    {renderTextContent(text, leftContent, text.leftOffsetX, text.leftOffsetY)}
                    {renderTextContent(text, rightContent, text.rightOffsetX, text.rightOffsetY)}
                  </>
                ) : (
                  renderTextContent(text, text.content, 0, 0)
                )}
              </div>
            </div>
          );
        })}

        {/* 渲染所有图标 */}
        {icons.map((icon) => {
          const isSelected = selectedElementId === icon.id && selectedElementType === 'icon';

          return (
            <div
              key={icon.id}
              className="absolute z-20 cursor-move select-none"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${icon.x}px, ${icon.y}px)`,
                outline: isSelected ? '2px dashed #3b82f6' : 'none',
                outlineOffset: '4px',
              }}
              onMouseDown={(e) => handleMouseDown(e, icon.id, 'icon', icon.x, icon.y)}
            >
              {renderIconContent(icon)}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="flex-1 bg-muted/50 dark:bg-muted/20 overflow-hidden relative w-full h-[40vh] md:h-full min-w-0 flex-shrink-0 md:flex-shrink">
      {/* 网格背景 */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Container for scaling */}
      <div
        ref={containerRef}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        <div
          id="canvas-export-target"
          className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center shadow-2xl"
          onClick={() => selectElement(null, null)}
        >
          {/* Background Layer */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: background.type === 'solid' ? background.color : '#ffffff',
              borderRadius: `${background.radius}px`,
            }}
          >
            {background.type === 'image' && background.imageUrl && (
              <img
                src={background.imageUrl}
                alt="Background"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{
                  filter: `blur(${background.blur}px)`,
                  transform: `scale(${background.scale}) translate(${background.positionX - 50}%, ${background.positionY - 50}%) rotate(${background.rotation}deg)`,
                  transformOrigin: 'center',
                }}
              />
            )}
          </div>

          {/* Inner Shadow Layer */}
          {background.shadow && (
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                boxShadow: `inset 0 ${background.shadowOffsetY}px ${background.shadowBlur}px ${background.shadowColor}`,
              }}
            />
          )}

          {/* Content Layer */}
          {renderContent()}

          {/* Overlays / Guides Layer */}
          {selectedRatios.map((ratioLabel) => {
            const ratio = RATIOS.find((r) => r.label === ratioLabel);
            if (!ratio) return null;

            const left = (dimensions.width - ratio.width) / 2;
            const top = (dimensions.height - ratio.height) / 2;

            return (
              <div
                key={ratioLabel}
                className="absolute border-2 border-dashed border-blue-500/50 pointer-events-none flex items-start justify-start export-exclude"
                style={{
                  width: ratio.width,
                  height: ratio.height,
                  left: left,
                  top: top,
                  zIndex: 50
                }}
              >
                <span className="bg-blue-500 text-white text-xs px-1 opacity-70">{ratioLabel}</span>
              </div>
            );
          })}

          {/* Ruler Overlay */}
          {showRuler && (
            <div
              className="absolute inset-0 pointer-events-none opacity-30 z-40 export-exclude"
              style={{
                backgroundImage: 'linear-gradient(90deg, #000 1px, transparent 1px), linear-gradient(0deg, #000 1px, transparent 1px)',
                backgroundSize: '100px 100px'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
