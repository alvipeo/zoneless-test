import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatInputHarness } from "@angular/material/input/testing";
import { IlgSignUpForm } from "./sign-up-form";
import { FakeUserVerificationService } from "./user-verification-service/fake-verification-service.spec";
import { UserVerificationService } from "./user-verification-service/user-verification";
import { SignUpStore } from "./sign-up-state";

export class SignUpPageObject {
   constructor(fakeVerificationSvc: FakeUserVerificationService) {
      TestBed.overrideComponent(IlgSignUpForm, {
         set: {
            providers: [
               {
                  provide: UserVerificationService,
                  useValue: fakeVerificationSvc
               },
               SignUpStore
            ]
         }
      });
      // TestBed.overrideProvider(UserVerificationService, { useValue: fakeVerificationSvc });

      //TestBed.overrideProvider(UserVerificationService, { useValue: fakeVerificationSvc });
      // TestBed.overrideComponent(IlgSignUpForm, {
      //    set: {
      //       providers: [{ provide: SignUpStore }]
      //    }
      // });

      this.fixture = TestBed.createComponent(IlgSignUpForm);
      this.component = this.fixture.componentInstance;
      this.loader = TestbedHarnessEnvironment.loader(this.fixture);
   }

   get emailFldHarness(): Promise<MatInputHarness> {
      const emailFldHarness = this.loader.getHarness(MatInputHarness.with({ label: "Email" }));
      expect(emailFldHarness).toBeDefined();
      return emailFldHarness;
   }

   get verificationCodeHardness(): Promise<MatInputHarness> {
      const verCodeFldHardness = this.loader.getHarness(MatInputHarness.with({ label: "Verification Code" }));
      expect(verCodeFldHardness).toBeDefined();
      return verCodeFldHardness;
   }

   get h1Title() {
      return this.fixture.nativeElement.querySelector("h1");
   }

   get sendCodeBtnHarness(): Promise<MatButtonHarness> {
      const sendBtnHarness = this.loader.getHarness(MatButtonHarness.with({ selector: ".send-ver-code" }));
      expect(sendBtnHarness).toBeDefined();
      return sendBtnHarness;
   }

   get registerBtnHarness(): Promise<MatButtonHarness> {
      const regBtnHarness = this.loader.getHarness(MatButtonHarness.with({ selector: "button[type='submit']" }));
      expect(regBtnHarness).toBeDefined();
      return regBtnHarness;
   }

   readonly component: IlgSignUpForm;
   readonly fixture: ComponentFixture<IlgSignUpForm>;

   private readonly code?: number;
   private readonly loader: HarnessLoader;
}
