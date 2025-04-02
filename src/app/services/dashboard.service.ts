import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError, timeout } from 'rxjs';

interface DashboardData {
  totalCustomers: number;
  totalPayments: number;
  pendingPayments: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8080/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
  }

  getLatestPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/latest-payments`).pipe(
      timeout(5000),  // Fails if API takes more than 5s
      catchError(error => {
        console.error("API Timeout or Error:", error);
        return throwError(() => new Error("Failed to fetch latest payments"));
      })
    );
  }
  private BaseUrl= 'http://localhost:8080/bills/overdue';
  getOverdueBills(): Observable<any[]> {
    return this.http.get<any[]>(this.BaseUrl);
  }

  private charUrl = 'http://localhost:8080/bills';
  getPaymentSummary(): Observable<any> {
    return this.http.get<any>(`${this.charUrl}/summary`);
  }

  getMonthlyPayments(): Observable<any> {
    return this.http.get<any>(`${this.charUrl}/monthly-payments`);
  }
}
