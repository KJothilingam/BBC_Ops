import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./components/startup-redirect/startup-redirect.component').then((c) => c.StartupRedirectComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((c) => c.LoginComponent),
  },
  
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
    canActivate: [AuthGuard], 
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(
        (c) => c.ProfileComponent
      ),
    canActivate: [AuthGuard], 
  },
  {
    path: 'adduser',
    loadComponent: () =>
      import('./components/add-user/add-user.component').then(
        (c) => c.AddUserComponent
      ),
    canActivate: [AuthGuard], 
  },
  {
    path: 'generatebill',
    loadComponent: () =>
      import('./components/generate-bill/generate-bill.component').then(
        (c) => c.GenerateBillComponent
      ),
    canActivate: [AuthGuard], 
  },
  {
    path: 'manageuser',
    loadComponent: () =>
      import('./components/manage-user/manage-user.component').then(
        (c) => c.ManageUserComponent
      ),
    canActivate: [AuthGuard], 
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./components/payment/payment.component').then(
        (c) => c.PaymentComponent
      ),
    canActivate: [AuthGuard], 
  },
  {
    path: 'paymentrecord',
    loadComponent: () =>
      import('./components/payment-history-component/payment-history-component.component').then(
        (c) => c.PaymentHistoryComponentComponent
      ),
    canActivate: [AuthGuard], 
  },
  {
    path: 'recent',
    loadComponent: () =>
      import('./components/recent-payments/recent-payments.component').then(
        (c) => c.RecentPaymentsComponent
      ),
    canActivate: [AuthGuard], 
  },
  {
    path: 'default',
    loadComponent: () =>
      import('./components/defaulter-bills/defaulter-bills.component').then(
        (c) => c.DefaulterBillsComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'updatebill',
    loadComponent: () =>
      import('./components/update-bill/update-bill.component').then(
        (c) => c.UpdateBillComponent
      ),
    canActivate: [AuthGuard], 
  },
  {
    path: 'report',
    loadComponent: () =>
      import('./components/report/report.component').then(
        (c) => c.ReportComponent
      ),
    canActivate: [AuthGuard], 
  },
];
