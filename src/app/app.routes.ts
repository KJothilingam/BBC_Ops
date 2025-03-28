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
        path:'report',
        loadComponent :()=>import('./components/report/report.component').then((c)=> c.ReportComponent),
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
];
