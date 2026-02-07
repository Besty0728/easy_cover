// Gemini API 服务

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

// 文生图
export async function geminiGenerateImage(
  endpoint: string,
  apiKey: string,
  model: string,
  prompt: string
): Promise<string[]> {
  const url = `${endpoint}/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  });

  const data: GeminiResponse = await response.json();

  if (data.error) throw new Error(data.error.message);
  if (!data.candidates?.[0]?.content?.parts) throw new Error('无效的响应格式');

  return data.candidates[0].content.parts
    .filter((p) => p.inlineData)
    .map((p) => `data:${p.inlineData!.mimeType};base64,${p.inlineData!.data}`);
}

// 图生图/修图
export async function geminiEditImage(
  endpoint: string,
  apiKey: string,
  model: string,
  imageBase64: string,
  prompt: string
): Promise<string[]> {
  const url = `${endpoint}/models/${model}:generateContent?key=${apiKey}`;

  // 从 data URL 提取 base64 和 mime type
  const match = imageBase64.match(/^data:(.+);base64,(.+)$/);
  const mimeType = match?.[1] || 'image/png';
  const base64Data = match?.[2] || imageBase64;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: mimeType, data: base64Data } },
          { text: prompt },
        ],
      }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  });

  const data: GeminiResponse = await response.json();

  if (data.error) throw new Error(data.error.message);
  if (!data.candidates?.[0]?.content?.parts) throw new Error('无效的响应格式');

  return data.candidates[0].content.parts
    .filter((p) => p.inlineData)
    .map((p) => `data:${p.inlineData!.mimeType};base64,${p.inlineData!.data}`);
}
