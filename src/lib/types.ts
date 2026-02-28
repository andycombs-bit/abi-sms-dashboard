export interface Message {
  id: string;
  sender: 'customer' | 'abi';
  text: string;
  timestamp: string;
}

export interface InternalNotes {
  reasoning: string;
  actionItems: string[];
}

export interface Draft {
  id: string;
  customerName: string;
  customerPhone: string;
  confidenceScore: number;
  messages: Message[];
  draftResponse: string;
  internalNotes: InternalNotes;
  createdAt: string;
  status: 'pending' | 'approved' | 'dismissed';
}
