export interface Birthday {
  id: number;
  name: string;
  nickname?: string | null;
  birth_date: string; // Format: "MM-DD"
  image_url: string | null;
  custom_message: string | null;
}
