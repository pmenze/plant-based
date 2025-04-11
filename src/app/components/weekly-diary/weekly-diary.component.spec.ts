import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyDiaryComponent } from './weekly-diary.component';

describe('WeeklyDiaryComponent', () => {
  let component: WeeklyDiaryComponent;
  let fixture: ComponentFixture<WeeklyDiaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyDiaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyDiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
