import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetCursor } from './target-cursor';

describe('TargetCursor', () => {
  let component: TargetCursor;
  let fixture: ComponentFixture<TargetCursor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetCursor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetCursor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
