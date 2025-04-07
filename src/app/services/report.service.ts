import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportRequest {
  requestId: number;
  requestType: string;
  billId?: number;
  newValue?: string;
  extendDays?: number;
  details?: string;
  status: string;
  requestDate: string;
  customerId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = 'http://localhost:8080/report';

  constructor(private http: HttpClient) {}

  getAllReports(): Observable<ReportRequest[]> {
    return this.http.get<ReportRequest[]>(`${this.baseUrl}/all`);
  }
 
  updateReportStatus(requestId: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-status/${requestId}`, { status });
  }
  
  
}
