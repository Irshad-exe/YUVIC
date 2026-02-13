import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { AllCmsComponent } from "./allcms.component";
describe("AllCmsComponent", () => {
  let component: AllCmsComponent;
  let fixture: ComponentFixture<AllCmsComponent>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [AllCmsComponent],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(AllCmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});