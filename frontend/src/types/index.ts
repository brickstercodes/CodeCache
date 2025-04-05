export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code_snippet: string;
  language: string;
  publisher: string;
  updated_at: string;
  tags: string[];
  ai_bio?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendations: Recommendation[];
}
