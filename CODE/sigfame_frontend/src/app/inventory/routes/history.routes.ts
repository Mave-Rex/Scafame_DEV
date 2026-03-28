import { Routes } from '@angular/router';
import { ViewHistoryComponent } from '../pages/history/view-history.component';
import { DetailHistoryComponent } from '../pages/history/detail-history.component';

export const historyRoutes: Routes = [
  {
    path: '',
    component: ViewHistoryComponent
  },
  {
    path: ':id',
    component: DetailHistoryComponent
  }
];
