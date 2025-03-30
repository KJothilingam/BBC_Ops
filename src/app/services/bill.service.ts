import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'http://localhost:8080/bills'; // ✅ Corrected base URL

  constructor(private http: HttpClient) {}

  generateBill(billData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate`, billData);
  }

  getAllBills(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`); // ✅ Fixed URL
  }
}
