import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
    canActivate: [AuthGuard], // ✅ Protected route
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(
        (c) => c.ProfileComponent
      ),
    canActivate: [AuthGuard], // ✅ Protected route
  },
  {
    path: 'adduser',
    loadComponent: () =>
      import('./components/add-user/add-user.component').then(
        (c) => c.AddUserComponent
      ),
    canActivate: [AuthGuard], // ✅ Protected route
  },
  {
    path: 'generatebill',
    loadComponent: () =>
      import('./components/generate-bill/generate-bill.component').then(
        (c) => c.GenerateBillComponent
      ),
    canActivate: [AuthGuard], // ✅ Protected route
  },
  {
    path: 'manageuser',
    loadComponent: () =>
      import('./components/manage-user/manage-user.component').then(
        (c) => c.ManageUserComponent
      ),
    canActivate: [AuthGuard], // ✅ Protected route
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./components/payment/payment.component').then(
        (c) => c.PaymentComponent
      ),
    canActivate: [AuthGuard], // ✅ Protected route
  },
  {
    path: 'paymentrecord',
    loadComponent: () =>
      import('./components/payment-history-component/payment-history-component.component').then(
        (c) => c.PaymentHistoryComponentComponent
      ),
    canActivate: [AuthGuard], // ✅ Protected route
  },
  {
    path: 'recent',
    loadComponent: () =>
      import('./components/recent-payments/recent-payments.component').then(
        (c) => c.RecentPaymentsComponent
      ),
    canActivate: [AuthGuard], // ✅ Protected route
  },
  {
    path: 'default',
    loadComponent: () =>
      import('./components/defaulter-bills/defaulter-bills.component').then(
        (c) => c.DefaulterBillsComponent
      ),
    canActivate: [AuthGuard], // ✅ Protected route
  },
  {
    path: 'updatebill',
    loadComponent: () =>
      import('./components/update-bill/update-bill.component').then(
        (c) => c.UpdateBillComponent
      ),
    canActivate: [AuthGuard], // ✅ Protected route
  },
];
