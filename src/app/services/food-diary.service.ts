import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { TranslationService } from './translation.service';
import { FoodImageService } from './food-image.service';
import { FoodEntry, WeeklyDiary, WeeklyStats } from '../models/food-entry.model';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FoodDiaryService {
  private foodEntries: FoodEntry[] = [];
  private knownFoods: Map<string, string> = new Map<string, string>();
  private foodEntriesSubject = new BehaviorSubject<FoodEntry[]>([]);

  constructor(
    private t: TranslationService,
    private foodImageService: FoodImageService
  ) {
    // Load data from localStorage
    const savedEntries = localStorage.getItem('foodEntries');
    const savedKnownFoods = localStorage.getItem('knownFoods');

    if (savedEntries) {
      this.foodEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      this.foodEntriesSubject.next(this.foodEntries);
    }

    if (savedKnownFoods) {
      const foods = JSON.parse(savedKnownFoods);
      this.knownFoods = new Map(foods);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('foodEntries', JSON.stringify(this.foodEntries));
    localStorage.setItem('knownFoods', JSON.stringify(Array.from(this.knownFoods.entries())));
  }

  getFoodEntries(): Observable<FoodEntry[]> {
    return this.foodEntriesSubject.asObservable();
  }

  getKnownFoods(): string[] {
    return Array.from(this.knownFoods.values());
  }

  getWeeklyDiary(weekNumber: number, year: number): WeeklyDiary {
    const entries = this.foodEntries.filter(
      entry => entry.weekNumber === weekNumber && entry.year === year
    );
    return { weekNumber, year, entries };
  }

  deleteEntry(entry: FoodEntry): void {
    this.foodEntries = this.foodEntries.filter(e => e.id !== entry.id);
    this.foodEntriesSubject.next(this.foodEntries);
    this.saveToLocalStorage();
  }

  getWeeklyStats(numWeeks: number = 6): WeeklyStats[] {
    const stats: WeeklyStats[] = [];
    const currentDate = new Date();

    for (let i = 0; i < numWeeks; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (i * 7));
      const weekNumber = this.getWeekNumber(date);
      const year = date.getFullYear();
      const entriesCount = this.foodEntries.filter(entry => 
        this.getWeekNumber(entry.date) === weekNumber && 
        entry.date.getFullYear() === year
      ).length;
      
      stats.unshift({
        weekNumber,
        year,
        entriesCount
      });
    }

    return stats;
  }

  addFoodEntry(name: string, date: Date): void {
    const weekNumber = this.getWeekNumber(date);
    const year = date.getFullYear();
    
    // Preserve the original case of the food name if it exists in knownFoods
    const lowerCaseName = name.toLowerCase();
    const properCaseName = this.knownFoods.has(lowerCaseName) 
      ? this.knownFoods.get(lowerCaseName)
      : name;

    // Create the entry with a unique ID
    const entry: FoodEntry = {
      id: Date.now().toString(),
      name: properCaseName!,
      date,
      weekNumber,
      year
    };

    // Add the entry to our list
    this.foodEntries.push(entry);
    this.knownFoods.set(lowerCaseName, properCaseName!);
    this.foodEntriesSubject.next([...this.foodEntries]);
    this.saveToLocalStorage();
    
    // Fetch an image for this food item if it doesn't already have one
    this.foodImageService.getImageForFood(properCaseName!).subscribe(imageUrl => {
      // Find the entry we just added and update its image URL
      const entryIndex = this.foodEntries.findIndex(e => e.id === entry.id);
      if (entryIndex !== -1) {
        this.foodEntries[entryIndex].imageUrl = imageUrl;
        this.foodEntriesSubject.next([...this.foodEntries]);
        this.saveToLocalStorage();
      }
    });
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }
}
