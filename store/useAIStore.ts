import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProviderConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface AIConfig {
  provider: 'gemini' | 'openai' | 'openrouter';
  gemini: ProviderConfig;
  openai: ProviderConfig;
  openrouter: ProviderConfig;
  aspectRatio: string;
  imageSize: string;
  useGoogleSearch: boolean;
}

interface AIState {
  config: AIConfig;
  isGenerating: boolean;
  generatedImages: string[]; // base64 data URLs
  error: string | null;

  updateConfig: (config: Partial<AIConfig>) => void;
  setGenerating: (isGenerating: boolean) => void;
  addGeneratedImage: (image: string) => void;
  removeGeneratedImage: (index: number) => void;
  clearImages: () => void;
  setError: (error: string | null) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      config: {
        provider: 'gemini',
        gemini: {
          endpoint: 'https://generativelanguage.googleapis.com/v1beta',
          apiKey: '',
          model: 'gemini-3-pro-image-preview',
        },
        openai: {
          endpoint: 'https://api.openai.com/v1',
          apiKey: '',
          model: 'dall-e-3',
        },
        openrouter: {
          endpoint: 'https://openrouter.ai/api/v1',
          apiKey: '',
          model: 'google/gemini-2.5-flash-image',
        },
        aspectRatio: '1:1',
        imageSize: '1K',
        useGoogleSearch: false,
      },
      isGenerating: false,
      generatedImages: [],
      error: null,

      updateConfig: (newConfig) =>
        set((state) => ({ config: { ...state.config, ...newConfig } })),
      setGenerating: (isGenerating) => set({ isGenerating }),
      addGeneratedImage: (image) =>
        set((state) => {
          const newImages = [image, ...state.generatedImages];
          // 限制最多保留 20 张图片，防止内存溢出
          if (newImages.length > 20) newImages.pop();
          return { generatedImages: newImages };
        }),
      removeGeneratedImage: (index) =>
        set((state) => ({ generatedImages: state.generatedImages.filter((_, i) => i !== index) })),
      clearImages: () => set({ generatedImages: [] }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'ai-config',
      version: 2,
      partialize: (state) => ({ config: state.config }),
      migrate: (persisted, version) => {
        const state = persisted as { config?: Record<string, unknown> };
        if (!state.config) return persisted;

        // v0 -> v2: 旧结构迁移
        if (version === 0 && !('gemini' in state.config)) {
          return {
            config: {
              provider: state.config.provider || 'gemini',
              gemini: {
                endpoint: state.config.provider === 'gemini' ? (state.config.endpoint || 'https://generativelanguage.googleapis.com/v1beta') : 'https://generativelanguage.googleapis.com/v1beta',
                apiKey: state.config.provider === 'gemini' ? (state.config.apiKey || '') : '',
                model: state.config.provider === 'gemini' ? (state.config.model || 'gemini-3-pro-image-preview') : 'gemini-3-pro-image-preview',
              },
              openai: {
                endpoint: state.config.provider === 'openai' ? (state.config.endpoint || 'https://api.openai.com/v1') : 'https://api.openai.com/v1',
                apiKey: state.config.provider === 'openai' ? (state.config.apiKey || '') : '',
                model: state.config.provider === 'openai' ? (state.config.model || 'dall-e-3') : 'dall-e-3',
              },
              openrouter: {
                endpoint: 'https://openrouter.ai/api/v1',
                apiKey: '',
                model: 'google/gemini-2.0-flash-exp:free',
              },
              aspectRatio: state.config.aspectRatio || '1:1',
              imageSize: state.config.imageSize || '1K',
              useGoogleSearch: state.config.useGoogleSearch || false,
            },
          };
        }

        // v1 -> v2: 添加 openrouter
        if (version === 1 && !('openrouter' in state.config)) {
          return {
            config: {
              ...state.config,
              openrouter: {
                endpoint: 'https://openrouter.ai/api/v1',
                apiKey: '',
                model: 'google/gemini-2.0-flash-exp:free',
              },
            },
          };
        }

        return persisted;
      },
    }
  )
);
