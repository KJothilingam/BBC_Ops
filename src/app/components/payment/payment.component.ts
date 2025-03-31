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

import * as QRCode from 'qrcode';  // Fix Import


import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AuthService } from '../../services/auth.service';
import { PaymentHistoryComponentComponent } from "../payment-history-component/payment-history-component.component";

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
    MatButtonModule,
    PaymentHistoryComponentComponent
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
  const pageWidth = doc.internal.pageSize.getWidth();

  // 🔹 Header with Company Info
  doc.setFillColor(0, 51, 153); // Dark Blue
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Electricity Bill Payment Receipt", pageWidth / 2, 15, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);

  // 🔹 Customer Details
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 153); // Dark Blue
  doc.text("Customer Details:", 20, 45);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Customer Name: ${this.paymentData.customerName ?? "N/A"}`, 20, 55);
  doc.text(`Email: ${this.paymentData.customerEmail ?? "N/A"}`, 20, 65);
  doc.text(`Meter Number: ${this.paymentData.meterNumber ?? "N/A"}`, 20, 75);
  doc.text(`Billing Address: ${this.paymentData.billingAddress ?? "N/A"}`, 20, 85);

  // 🔹 Invoice Details
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 153);
  doc.text("Invoice Details:", 20, 100);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice ID: ${this.paymentData.invoiceId ?? "N/A"}`, 20, 110);
  doc.text(`Unit Consumed: ${this.paymentData.unitConsumed ?? "0"} kWh`, 20, 120);
  doc.text(`Due Date: ${this.paymentData.dueDate ? new Date(this.paymentData.dueDate).toLocaleDateString() : "N/A"}`, 20, 130);
  doc.text(`Payment Date: ${this.paymentData.paymentDate ? new Date(this.paymentData.paymentDate).toLocaleDateString() : "N/A"}`, 20, 140);

  // 🔹 Payment Breakdown
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 153);
  doc.text("Payment Breakdown:", 20, 155);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Bill Amount: ₹${this.paymentData.totalBillAmount ?? "0.00"}`, 20, 165);
  doc.text(`Previous Due: ₹${this.paymentData.previousDue ?? "0.00"}`, 20, 175);
  doc.text(`Late Fee: ₹${this.paymentData.lateFee ?? "0.00"}`, 20, 185);
  doc.text(`Discount: ₹${this.paymentData.discountApplied ?? "0.00"}`, 20, 195);
  doc.text(`GST: ₹${this.paymentData.gst ?? "0.00"}`, 20, 205);
  doc.text(`Net Payable: ₹${this.paymentData.netPayable ?? "0.00"}`, 20, 215);
  doc.text(`Amount Paid: ₹${this.paymentData.amountPaid ?? "0.00"}`, 20, 225);
  doc.text(`Payment Method: ${this.paymentData.paymentMethod ?? "N/A"}`, 20, 235);
  doc.text(`Transaction ID: ${this.paymentData.transactionId ?? "N/A"}`, 20, 245);

  // 🔹 Generate QR Code
  const qrData = `Invoice ID: ${this.paymentData.invoiceId}\nCustomer: ${this.paymentData.customerName}\nMeter No: ${this.paymentData.meterNumber}\nAmount Paid: ₹${this.paymentData.amountPaid}`;
  
  QRCode.toDataURL(qrData, { width: 100 }, (err, qrUrl) => {
    if (!err) {
      doc.addImage(qrUrl, 'PNG', pageWidth - 50, 100, 40, 40);
      doc.text("Scan for Details", pageWidth - 50, 150);
    }

    // 🔹 Footer
    doc.setDrawColor(0);
    doc.setFillColor(0, 51, 153);
    doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("For any queries, contact: support@electricity.com", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

    // 🔹 Save PDF
    doc.save(`receipt_${this.paymentData.invoiceId ?? "unknown"}.pdf`);
  });
}

  // 🔹 Toastr Configuration
  private getToastrConfig() {
    return { timeOut: 3000, positionClass: 'toast-top-right' };
  }
}
