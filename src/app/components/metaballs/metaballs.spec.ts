import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Metaballs } from './metaballs';

describe('Metaballs', () => {
  let component: Metaballs;
  let fixture: ComponentFixture<Metaballs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Metaballs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Metaballs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
