import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService, TaskDto, RateDto, MaterialDto } from '../../../services/task.service';
import { AdminService } from '../../../services/admin.service';
import { RateDialogComponent } from '../rate-dialog/rate-dialog.component';
import { MaterialDialogComponent } from '../material-dialog/material-dialog.component';

@Component({
  selector: 'app-task-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatTooltipModule
  ],
  template: `
    <h2 mat-dialog-title>Modifier la tâche</h2>
    
    <mat-dialog-content>
      <mat-tab-group>
        <!-- Onglet Informations générales -->
        <mat-tab label="Informations">
          <form [formGroup]="taskForm" class="task-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom de la tâche</mat-label>
              <input matInput formControlName="name" placeholder="Nom de la tâche">
              <mat-error *ngIf="taskForm.get('name')?.hasError('required')">
                Le nom est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" 
                        placeholder="Description de la tâche" 
                        rows="3"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Service</mat-label>
              <mat-select formControlName="serviceId">
                <mat-option *ngFor="let service of services" [value]="service.id">
                  {{service.name}}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="taskForm.get('serviceId')?.hasError('required')">
                Le service est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Durée (minutes)</mat-label>
              <input matInput type="number" formControlName="duration" 
                     placeholder="Durée en minutes">
              <mat-error *ngIf="taskForm.get('duration')?.hasError('required')">
                La durée est requise
              </mat-error>
              <mat-error *ngIf="taskForm.get('duration')?.hasError('min')">
                La durée doit être positive
              </mat-error>
            </mat-form-field>

            <div class="image-section">
              <label>Image actuelle :</label>
              <div class="current-image" *ngIf="data.task.imageName">
                <img [src]="getImageUrl(data.task.imageName)" 
                     alt="Image actuelle" 
                     class="preview-image">
              </div>
              <div *ngIf="!data.task.imageName" class="no-image">
                Aucune image
              </div>
            </div>
          </form>
        </mat-tab>

        <!-- Onglet Tarifs -->
        <mat-tab label="Tarifs ({{rates.length}})">
          <div class="rates-section">
            <div class="section-header">
              <h3>Gestion des tarifs</h3>
              <button mat-raised-button color="primary" (click)="addRate()">
                <mat-icon>add</mat-icon>
                Ajouter un tarif
              </button>
            </div>
            
            <table mat-table [dataSource]="rates" class="rates-table" *ngIf="rates.length > 0">
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Prix</th>
                <td mat-cell *matCellDef="let rate">{{rate.price | currency:'EUR'}}</td>
              </ng-container>
              
              <ng-container matColumnDef="startDate">
                <th mat-header-cell *matHeaderCellDef>Date début</th>
                <td mat-cell *matCellDef="let rate">{{rate.startDate | date:'short'}}</td>
              </ng-container>
              
              <ng-container matColumnDef="endDate">
                <th mat-header-cell *matHeaderCellDef>Date fin</th>
                <td mat-cell *matCellDef="let rate">{{rate.endDate | date:'short'}}</td>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let rate">
                  <button mat-icon-button color="primary" (click)="editRate(rate)" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteRate(rate)" matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="rateColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: rateColumns;"></tr>
            </table>
            
            <div *ngIf="rates.length === 0" class="no-data">
              <mat-icon>euro</mat-icon>
              <p>Aucun tarif défini</p>
            </div>
          </div>
        </mat-tab>

        <!-- Onglet Matériaux -->
        <mat-tab label="Matériaux ({{materials.length}})">
          <div class="materials-section">
            <div class="section-header">
              <h3>Gestion des matériaux</h3>
              <button mat-raised-button color="primary" (click)="addMaterial()">
                <mat-icon>add</mat-icon>
                Ajouter un matériau
              </button>
            </div>
            
            <table mat-table [dataSource]="materials" class="materials-table" *ngIf="materials.length > 0">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let material">{{material.name}}</td>
              </ng-container>
              
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Quantité</th>
                <td mat-cell *matCellDef="let material">{{material.quantity}}</td>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let material">
                  <button mat-icon-button color="primary" (click)="editMaterial(material)" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteMaterial(material)" matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="materialColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: materialColumns;"></tr>
            </table>
            
            <div *ngIf="materials.length === 0" class="no-data">
              <mat-icon>build</mat-icon>
              <p>Aucun matériau défini</p>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" 
              (click)="onSave()" 
              [disabled]="taskForm.invalid || saving">
        <mat-icon *ngIf="saving">hourglass_empty</mat-icon>
        {{saving ? 'Sauvegarde...' : 'Sauvegarder'}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .task-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    .image-section {
      margin: 16px 0;
    }

    .current-image {
      margin-top: 8px;
    }

    .preview-image {
      max-width: 100px;
      max-height: 100px;
      border-radius: 8px;
      border: 2px solid #ddd;
    }

    .no-image {
      color: #666;
      font-style: italic;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    mat-dialog-content {
      max-height: 60vh;
      overflow-y: auto;
    }
  `]
})
export class TaskEditDialogComponent implements OnInit {
  taskForm: FormGroup;
  services: any[] = [];
  saving = false;
  rates: RateDto[] = [];
  materials: MaterialDto[] = [];
  rateColumns = ['price', 'startDate', 'endDate', 'actions'];
  materialColumns = ['name', 'quantity', 'actions'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TaskEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: TaskDto },
    private taskService: TaskService,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.taskForm = this.fb.group({
      name: [data.task.name, [Validators.required]],
      description: [data.task.description || ''],
      serviceId: [data.task.serviceId, [Validators.required]],
      duration: [data.task.duration, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadRates();
    this.loadMaterials();
  }

  loadServices(): void {
    this.adminService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des services:', error);
        this.snackBar.open('Erreur lors du chargement des services', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:8080/uploads/tasks/${imageName}`;
  }

  onSave(): void {
    if (this.taskForm.valid) {
      this.saving = true;
      
      const updatedTask: TaskDto = {
        ...this.data.task,
        ...this.taskForm.value
      };

      this.taskService.updateTask(updatedTask.id!, updatedTask).subscribe({
        next: (result) => {
          this.snackBar.open('Tâche modifiée avec succès', 'Fermer', {
            duration: 3000
          });
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.snackBar.open('Erreur lors de la modification', 'Fermer', {
            duration: 3000
          });
          this.saving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Méthodes pour la gestion des rates
  loadRates(): void {
    if (this.data.task.id) {
      this.taskService.getTaskRates(this.data.task.id).subscribe({
        next: (rates) => {
          this.rates = rates;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des tarifs:', error);
        }
      });
    }
  }

  addRate(): void {
    const dialogRef = this.dialog.open(RateDialogComponent, {
      width: '500px',
      data: { rate: null }
    });

    dialogRef.afterClosed().subscribe((result: RateDto | undefined) => {
      if (result && this.data.task.id) {
        this.taskService.addRateToTask(this.data.task.id, result).subscribe({
          next: (rate) => {
            this.rates.push(rate);
            this.snackBar.open('Tarif ajouté avec succès', 'Fermer', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout du tarif:', error);
            this.snackBar.open('Erreur lors de l\'ajout du tarif', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  editRate(rate: RateDto): void {
    const dialogRef = this.dialog.open(RateDialogComponent, {
      width: '500px',
      data: { rate: rate }
    });

    dialogRef.afterClosed().subscribe((result: RateDto | undefined) => {
      if (result && rate.id) {
        this.taskService.updateRate(rate.id, result).subscribe({
          next: (updatedRate) => {
            const index = this.rates.findIndex(r => r.id === rate.id);
            if (index !== -1) {
              this.rates[index] = updatedRate;
            }
            this.snackBar.open('Tarif modifié avec succès', 'Fermer', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Erreur lors de la modification du tarif:', error);
            this.snackBar.open('Erreur lors de la modification du tarif', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  deleteRate(rate: RateDto): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) {
      if (rate.id) {
        this.taskService.deleteRate(rate.id).subscribe({
          next: () => {
            this.rates = this.rates.filter(r => r.id !== rate.id);
            this.snackBar.open('Tarif supprimé avec succès', 'Fermer', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Erreur lors de la suppression du tarif:', error);
            this.snackBar.open('Erreur lors de la suppression du tarif', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    }
  }

  // Méthodes pour la gestion des materials
  loadMaterials(): void {
    if (this.data.task.id) {
      this.taskService.getTaskMaterials(this.data.task.id).subscribe({
        next: (materials) => {
          this.materials = materials;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des matériaux:', error);
        }
      });
    }
  }

  addMaterial(): void {
    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      width: '500px',
      data: { material: null }
    });

    dialogRef.afterClosed().subscribe((result: MaterialDto | undefined) => {
      if (result && this.data.task.id) {
        this.taskService.addMaterialToTask(this.data.task.id, result).subscribe({
          next: (material) => {
            this.materials.push(material);
            this.snackBar.open('Matériau ajouté avec succès', 'Fermer', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout du matériau:', error);
            this.snackBar.open('Erreur lors de l\'ajout du matériau', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  editMaterial(material: MaterialDto): void {
    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      width: '500px',
      data: { material: material }
    });

    dialogRef.afterClosed().subscribe((result: MaterialDto | undefined) => {
      if (result && material.id) {
        this.taskService.updateMaterial(material.id, result).subscribe({
          next: (updatedMaterial) => {
            const index = this.materials.findIndex(m => m.id === material.id);
            if (index !== -1) {
              this.materials[index] = updatedMaterial;
            }
            this.snackBar.open('Matériau modifié avec succès', 'Fermer', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Erreur lors de la modification du matériau:', error);
            this.snackBar.open('Erreur lors de la modification du matériau', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  deleteMaterial(material: MaterialDto): void {
    if (material.id && confirm('Êtes-vous sûr de vouloir supprimer ce matériau ?')) {
      this.taskService.deleteMaterial(material.id).subscribe({
        next: () => {
          this.materials = this.materials.filter(m => m.id !== material.id);
          this.snackBar.open('Matériau supprimé avec succès', 'Fermer', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du matériau:', error);
          this.snackBar.open('Erreur lors de la suppression du matériau', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }
}
