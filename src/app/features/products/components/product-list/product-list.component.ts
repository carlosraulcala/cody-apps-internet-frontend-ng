import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services & Models
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CartService } from '@features/cart/services/cart.service';
import { CategoryService } from '@features/categories/services/category.service';
import { Category } from '@features/categories/models/category.model';

import { ReviewListComponent } from '@features/reviews/components/review-list/review-list.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule,
    SelectModule,
    ReviewListComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  public productService = inject(ProductService);
  public cartService = inject(CartService);
  public categoryService = inject(CategoryService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Filtro por categoría
  public selectedCategoryId = signal<number | null>(null);
  public filteredProducts = computed(() => {
    const products = this.productService.products();
    const categoryId = this.selectedCategoryId();
    console.log('Filtering products. CategoryId:', categoryId, 'Total products:', products.length);
    return categoryId
      ? products.filter(p => p.category_id === categoryId)
      : products;
  });

  product!: Partial<Product>;
  productDialog: boolean = false;
  submitted: boolean = false;

  // Estado para modal de reseñas
  selectedProduct: Product | null = null;
  showReviewsDialog: boolean = false;

  openReviews(prod: Product) {
    this.selectedProduct = prod;
    this.showReviewsDialog = true;
  }

  ngOnInit() {
    this.productService.loadProducts();
    this.cartService.loadCart();
    this.categoryService.loadCategories();
  }

  // 👉 Método para agregar al carrito con control estricto de stock
  addToCart(prod: Product) {
    if (prod.stock <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin Stock',
        detail: 'Este producto se encuentra agotado',
        life: 3000
      });
      return;
    }

    const currentItem = this.cartService.items().find((item) => item.product_id === prod.id);
    const currentQty = currentItem?.quantity ?? 0;

    if (currentQty + 1 > prod.stock) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Límite de Stock',
        detail: `No puedes agregar más unidades. El stock máximo disponible es ${prod.stock} (ya tienes ${currentQty} en el carrito).`,
        life: 4000
      });
      return;
    }

    this.cartService.addToCart({
      product_id: prod.id,
      quantity: 1
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Carrito',
      detail: `"${prod.title}" agregado al carrito (${currentQty + 1}/${prod.stock})`,
      life: 3000
    });
  }

  isMaxStockReached(prod: Product): boolean {
    if (prod.stock <= 0) return true;
    const currentItem = this.cartService.items().find((item) => item.product_id === prod.id);
    return (currentItem?.quantity ?? 0) >= prod.stock;
  }

  openNew() {
    this.product = { stock: 0, price: 0 };
    this.submitted = false;
    this.productDialog = true;
  }

  editProduct(prod: Product) {
    this.product = { ...prod };
    this.productDialog = true;
  }

  deleteProduct(prod: Product) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${prod.title}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (prod.id) {
          this.productService.deleteProduct(prod.id);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado', life: 3000 });
        }
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    if (this.product.title?.trim() && this.product.price !== undefined && this.product.category_id) {
      if (this.product.id) {
        this.productService.updateProduct(this.product.id, this.product as Product);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado', life: 3000 });
      } else {
        this.productService.createProduct(this.product as Omit<Product, 'id'>);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto creado', life: 3000 });
      }
      this.productDialog = false;
    }
  }
}
