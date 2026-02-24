import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Angel3d } from './angel3d';

describe('Angel3d', () => {
  let component: Angel3d;
  let fixture: ComponentFixture<Angel3d>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Angel3d]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Angel3d);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
