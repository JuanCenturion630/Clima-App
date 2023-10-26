import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetearContraseniaPage } from './resetear-contrasenia.page';

describe('ResetearContraseniaPage', () => {
  let component: ResetearContraseniaPage;
  let fixture: ComponentFixture<ResetearContraseniaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ResetearContraseniaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
