import { inject } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { patchState, signalStore, withMethods, withProps, withState } from "@ngrx/signals";
import { debounceTime, exhaustMap, filter, map, of, pairwise, pipe, share, startWith, switchMap, take, tap, timer } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { UserVerificationService } from "./user-verification-service/user-verification";
import { isErrorData } from "../error-handling";

type SignUpState = {
   isCodeSent: boolean;
   inProgress: boolean;
   thingy: string | null;
   emailVerified: boolean;
   registrationSuccessful: boolean;
};

const initialState: SignUpState = {
   isCodeSent: false,
   inProgress: false,
   thingy: null,
   emailVerified: false,
   registrationSuccessful: false
};

const FOUR_MINUTES = 4 * 60;

export const SignUpStore = signalStore(
   withState(initialState),
   withMethods((store, userVerifySvc = inject(UserVerificationService)) => {
      // const isCodeSent$ = toObservable(store.isCodeSent);

      console.log(`using FakeUserVerificationService: ${!(userVerifySvc instanceof UserVerificationService)}`);

      return {
         sendVerificationCode: rxMethod<string>(
            pipe(
               debounceTime(300),
               // this prevents user from sending verification code again to the same email
               // so, let's not do this  ===>  distinctUntilChanged(),
               tap(() => patchState(store, { inProgress: true })),
               switchMap((email) => {
                  const obs$ = userVerifySvc.sendVerificationCode(email);

                  if (!obs$)
                     console.warn("NULL");

                  return obs$.pipe(
                     tapResponse({
                        next: (thingy) => {
                           patchState(store, { thingy, emailVerified: false, isCodeSent: !!thingy, inProgress: false });
                        },
                        error: (err) => {
                           let isCodeSent = false;
                           if (isErrorData(err)) {
                              isCodeSent = err.errorId === 204;
                           }
                           patchState(store, { inProgress: false, isCodeSent });
                        }
                     })
                  );
               })
            )
         )
      };
   }),
   withProps((store) => {
      const isCodeSent$ = toObservable(store.isCodeSent);

      return {
         timeUntilNextSendAllowed$: isCodeSent$.pipe(
            startWith(false),
            pairwise(),
            filter(([prev, curr]) => curr === true && prev === false),
            exhaustMap(() =>
               of(FOUR_MINUTES).pipe(
                  switchMap((period) =>
                     timer(0, 1000).pipe(
                        take(period),
                        map((i) => period - i),
                        tap({ complete: () => patchState(store, { isCodeSent: false, thingy: undefined }) })
                     )
                  )
               )
            ),
            share()
         )
      };
   })
);
