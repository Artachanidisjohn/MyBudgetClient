import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { IonicModule } from "@ionic/angular";

@Component({
  selector: 'app-expenses-stats',
  standalone: true,
  template: `<h1>Stats Page</h1>`,
  imports: [IonicModule, CommonModule]
})
export class ExpensesStatsComponent {}
