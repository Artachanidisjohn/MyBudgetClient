import { Component, HostListener, inject, NgZone, OnInit, ViewChild } from '@angular/core';
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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatAccordion,
} from '@angular/material/expansion';
type SectionKey = 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Older';

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
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatAccordion,
  ],
  styleUrls: ['expenses-list.scss'],
  template: `
    <ion-header>
      <ion-toolbar>
        <h1 class="page-title">My Budget Overview</h1>

        <ion-buttons slot="end">
          <ion-button (click)="logout()">
            <ion-icon name="power-outline" style="font-size: 1.7rem; color: #ff4d4d;"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <div class="top-tabs">
      <button [class.active]="activeTab === 'expenses'" (click)="activeTab = 'expenses'">
        Expenses
      </button>
      @if (isMobile) {
      <button [class.active]="activeTab === 'add'" (click)="activeTab = 'add'">
        {{ isEditing ? 'Edit' : 'Add' }}
      </button>

      }
      <button [class.active]="activeTab === 'stats'" (click)="activeTab = 'stats'">Insights</button>
    </div>

    <div>
      @if (isMobile && activeTab === 'add') {
      <form #expenseForm="ngForm" (ngSubmit)="saveExpense(expenseForm)" class="expense-form">
        <h3 class="form-title">
          {{ isEditing ? 'Edit Expense' : 'Add Expense' }}
        </h3>

        <div class="form-divider"></div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" [(ngModel)]="currentExpense.description" name="description" required />
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
            <ion-select-option [value]="cat.id">{{ cat.name }}</ion-select-option>
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
              required
              [max]="today"
              placeholder="Select date"
              readonly
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
      } @if (isMobile && activeTab === 'expenses') {
      <div class="filters-card">
        <input
          type="text"
          class="search-input"
          placeholder="Search..."
          [(ngModel)]="searchText"
          (input)="applyFilters()"
        />
      </div>

      <div class="category-tabs">
        @for (c of categoryTabs; track c) {
        <button [class.active]="selectedCategory === c" (click)="filterByCategory(c)">
          {{ c }}
        </button>
        }
      </div>
      <div class="expenses-cards">
        @if (filteredExpenses.length === 0) {
        <div class="empty-state">
          <div class="empty-hero">🪙</div>
          <h2>No expenses yet</h2>
          <p>Add your first expense to get started.</p>
          <button class="primary-btn" (click)="activeTab = 'add'">➕ Add Expense</button>
        </div>

        }
        <mat-accordion class="group-accordion">
          @for (group of getGroupedExpenses(); track group.title) {

          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                {{ group.title }}
              </mat-panel-title>
            </mat-expansion-panel-header>
            @for (e of group.items; track e.id) {
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
          </mat-expansion-panel>

          }
        </mat-accordion>
      </div>
      } @if (!isMobile && activeTab === 'expenses') {
      <div class="form-filter-row">
        <form #expenseForm="ngForm" (ngSubmit)="saveExpense(expenseForm)" class="expense-form">
          <h3 class="form-title">Add Expense</h3>
          <div class="form-divider"></div>
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
              <ion-select-option [value]="cat.id">{{ cat.name }}</ion-select-option>
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
                required
                [max]="today"
                placeholder="Select date"
                readonly
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

        <div class="list-scroll">
          <div class="filters-card">
            <input
              type="text"
              class="search-input"
              placeholder="Search..."
              [(ngModel)]="searchText"
              (input)="applyFilters()"
            />
          </div>

          <div class="mat-table-wrapper">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Description</th>
                <td
                  mat-cell
                  *matCellDef="let e"
                  #descCell
                  [matTooltip]="isTruncated(descCell) ? e.description : ''"
                  matTooltipPosition="above"
                  class="truncate-text"
                >
                  {{ e.description }}
                </td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
                <td mat-cell *matCellDef="let e">{{ getCategoryName(e.categoryId) }}</td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount (€)</th>
                <td mat-cell *matCellDef="let e">{{ e.amount | currency : 'EUR' }}</td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                <td mat-cell *matCellDef="let e">{{ e.date | date : 'shortDate' }}</td>
              </ng-container>

              <ng-container matColumnDef="edit">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let e">
                  <button class="icon-btn" (click)="editExpense(e)">✏️</button>
                </td>
              </ng-container>

              <ng-container matColumnDef="delete">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let e">
                  <button class="icon-btn delete" (click)="deleteExpense(e.id)">🗑️</button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              <tr class="mat-row no-data-row" *matNoDataRow>
                <td class="mat-cell" colspan="6">📭 No expenses found</td>
              </tr>
            </table>
            <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 20, 50, 100]"></mat-paginator>
          </div>
        </div>
      </div>
      } @if (activeTab === 'stats') {
      <div class="stats-wrapper">
        <div class="stat-card total">
          <h3>Total Overview</h3>

          <div class="kpi-row">
            <div class="kpi-box">
              <label>Total</label>
              <strong>{{ getTotal() | currency : 'EUR' }}</strong>
            </div>

            <div class="kpi-box">
              <label>Avg per day</label>
              <strong>{{ getAvgPerDay() | currency : 'EUR' }}</strong>
            </div>

            <div class="kpi-box">
              <label>Transactions</label>
              <strong>{{ filteredExpenses.length }}</strong>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <h3>Expenses per Product</h3>

          @if (visibleProducts.length > 0) { @for (p of visibleProducts; track p.name) {
          <div class="product-entry">
            <div class="product-header">
              <span>{{ p.name }}</span>
              <span>{{ p.total | currency : 'EUR' }}</span>
            </div>
            <div class="product-sub">{{ p.category }}</div>
          </div>
          } } @else {
          <p class="no-data-msg">No product expenses yet.</p>
          } @if (getExpensesPerProduct().length > 5) {
          <button class="show-more-btn" (click)="showMore = !showMore">
            {{ showMore ? 'Show Less' : 'Show More' }}
          </button>
          }
        </div>

        <div class="stat-card">
          <h3>Expenses per Category</h3>
          @if (chartData && chartData.length > 0) {
          <apx-chart [series]="pieSeries" [chart]="pieChart" [labels]="pieLabels"></apx-chart>
          } @else{
          <p class="no-data-msg">No category data available.</p>
          }
        </div>

        <div class="stat-card">
          <h3>Top 5 Biggest Expenses</h3>
          <apx-chart [series]="barSeries" [chart]="barChart" [xaxis]="barXAxis"></apx-chart>
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
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  expenses: Expense[] = [];
  categories: Category[] = [];
  currentExpense: Expense = this.getEmptyExpense();
  originalExpense: Expense | null = null;

  isEditing = false;
  displayedColumns = ['description', 'category', 'amount', 'date', 'edit', 'delete'];
  dataSource = new MatTableDataSource<Expense>();

  today = new Date();
  activeTab: 'expenses' | 'add' | 'stats' = 'expenses';
  isMobile = window.innerWidth < 768;
  searchText = '';
  selectedCategory = 'All';
  categoryTabs: string[] = ['All'];

  filteredExpenses: Expense[] = [];
  fromDate?: Date;
  toDate?: Date;

  toastMessage: string | null = null;
  showMore = false;
  products: any[] = [];
  chartData: any[] = [];

  expensesService = inject(ExpensesService);
  categoriesService = inject(CategoriesService);
  authService = inject(AuthService);
  router = inject(Router);
  alertCtrl = inject(AlertController);
  zone = inject(NgZone);

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
    this.isMobile = window.innerWidth < 768;

    this.loadExpenses();

    this.categoriesService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.categoryTabs = ['All', ...data.map((c) => c.name)];
      },
    });
  }

  ngAfterViewInit() {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'category':
          return this.getCategoryName(item.categoryId).toLowerCase();
        default:
          return (item as any)[property];
      }
    };

    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  refreshCharts() {
    setTimeout(() => {
      ApexCharts.exec(this.pieChart.chart?.id, 'updateOptions', {});
      ApexCharts.exec(this.barChart.chart?.id, 'updateOptions', {});
    }, 200);
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  get visibleProducts() {
    return this.showMore ? this.getExpensesPerProduct() : this.getExpensesPerProduct().slice(0, 5);
  }

  filterByCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  getGroupedExpenses() {
    const groups: Record<SectionKey, Expense[]> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      'This Month': [],
      Older: [],
    };

    const now = new Date();
    const today = now.getDate();
    const currentWeek = this.getWeekNumber(now);
    const currentMonth = now.getMonth();

    for (const e of this.filteredExpenses) {
      const d = new Date(e.date);
      const week = this.getWeekNumber(d);

      if (d.toDateString() === now.toDateString()) {
        groups.Today.push(e);
      } else if (this.isYesterday(d)) {
        groups.Yesterday.push(e);
      } else if (week === currentWeek) {
        groups['This Week'].push(e);
      } else if (d.getMonth() === currentMonth) {
        groups['This Month'].push(e);
      } else {
        groups.Older.push(e);
      }
    }

    return Object.keys(groups)
      .map((k) => ({
        title: k as SectionKey,
        items: groups[k as SectionKey],
      }))
      .filter((g) => g.items.length > 0);
  }

  isYesterday(d: Date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.toDateString() === yesterday.toDateString();
  }

  getWeekNumber(d: Date) {
    const oneJan = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((+d - +oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
  }

  getEmptyExpense(): Expense {
    return {
      id: 0,
      description: '',
      amount: null,
      categoryId: 0,
      date: '',
    };
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  }

  getAvgPerDay() {
    if (this.filteredExpenses.length === 0) return 0;

    const timestamps = this.filteredExpenses.map((e) => new Date(e.date).getTime());
    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);

    const days = Math.max(1, (max - min) / (1000 * 60 * 60 * 24));

    return this.getTotal() / days;
  }

  getExpensesPerProduct() {
    const map = new Map<string, { total: number; categoryId: number }>();

    for (const e of this.filteredExpenses) {
      const name = e.description.trim();

      if (!map.has(name)) {
        map.set(name, { total: 0, categoryId: e.categoryId });
      }

      const entry = map.get(name)!;
      entry.total += e.amount ?? 0;
    }

    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      total: data.total,
      category: this.getCategoryName(data.categoryId),
    }));
  }

  loadExpenses() {
    this.expensesService.getExpenses().subscribe((data) => {
      this.expenses = data;
      this.products = this.getExpensesPerProduct();
      this.chartData = [...this.pieSeries];
      this.expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.applyFilters();
      this.updateCharts();
    });
  }

  applyFilters() {
    const term = this.searchText.toLowerCase();

    this.filteredExpenses = this.expenses
      .filter((e) => {
        const desc = e.description.toLowerCase().includes(term);
        const cat = this.getCategoryName(e.categoryId).toLowerCase().includes(term);
        return desc || cat;
      })
      .filter((e) => {
        const d = new Date(e.date);
        if (this.fromDate && d < this.fromDate) return false;
        if (this.toDate && d > this.toDate) return false;
        return true;
      });

    if (this.selectedCategory !== 'All') {
      this.filteredExpenses = this.filteredExpenses.filter(
        (e) => this.getCategoryName(e.categoryId) === this.selectedCategory
      );
    }

    this.dataSource.data = this.filteredExpenses;

    if (this.sort) this.dataSource.sort = this.sort;
    if (this.paginator) this.dataSource.paginator = this.paginator;
  }

  updateCharts() {
    const perCat = this.getExpensesPerCategory();

    this.pieLabels = perCat.map((c) => c.name);
    this.pieSeries = perCat.map((c) => c.total);

    this.chartData = this.pieSeries;

    const top = this.getTopExpenses();

    this.barSeries = [
      {
        name: 'Amount',
        data: top.map((t) => t.amount ?? 0),
      },
    ];

    this.barXAxis.categories = top.map((t) => t.description);

    this.products = this.getExpensesPerProduct(); // <-- προσθήκη
  }

  getTotal() {
    return this.filteredExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  }

  async saveExpense(form: NgForm) {
    if (form.invalid) return;

    const expenseToSave = { ...this.currentExpense };
    expenseToSave.date = new Date(this.currentExpense.date).toISOString();

    const request$ = (
      expenseToSave.id
        ? this.expensesService.updateExpense(expenseToSave)
        : this.expensesService.addExpense(expenseToSave)
    ) as Observable<any>;

    request$.subscribe(() => {
      this.currentExpense = this.getEmptyExpense();
      form.resetForm();
      this.loadExpenses();
      this.isEditing = false;

      this.showToast(expenseToSave.id ? 'Expense updated!' : 'Expense added!');
    });
  }

  getExpensesPerCategory() {
    const results: { name: string; total: number }[] = [];

    for (const c of this.categories) {
      const total = this.filteredExpenses
        .filter((e) => e.categoryId === c.id)
        .reduce((s, x) => s + (x.amount ?? 0), 0);

      if (total > 0) results.push({ name: c.name, total });
    }

    return results;
  }

  getTopExpenses() {
    return [...this.filteredExpenses].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0)).slice(0, 5);
  }

  editExpense(expense: Expense) {
    this.currentExpense = { ...expense };
    this.originalExpense = { ...expense };
    this.isEditing = true;
    if (this.isMobile) {
      this.activeTab = 'add';
    }
  }

  hasChanges() {
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

  isTruncated(element: HTMLElement): boolean {
    if (!element) return false;
    return element.scrollWidth > element.clientWidth;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => (this.toastMessage = null), 2000);
  }
}
