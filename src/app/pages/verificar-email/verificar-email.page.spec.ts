import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificarEmailPage } from './verificar-email.page';

describe('VerificarEmailPage', () => {
  let component: VerificarEmailPage;
  let fixture: ComponentFixture<VerificarEmailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(VerificarEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
