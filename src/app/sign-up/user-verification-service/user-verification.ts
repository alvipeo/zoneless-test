import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { delay, map, Observable, of } from "rxjs";
import { IlgErrorData } from "../../error-handling";

export type SendCodeResponse = {
   errorMsg?: string;
   thingy?: string;
};

@Injectable({
   providedIn: "root"
})
export class UserVerificationService {
   private http = inject(HttpClient);

   sendVerificationCode(email: string): Observable<string | null> {
      const formData = new FormData();
      formData.append("email", email);
      // return this.http.put<string | null>("/api/verify-user", formData, { observe: "response" }).pipe(
      //    map((response) => {
      //       if (response.status === 204) {
      //          throw new IlgErrorData("Verification code was already sent earlier", undefined, 204);
      //       } else {
      //          return response.body ?? null;
      //       }
      //    })
      // );
      return of("123456").pipe(delay(1000));
   }
}
