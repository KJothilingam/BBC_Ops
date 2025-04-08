// payment-history.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentHistoryService {
  private apiUrl = 'http://localhost:8080'; 

  constructor(private http: HttpClient) {}

  getPaymentDetails(transactionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payment-records/${transactionId}`);
  }
}
