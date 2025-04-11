import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FoodDiaryService } from '../../services/food-diary.service';
import { FoodEntry, WeeklyDiary } from '../../models/food-entry.model';
import { StatisticsPanelComponent } from '../statistics-panel/statistics-panel.component';

@Component({
  selector: 'app-weekly-diary',
  templateUrl: './weekly-diary.component.html',
  styleUrls: ['./weekly-diary.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatAutocompleteModule,
    MatDialogModule
  ]
})
export class WeeklyDiaryComponent implements OnInit {
  selectedDate: Date = new Date();
  currentWeek: WeeklyDiary = {
    weekNumber: 0,
    year: 0,
    entries: []
  };
  newFoodName: string = '';
  knownFoods: string[] = [];
  filteredFoods: string[] = [];

  constructor(
    private foodDiaryService: FoodDiaryService,
    public t: TranslationService,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit(): void {
    this.loadKnownFoods();
    this.updateCurrentWeek();
    this.foodDiaryService.getFoodEntries().subscribe(() => {
      this.updateCurrentWeek();
    });
  }

  updateCurrentWeek(): void {
    const weekNumber = this.foodDiaryService['getWeekNumber'](this.selectedDate);
    const year = this.selectedDate.getFullYear();
    this.currentWeek = this.foodDiaryService.getWeeklyDiary(weekNumber, year) || {
      weekNumber,
      year,
      entries: []
    };
  }

  navigateWeek(offset: number): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    this.selectedDate = newDate;
    this.updateCurrentWeek();
  }

  goToCurrentWeek(): void {
    this.selectedDate = new Date();
    this.updateCurrentWeek();
  }

  formatWeekRange(): string {
    const startOfWeek = new Date(this.selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${startOfWeek.toLocaleDateString(this.locale)} - ${endOfWeek.toLocaleDateString(this.locale)}`;
  }

  isCurrentWeek(): boolean {
    const today = new Date();
    return this.foodDiaryService['getWeekNumber'](this.selectedDate) === this.foodDiaryService['getWeekNumber'](today) &&
           this.selectedDate.getFullYear() === today.getFullYear();
  }

  loadKnownFoods(): void {
    this.knownFoods = this.foodDiaryService.getKnownFoods();
  }

  filterFoods(value: string): void {
    const filterValue = value.toLowerCase();
    this.filteredFoods = this.knownFoods
      .filter(food => food.toLowerCase().includes(filterValue))
      .slice(0, 5);
  }

  addFood(): void {
    if (this.newFoodName.trim()) {
      try {
        this.foodDiaryService.addFoodEntry(this.newFoodName.trim(), this.selectedDate);
        this.newFoodName = '';
        this.loadKnownFoods();
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(error.message === 'This food has already been logged for this week' ? 
            this.t.get('DUPLICATE_FOOD_ERROR') : error.message);
        } else {
          alert(this.t.get('UNKNOWN_ERROR'));
        }
      }
    }
  }

  selectFood(food: string): void {
    this.newFoodName = food;
    this.filteredFoods = [];
  }

  deleteEntry(entry: FoodEntry): void {
    this.foodDiaryService.deleteEntry(entry);
  }

  openStatistics(): void {
    const stats = this.foodDiaryService.getWeeklyStats();
    this.dialog.open(StatisticsPanelComponent, {
      data: { weeklyStats: stats },
      panelClass: 'statistics-dialog',
      maxWidth: '90vw',
      width: '400px',
      maxHeight: '90vh',
      height: 'auto'
    });
  }

  getItemsCountText(): string {
    const count = this.currentWeek.entries.length;
    if (count === 1) {
      return this.t.get('ITEMS_COUNT_SINGLE');
    }
    return this.t.get('ITEMS_COUNT').replace('{count}', count.toString());
  }
}
