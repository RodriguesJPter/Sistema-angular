import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokedexLista } from './pokedex-lista';

describe('PokedexLista', () => {
  let component: PokedexLista;
  let fixture: ComponentFixture<PokedexLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokedexLista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokedexLista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
