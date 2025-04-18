import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
// import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getUserDetails();
    
    if (user && user.userId) {
      return true;  //  Allow access if user is logged in
    }

    this.router.navigate(['/']); //  Redirect to login page if not logged in
    return false;
  }
}
