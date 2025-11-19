export interface Tool {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: "excellent" | "good" | "fair" | "poor" | "damaged";
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateToolRequest {
  name: string;
  category: string;
  quantity: number;
  condition: string;
  notes?: string;
}

export interface UpdateToolRequest {
  name?: string;
  category?: string;
  quantity?: number;
  condition?: string;
  notes?: string;
}
