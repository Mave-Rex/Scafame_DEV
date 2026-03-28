import { Routes } from '@angular/router';
import { SelectProductsEntryComponent } from '../pages/entries/select-products-entry.component';
import { ReviewEntryComponent } from '../pages/entries/review-request-entry.component';

export const entriesRoutes: Routes = [
  {
    path: 'request',
    component: SelectProductsEntryComponent
  },
  {
    path: 'request/review',
    component: ReviewEntryComponent
  }
];
