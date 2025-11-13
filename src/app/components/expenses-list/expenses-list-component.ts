import { Component, inject, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Expense } from '../../models/expenses-model';
import { Category } from '../../models/category-model';
import { ExpensesService } from '../../services/expenses-service';
import { CategoriesService } from '../../services/categories-service';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { AlertController } from '@ionic/angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-expenses-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    NgApexchartsModule,
  ],
  styleUrls: ['expenses-list.scss'],
  template: `
    <div class="page-scroll">
      <ion-header>
        <ion-toolbar>
          <h1 class="page-title">My Budget Overview</h1>
          <ion-buttons slot="end">
            <ion-button (click)="logout()">
              <ion-icon
                name="log-out-outline"
                style="font-size: 1.6rem; color: #ff4d4d;"
              ></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <div class="top-tabs">
        <button [class.active]="activeTab === 'expenses'" (click)="activeTab = 'expenses'">
          Expenses
        </button>

        <button [class.active]="activeTab === 'stats'" (click)="activeTab = 'stats'">Stats</button>
      </div>
      @if (activeTab === 'expenses') {
      <div class="form-filter-row">
        <form #expenseForm="ngForm" (ngSubmit)="saveExpense(expenseForm)" class="expense-form">
          <div class="form-group">
            <label>Description</label>
            <input
              type="text"
              [(ngModel)]="currentExpense.description"
              name="description"
              required
            />
          </div>

          <div class="form-group">
            <label>Amount (€)</label>
            <input type="number" [(ngModel)]="currentExpense.amount" name="amount" required />
          </div>

          <div class="form-group">
            <label>Category</label>

            <ion-select
              [(ngModel)]="currentExpense.categoryId"
              name="categoryId"
              interface="popover"
              class="custom-ion-select"
              placeholder="Select category"
            >
              @for (cat of categories; track cat.id) {
              <ion-select-option [value]="cat.id">
                {{ cat.name }}
              </ion-select-option>
              }
            </ion-select>
          </div>

          <div class="form-group">
            <label>Date</label>

            <mat-form-field appearance="fill" class="date-field">
              <input
                matInput
                [matDatepicker]="picker"
                [(ngModel)]="currentExpense.date"
                name="date"
                [max]="today"
                required
                placeholder="Select date"
                readonly="true"
              />

              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </div>

          <button type="submit" [disabled]="expenseForm.invalid || (isEditing && !hasChanges())">
            {{ currentExpense.id ? '💾 Update' : '➕ Add' }}
          </button>

          @if (isEditing) {
          <button type="button" class="cancel-btn" (click)="cancelEdit()">❌ Cancel</button>
          }
        </form>
        <div class="records-section">
          <div class="filters-card">
            <input
              type="text"
              class="search-input"
              placeholder="Search..."
              [(ngModel)]="searchText"
              (input)="applyFilters()"
            />

            <div class="sort-row">
              <button (click)="sortBy('date')">Sort by Date</button>
              <button (click)="sortBy('amount')">Sort by Amount</button>
            </div>
          </div>

          <div class="expenses-cards">
            @if (filteredExpenses.length === 0) {
            <div class="empty-state">
              <p>📭 No expenses yet</p>
              <small>Add your first expense to get started!</small>
            </div>
            } @for (e of filteredExpenses; track e.id) {
            <div class="expense-card">
              <div class="expense-header">
                <h3>{{ e.description }}</h3>
                <div class="actions">
                  <button class="btn-edit" (click)="editExpense(e)">✏️</button>
                  <button class="btn-delete" (click)="deleteExpense(e.id)">🗑️</button>
                </div>
              </div>

              <div class="expense-info">
                <p><strong>Category:</strong> {{ getCategoryName(e.categoryId) }}</p>
                <p><strong>Amount:</strong> {{ e.amount | currency : 'EUR' }}</p>
                <p><strong>Date:</strong> {{ e.date | date : 'shortDate' }}</p>
              </div>
            </div>
            }
          </div>
        </div>
      </div>

      } @if (activeTab === 'stats') {

      <div class="stats-wrapper">
        <div class="stat-card">
          <h3>Total Expenses</h3>
          <p class="big-number">{{ getTotal() | currency : 'EUR' }}</p>
        </div>

        <div class="stat-card">
          <h3>Expenses per Category</h3>
          <apx-chart [series]="pieSeries" [chart]="pieChart" [labels]="pieLabels"></apx-chart>
        </div>

        <div class="stat-card">
          <h3>Top 5 Biggest Expenses</h3>
          <apx-chart [series]="barSeries" [chart]="barChart" [xaxis]="barXAxis"></apx-chart>
        </div>
      </div>

      <div class="stats-wrapper">
        <div class="stat-card">
          <h3>Expenses per Category</h3>
          @for (c of getExpensesPerCategory(); track c.name) {
          <div class="category-row">
            <span>{{ c.name }}</span>
            <strong>{{ c.total | currency : 'EUR' }}</strong>
          </div>
          }
        </div>

        <div class="stat-card">
          <h3>Top 5 Biggest Expenses</h3>
          @for (t of getTopExpenses(); track t.id) {
          <div class="category-row">
            <span>{{ t.description }} ({{ getCategoryName(t.categoryId) }})</span>
            <strong>{{ t.amount | currency : 'EUR' }}</strong>
          </div>
          }
        </div>
      </div>

      } @if (toastMessage) {
      <div class="custom-toast">
        {{ toastMessage }}
      </div>
      }
    </div>
  `,
})
export class ExpensesListComponent implements OnInit {
  expenses: Expense[] = [];
  categories: Category[] = [];
  currentExpense: Expense = this.getEmptyExpense();
  isEditing = false;

  expensesService = inject(ExpensesService);
  categoriesService = inject(CategoriesService);
  authService = inject(AuthService);
  router = inject(Router);
  alertCtrl = inject(AlertController);
  zone = inject(NgZone);
  toastMessage: string | null = null;
  originalExpense: Expense | null = null;
  today = new Date();
  searchText = '';
  filteredExpenses: Expense[] = [];
  fromDate?: Date;
  toDate?: Date;
  activeTab: 'expenses' | 'stats' = 'expenses';
  pieSeries: number[] = [];
  pieLabels: string[] = [];
  pieChart: any = {
    type: 'pie',
    height: 300,
    toolbar: { show: false },
    colors: ['#ffcc00', '#66aaff', '#ff7777', '#55ddaa', '#aa88ff'],
  };
  barSeries: any[] = [];
  barChart: any = {
    type: 'bar',
    height: 350,
    toolbar: { show: false },
    foreColor: '#ffffff',
  };

  barXAxis: any = {
    categories: [],
    labels: {
      style: {
        colors: ['#ffffff'],
        fontSize: '12px',
        fontWeight: 500,
      },
    },
  };

  barYAxis: any = {
    labels: {
      style: {
        colors: ['#ffffff'],
        fontSize: '12px',
        fontWeight: 500,
      },
    },
  };

  ngOnInit(): void {
    this.loadExpenses();
    this.categoriesService.getCategories().subscribe({
      next: (data) => (this.categories = data),
    });
  }

  getEmptyExpense(): Expense {
    return { id: 0, description: '', amount: null, categoryId: 0, date: '' };
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  }

  loadExpenses() {
    this.expensesService.getExpenses().subscribe((data) => {
      this.expenses = data;
      this.applyFilters();
      this.updateCharts();
    });
  }

  applyFilters() {
    const term = this.searchText.toLowerCase();

    this.filteredExpenses = this.expenses
      .filter((e) => {
        const descriptionMatch = e.description.toLowerCase().includes(term);
        const categoryMatch = this.getCategoryName(e.categoryId).toLowerCase().includes(term);

        return descriptionMatch || categoryMatch;
      })
      .filter((e) => {
        const d = new Date(e.date);

        if (this.fromDate && d < this.fromDate) return false;
        if (this.toDate && d > this.toDate) return false;

        return true;
      });
  }

  updateCharts() {
    const perCat = this.getExpensesPerCategory();
    this.pieLabels = perCat.map((c) => c.name);
    this.pieSeries = perCat.map((c) => c.total);
    const top = this.getTopExpenses();
    this.barSeries = [
      {
        name: 'Amount',
        data: top.map((t) => t.amount ?? 0),
      },
    ];
    this.barXAxis.categories = top.map((t) => t.description);
  }

  getTotal() {
    return this.filteredExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  }
  async saveExpense(form: NgForm) {
    if (form.invalid) return;

    const expenseToSave = { ...this.currentExpense };
    expenseToSave.date = new Date(this.currentExpense.date).toISOString();

    let request$: Observable<any> = expenseToSave.id
      ? this.expensesService.updateExpense(expenseToSave)
      : this.expensesService.addExpense(expenseToSave);

    request$.subscribe(async () => {
      this.currentExpense = this.getEmptyExpense();
      form.resetForm();
      this.loadExpenses();
      this.isEditing = false;
      this.showToast(expenseToSave.id ? 'Expense updated!' : 'Expense added!');
    });
  }

  sortBy(field: 'date' | 'amount') {
    this.filteredExpenses.sort((a, b) => {
      if (field === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (field === 'amount') return (b.amount ?? 0) - (a.amount ?? 0);
      return 0;
    });
  }

  getExpensesPerCategory() {
    const result: { name: string; total: number }[] = [];

    for (const cat of this.categories) {
      const total = this.filteredExpenses
        .filter((e) => e.categoryId === cat.id)
        .reduce((s, x) => s + (x.amount ?? 0), 0);

      if (total > 0) result.push({ name: cat.name, total });
    }

    return result;
  }

  getTopExpenses() {
    return [...this.filteredExpenses].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0)).slice(0, 5);
  }

  editExpense(expense: Expense): void {
    this.currentExpense = { ...expense };
    this.originalExpense = { ...expense };
    this.isEditing = true;
  }

  hasChanges(): boolean {
    return JSON.stringify(this.currentExpense) !== JSON.stringify(this.originalExpense);
  }

  cancelEdit() {
    this.currentExpense = this.getEmptyExpense();
    this.originalExpense = null;
    this.isEditing = false;
  }

  async deleteExpense(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.expensesService.deleteExpense(id).subscribe(() => {
              this.zone.run(() => {
                this.showToast('Expense deleted!');
                this.loadExpenses();
              });
            });
          },
        },
      ],
    });

    await alert.present();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => (this.toastMessage = null), 2000);
  }
}
