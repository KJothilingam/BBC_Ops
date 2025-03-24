import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path:'',
        loadComponent :()=>import('./components/login/login.component').then((c)=> c.LoginComponent),
    },
];
