import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { WeeklyStats } from '../../models/food-entry.model';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-statistics-panel',
  templateUrl: './statistics-panel.component.html',
  styleUrls: ['./statistics-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [TranslationService]
})
export class StatisticsPanelComponent {
  constructor(
    public dialogRef: MatDialogRef<StatisticsPanelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { weeklyStats: WeeklyStats[] },
    public t: TranslationService
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getMaxEntries(): number {
    return Math.max(...this.data.weeklyStats.map(stat => stat.entriesCount), 0);
  }

  getBarHeight(entriesCount: number): string {
    const maxHeight = 200; // max height in pixels
    const maxEntries = this.getMaxEntries();
    return maxEntries > 0 ? `${(entriesCount / maxEntries) * maxHeight}px` : '0';
  }
}
