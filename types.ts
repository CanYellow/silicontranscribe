export interface TranscriptionResponse {
  text: string;
}

export interface ApiError {
  message: string;
  code?: number;
}

export enum TranscriptionModel {
  SenseVoiceSmall = 'FunAudioLLM/SenseVoiceSmall',
  TeleSpeechASR = 'TeleAI/TeleSpeechASR',
}

export const AVAILABLE_MODELS = [
  { value: TranscriptionModel.SenseVoiceSmall, label: 'FunAudioLLM / SenseVoiceSmall' },
  { value: TranscriptionModel.TeleSpeechASR, label: 'TeleAI / TeleSpeechASR' },
];
