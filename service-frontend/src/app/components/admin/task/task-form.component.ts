import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin.service';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { RateDialogComponent, RateData } from './rate-dialog.component';
import { MaterialDialogComponent, MaterialData } from './material-dialog.component';

interface ServiceDto {
  id: number;
  name: string;
}

interface TaskRateDisplay {
  price: number;
  startDate: Date | null;
  endDate: Date | null;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    HttpClientModule,
    RouterModule
  ]
})
export class TaskFormComponent implements OnInit {
  task: any = { name: '', serviceId: null, duration: null, description: '' };
  services: ServiceDto[] = [];

  rates: TaskRateDisplay[] = [];
  rateColumns = ['price', 'start', 'end'];
  materials: MaterialData[] = [];
  materialColumns = ['name', 'quantity', 'actions'];
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private dialog: MatDialog, private adminService: AdminService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadServices();
    const serviceId = this.route.snapshot.paramMap.get('serviceId');
    if (serviceId) {
      this.task.serviceId = +serviceId;
    }
  }

  loadServices(): void {
    this.adminService.getAllServices().subscribe(data => {
      this.services = data;
    });
  }

  displayRate(): string {
    if (this.rates.length > 1) {
      return `${this.rates.length} tarifs ajoutés`;
    } else if (this.rates.length === 1) {
      return `${this.rates[0].price} €`;
    }
    return '';
  }

  openRateDialog(): void {
    const dialogRef = this.dialog.open(RateDialogComponent, {
      width: '400px',
      data: { price: null, startDate: null, endDate: null } as RateData
    });

    dialogRef.afterClosed().subscribe((result: RateData | undefined) => {
      if (result && result.price != null) {
        this.rates.push({ price: result.price, startDate: result.startDate, endDate: result.endDate });
        this.rates = [...this.rates];
      }
    });
  }

  openMaterialDialog(): void {
    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      width: '400px',
      data: { name: '', quantity: 1 } as MaterialData
    });

    dialogRef.afterClosed().subscribe((result: MaterialData | undefined) => {
      if (result && result.name && result.quantity > 0) {
        this.materials.push(result);
        this.materials = [...this.materials]; // Trigger change detection for the table
      }
    });
  }

  removeMaterial(index: number): void {
    this.materials.splice(index, 1);
    this.materials = [...this.materials]; // Trigger change detection
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  save(): void {
    if (!this.selectedFile) {
      console.error('Image is required');
      return;
    }

    const taskDto = {
      name: this.task.name,
      description: this.task.description,
      duration: this.task.duration,
      serviceId: this.task.serviceId,
      rates: this.rates.map(r => ({ price: r.price, startDate: r.startDate, endDate: r.endDate })),
      materials: this.materials
    };

    this.adminService.createTask(taskDto, this.selectedFile).subscribe(
      (response) => {
        console.log('Task created successfully', response);
        this.router.navigate(['/admin/tasks-management']);
      },
      (error) => {
        console.error('Error creating task', error);
      }
    );
  }
}
