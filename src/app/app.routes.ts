import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path:'',
        loadComponent :()=>import('./components/login/login.component').then((c)=> c.LoginComponent),
    },
    {
        path:'dashboard',
        loadComponent :()=>import('./components/dashboard/dashboard.component').then((c)=> c.DashboardComponent),
    },
    
    {
        path:'profile',
        loadComponent :()=>import('./components/profile/profile.component').then((c)=> c.ProfileComponent),
    },
    {
        path:'adduser',
        loadComponent :()=>import('./components/add-user/add-user.component').then((c)=> c.AddUserComponent),
    },
    {
        path:'generatebill',
        loadComponent :()=>import('./components/generate-bill/generate-bill.component').then((c)=> c.GenerateBillComponent),
    },
    {
        path:'manageuser',
        loadComponent :()=>import('./components/manage-user/manage-user.component').then((c)=> c.ManageUserComponent),
    },
    {
        path:'payment',
        loadComponent :()=>import('./components/payment/payment.component').then((c)=> c.PaymentComponent),
    },
    {
        path:'paymentrecord',
        loadComponent :()=>import('./components/payment-history-component/payment-history-component.component').then((c)=> c.PaymentHistoryComponentComponent),
    },
    {
        path:'recent',
        loadComponent :()=>import('./components/recent-payments/recent-payments.component').then((c)=> c.RecentPaymentsComponent),
    },
];
