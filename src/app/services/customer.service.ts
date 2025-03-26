import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:8080/customers'; // Updated base URL

  constructor(private http: HttpClient) {}

  uploadCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.post<any>(`${this.apiUrl}/upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  fetchCustomers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list`) // Endpoint to fetch customers
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMsg = `Client-side error: ${error.error.message}`;
    } else {
      errorMsg = `Server-side error: ${error.status} - ${error.message}`;
    }
    return throwError(() => new Error(errorMsg));
  }


  deleteCustomer(customerId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${customerId}`);
  }
}
