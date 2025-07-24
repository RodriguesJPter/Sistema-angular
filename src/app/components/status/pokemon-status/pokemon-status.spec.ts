import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonStatus } from './pokemon-status';

describe('PokemonStatus', () => {
  let component: PokemonStatus;
  let fixture: ComponentFixture<PokemonStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
