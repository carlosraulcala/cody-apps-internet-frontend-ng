import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { TasksComponent } from './features/tasks/components/task-list/tasks.component';
import { authGuard } from './core/auth.guard';
import { NotFoundComponent } from './features/not-found/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SignInComponent } from './features/auth/pages/sign-in/sign-in.component';
import { SignUpComponent } from './features/auth/pages/sign-up/sign-up.component';

import { CategoryListComponent } from './features/categories/components/category-list/category-list.component';
import { ProductListComponent } from '@features/products/components/product-list/product-list.component';
import { CartComponent } from '@features/cart/components/cart-view/cart.component';
import { ReviewListComponent } from '@features/reviews/components/review-list/review-list.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        pathMatch: 'full',
        title: 'MiPanel Pro | Dashboard',
      },
      {
        path: 'tasks',
        component: TasksComponent,
        title: 'Gestión de Tareas | MiPanel Pro'
      },
      {
        path: 'categories',
        component: CategoryListComponent,
        title: 'Categorías | MiPanel Pro'
      },
      {
        path: 'products',
        component: ProductListComponent,
        title: 'Productos | MiPanel Pro'
      },
      {
        path: 'cart',
        component: CartComponent,
        title: 'Carrito | MiPanel Pro'
      },
      {
        path: 'reviews',
        component: ReviewListComponent,
        title: 'Reseñas | MiPanel Pro'
      }
    ]
  },
  // auth pages
  {
    path: 'signin',
    component: SignInComponent,
    title: 'Iniciar Sesión | MiPanel Pro'
  },
  {
    path: 'signup',
    component: SignUpComponent,
    title: 'Registro | MiPanel Pro'
  },
  // error pages
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Página no encontrada | MiPanel Pro'
  },
];
