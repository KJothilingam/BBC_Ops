import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/employees'; // ✅ Backend API URL

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: any) {}

  generateOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp }).pipe(
      tap((response: any) => {
        if (response.userId && response.userName && response.designation) {
          this.saveUserDetails(response.userId, response.userName, response.designation);
        } else {
          throw new Error("Invalid response structure"); // 🚨 Log unexpected responses
        }
      })
    );
  }

  getEmployeeDetails(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/data/${userId}`);
  }

  updateEmployeeDetails(employee: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${employee.employee_id}`, employee);
  }

  saveUserDetails(userId: string, userName: string, designation: string): void {
    if (isPlatformBrowser(this.platformId)) { // ✅ Ensure it's running in a browser
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      localStorage.setItem('designation', designation);
    }
  }

  getUserDetails(): { userId: string; userName: string; designation: string } | null {
    if (isPlatformBrowser(this.platformId)) { // ✅ Check before accessing localStorage
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const designation = localStorage.getItem('designation');

      if (userId && userName && designation) {
        return { userId, userName, designation };
      }
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) { // ✅ Prevent SSR errors
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('designation');
    }
  }
}
