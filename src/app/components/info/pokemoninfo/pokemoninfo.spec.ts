import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pokemoninfo } from './pokemoninfo';

describe('Pokemoninfo', () => {
  let component: Pokemoninfo;
  let fixture: ComponentFixture<Pokemoninfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pokemoninfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pokemoninfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
