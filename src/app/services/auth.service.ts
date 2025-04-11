import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/employees'; 

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
    if (isPlatformBrowser(this.platformId)) {
      const userId = localStorage.getItem('userId');
  
      if (userId) {
        // 1. Fetch employee details to get email
        this.getEmployeeDetails(userId).subscribe({
          next: (res) => {
            const email = res.email;
            if (email) {
              // 2. Call logout API with email
              this.http.post(`${this.apiUrl}/logout`, { email }).subscribe({
                next: () => {
                  console.log("Logout successful and logged");
                },
                error: (err) => {
                  console.error("Logout API error", err);
                }
              });
            }
          },
          error: (err) => {
            console.error("Failed to fetch employee details", err);
          }
        });
      }
  
      // 3. Clear local storage anyway
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('designation');
    }
  }
  
}
