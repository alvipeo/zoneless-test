import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { concat, delay, map, Observable, of, shareReplay, Subject, switchMap } from "rxjs";
import { formatDuration, intervalToDuration } from "date-fns";
import { SignUpStore } from "./sign-up-state";

// from here - https://digitalfortress.tech/tricks/top-15-commonly-used-regex/ (https://www.regexpal.com/?fam=104028)
// Should have 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character and be at least 8 characters long
const passRegex = /(?=(.*[0-9]))(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-Я])(?=(.*[A-Я]))(?=(.*)).{8,}/;

@Component({
   imports: [AsyncPipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
   templateUrl: "./sign-up-form.html",
   styleUrl: "./sign-up-form.scss",
   encapsulation: ViewEncapsulation.None,
   changeDetection: ChangeDetectionStrategy.OnPush,
   providers: [SignUpStore]
})
export class IlgSignUpForm {
   private readonly fb = inject(FormBuilder);
   private readonly validationMessages: { [key: string]: { [key: string]: string } };

   protected readonly hidePassVisibility$: Observable<string>;
   protected readonly passwordType$: Observable<string>;
   protected readonly store = inject(SignUpStore);

   private readonly triggerShowPassword$ = new Subject<boolean>();
   protected readonly timeUntilNextSendAllowed$ = this.store.timeUntilNextSendAllowed$.pipe(map((sec) => humanizeDuration(sec)));

   constructor() {
      this.validationMessages = this.initValidationMessages();

      // should return "visibility_off" or "visibility"
      this.hidePassVisibility$ = concat(
         of("visibility_off"),
         this.triggerShowPassword$.pipe(switchMap(() => concat(of("visibility"), of("visibility_off").pipe(delay(3000)))))
      ).pipe(shareReplay());
      this.passwordType$ = this.hidePassVisibility$.pipe(
         map((vis) => (vis === "visibility_off" ? "password" : "text")),
         shareReplay()
      );
   }

   frm = this.fb.group({
      email: ["", [Validators.email, Validators.required], null, { updateOn: "blur" }],
      code: ["", [Validators.required, Validators.minLength(6)], null, { updateOn: "blur" }]
   });

   get canSaveForm(): boolean {
      return this.frm.touched && this.frm.valid;
   }

   get codeCrl(): AbstractControl<string | null> | null {
      return this.frm.get("code");
   }

   get emailCrl(): AbstractControl<string | null> | null {
      return this.frm.get("email");
   }

   isTouchedAndInvalid(controlName: string): boolean {
      const crl = this.frm.get(controlName);
      return !!crl && crl.touched && crl.invalid;
   }

   emailChanged(): void {
      // this.store.clearCodeVerified();
      // this.codeCrl.reset();
   }

   onSubmit(): void {
      if (!this.frm.valid) {
         return;
      }

      // const val = this.frm.value;
      // this.store.registerUser(new UserRegistrationModel(val.email, val.pass, val.personName, val.code, undefined));
   }

   showPassword(): void {
      this.triggerShowPassword$.next(true);
   }

   sendCode(): void {
      if (this.emailCrl && this.emailCrl.valid && this.emailCrl.value) {
         this.store.sendVerificationCode(this.emailCrl.value);
      }
   }

   validateCode(): void {
      // if (this.emailCrl && this.emailCrl.valid && this.codeCrl.value && this.codeCrl.valid) {
      //    this.store.verifyCode({ email: this.emailCrl.value, code: this.codeCrl.value });
      // }
   }

   getErrorMessage(controlName: string): string | null {
      const ctrl = this.frm.get(controlName);
      if (!ctrl) {
         return null;
      }

      if (ctrl.pristine || ctrl.valid) {
         return null;
      }

      for (const key in ctrl.errors) {
         if (Object.prototype.hasOwnProperty.call(ctrl.errors, key)) {
            return this.validationMessages[controlName][key];
         }
      }
      return null;
   }

   private initValidationMessages(): {
      [key: string]: { [key: string]: string };
   } {
      const passwordValMsgs = {
         required: $localize`:@@regPassReqErr:Please enter password`,
         pattern: $localize`:@@regPassPatternErr:Should have 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character`,
         minlength: $localize`:@@regPassMinLengthErr:Should be at least 8 characters long`,
         maxlength: $localize`:@@regPassMaxLengthErr:Maximum 64 characters`
      };

      const namesLimitMsgs = {
         minlength: $localize`:@@regNameMinLengthErr:Minimum 2 letters`,
         maxlength: $localize`:@@regNameMaxLengthErr:Maximum 64 letters`
      };

      return {
         email: {
            required: $localize`:@@regEmailReqErr:Please enter valid email`,
            email: $localize`:@@regEmailInvalidErr:Email is invalid`
         },
         code: {
            required: $localize`:@@regCoreErr:Please enter code from email`
         },
         pass: passwordValMsgs,
         confirmPass: passwordValMsgs,
         personName: { ...namesLimitMsgs, required: $localize`:@@regEnterNameErr:Please enter your name` },
         comment: {
            minlength: $localize`:@@regMinCommentErr:Minimum 5 characters`,
            maxlength: $localize`:@@regMaxCommentErr:Maximum 256 characters`
         }
      };
   }
}

function humanizeDuration(eventDuration: number | null): string | null {
   //
   // https://date-fns.org/

   if (eventDuration) {
      return formatDuration(intervalToDuration({ start: 0, end: eventDuration * 1000 }));
   } else {
      return null;
   }
}
