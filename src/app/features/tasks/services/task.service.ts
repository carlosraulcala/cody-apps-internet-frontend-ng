import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  // 1. Estado centralizado y reactivo usando Signals
  private _tasks = signal<Task[]>([]);
  public tasks = this._tasks.asReadonly(); // Expuesto como solo lectura para los componentes

  // 2. Método para cargar inicialemente
  loadTasks(): void {
    this.http.get<Task[]>(this.apiUrl).subscribe({
      next: (data) => this._tasks.set(data),
      error: (err) => console.error('Error al cargar tareas', err)
    });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // 3. Mutaciones: Hacen la llamada HTTP y actualizan el Signal internamente con tap()
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      tap((newTask) => this._tasks.update(tasks => [...tasks, newTask]))
    );
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, task).pipe(
      tap((updatedTask) => this._tasks.update(tasks => tasks.map(t => t.id === id ? updatedTask : t)))
    );
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this._tasks.update(tasks => tasks.filter(t => t.id !== id)))
    );
  }

  aiSuggest(prompt: string): Observable<{title: string, description: string}> {
    return this.http.post<{title: string, description: string}>(`${this.apiUrl}/ai-suggest`, { prompt });
  }

  generateAiTask(prompt: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/ai`, { prompt }).pipe(
      tap((newTask) => this._tasks.update(tasks => [...tasks, newTask]))
    );
  }
}
