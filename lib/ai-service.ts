// AI 图片生成服务

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }[];
  error?: {
    message: string;
  };
}

interface OpenAIResponse {
  data?: Array<{
    url?: string;
    b64_json?: string;
  }>;
  error?: {
    message: string;
  };
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      images?: Array<{
        image_url?: { url: string };
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

export interface ImageGenerationOptions {
  aspectRatio?: string;
  imageSize?: string;
  useGoogleSearch?: boolean;
}

// 将比例转换为 OpenAI 尺寸
function aspectRatioToOpenAISize(ratio: string): string {
  const map: Record<string, string> = {
    '1:1': '1024x1024',
    '16:9': '1792x1024',
    '9:16': '1024x1792',
  };
  return map[ratio] || '1024x1024';
}

// OpenAI 文生图
export async function openaiGenerateImage(
  endpoint: string,
  apiKey: string,
  model: string,
  prompt: string,
  options?: ImageGenerationOptions
): Promise<string[]> {
  const url = `${endpoint}/images/generations`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: aspectRatioToOpenAISize(options?.aspectRatio || '1:1'),
      response_format: 'b64_json',
    }),
  });

  const data: OpenAIResponse = await response.json();

  if (data.error) throw new Error(data.error.message);
  if (!data.data?.length) throw new Error('无效的响应格式');

  return data.data
    .filter((d) => d.b64_json)
    .map((d) => `data:image/png;base64,${d.b64_json}`);
}

// OpenAI 图生图（仅 DALL-E 2 支持）
export async function openaiEditImage(
  endpoint: string,
  apiKey: string,
  model: string,
  imageBase64: string,
  prompt: string,
  options?: ImageGenerationOptions
): Promise<string[]> {
  // DALL-E 3 不支持图生图，使用文生图
  if (model.includes('dall-e-3')) {
    return openaiGenerateImage(endpoint, apiKey, model, prompt, options);
  }

  // DALL-E 2 使用 edits 端点
  // 注意：edits 端点不需要 model 参数，且图片必须是正方形 PNG（最大 4MB）
  const url = `${endpoint}/images/edits`;

  const match = imageBase64.match(/^data:(.+);base64,(.+)$/);
  const base64Data = match?.[2] || imageBase64;
  const binaryData = atob(base64Data);
  const bytes = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    bytes[i] = binaryData.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'image/png' });

  const formData = new FormData();
  formData.append('image', blob, 'image.png');
  formData.append('prompt', prompt);
  formData.append('n', '1');
  formData.append('size', '1024x1024');
  formData.append('response_format', 'b64_json');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  });

  const data: OpenAIResponse = await response.json();

  if (data.error) throw new Error(data.error.message);
  if (!data.data?.length) throw new Error('无效的响应格式');

  return data.data
    .filter((d) => d.b64_json)
    .map((d) => `data:image/png;base64,${d.b64_json}`);
}

// Gemini 文生图
export async function geminiGenerateImage(
  endpoint: string,
  apiKey: string,
  model: string,
  prompt: string,
  options?: ImageGenerationOptions
): Promise<string[]> {
  const url = `${endpoint}/models/${model}:generateContent`;

  const generationConfig: Record<string, unknown> = {
    responseModalities: ['TEXT', 'IMAGE'],
  };

  const needsAspectRatio = options?.aspectRatio && options.aspectRatio !== '1:1';
  const needsImageSize = options?.imageSize && options.imageSize !== '1K' && model.includes('gemini-3');
  if (needsAspectRatio || needsImageSize) {
    const imageConfig: Record<string, string> = {};
    if (needsAspectRatio) imageConfig.aspectRatio = options!.aspectRatio!;
    if (needsImageSize) imageConfig.imageSize = options!.imageSize!;
    generationConfig.imageConfig = imageConfig;
  }

  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  };

  if (options?.useGoogleSearch) {
    body.tools = [{ googleSearch: {} }];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  const data: GeminiResponse = await response.json();

  if (data.error) throw new Error(data.error.message);
  if (!data.candidates?.[0]?.content?.parts) throw new Error('无效的响应格式');

  return data.candidates[0].content.parts
    .filter((p) => p.inlineData)
    .map((p) => `data:${p.inlineData!.mimeType};base64,${p.inlineData!.data}`);
}

// Gemini 图生图
export async function geminiEditImage(
  endpoint: string,
  apiKey: string,
  model: string,
  imageBase64: string,
  prompt: string,
  options?: ImageGenerationOptions
): Promise<string[]> {
  const url = `${endpoint}/models/${model}:generateContent`;

  const match = imageBase64.match(/^data:(.+);base64,(.+)$/);
  const mimeType = match?.[1] || 'image/png';
  const base64Data = match?.[2] || imageBase64;

  const generationConfig: Record<string, unknown> = {
    responseModalities: ['TEXT', 'IMAGE'],
  };

  const needsAspectRatio = options?.aspectRatio && options.aspectRatio !== '1:1';
  const needsImageSize = options?.imageSize && options.imageSize !== '1K' && model.includes('gemini-3');
  if (needsAspectRatio || needsImageSize) {
    const imageConfig: Record<string, string> = {};
    if (needsAspectRatio) imageConfig.aspectRatio = options!.aspectRatio!;
    if (needsImageSize) imageConfig.imageSize = options!.imageSize!;
    generationConfig.imageConfig = imageConfig;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: mimeType, data: base64Data } },
          { text: prompt },
        ],
      }],
      generationConfig,
    }),
  });

  const data: GeminiResponse = await response.json();

  if (data.error) throw new Error(data.error.message);
  if (!data.candidates?.[0]?.content?.parts) throw new Error('无效的响应格式');

  return data.candidates[0].content.parts
    .filter((p) => p.inlineData)
    .map((p) => `data:${p.inlineData!.mimeType};base64,${p.inlineData!.data}`);
}

// OpenRouter 文生图
export async function openrouterGenerateImage(
  endpoint: string,
  apiKey: string,
  model: string,
  prompt: string,
  options?: ImageGenerationOptions
): Promise<string[]> {
  const url = `${endpoint}/chat/completions`;

  const body: Record<string, unknown> = {
    model,
    messages: [{ role: 'user', content: prompt }],
    modalities: ['image', 'text'],
  };

  if (options?.aspectRatio && options.aspectRatio !== '1:1') {
    body.image_config = { aspect_ratio: options.aspectRatio };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data: OpenRouterResponse = await response.json();

  if (data.error) throw new Error(data.error.message);
  if (!data.choices?.[0]?.message?.images?.length) throw new Error('无效的响应格式');

  return data.choices[0].message.images
    .filter((img) => img.image_url?.url)
    .map((img) => img.image_url!.url);
}

// OpenRouter 图生图
export async function openrouterEditImage(
  endpoint: string,
  apiKey: string,
  model: string,
  imageBase64: string,
  prompt: string,
  options?: ImageGenerationOptions
): Promise<string[]> {
  const url = `${endpoint}/chat/completions`;

  const body: Record<string, unknown> = {
    model,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageBase64 } },
        { type: 'text', text: prompt },
      ],
    }],
    modalities: ['image', 'text'],
  };

  if (options?.aspectRatio && options.aspectRatio !== '1:1') {
    body.image_config = { aspect_ratio: options.aspectRatio };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data: OpenRouterResponse = await response.json();

  if (data.error) throw new Error(data.error.message);
  if (!data.choices?.[0]?.message?.images?.length) throw new Error('无效的响应格式');

  return data.choices[0].message.images
    .filter((img) => img.image_url?.url)
    .map((img) => img.image_url!.url);
}
