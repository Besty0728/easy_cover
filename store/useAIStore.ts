import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProviderConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface AIConfig {
  provider: 'gemini' | 'openai';
  gemini: ProviderConfig;
  openai: ProviderConfig;
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
          model: 'gemini-2.0-flash-exp-image-generation',
        },
        openai: {
          endpoint: 'https://api.openai.com/v1',
          apiKey: '',
          model: 'dall-e-3',
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
        set((state) => ({ generatedImages: [image, ...state.generatedImages] })),
      removeGeneratedImage: (index) =>
        set((state) => ({ generatedImages: state.generatedImages.filter((_, i) => i !== index) })),
      clearImages: () => set({ generatedImages: [] }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'ai-config',
      version: 1,
      partialize: (state) => ({ config: state.config }),
      // 迁移旧配置结构
      migrate: (persisted, version) => {
        if (version === 0) {
          const old = persisted as { config?: { provider?: string; endpoint?: string; apiKey?: string; model?: string } };
          if (old.config && !('gemini' in old.config)) {
            // 旧结构迁移到新结构
            return {
              config: {
                provider: old.config.provider || 'gemini',
                gemini: {
                  endpoint: old.config.provider === 'gemini' ? (old.config.endpoint || 'https://generativelanguage.googleapis.com/v1beta') : 'https://generativelanguage.googleapis.com/v1beta',
                  apiKey: old.config.provider === 'gemini' ? (old.config.apiKey || '') : '',
                  model: old.config.provider === 'gemini' ? (old.config.model || 'gemini-2.0-flash-exp-image-generation') : 'gemini-2.0-flash-exp-image-generation',
                },
                openai: {
                  endpoint: old.config.provider === 'openai' ? (old.config.endpoint || 'https://api.openai.com/v1') : 'https://api.openai.com/v1',
                  apiKey: old.config.provider === 'openai' ? (old.config.apiKey || '') : '',
                  model: old.config.provider === 'openai' ? (old.config.model || 'dall-e-3') : 'dall-e-3',
                },
                aspectRatio: (old.config as Record<string, unknown>).aspectRatio as string || '1:1',
                imageSize: (old.config as Record<string, unknown>).imageSize as string || '1K',
                useGoogleSearch: (old.config as Record<string, unknown>).useGoogleSearch as boolean || false,
              },
            };
          }
        }
        return persisted;
      },
    }
  )
);
