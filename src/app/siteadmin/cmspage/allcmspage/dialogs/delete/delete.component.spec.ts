import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AllCmsDeleteComponent } from './delete.component';
describe('DeleteComponent', () => {
  let component: AllCmsDeleteComponent;
  let fixture: ComponentFixture<AllCmsDeleteComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AllCmsDeleteComponent],
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(AllCmsDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});