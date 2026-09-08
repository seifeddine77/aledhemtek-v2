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
import { CleanTextPipe, cleanText } from '../../../pipes/clean-text.pipe';
import { environment } from '../../../../environments/environment';

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
    MatTooltipModule,
    CleanTextPipe
  ],
  template: `
    <div class="dialog-modern-container">
      <div class="dialog-modern-header">
        <div class="dialog-header-badge">
          <mat-icon>edit_calendar</mat-icon>
        </div>
        <div class="dialog-header-text">
          <h2>Modifier la tâche</h2>
          <p>Ajustez les caractéristiques générales, la tarification et les matériaux</p>
        </div>
      </div>
      
      <div class="dialog-modern-body">
        <mat-tab-group class="modern-tabs" animationDuration="150ms">
          <!-- Onglet Informations générales -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">info</mat-icon>
              <span>Informations</span>
            </ng-template>

            <div class="tab-body">
              <form [formGroup]="taskForm" class="task-form">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Nom de la tâche</mat-label>
                  <mat-icon matPrefix>assignment</mat-icon>
                  <input matInput formControlName="name" placeholder="Nom de la tâche">
                  <mat-error *ngIf="taskForm.get('name')?.hasError('required')">
                    Le nom est requis
                  </mat-error>
                </mat-form-field>

                <div class="form-row-2">
                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Service rattaché</mat-label>
                    <mat-icon matPrefix>category</mat-icon>
                    <mat-select formControlName="serviceId">
                      <mat-option *ngFor="let service of services" [value]="service.id">
                        {{service.name | cleanText}}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="taskForm.get('serviceId')?.hasError('required')">
                      Le service est requis
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Durée approximative</mat-label>
                    <mat-icon matPrefix>schedule</mat-icon>
                    <input matInput type="number" formControlName="duration" placeholder="Ex: 60" min="1">
                    <span matSuffix class="field-unit">min</span>
                    <mat-error *ngIf="taskForm.get('duration')?.hasError('required')">
                      La durée est requise
                    </mat-error>
                    <mat-error *ngIf="taskForm.get('duration')?.hasError('min')">
                      La durée doit être positive
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Description détaillée</mat-label>
                  <mat-icon matPrefix>description</mat-icon>
                  <textarea matInput formControlName="description" 
                            placeholder="Description des opérations de la tâche..." 
                            rows="3"></textarea>
                </mat-form-field>

                <div class="image-section" *ngIf="data.task.imageName">
                  <span class="image-section-title">Illustration actuelle</span>
                  <div class="current-image">
                    <div class="preview-wrap" *ngIf="!imageError; else fallbackImage">
                      <img [src]="getImageUrl(data.task.imageName)" 
                           alt="Image actuelle" 
                           class="preview-image"
                           (error)="onImageError()">
                    </div>
                    <ng-template #fallbackImage>
                      <div class="preview-fallback">
                        <mat-icon>photo_size_select_actual</mat-icon>
                        <span>Visuel catalogué</span>
                      </div>
                    </ng-template>
                    <div class="image-meta">
                      <span class="image-name-badge">{{ data.task.imageName }}</span>
                      <span class="image-help-caption">Fichier d'illustration associé</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </mat-tab>

          <!-- Onglet Tarifs -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">payments</mat-icon>
              <span>Tarifs ({{rates.length}})</span>
            </ng-template>

            <div class="tab-body">
              <div class="section-actions-bar">
                <span class="section-subtitle">Historique et tarifs appliqués</span>
                <button mat-stroked-button color="primary" (click)="addRate()">
                  <mat-icon>add</mat-icon>
                  Nouveau tarif
                </button>
              </div>
              
              <div class="table-wrap" *ngIf="rates.length > 0">
                <table mat-table [dataSource]="rates" class="modern-inner-table">
                  <ng-container matColumnDef="price">
                    <th mat-header-cell *matHeaderCellDef>Tarif HT</th>
                    <td mat-cell *matCellDef="let rate">
                      <span class="badge-price">{{rate.price | currency:'EUR'}}</span>
                    </td>
                  </ng-container>
                  
                  <ng-container matColumnDef="startDate">
                    <th mat-header-cell *matHeaderCellDef>Début d'application</th>
                    <td mat-cell *matCellDef="let rate">
                      <span class="badge-date">{{rate.startDate | date:'dd/MM/yyyy'}}</span>
                    </td>
                  </ng-container>
                  
                  <ng-container matColumnDef="endDate">
                    <th mat-header-cell *matHeaderCellDef>Fin d'application</th>
                    <td mat-cell *matCellDef="let rate">
                      <span class="badge-date" *ngIf="rate.endDate">{{rate.endDate | date:'dd/MM/yyyy'}}</span>
                      <span class="text-muted" *ngIf="!rate.endDate">Indéterminée</span>
                    </td>
                  </ng-container>
                  
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
                    <td mat-cell *matCellDef="let rate" class="text-right">
                      <button mat-icon-button color="primary" (click)="editRate(rate)" matTooltip="Modifier ce tarif">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="deleteRate(rate)" matTooltip="Supprimer ce tarif">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="rateColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: rateColumns;"></tr>
                </table>
              </div>
              
              <div *ngIf="rates.length === 0" class="empty-state-notice">
                <mat-icon>payments</mat-icon>
                <p>Aucun tarif défini pour cette tâche.</p>
                <span>Ajoutez un tarif pour rendre cette tâche réservable.</span>
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Matériaux -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">inventory_2</mat-icon>
              <span>Matériaux ({{materials.length}})</span>
            </ng-template>

            <div class="tab-body">
              <div class="section-actions-bar">
                <span class="section-subtitle">Fournitures et outillages requis</span>
                <button mat-stroked-button color="primary" (click)="addMaterial()">
                  <mat-icon>add</mat-icon>
                  Ajouter un matériau
                </button>
              </div>
              
              <div class="table-wrap" *ngIf="materials.length > 0">
                <table mat-table [dataSource]="materials" class="modern-inner-table">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Désignation</th>
                    <td mat-cell *matCellDef="let material" class="font-medium">
                      {{material.name}}
                    </td>
                  </ng-container>
                  
                  <ng-container matColumnDef="quantity">
                    <th mat-header-cell *matHeaderCellDef>Quantité</th>
                    <td mat-cell *matCellDef="let material">
                      <span class="badge-qty">Qté : {{material.quantity}}</span>
                    </td>
                  </ng-container>
                  
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
                    <td mat-cell *matCellDef="let material" class="text-right">
                      <button mat-icon-button color="primary" (click)="editMaterial(material)" matTooltip="Modifier">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="deleteMaterial(material)" matTooltip="Supprimer">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="materialColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: materialColumns;"></tr>
                </table>
              </div>
              
              <div *ngIf="materials.length === 0" class="empty-state-notice">
                <mat-icon>handyman</mat-icon>
                <p>Aucun matériau associé.</p>
                <span>Cliquez ci-dessus pour ajouter des fournitures nécessaires.</span>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <div class="dialog-modern-actions">
        <button mat-button (click)="onCancel()" class="btn-cancel">Annuler</button>
        <button mat-raised-button color="primary" 
                (click)="onSave()" 
                [disabled]="taskForm.invalid || saving" class="btn-primary">
          <mat-icon *ngIf="saving">hourglass_empty</mat-icon>
          <mat-icon *ngIf="!saving">save</mat-icon>
          {{saving ? 'Enregistrement...' : 'Enregistrer'}}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-modern-container {
      padding: 1.75rem;
      width: 100%;
      box-sizing: border-box;
    }
    .dialog-modern-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }
    .dialog-header-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(37, 99, 235, 0.1);
      color: var(--color-primary, #2563eb);
    }
    .dialog-header-text h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary, #0f172a);
    }
    .dialog-header-text p {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: var(--color-text-secondary, #64748b);
    }
    .dialog-modern-body {
      max-height: 60vh;
      overflow-y: auto;
    }
    .tab-icon {
      margin-right: 6px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .tab-body {
      padding: 1.25rem 0.25rem 0.5rem;
    }
    .task-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .field-unit {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-text-muted, #64748b);
      margin-right: 8px;
    }
    .image-section {
      background: #f8fafc;
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 12px;
      padding: 0.85rem 1.15rem;
    }
    .image-section-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-secondary, #64748b);
      display: block;
      margin-bottom: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .current-image {
      display: flex;
      align-items: center;
      gap: 1.15rem;
    }
    .preview-wrap {
      width: 72px;
      height: 72px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--color-border, #cbd5e1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
      flex-shrink: 0;
      background: white;
    }
    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .preview-fallback {
      width: 72px;
      height: 72px;
      border-radius: 10px;
      background: #f1f5f9;
      border: 1px dashed var(--color-border, #cbd5e1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      color: #94a3b8;
      flex-shrink: 0;
    }
    .preview-fallback mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    .preview-fallback span {
      font-size: 0.65rem;
      font-weight: 500;
      text-align: center;
    }
    .image-meta {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .image-name-badge {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--color-text-primary, #1e293b);
      background: white;
      border: 1px solid var(--color-border, #e2e8f0);
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      display: inline-block;
      width: fit-content;
    }
    .image-help-caption {
      font-size: 0.75rem;
      color: var(--color-text-muted, #94a3b8);
    }
    .section-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .section-subtitle {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-primary, #1e293b);
    }
    .table-wrap {
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 8px;
      overflow: hidden;
    }
    .modern-inner-table {
      width: 100%;
    }
    .modern-inner-table th {
      background: #f8fafc;
      color: var(--color-text-secondary, #475569);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.6rem 0.75rem;
    }
    .modern-inner-table td {
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid var(--color-border-subtle, #f1f5f9);
      font-size: 0.85rem;
    }
    .badge-price {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      background: rgba(37, 99, 235, 0.1);
      color: var(--color-primary, #2563eb);
      font-weight: 600;
      font-size: 0.85rem;
    }
    .badge-date {
      display: inline-block;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      background: #f1f5f9;
      color: #334155;
      font-size: 0.8rem;
    }
    .badge-qty {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      background: #ecfdf5;
      color: #059669;
      font-weight: 600;
      font-size: 0.8rem;
    }
    .empty-state-notice {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      padding: 2rem;
      text-align: center;
      background: #f8fafc;
      border: 1px dashed var(--color-border, #cbd5e1);
      border-radius: 8px;
      color: var(--color-text-secondary, #64748b);
    }
    .empty-state-notice mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--color-text-muted, #94a3b8);
    }
    .empty-state-notice p {
      margin: 0;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .empty-state-notice span {
      font-size: 0.8rem;
      color: var(--color-text-muted, #94a3b8);
    }
    .dialog-modern-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.85rem;
      margin-top: 1.5rem;
      padding-top: 1.15rem;
      border-top: 1px solid var(--color-border, #e2e8f0);
      box-sizing: border-box;
      width: 100%;
    }
    .btn-cancel {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-weight: 500;
      color: #475569;
      padding: 0 1.25rem;
      height: 40px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .btn-primary {
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
      padding: 0 1.5rem;
      height: 40px;
      white-space: nowrap;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .w-100 {
      width: 100%;
    }
    .text-right {
      text-align: right;
    }
    .font-medium {
      font-weight: 500;
    }
    .text-muted {
      color: var(--color-text-muted, #94a3b8);
      font-style: italic;
    }
    @media (max-width: 640px) {
      .dialog-modern-container {
        min-width: 100%;
        padding: 1rem;
      }
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TaskEditDialogComponent implements OnInit {
  taskForm: FormGroup;
  services: any[] = [];
  saving = false;
  imageError = false;
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
    const cleanName = cleanText(data.task.name || '');
    const cleanDesc = cleanText(data.task.description || '');
    this.taskForm = this.fb.group({
      name: [cleanName, [Validators.required]],
      description: [cleanDesc],
      serviceId: [data.task.serviceId, [Validators.required]],
      duration: [data.task.duration, [Validators.required, Validators.min(1)]]
    });
  }

  onImageError(): void {
    this.imageError = true;
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadRates();
    this.loadMaterials();
  }

  loadServices(): void {
    this.adminService.getAllServices().subscribe({
      next: (services) => {
        this.services = (services || []).map((s: any) => ({
          ...s,
          name: cleanText(s.name || '')
        }));
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
    return `${environment.uploadsUrl}/tasks/${imageName}`;
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
          this.materials = (materials || []).map(m => ({
            ...m,
            name: cleanText(m.name || '')
          }));
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
