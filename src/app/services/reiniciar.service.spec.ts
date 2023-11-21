import { TestBed } from '@angular/core/testing';

import { ReiniciarService } from './reiniciar.service';

describe('ReiniciarService', () => {
  let service: ReiniciarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReiniciarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
