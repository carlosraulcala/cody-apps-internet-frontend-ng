import { Component, OnInit, inject, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

// Review Feature
import { ReviewService } from '../../services/review.service';
import { ReviewIn } from '../../models/review.model';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RatingModule,
    ButtonModule,
    DialogModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './review-list.component.html'
})
export class ReviewListComponent implements OnInit {
  public reviewService = inject(ReviewService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Input Signal opcional si se usa dentro de la vista de un producto
  productId = input<number | undefined>(undefined);

  reviewDialog: boolean = false;
  submitted: boolean = false;

  newReview: ReviewIn = {
    rating: 5,
    comment: ''
  };

  constructor() {
    effect(() => {
      const id = this.productId();
      this.reviewService.loadReviews(id);
    });
  }

  ngOnInit() {}

  openNew() {
    this.newReview = { rating: 5, comment: '' };
    this.submitted = false;
    this.reviewDialog = true;
  }

  hideDialog() {
    this.reviewDialog = false;
    this.submitted = false;
  }

  saveReview() {
    this.submitted = true;

    if (!this.newReview.comment.trim() || !this.newReview.rating) {
      return;
    }

    const prodId = this.productId();
    if (!prodId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se ha seleccionado un producto válido',
        life: 3000
      });
      return;
    }

    this.reviewService.createReview(prodId, this.newReview);
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Reseña enviada correctamente',
      life: 3000
    });

    this.reviewDialog = false;
  }

  deleteReview(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar esta reseña?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.reviewService.deleteReview(id, this.productId());
        this.messageService.add({
          severity: 'info',
          summary: 'Eliminado',
          detail: 'Reseña eliminada con éxito',
          life: 3000
        });
      }
    });
  }
}
