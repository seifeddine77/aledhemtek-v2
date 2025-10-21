import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface PaginationConfig {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  pageSizeOptions: number[];
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() config: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    pageSizeOptions: [5, 10, 25, 50]
  };

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.config.totalItems / this.config.itemsPerPage);
  }

  get startItem(): number {
    return (this.config.currentPage - 1) * this.config.itemsPerPage + 1;
  }

  get endItem(): number {
    const end = this.config.currentPage * this.config.itemsPerPage;
    return Math.min(end, this.config.totalItems);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.config.currentPage;
    const delta = 2;
    
    let start = Math.max(1, current - delta);
    let end = Math.min(total, current + delta);
    
    // Adjust if we're near the beginning or end
    if (current <= delta) {
      end = Math.min(total, 2 * delta + 1);
    }
    if (current + delta >= total) {
      start = Math.max(1, total - 2 * delta);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.config.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSizeChange.emit(newSize);
  }

  goToFirstPage(): void {
    this.onPageChange(1);
  }

  goToLastPage(): void {
    this.onPageChange(this.totalPages);
  }

  goToPreviousPage(): void {
    this.onPageChange(this.config.currentPage - 1);
  }

  goToNextPage(): void {
    this.onPageChange(this.config.currentPage + 1);
  }
}
