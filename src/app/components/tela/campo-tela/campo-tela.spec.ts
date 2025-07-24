import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampoTela } from './campo-tela';

describe('CampoTela', () => {
  let component: CampoTela;
  let fixture: ComponentFixture<CampoTela>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampoTela]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampoTela);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
