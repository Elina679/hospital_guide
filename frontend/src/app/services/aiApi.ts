import { post } from './httpClient';

export interface AIChatResponse {
  reply?: string;
  response?: string;
  answer?: string;
  message?: string;
}

/** Sends one user message to the medical assistant endpoint. */
export async function sendAIMessage(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  const data = await post('/speech/chat', { text: message, history }) as AIChatResponse;
  return data.reply || data.response || data.answer || data.message || '抱歉，我暂时没有返回有效内容。';
}
