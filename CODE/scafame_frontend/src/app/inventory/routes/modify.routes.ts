import { Routes } from '@angular/router';
import { ModifyInventoryComponent } from '../pages/modify/modify-inventory.component';

// UNIT
import { AddUnitPageComponent } from '../pages/modify/add-pages/add-unit-page.component';
import { EditUnitPageComponent } from '../pages/modify/edit-pages/edit-unit-page.component';
import { DeleteUnitPageComponent } from '../pages/modify/delete-pages/delete-unit-page.component';

// CATEGORÍAS
import { AddCategoryPageComponent } from '../pages/modify/add-pages/add-category-page.component';
import { EditCategoryPageComponent } from '../pages/modify/edit-pages/edit-category-page.component';
import { DeleteCategoryPageComponent } from '../pages/modify/delete-pages/delete-category-page.component';

// PRODUCTOS
import { AddProductPageComponent } from '../pages/modify/add-pages/add-product-page.component';
import { EditProductPageComponent } from '../pages/modify/edit-pages/edit-product-page.component';
import { DeleteProductPageComponent } from '../pages/modify/delete-pages/delete-product-page.component';

export const modifyRoutes: Routes = [
  {
    path: '',
    component: ModifyInventoryComponent
  },

  // UNITS (reemplazo de ÁREAS)
  { path: 'unit/add',    component: AddUnitPageComponent },
  { path: 'unit/edit',   component: EditUnitPageComponent },
  { path: 'unit/delete', component: DeleteUnitPageComponent },

  // CATEGORÍAS
  { path: 'category/add',    component: AddCategoryPageComponent },
  { path: 'category/edit',   component: EditCategoryPageComponent },
  { path: 'category/delete', component: DeleteCategoryPageComponent },

  // PRODUCTOS
  { path: 'product/add',    component: AddProductPageComponent },
  { path: 'product/edit',   component: EditProductPageComponent },
  { path: 'product/delete', component: DeleteProductPageComponent },
];
