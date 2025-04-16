import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private baseUrl = 'http://localhost:8080/audit';

  constructor(private http: HttpClient) {}

  getAuditLogs() {
    return this.http.get<any[]>(`${this.baseUrl}/audit-logs`);
  }
}
