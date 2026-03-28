import { Routes } from '@angular/router';
import { RemovalsPageComponent } from '../pages/removals/removals-page.component';
import { SelectProductsComponent } from '../pages/removals/request-removal/select-products.component';
import { ReviewRequestComponent } from '../pages/removals/request-removal/review-request.component';
import { ManageRemovalsComponent } from '../pages/removals/manage-removals/manage-removals.component';

export const removalsRoutes: Routes = [
  {
    path: '',
    component: RemovalsPageComponent
  },
  {
    path: 'request',
    component: SelectProductsComponent
  },
  {
    path: 'request/review',
    component: ReviewRequestComponent
  },
  {
    path: 'manage',
    component: ManageRemovalsComponent
  }
];
