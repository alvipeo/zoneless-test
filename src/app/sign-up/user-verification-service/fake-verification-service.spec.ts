import { delay, Observable, of } from "rxjs";

export class FakeUserVerificationService {
   constructor(codeToReturn: number) {
      this._codeToReturn = codeToReturn;
   }

   sendVerificationCode(email: string): Observable<string | null> {
      const code = this._codeToReturn.toString().padStart(6, "0");
      console.log(code);
      return of(code).pipe(delay(1000));
   }

   private _codeToReturn: number;
}
