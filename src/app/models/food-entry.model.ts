export interface FoodEntry {
  id: string;
  name: string;
  date: Date;
  weekNumber: number;
  year: number;
  imageUrl?: string;
}

export interface WeeklyDiary {
  weekNumber: number;
  year: number;
  entries: FoodEntry[];
}

export interface WeeklyStats {
  weekNumber: number;
  year: number;
  entriesCount: number;
}
