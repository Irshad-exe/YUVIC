import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AllDoctorsDeleteComponent } from './delete.component';
describe('DeleteComponent', () => {
  let component: AllDoctorsDeleteComponent;
  let fixture: ComponentFixture<AllDoctorsDeleteComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AllDoctorsDeleteComponent],
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(AllDoctorsDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
