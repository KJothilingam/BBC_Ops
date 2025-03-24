import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {


  selectedBranch: string = '';
  email: string = '';
  otp: string = '';
  showOTP: boolean = false;
  keepLoggedIn: boolean = false;
  branches = ['Branch 1', 'Branch 2', 'Branch 3'];

  generateOTP() {
    alert('OTP has been sent to ' + this.email);
  }

  toggleOTPVisibility() {
    this.showOTP = !this.showOTP;
  }

  verifyOTP() {
    if (this.otp.length >= 8) {
      alert('OTP Verified Successfully');
    } else {
      alert('Invalid OTP. Must be at least 8 characters.');
    }
  }

}
