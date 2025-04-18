import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { BillService } from '../../services/bill.service';
import { PaymentRequest } from './../../Interfaces/payment.model';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import * as QRCode from 'qrcode';  
import jsPDF from 'jspdf';
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
  bills: any[] = []; 
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
    private cd: ChangeDetectorRef 
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

  //  Fetch unpaid bills
  fetchBills() {
    const meterNumber = this.paymentForm.get('meterNumber')?.value?.trim();

    console.log("Meter Number Entered:", meterNumber); 

    if (!meterNumber) {
      this.toastr.warning('Please enter a meter number.', 'Warning', this.getToastrConfig());
      return;
    }

    this.billService.getUnpaidBillsByMeter(meterNumber).subscribe({
      next: (data) => {
        console.log("Fetched Bills:", data); 

        if (!data || data.length === 0) { 
          this.bills = [];
          this.toastr.info('No pending bills.', 'Info', this.getToastrConfig());
          return;
        }

        this.bills = data; 
      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastr.error('Failed to fetch bills. Try again later.', 'Error', this.getToastrConfig());
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

      this.cd.detectChanges(); 
    }
  }


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
        if (response.success) {
          //  Only update the UI and generate the PDF if the payment was successful
          this.paymentData = {
            ...response,
            customerName: this.paymentData.customerName ?? 'N/A',
            customerEmail: this.paymentData.customerEmail ?? 'N/A'
          };
  
          this.toastr.success('Payment Successful!', 'Success', this.getToastrConfig());
          const logMessage = `Payment Successful!: Amount: ${response.amountPaid} ,Bill ID: ${paymentData.billId}`;
          this.authService.logAction(logMessage);
          this.generatePDFReceipt(); //  Generate PDF only if success
          this.resetForm();
        } else {
          //  Handle failed payment properly
          this.toastr.error(response.message || 'Payment Failed! Try again.', 'Error', this.getToastrConfig());
          this.isProcessing = false;
          this.paymentForm.enable();
        }
      },
      error: () => {
        this.toastr.error('Payment Failed! Try again.', 'Error', this.getToastrConfig());
        this.isProcessing = false;
        this.paymentForm.enable();
      }
    });
  }
  
  

  //  Reset form after payment
  private resetForm() {
    this.isProcessing = false;
    this.paymentForm.reset();
    this.paymentForm.enable();
    this.bills = [];
  }

  //  Generate PDF Receipt
  generatePDFReceipt() {
    if (!this.paymentData || Object.keys(this.paymentData).length === 0) {
      console.error("Payment data is missing!");
      return;
    }
  
    console.log("Generating PDF with Data:", this.paymentData);
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;
  
    // Header with Company Logo & Title
    const logoUrl = 'https://cdn-icons-png.flaticon.com/512/1827/1827504.png';
    doc.setFillColor(0, 51, 153);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.addImage(logoUrl, 'PNG', 15, 5, 20, 20);
    doc.text("Electricity Bill Payment Receipt", pageWidth / 2, y, { align: "center" });
  
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 35;
  
    //  Row Function
    function drawRow(label: string, value: string, rowY: number, isBold: boolean = false, highlight: boolean = false) {
      const rowX = 20;
      const rowWidth = pageWidth - 40;
      const rowHeight = 10;
      const labelX = rowX + 5;
      const valueX = rowX + rowWidth / 2 + 5;
  
      if (highlight) {
        doc.setFillColor(255, 223, 186);
      } else {
        doc.setFillColor(240, 240, 240);
      }
  
      doc.rect(rowX, rowY, rowWidth, rowHeight, 'F');
      doc.setDrawColor(180, 180, 180);
      doc.rect(rowX, rowY, rowWidth, rowHeight);
  
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.text(label, labelX, rowY + rowHeight / 2 + 2);
      doc.text(value, valueX, rowY + rowHeight / 2 + 2);
    }
  
    //  Customer Details
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 153);
    doc.text("Customer Details", 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 10;
  
    drawRow("Customer Name", this.paymentData.customerName ?? "N/A", y, true);
    y += 12;
    drawRow("Email", this.paymentData.customerEmail ?? "N/A", y);
    y += 12;
    drawRow("Meter Number", this.paymentData.meterNumber ?? "N/A", y);
    y += 20;
  
    //  Invoice & Payment Details
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 153);
    doc.text("Invoice & Payment Details", 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 10;
  
    drawRow("Invoice ID", this.paymentData.invoiceId ?? "N/A", y);
    y += 12;
    drawRow("Unit Consumed", `${this.paymentData.unitConsumed ?? "0"} kWh`, y);
    y += 12;
    drawRow("Due Date", this.paymentData.dueDate ? new Date(this.paymentData.dueDate).toLocaleDateString() : "N/A", y);
    y += 12;
    drawRow("Payment Date", this.paymentData.paymentDate ? new Date(this.paymentData.paymentDate).toLocaleDateString() : "N/A", y);
    y += 12;
    drawRow("Total Bill Amount", `Rs.${this.paymentData.totalBillAmount ?? "0.00"}`, y, true);
    y += 12;
  
    //  Calculate Discounts
    let earlyPaymentDiscount = 0;
    let onlinePaymentDiscount = 0;
    const totalAmount = this.paymentData.totalBillAmount ?? 0;
  
    if (this.paymentData.dueDate && this.paymentData.paymentDate) {
      const dueDate = new Date(this.paymentData.dueDate);
      const paymentDate = new Date(this.paymentData.paymentDate);
      const isEarly = paymentDate < dueDate;
  
      if (isEarly) {
        earlyPaymentDiscount = totalAmount * 0.05;
  
        if (this.paymentData.paymentMethod && this.paymentData.paymentMethod.toUpperCase() !== "CASH") {
          onlinePaymentDiscount = totalAmount * 0.05;
        }
      }
    }
  
    const totalDiscount = earlyPaymentDiscount + onlinePaymentDiscount;
    const finalAmountPaid = totalAmount - totalDiscount;
  
    // Show Discounts
    drawRow("Early Payment Discount (5%)", `Rs.${earlyPaymentDiscount.toFixed(2)}`, y);
    y += 12;
  
    if (onlinePaymentDiscount > 0) {
      drawRow("Online Payment Bonus (5%)", `Rs.${onlinePaymentDiscount.toFixed(2)}`, y);
      y += 12;
    }
  
    // Final Amount Paid
    y += 5;
    drawRow("Final Amount Paid", `Rs.${finalAmountPaid.toFixed(2)}`, y, true, true);
    y += 20;
  
    // Payment Method & Transaction
    drawRow("Payment Method", this.paymentData.paymentMethod ?? "N/A", y);
    y += 12;
    drawRow("Transaction ID", this.paymentData.transactionId ?? "N/A", y);
    y += 12;
  
    // Generate QR Code
    const qrData = `Invoice ID: ${this.paymentData.invoiceId}\nCustomer: ${this.paymentData.customerName}\nMeter No: ${this.paymentData.meterNumber}\nAmount Paid: -Rs.${finalAmountPaid.toFixed(2)}`;
    QRCode.toDataURL(qrData, { width: 100 }, (err, qrUrl) => {
      if (!err) {
        doc.addImage(qrUrl, 'PNG', pageWidth - 60, y, 40, 40);
        doc.text("Scan for Details", pageWidth - 60, y + 45);
      }
  
      // Footer
      doc.setFillColor(0, 51, 153);
      doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("For any queries, contact: support@electricity.com", pageWidth / 2, doc.internal.pageSize.getHeight() - 12, { align: "center" });
      doc.text("Thank you for your payment!", pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: "center" });
  
      // Save PDF
      doc.save(`receipt_${this.paymentData.invoiceId ?? "unknown"}.pdf`);
    });
  }
  
  



  
  



  // 🔹 Toastr Configuration
  private getToastrConfig() {
    return { timeOut: 3000, positionClass: 'toast-top-right' };
  }
}
