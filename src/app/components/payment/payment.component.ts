import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { BillService } from '../../services/bill.service';
import { PaymentRequest } from './../../Interfaces/payment.model';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";

// 🔹 Import Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr'; // 🔹 Import Toastr Service

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarComponent,
    // 🔹 Include Material Modules
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule
  ]
})
export class PaymentComponent {
  paymentForm: FormGroup;
  isProcessing = false;
  bills: any[] = []; // Store fetched bills

  constructor(
    private fb: FormBuilder, 
    private paymentService: PaymentService, 
    private billService: BillService,
    private toastr: ToastrService // 🔹 Inject Toastr Service
  ) {
    this.paymentForm = this.fb.group({
      meterNumber: ['', Validators.required],
      billId: ['', Validators.required],
      amount: [{ value: '', disabled: true }, [Validators.required, Validators.min(1)]],
      dueDate: [{ value: '', disabled: true }],
      paymentMethod: ['', Validators.required]
    });
  }

  // 🔹 Fetch unpaid bills based on meter number
  fetchBills() {
    const meterNumber = this.paymentForm.get('meterNumber')?.value;

    if (!meterNumber.trim()) {
      this.toastr.warning('Please enter a meter number.', 'Warning', this.getToastrConfig());
      return;
    }

    this.billService.getUnpaidBillsByMeter(meterNumber).subscribe({
      next: (data) => {
        this.bills = data;
        if (data.length === 0) {
          this.toastr.info('No bill due for this meter connection.', 'Info', this.getToastrConfig());
        }
      },
      error: () => {
        this.bills = [];
        this.toastr.error('Error fetching bills. Please try again.', 'Error', this.getToastrConfig());
      }
    });
  }

  // 🔹 Auto-fill bill details when a bill is selected
  onBillSelect() {
    const selectedBillId = this.paymentForm.get('billId')?.value;
    const selectedBill = this.bills.find(bill => bill.billId === selectedBillId);

    if (selectedBill) {
      this.paymentForm.patchValue({
        amount: selectedBill.totalBillAmount,
        dueDate: new Date(selectedBill.dueDate).toISOString().split('T')[0] // Format YYYY-MM-DD
      });
    }
  }

  // 🔹 Process payment
  processPayment() {
    if (this.paymentForm.invalid) {
      this.toastr.error('Please fill in all required fields.', 'Error', this.getToastrConfig());
      return;
    }

    this.isProcessing = true;
    this.paymentForm.disable(); // 🔹 Disable form while processing

    const paymentData: PaymentRequest = this.paymentForm.getRawValue(); // ✅ Ensure disabled fields are included

    this.paymentService.processPayment(paymentData).subscribe({
      next: () => {
        this.toastr.success('Payment Successful!', 'Success', this.getToastrConfig());
        this.resetForm();
      },
      error: (error) => {
        this.toastr.error('Payment Failed! Try again.', 'Error', this.getToastrConfig());
        console.error(error);
        this.isProcessing = false;
        this.paymentForm.enable(); // 🔹 Re-enable form if payment fails
      }
    });
  }

  // 🔹 Reset form after successful payment
  private resetForm() {
    this.isProcessing = false;
    this.paymentForm.reset();
    this.paymentForm.enable(); // ✅ Ensure the form is re-enabled
    this.bills = [];
  }

  // 🔹 Centralized Toastr configuration
  private getToastrConfig() {
    return {
      timeOut: 3000,
      positionClass: 'toast-top-right'
    };
  }
}
