import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";

@Component({
   imports: [RouterLink, MatButtonModule, MatDividerModule],
   templateUrl: "./ilg-home.html",
   styleUrl: "./ilg-home.scss",
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class IlgHome {}
