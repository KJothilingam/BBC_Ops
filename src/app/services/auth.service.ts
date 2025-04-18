import { Injectable, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {
  private apiUrl = 'http://localhost:8080/employees'; 
  private jwtToken: string | null = null;
  private inactivityTimer: any;
  private warningTimer: any;
  private countdownInterval: any;
  private remainingSeconds: number = 60;
  private countdownToast: any;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router,
    private toastr: ToastrService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        this.jwtToken = token;
        this.startInactivityWatcher();
      }

      // Sync token on storage change
      window.addEventListener('storage', (event) => {
        if (event.key === 'jwtToken') {
          this.jwtToken = event.newValue;
        }
      });

      // Detect user activity to reset timers
      ['click', 'mousemove', 'keydown', 'scroll'].forEach(event => {
        window.addEventListener(event, () => this.resetInactivityTimer());
      });
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', (event) => {
        if (event.key === 'jwtToken' && event.newValue) {
          this.jwtToken = event.newValue;
        }
      });
    }
  }

  private startInactivityWatcher() {
    this.resetInactivityTimer();
  }

  private resetInactivityTimer() {
    clearTimeout(this.inactivityTimer);
    clearTimeout(this.warningTimer);
    clearInterval(this.countdownInterval);

    // 4 min: show warning toast
    this.warningTimer = setTimeout(() => {
      this.remainingSeconds = 60;

      this.countdownToast = this.toastr.warning(`You will be logged out in ${this.remainingSeconds} seconds due to inactivity.`, 'Inactivity Warning', {
        disableTimeOut: true,
        tapToDismiss: false,
        closeButton: true,
        toastClass: 'ngx-toastr countdown-toast' // Custom class for styling
      });

      this.countdownInterval = setInterval(() => {
        this.remainingSeconds--;
        const message = `You will be logged out in ${this.remainingSeconds} seconds due to inactivity.`;

        // Update the toast message with countdown
        const toastElement = document.querySelector('.countdown-toast .toast-message');
        if (toastElement) {
          toastElement.textContent = message;
        }

        console.log(message);

        if (this.remainingSeconds <= 0) {
          clearInterval(this.countdownInterval);
        }
      }, 1000);
    }, 4 * 60 * 1000); // 4 minutes of inactivity

    // 5 min: auto logout
    this.inactivityTimer = setTimeout(() => {
      console.log(' Logging out due to 5 min inactivity...');
      this.logout();
      this.toastr.info('You have been logged out due to inactivity.', 'Session Expired');
    }, 5 * 60 * 1000); // 5 minutes of inactivity
  }

  generateOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp }).pipe(
      tap((response: any) => {
        if (response.userId && response.userName && response.designation && response.token) {
          this.saveToken(response.token);
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

    this.getEmployeeDetails(userDetails.userId).subscribe({
      next: (employee) => {
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
        next: () => console.log(" Backend logout successful"),
        error: err => console.error(" Logout API failed", err)
      });
    }

    this.jwtToken = null;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }

    this.router.navigate(['/login']);
  }

  saveToken(token: string): void {
    this.jwtToken = token;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('jwtToken', token);
    }
  }

  getToken(): string | null {
    return this.jwtToken || (isPlatformBrowser(this.platformId) ? localStorage.getItem('jwtToken') : null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
