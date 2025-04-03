import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BillDetailsDialogComponent } from '../bill-details-dialog/bill-details-dialog.component';
import { BillService } from '../../services/bill.service';
import jsPDF from 'jspdf';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-generate-bill',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './generate-bill.component.html',
  styleUrls: ['./generate-bill.component.css']
})
export class GenerateBillComponent {
  bill: any = {
    meterNumber: '',
    monthDate: '',
    dueDate: '',
    customer_id: '',
    unitConsumed: 0
  };
  filteredBills: any[] = [];
  selectedStatus: string = '';
  bills: any[] = [];

  constructor(
    private billService: BillService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  // updateDueDate() {
  //   if (this.bill.monthDate) {
  //     let selectedDate = new Date(this.bill.monthDate);
  //     selectedDate.setDate(selectedDate.getDate() + 10);
  //     this.bill.dueDate = selectedDate.toISOString().split('T')[0];
  //   }
  // }

  updateDueDate() {
    if (this.bill.monthDate) {
        let selectedDate: Date;

        // Check if monthDate is a timestamp (number) or a date string
        if (!isNaN(this.bill.monthDate)) {
            selectedDate = new Date(parseInt(this.bill.monthDate)); // Convert timestamp to Date
        } else {
            selectedDate = new Date(this.bill.monthDate); // Already in correct format
        }

        selectedDate.setDate(selectedDate.getDate() + 10); // Add 10 days for due date

        this.bill.dueDate = selectedDate.toISOString().split('T')[0]; // Convert to yyyy-MM-dd
    }
}

generateBill() {
  if (this.bill.monthDate) {
      this.bill.monthDate = new Date(this.bill.monthDate).getTime(); // ✅ Convert to timestamp
  }

  console.log("📤 Sending request payload:", this.bill);

  this.billService.generateBill(this.bill).subscribe(
      (response: any) => {
          console.log("📥 Response from backend:", response);
          if (response.success) {
              this.toastr.success('✅ Bill Generated Successfully!', 'Success');
              this.fetchBills();
              this.dialog.open(BillDetailsDialogComponent, { data: response.bill });
          } else {
              this.toastr.error(`⚠️ Failed: ${response.message}`, 'Error');
          }
      },
      (error) => {
          console.error("❌ Error from API:", error);
          if (error.status === 400) {
              this.toastr.warning('⚠️ Error: Bill already generated or invalid input.', 'Warning');
          } else {
              this.toastr.error(`⚠️ Error: ${error.error.message}`, 'Error');
          }
      }
  );
}


  openDatePicker(event: MouseEvent) {
    (event.target as HTMLInputElement).showPicker();
  }

  ngOnInit(): void {
    this.fetchBills();
    this.updateOverdueBills();
 }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'PAID':
        return 'status-paid';
      case 'OVERDUE':
        return 'status-overdue';
      default:
        return '';
    }
  }

  // fetchBills() {
  //   this.billService.getAllBills().subscribe(
  //     (data) => {
  //       this.bills = data.map(bill => ({
  //         ...bill,
  //         customer_id: bill.customer?.customerId || 'N/A',
  //         meterNumber: bill.customer?.meterNumber || 'N/A'
  //       }));
  
  //       this.filteredBills = [...this.bills];
  //     },
  //     (error) => {
  //       console.error('Error fetching bills:', error);
  //     }
  //   );
  // }
  
  
  fetchBills() {
    this.billService.getAllBills().subscribe(
      (data) => {
        this.bills = data.map(bill => ({
          ...bill,
          customer_id: bill.customer?.customerId || 'N/A',
          meterNumber: bill.customer?.meterNumber || 'N/A'
        }));
  
        // Sort bills in descending order based on createdAt date
        this.bills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
        this.filteredBills = [...this.bills];
      },
      (error) => {
        console.error('Error fetching bills:', error);
      }
    );
  }
  
  
  filterBills() {
    if (!this.selectedStatus) {
      this.filteredBills = [...this.bills];
    } else {
      this.filteredBills = this.bills.filter(bill => bill.paymentStatus === this.selectedStatus);
    }
  }
  generatePDFInvoice(bill: any) {
    if (!bill) {
        console.error("⚠️ Error: Invoice data is missing!");
        return;
    }

    console.log("📝 Generating PDF for:", bill);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // 🔹 **Company Logo & Header**
    const logoUrl = 'https://cdn-icons-png.flaticon.com/512/1827/1827504.png'; // Change this to your logo
    doc.setFillColor(0, 102, 204); // Dark Blue Header
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.addImage(logoUrl, 'PNG', 15, 5, 20, 20);
    doc.text("Electricity Bill Invoice", pageWidth / 2, 15, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 35;

    // 🔹 **Function to Draw a Table Row**
    function drawRow(label: string, value: string, rowY: number, isBold: boolean = false, r: number = 240, g: number = 240, b: number = 240) {
        const rowX = 20;
        const rowWidth = pageWidth - 40;
        const rowHeight = 10;
        const labelX = rowX + 5;
        const valueX = rowX + rowWidth / 2 + 5;

        doc.setFillColor(r, g, b);  // Background color
        doc.rect(rowX, rowY, rowWidth, rowHeight, 'F');
        doc.setDrawColor(180, 180, 180); // Border
        doc.rect(rowX, rowY, rowWidth, rowHeight);

        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.text(label, labelX, rowY + rowHeight / 2 + 2);
        doc.text(value, valueX, rowY + rowHeight / 2 + 2);
    }

    // 🔹 **Invoice Details Section**
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Invoice Details", 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 10;

    drawRow("Invoice ID", bill.invoiceId ?? "N/A", y, true, 220, 220, 250); // Light Blue
    y += 12;
    drawRow("Issue Date", new Date(bill.createdAt).toLocaleDateString() ?? "N/A", y, false, 250, 250, 250);
    y += 12;
    drawRow("Due Date", new Date(bill.dueDate).toLocaleDateString() ?? "N/A", y, false, 250, 250, 250);
    y += 12;

    // 🔹 **Payment Status with Background Highlight**
    let statusColor: number[] = [255, 193, 7]; // Default Yellow (PENDING)
    if (bill.paymentStatus === "PAID") {
        statusColor = [40, 167, 69]; // Green
    } else if (bill.paymentStatus === "OVERDUE") {
        statusColor = [220, 53, 69]; // Red
    }

    drawRow("Payment Status", bill.paymentStatus ?? "N/A", y, true, statusColor[0], statusColor[1], statusColor[2]);
    y += 20;

    // 🔹 **Customer Details Section**
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Customer Details", 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 10;

    drawRow("Customer Name", bill.customer.name ?? "N/A", y, true, 240, 248, 255); // Light Cyan
    y += 12;
    drawRow("Address", bill.customer.address ?? "N/A", y, false, 255, 250, 250);
    y += 12;
    drawRow("Phone", bill.customer.phoneNumber ?? "N/A", y, false, 255, 250, 250);
    y += 12;
    drawRow("Email", bill.customer.email ?? "N/A", y, false, 255, 250, 250);
    y += 20;

    // 🔹 **Billing Details Section**
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Billing Details", 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 10;

    drawRow("Units Consumed", `${bill.unitConsumed} kWh`, y, false, 224, 255, 255);
    y += 12;
    drawRow("Amount", `₹${bill.totalBillAmount}`, y, true, 255, 235, 205); // Light Yellow
    y += 20;

    // 🔹 **Footer**
    doc.setFillColor(0, 102, 204);
    doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Thank you for your payment!", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

    // ✅ **Save the PDF**
    doc.save(`Invoice_${bill.invoiceId}.pdf`);
}



  
  updateOverdueBills() {
    this.billService.updateOverdueBills().subscribe(
      (response) => {
        console.log(response);
        this.fetchBills();
      },
      (error) => {
        console.error('Error updating overdue bills:', error);
      }
    );
  }
}
