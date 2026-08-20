import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CartItemDetail } from '../../models/cart-item.model';
import { CartService } from '@features/cart/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {
  public cartService = inject(CartService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit() {
    this.cartService.loadCart();
  }

  updateQuantity(item: CartItemDetail, newQty: number) {
    if (newQty <= 0) {
      this.removeItem(item);
      return;
    }

    if (item.product && newQty > item.product.stock) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Límite de Stock',
        detail: `No puedes agregar más de ${item.product.stock} unidades de ${item.product.title}.`,
        life: 3000
      });
      return;
    }

    this.cartService.updateQuantity(item.id, newQty);
  }

  removeItem(item: CartItemDetail) {
    const title = item.product?.title ? `"${item.product.title}"` : 'este producto';
    this.confirmationService.confirm({
      message: `¿Deseas quitar ${title} del carrito?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cartService.removeItem(item.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Carrito',
          detail: 'Producto eliminado',
          life: 3000
        });
      }
    });
  }

  clearCart() {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas vaciar todo el carrito?',
      header: 'Vaciar Carrito',
      icon: 'pi pi-trash',
      accept: () => {
        this.cartService.clearCart();
        this.messageService.add({
          severity: 'warn',
          summary: 'Carrito Vacío',
          detail: 'Se han eliminado todos los productos',
          life: 3000
        });
      }
    });
  }

  checkout() {
    this.messageService.add({
      severity: 'success',
      summary: 'Orden Procesada',
      detail: '¡Tu orden ha sido generada exitosamente!',
      life: 4000
    });
  }
}
