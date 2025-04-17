import { Injectable, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {
  private apiUrl = 'http://localhost:8080/employees'; 
  private jwtToken: string | null = null;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: any, private router: Router) {}

  ngOnInit() {
    // Listen for storage changes (when token is added or removed)
    window.addEventListener('storage', (event) => {
      if (event.key === 'jwtToken' && event.newValue) {
        this.jwtToken = event.newValue;  // Sync token with class property
      }
    });
  }

  generateOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp }).pipe(
      tap((response: any) => {
        if (response.userId && response.userName && response.designation && response.token) {
          this.saveToken(response.token);  // Save token to class property
          this.saveUserDetails(response.userId, response.userName, response.designation);
        } else {
          throw new Error("Invalid response structure");
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
    if (isPlatformBrowser(this.platformId)) { 
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      localStorage.setItem('designation', designation);
    }
  }

  getUserDetails(): { userId: string; userName: string; designation: string } | null {
    if (isPlatformBrowser(this.platformId)) { 
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const designation = localStorage.getItem('designation');
      
      if (userId && userName && designation) {
        return { userId, userName, designation };
      }
    }
    return null;
  }

  logAction(message: string): void {
    const userDetails = this.getUserDetails();
    if (!userDetails || !userDetails.userId) {
      console.error("User not logged in or user details missing");
      return;
    }

    // 1. Get full employee details using userId
    this.getEmployeeDetails(userDetails.userId).subscribe({
      next: (employee) => {
        // Map to match Java's camelCase fields
        const mappedEmployee = {
          employeeId: employee.employee_id,
          name: employee.name,
          email: employee.email,
          phoneNumber: employee.phone_number,
          dob: employee.dob,
          gender: employee.gender,
          designation: employee.designation
        };

        const auditPayload = {
          employee: mappedEmployee,
          message: message
        };

        console.log("📤 Audit payload to backend:", auditPayload);

        this.http.post('http://localhost:8080/audit/log', auditPayload).subscribe({
          next: () => console.log("Action logged successfully"),
          error: (err) => console.error("Failed to log action", err)
        });
      },
      error: (err) => {
        console.error("Failed to fetch employee details for logging", err);
      }
    });
  }      

  logout(): void {
    const token = this.getToken();
    
    if (token) {
      this.http.post('http://localhost:8080/employees/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => console.log("✅ Backend logout successful"),
        error: err => console.error("❌ Logout API failed", err)
      });
    }
    
    this.jwtToken = null;  // Clear the JWT token from the class property
    localStorage.clear();  // Optional: Clear localStorage as well
    
    // Optional: Redirect to login
    this.router.navigate(['/login']);
  }

  saveToken(token: string): void {
    this.jwtToken = token;  // Store the token in the class property
    localStorage.setItem('jwtToken', token); // Ensure the token is stored in localStorage for tab synchronization
  }
  
  getToken(): string | null {
    return this.jwtToken || localStorage.getItem('jwtToken');  // Return the token from the class property or localStorage
  }
  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
