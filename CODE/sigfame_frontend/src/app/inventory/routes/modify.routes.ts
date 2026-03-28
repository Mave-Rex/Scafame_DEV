import { Routes } from '@angular/router';
import { ModifyInventoryComponent } from '../pages/modify/modify-inventory.component';

// Las páginas siguientes serán contenedores para mostrar los formularios correspondientes
import { AddAreaPageComponent } from '../pages/modify/add-pages/add-area-page.component';
import { EditAreaPageComponent } from '../pages/modify/edit-pages/edit-area-page.component';
import { DeleteAreaPageComponent } from '../pages/modify/delete-pages/delete-area-page.component';

import { AddCategoryPageComponent } from '../pages/modify/add-pages/add-category-page.component';
import { EditCategoryPageComponent } from '../pages/modify/edit-pages/edit-category-page.component';
import { DeleteCategoryPageComponent } from '../pages/modify/delete-pages/delete-category-page.component';

import { AddProductPageComponent } from '../pages/modify/add-pages/add-product-page.component';
import { EditProductPageComponent } from '../pages/modify/edit-pages/edit-product-page.component';
import { DeleteProductPageComponent } from '../pages/modify/delete-pages/delete-product-page.component';

export const modifyRoutes: Routes = [
  {
    path: '',
    component: ModifyInventoryComponent
  },

  // ÁREAS
  {
    path: 'area/add',
    component: AddAreaPageComponent
  },
  {
    path: 'area/edit',
    component: EditAreaPageComponent
  },
  {
    path: 'area/delete',
    component: DeleteAreaPageComponent
  },

  // CATEGORÍAS
  {
    path: 'category/add',
    component: AddCategoryPageComponent
  },
  {
    path: 'category/edit',
    component: EditCategoryPageComponent
  },
  {
    path: 'category/delete',
    component: DeleteCategoryPageComponent
  },

  // PRODUCTOS
  {
    path: 'product/add',
    component: AddProductPageComponent
  },
  {
    path: 'product/edit',
    component: EditProductPageComponent
  },
  {
    path: 'product/delete',
    component: DeleteProductPageComponent
  }
];
