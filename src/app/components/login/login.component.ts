import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

 
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

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
        // Clear the current input
        inputs[index].nativeElement.value = '';  
        // Move focus to previous input
        inputs[index - 1].nativeElement.focus();
      }
    }
  }

}
