import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ToastrService } from 'ngx-toastr';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AuthService } from '../../services/auth.service';

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
    // 🔹 Angular Material Modules
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
  paymentData: any = {};
  showModal = false;
  userName: string | null = 'N/A';
  designation: string | null = 'N/A';

  constructor(
    private fb: FormBuilder, 
    private paymentService: PaymentService, 
    private billService: BillService,
    private toastr: ToastrService,
    private authService: AuthService, 
    private cd: ChangeDetectorRef // 🔹 Force UI update
  ) {
    this.paymentForm = this.fb.group({
      meterNumber: ['', Validators.required],
      billId: ['', Validators.required],
      amount: [{ value: '', disabled: true }, [Validators.required, Validators.min(1)]],
      dueDate: [{ value: '', disabled: true }],
      paymentMethod: ['', Validators.required]
    });

    const userDetails = this.authService.getUserDetails();
    this.userName = userDetails?.userName ?? 'N/A';
    this.designation = userDetails?.designation ?? 'N/A';
  }

  closeModal() {
    this.showModal = false;
  }

  // 🔹 Fetch unpaid bills
  fetchBills() {
    const meterNumber = this.paymentForm.get('meterNumber')?.value.trim();

    if (!meterNumber) {
      this.toastr.warning('Please enter a meter number.', 'Warning', this.getToastrConfig());
      return;
    }
    this.billService.getUnpaidBillsByMeter(meterNumber).subscribe({
      next: (data) => {
        this.bills = data;
        if (data.length === 0) {
          this.toastr.info('No due bills.', 'Info');
        }
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    });
  }

  // 🔹 Auto-fill bill details when a bill is selected
  onBillSelect() {
    const selectedBillId = parseInt(this.paymentForm.get('billId')?.value, 10);
    const selectedBill = this.bills.find(bill => bill.billId === selectedBillId);

    if (selectedBill) {
      this.paymentForm.patchValue({
        amount: selectedBill.totalBillAmount,
        dueDate: new Date(selectedBill.dueDate).toISOString().split('T')[0] // Format YYYY-MM-DD
      });

      this.paymentData = {
        invoiceId: selectedBill.invoiceId,
        meterNumber: selectedBill.customer?.meterNumber ?? 'N/A',
        totalBillAmount: selectedBill.totalBillAmount,
        discountApplied: selectedBill.discountApplied,
        amountPaid: selectedBill.transaction?.amountPaid ?? 0,
        paymentMethod: selectedBill.transaction?.paymentMethod ?? 'N/A',
        paymentDate: selectedBill.transaction ? new Date(selectedBill.transaction.paymentDate).toISOString().split('T')[0] : 'N/A',
        customerName: selectedBill.customer?.name ?? 'Unknown',  
        customerEmail: selectedBill.customer?.email ?? 'N/A',
      };

      this.cd.detectChanges(); // ✅ Force UI update
    }
  }

  // 🔹 Process payment
  processPayment() {
    if (this.paymentForm.invalid) {
      this.toastr.error('Please fill in all required fields.', 'Error', this.getToastrConfig());
      return;
    }

    this.isProcessing = true;
    this.paymentForm.disable();

    const paymentData: PaymentRequest = this.paymentForm.getRawValue();

    this.paymentService.processPayment(paymentData).subscribe({
      next: (response) => {
        this.paymentData = {
          ...response, // ✅ Keep payment response
          customerName: this.paymentData.customerName ?? 'N/A',
          customerEmail: this.paymentData.customerEmail ?? 'N/A'
        };

        this.toastr.success('Payment Successful!', 'Success', this.getToastrConfig());
        this.generatePDFReceipt();
        this.resetForm();
      },
      error: () => {
        this.toastr.error('Payment Failed! Try again.', 'Error', this.getToastrConfig());
        this.isProcessing = false;
        this.paymentForm.enable();
      }
    });
  }

  // 🔹 Reset form after payment
  private resetForm() {
    this.isProcessing = false;
    this.paymentForm.reset();
    this.paymentForm.enable();
    this.bills = [];
  }

  // 🔹 Generate PDF Receipt
  generatePDFReceipt() {
    if (!this.paymentData || Object.keys(this.paymentData).length === 0) {
      console.error("Payment data is missing!");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Payment Receipt", 90, 15);
    
    doc.setFontSize(12);
    doc.text(`Processed By: ${this.userName} (${this.designation})`, 20, 30);
    doc.text(`Customer: ${this.paymentData.customerName}`, 20, 45);
    doc.text(`Email: ${this.paymentData.customerEmail}`, 20, 55);
    doc.text(`Meter Number: ${this.paymentData.meterNumber}`, 20, 65);

    doc.text("Invoice Details:", 20, 80);
    doc.text(`Invoice ID: ${this.paymentData.invoiceId ?? "N/A"}`, 20, 90);
    doc.text(`Unit Consumed: ${this.paymentData.unitConsumed ?? "0"} kWh`, 20, 100);
    doc.text(`Due Date: ${this.paymentData.dueDate ? new Date(this.paymentData.dueDate).toLocaleDateString() : "N/A"}`, 20, 110);
    doc.text(`Payment Date: ${this.paymentData.paymentDate ? new Date(this.paymentData.paymentDate).toLocaleDateString() : "N/A"}`, 20, 120);

    doc.text("Transaction Details:", 20, 135);
    doc.text(`Bill Amount: ₹${this.paymentData.totalBillAmount ?? "0.00"}`, 20, 145);
    doc.text(`Amount Paid: ₹${this.paymentData.amountPaid ?? "0.00"}`, 20, 155);
    doc.text(`Payment Method: ${this.paymentData.paymentMethod}`, 20, 165);
    doc.text(`Transaction ID: ${this.paymentData.transactionId ?? "N/A"}`, 20, 175);
    
    doc.setFontSize(10);
    doc.text("Thank you for your payment!", 20, 190);

    doc.save(`receipt_${this.paymentData.invoiceId ?? "unknown"}.pdf`);
  }

  // 🔹 Toastr Configuration
  private getToastrConfig() {
    return { timeOut: 3000, positionClass: 'toast-top-right' };
  }
}
