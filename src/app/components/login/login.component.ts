import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = "";
  otp: string = "";
  otpGenerated: boolean = false;
  storedOtp: string = "";

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  
  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}

  moveNext(event: any, index: number): void {
    const inputValue = event.target.value;
    if (inputValue.length === 1 && index < this.otpInputs.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  moveBack(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const inputs = this.otpInputs.toArray();
      if (index > 0) {
        inputs[index].nativeElement.value = '';  
        inputs[index - 1].nativeElement.focus();
      }
    }
  }
  autoFillOtp(otp: string) {
    const otpArray = otp.split(''); // Convert OTP string into array of digits
    const inputs = this.otpInputs.toArray(); // Get all input fields
    
    otpArray.forEach((digit, index) => {
      if (inputs[index]) {
        inputs[index].nativeElement.value = digit; // Auto-fill input box
      }
    });
  
    // Move focus to the last OTP box after auto-fill
    if (inputs.length > 0) {
      inputs[inputs.length - 1].nativeElement.focus();
    }
  }
  

  generateOtp() {
    if (!this.email) {
      this.toastr.warning("⚠️ Please enter your email", "Warning!", { timeOut: 10000 });
      return;
    }
  
    this.authService.generateOtp(this.email).subscribe(
      response => {
        if (response.otp) {
          this.storedOtp = response.otp; // Store OTP for auto-fill
  
          this.toastr.success(
            `✅ OTP Sent Successfully! <br><strong style="font-size: 18px;">Your OTP: ${response.otp}</strong>`, 
            "Success!", 
            { timeOut: 10000, enableHtml: true }
          );
  
          // Auto-fill OTP in input boxes
          setTimeout(() => this.autoFillOtp(response.otp), 500); 
        } else {
          this.toastr.success("✅ OTP Sent Successfully!", "Success!", { timeOut: 10000 });
        }
      },
      error => {
        let errorMessage = error.error?.message || "❌ Something went wrong!";
        this.toastr.error(errorMessage, "Error!", { timeOut: 10000 });
      }
    );
  }
  
  

  verifyOtp() {
    const enteredOtp = this.otpInputs.map(input => input.nativeElement.value).join('');

    if (enteredOtp.length !== 6) {
      this.toastr.warning("⚠️ Enter complete 6-digit OTP", "Warning!", { timeOut: 10000 });
      return;
    }

    this.authService.verifyOtp(this.email, enteredOtp).subscribe(
      response => {
        this.toastr.success("✅ OTP Verified!", "Success!", { timeOut: 20000 });
        this.router.navigate(['/dashboard']);
      },
      error => {
        this.toastr.error(error.error.message || "❌ Invalid OTP", "Error!", { timeOut: 10000 });
      }
    );
  }
}
