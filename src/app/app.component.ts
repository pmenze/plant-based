import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeklyDiaryComponent } from './components/weekly-diary/weekly-diary.component';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    WeeklyDiaryComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private t: TranslationService) {
    this.title = this.t.get('APP_TITLE');
  }
  title: string;
}
