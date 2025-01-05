export interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

export interface AIResponse {
  text: string;
  error?: string;
}