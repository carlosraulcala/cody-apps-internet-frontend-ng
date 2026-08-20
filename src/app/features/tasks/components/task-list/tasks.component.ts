import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    RippleModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  // Enlazamos directamente el Signal expuesto por el servicio
  private taskService = inject(TaskService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  tasks = this.taskService.tasks;
  
  task!: Task;
  taskDialog: boolean = false;
  aiDialog: boolean = false;
  aiPrompt: string = '';
  submitted: boolean = false;

  ngOnInit() {
    // Pedimos al servicio que cargue, él actualizará su propio Signal internamente
    this.taskService.loadTasks();
  }

  openNew() {
    this.task = { title: '', description: '', completed: false };
    this.submitted = false;
    this.taskDialog = true;
  }

  openAiDialog() {
    this.aiPrompt = '';
    this.aiDialog = true;
  }

  generateAiTask() {
    if (!this.aiPrompt.trim()) return;

    this.taskService.aiSuggest(this.aiPrompt).subscribe({
      next: (suggestion) => {
        this.task = {
          title: suggestion.title,
          description: suggestion.description,
          completed: false
        };
        this.taskDialog = true;
        this.aiDialog = false;
        this.messageService.add({ severity: 'info', summary: 'Sugerencia', detail: 'La IA ha sugerido una tarea. Por favor, revísala antes de guardar.', life: 3000 });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener sugerencia de la IA', life: 3000 })
    });
  }

  editTask(task: Task) {
    this.task = { ...task };
    this.taskDialog = true;
  }

  deleteTask(task: Task) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que quieres eliminar "' + task.title + '"?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        if (task.id) {
          this.taskService.deleteTask(task.id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Éxitoso', detail: 'Tarea eliminada', life: 3000 });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar', life: 3000 })
          });
        }
      }
    });
  }

  hideDialog() {
    this.taskDialog = false;
    this.submitted = false;
  }

  saveTask() {
    this.submitted = true;
    if (this.task.title?.trim()) {
      if (this.task.id) {
        // Update
        this.taskService.updateTask(this.task.id, this.task).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Tarea actualizada', life: 3000 });
            this.taskDialog = false;
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar', life: 3000 })
        });
      } else {
        // Create
        this.taskService.createTask(this.task).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Tarea creada', life: 3000 });
            this.taskDialog = false;
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear', life: 3000 })
        });
      }
    }
  }

  toggleStatus(task: Task) {
    if (!task.id) return;
    
    this.taskService.updateTask(task.id, task).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Estado de tarea actualizado', life: 2000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar estado', life: 3000 });
        this.taskService.loadTasks(); // Si falla, recargamos el estado original
      }
    });
  }
}
