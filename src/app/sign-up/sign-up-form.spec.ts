import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { SignUpPageObject } from "./page-object.spec";
import { IlgSignUpForm } from "./sign-up-form";
import { FakeUserVerificationService } from "./user-verification-service/fake-verification-service.spec";
import { SignUpStore } from "./sign-up-state";

describe("sign up form should", () => {
   //
   // Timers in zoneless
   // https://github.com/angular/angular/blob/main/adev/src/app/editor/code-editor/code-mirror-editor.service.spec.ts#L145

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [IlgSignUpForm],
         providers: [provideZonelessChangeDetection()]
      }).compileComponents();
   });

   it("be created", () => {
      const fakeVerificationSvc = new FakeUserVerificationService(12345);
      const pageObj = new SignUpPageObject(fakeVerificationSvc);

      expect(pageObj.component).toBeDefined();
      expect(pageObj.h1Title.textContent).toBe("Sign Up");
   });

   it("have correct initial button status", async () => {
      const fakeVerificationSvc = new FakeUserVerificationService(12345);
      const pageObj = new SignUpPageObject(fakeVerificationSvc);

      const sendCodeBtn = await pageObj.sendCodeBtnHarness;
      expect(await sendCodeBtn.isDisabled()).toBe(true);

      const registerBtn = await pageObj.registerBtnHarness;
      expect(await registerBtn.isDisabled()).toBe(true);
   });

   fit("show verification field", async () => {
      jasmine.clock().install();
      jasmine.clock().mockDate();

      const code = 484637;
      const fakeVerificationSvc = new FakeUserVerificationService(code);

      // IMPORTANT !!! => .and.callThrough();
      spyOn(fakeVerificationSvc, "sendVerificationCode").and.callThrough();

      const pageObj = new SignUpPageObject(fakeVerificationSvc);

      const emailFld = await pageObj.emailFldHarness;
      await emailFld.setValue("alex@bee.com");

      const sendCodeBtn = await pageObj.sendCodeBtnHarness;
      expect(await sendCodeBtn.isDisabled()).toBe(false);

      await sendCodeBtn.click();

      jasmine.clock().tick(600);

      expect(fakeVerificationSvc.sendVerificationCode).toHaveBeenCalled();

      await pageObj.fixture.whenStable();

      const verCodeFld = await pageObj.verificationCodeHardness;
      expect(verCodeFld).toBeDefined();

      jasmine.clock().uninstall();
   });
});
