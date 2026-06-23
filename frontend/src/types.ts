export interface Birthday {
  id: number;
  name: string;
  nickname?: string | null;
  birth_date: string; // Format: "MM-DD"
  image_url: string | null;
  custom_message: string | null;
}

export type EventType = 'holiday_global' | 'holiday_local' | 'private_event';

export interface EventRecord {
  id: number;
  title: string;
  event_date: string; // YYYY-MM-DD HH:MM para privados o MM-DD para feriados
  type: EventType;
  description: string | null;
}
