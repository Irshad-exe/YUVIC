import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { CmsFormDialogComponent } from "./form-dialog.component";
describe("CmsFormDialogComponent", () => {
  let component: CmsFormDialogComponent;
  let fixture: ComponentFixture<CmsFormDialogComponent>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [CmsFormDialogComponent],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(CmsFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});