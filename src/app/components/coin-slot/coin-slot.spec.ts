import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinSlot } from './coin-slot';

describe('CoinSlot', () => {
  let component: CoinSlot;
  let fixture: ComponentFixture<CoinSlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoinSlot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoinSlot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
