export interface CreateShowRequest {
  name: string;
  venue?: string;
  city?: string;
  country?: string;
  show_date: string;
  door_time?: string;
  show_time?: string;
  end_time?: string;
  notes?: string;
  ticket_url?: string;
}

export interface UpdateShowRequest extends Partial<CreateShowRequest> {}

export interface ShowResponse {
  id: string;
  name: string;
  venue?: string;
  city?: string;
  country?: string;
  show_date: string;
  door_time?: string;
  show_time?: string;
  end_time?: string;
  notes?: string;
  ticket_url?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}
