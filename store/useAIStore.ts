import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIConfig {
  provider: 'gemini' | 'openai';
  endpoint: string;
  apiKey: string;
  model: string;
}

interface AIState {
  config: AIConfig;
  isGenerating: boolean;
  generatedImages: string[]; // base64 data URLs
  error: string | null;

  updateConfig: (config: Partial<AIConfig>) => void;
  setGenerating: (isGenerating: boolean) => void;
  addGeneratedImage: (image: string) => void;
  clearImages: () => void;
  setError: (error: string | null) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      config: {
        provider: 'gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta',
        apiKey: '',
        model: 'gemini-2.0-flash-exp-image-generation',
      },
      isGenerating: false,
      generatedImages: [],
      error: null,

      updateConfig: (newConfig) =>
        set((state) => ({ config: { ...state.config, ...newConfig } })),
      setGenerating: (isGenerating) => set({ isGenerating }),
      addGeneratedImage: (image) =>
        set((state) => ({ generatedImages: [image, ...state.generatedImages] })),
      clearImages: () => set({ generatedImages: [] }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'ai-config',
      partialize: (state) => ({ config: state.config }), // 只持久化配置
    }
  )
);
