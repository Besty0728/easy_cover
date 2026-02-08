import { create } from 'zustand';

export type AspectRatio = '1:1' | '16:9' | '21:9' | '4:3' | '3:4' | '2:1';

export const RATIOS: { label: AspectRatio; width: number; height: number }[] = [
  { label: '1:1', width: 900, height: 900 },
  { label: '16:9', width: 1600, height: 900 },
  { label: '21:9', width: 2100, height: 900 },
  { label: '4:3', width: 1200, height: 900 },
  { label: '3:4', width: 900, height: 1200 },
  { label: '2:1', width: 1800, height: 900 },
];

interface TextSettings {
  id: string;
  content: string;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  fontWeight: number;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  // Font settings
  font: string;
  // Split settings
  isSplit: boolean;
  leftOffsetX: number;
  leftOffsetY: number;
  rightOffsetX: number;
  rightOffsetY: number;
}

interface IconSettings {
  id: string;
  name: string; // identifier for the icon
  size: number;
  color: string; // useful if we allow tinting, even for colored icons
  shadow: boolean;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  // New settings for "Card/Box" style icon
  bgShape: 'none' | 'circle' | 'square' | 'rounded-square';
  bgColor: string;
  padding: number;
  radius: number; // For rounded-square custom radius
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetY: number;
  // Transparency and Blur for container
  bgOpacity: number; // 0-1
  bgBlur: number; // px
  // Custom image icon
  customIconUrl?: string;
  customIconRadius: number; // For custom image icon radius
}

interface BackgroundSettings {
  type: 'solid' | 'image';
  color: string;
  imageUrl: string;
  blur: number; // 0-100
  radius: number; // 0-100
  shadow: boolean;
  opacity: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetY: number;
  // Image transform settings
  scale: number;
  positionX: number;
  positionY: number;
  rotation: number;
}

export interface AIImageSettings {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

interface CoverState {
  selectedRatios: AspectRatio[];
  showRuler: boolean;
  texts: TextSettings[];
  icons: IconSettings[];
  aiImages: AIImageSettings[];
  background: BackgroundSettings;
  selectedElementId: string | null;
  selectedElementType: 'text' | 'icon' | 'aiImage' | null;

  // Actions
  toggleRatio: (ratio: AspectRatio) => void;
  setShowRuler: (show: boolean) => void;

  addText: () => void;
  removeText: (id: string) => void;
  updateText: (id: string, settings: Partial<TextSettings>) => void;
  duplicateText: (id: string) => void;

  addIcon: () => void;
  removeIcon: (id: string) => void;
  updateIcon: (id: string, settings: Partial<IconSettings>) => void;
  duplicateIcon: (id: string) => void;

  addAIImage: (imageUrl: string) => void;
  removeAIImage: (id: string) => void;
  updateAIImage: (id: string, settings: Partial<AIImageSettings>) => void;

  selectElement: (id: string | null, type: 'text' | 'icon' | 'aiImage' | null) => void;
  updateBackground: (settings: Partial<BackgroundSettings>) => void;
}

export const useCoverStore = create<CoverState>((set) => ({
  selectedRatios: ['16:9'],
  showRuler: true,
  texts: [{
    id: 'text-1',
    content: '封面标题',
    fontSize: 160,
    color: '#000000',
    strokeColor: '#ffffff',
    strokeWidth: 0,
    fontWeight: 700,
    x: 0,
    y: 0,
    rotation: 0,
    zIndex: 1,
    font: 'Inter, sans-serif',
    isSplit: false,
    leftOffsetX: 0,
    leftOffsetY: 0,
    rightOffsetX: 0,
    rightOffsetY: 0,
  }],
  icons: [{
    id: 'icon-1',
    name: 'logos:react',
    size: 120,
    color: '#000000',
    shadow: true,
    x: 0,
    y: 0,
    rotation: 0,
    zIndex: 1,
    bgShape: 'rounded-square',
    bgColor: '#ffffff',
    padding: 40,
    radius: 40,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowBlur: 6,
    shadowOffsetY: 4,
    bgOpacity: 1,
    bgBlur: 0,
    customIconUrl: '',
    customIconRadius: 0,
  }],
  aiImages: [],
  background: {
    type: 'solid',
    color: '#f3f4f6',
    imageUrl: '',
    blur: 0,
    radius: 0,
    shadow: false,
    opacity: 1,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowBlur: 30,
    shadowOffsetY: 10,
    scale: 1,
    positionX: 50,
    positionY: 50,
    rotation: 0,
  },
  selectedElementId: null,
  selectedElementType: null,

  toggleRatio: (ratio) =>
    set((state) => {
      const exists = state.selectedRatios.includes(ratio);
      if (exists && state.selectedRatios.length === 1) return state;
      return {
        selectedRatios: exists
          ? state.selectedRatios.filter((r) => r !== ratio)
          : [...state.selectedRatios, ratio],
      };
    }),
  setShowRuler: (show) => set({ showRuler: show }),

  addText: () => set((state) => {
    const newId = `text-${Date.now()}`;
    return {
      texts: [...state.texts, {
        id: newId,
        content: '新文字',
        fontSize: 160,
        color: '#000000',
        strokeColor: '#ffffff',
        strokeWidth: 0,
        fontWeight: 700,
        x: 0,
        y: 0,
        rotation: 0,
        zIndex: 1,
        font: 'Inter, sans-serif',
        isSplit: false,
        leftOffsetX: 0,
        leftOffsetY: 0,
        rightOffsetX: 0,
        rightOffsetY: 0,
      }],
      selectedElementId: newId,
      selectedElementType: 'text',
    };
  }),

  removeText: (id) => set((state) => {
    const newTexts = state.texts.filter(t => t.id !== id);
    return {
      texts: newTexts,
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      selectedElementType: state.selectedElementId === id ? null : state.selectedElementType,
    };
  }),

  updateText: (id, settings) => set((state) => ({
    texts: state.texts.map(text =>
      text.id === id ? { ...text, ...settings } : text
    ),
  })),

  duplicateText: (id) => set((state) => {
    const text = state.texts.find(t => t.id === id);
    if (!text) return state;
    const newId = `text-${Date.now()}`;
    return {
      texts: [...state.texts, {
        ...text,
        id: newId,
        x: text.x + 20,
        y: text.y + 20,
      }],
      selectedElementId: newId,
      selectedElementType: 'text',
    };
  }),

  addIcon: () => set((state) => {
    const newId = `icon-${Date.now()}`;
    return {
      icons: [...state.icons, {
        id: newId,
        name: 'logos:react',
        size: 120,
        color: '#000000',
        shadow: true,
        x: 0,
        y: 0,
        rotation: 0,
        zIndex: 1,
        bgShape: 'rounded-square',
        bgColor: '#ffffff',
        padding: 40,
        radius: 40,
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowBlur: 6,
        shadowOffsetY: 4,
        bgOpacity: 1,
        bgBlur: 0,
        customIconUrl: '',
        customIconRadius: 0,
      }],
      selectedElementId: newId,
      selectedElementType: 'icon',
    };
  }),

  removeIcon: (id) => set((state) => {
    const newIcons = state.icons.filter(i => i.id !== id);
    return {
      icons: newIcons,
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      selectedElementType: state.selectedElementId === id ? null : state.selectedElementType,
    };
  }),

  updateIcon: (id, settings) => set((state) => ({
    icons: state.icons.map(icon =>
      icon.id === id ? { ...icon, ...settings } : icon
    ),
  })),

  duplicateIcon: (id) => set((state) => {
    const icon = state.icons.find(i => i.id === id);
    if (!icon) return state;
    const newId = `icon-${Date.now()}`;
    return {
      icons: [...state.icons, {
        ...icon,
        id: newId,
        x: icon.x + 20,
        y: icon.y + 20,
      }],
      selectedElementId: newId,
      selectedElementType: 'icon',
    };
  }),

  addAIImage: (imageUrl) => set((state) => {
    const newId = `aiImage-${Date.now()}`;
    return {
      aiImages: [...state.aiImages, {
        id: newId,
        imageUrl,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        zIndex: 1,
      }],
      selectedElementId: newId,
      selectedElementType: 'aiImage',
    };
  }),

  removeAIImage: (id) => set((state) => ({
    aiImages: state.aiImages.filter(i => i.id !== id),
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    selectedElementType: state.selectedElementId === id ? null : state.selectedElementType,
  })),

  updateAIImage: (id, settings) => set((state) => ({
    aiImages: state.aiImages.map(img =>
      img.id === id ? { ...img, ...settings } : img
    ),
  })),

  selectElement: (id, type) => set({
    selectedElementId: id,
    selectedElementType: type,
  }),

  updateBackground: (settings) =>
    set((state) => ({ background: { ...state.background, ...settings } })),
}));
