import { TranscriptionModel, TranscriptionResponse } from '../types';

const API_ENDPOINT = 'https://api.siliconflow.cn/v1/audio/transcriptions';

export const transcribeAudio = async (
  file: File,
  apiKey: string,
  model: string = TranscriptionModel.SenseVoiceSmall
): Promise<TranscriptionResponse> => {
  if (!apiKey) {
    throw new Error('API Key is required');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', model);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Note: Do not set 'Content-Type': 'multipart/form-data' manually.
        // The browser sets it automatically with the boundary when using FormData.
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `API Request failed: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch (e) {
        // Fallback if not JSON
        if (errorBody) errorMessage = errorBody;
      }
      throw new Error(errorMessage);
    }

    const data: TranscriptionResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during transcription.');
  }
};
