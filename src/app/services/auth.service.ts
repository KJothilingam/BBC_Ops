import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/employees'; // ✅ Backend API URL

  constructor(private http: HttpClient) {}

  generateOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp });
  }
}
