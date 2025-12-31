import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category-model';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private apiUrl = `${API_BASE}/api/categories`;
  private http = inject(HttpClient);

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }
}
