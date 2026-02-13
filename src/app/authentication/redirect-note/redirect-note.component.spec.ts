import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RedirectNot } from './redirect-note.component';
describe('RedirectNot', () => {
  let component: RedirectNot;
  let fixture: ComponentFixture<RedirectNot>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [RedirectNot],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectNot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
