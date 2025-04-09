import { CommonModule, formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import { PaymentHistoryService } from '../../services/payment-history.service';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-payment-history-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history-component.component.html',
  styleUrls: ['./payment-history-component.component.css']
})
export class PaymentHistoryComponentComponent implements OnInit {
  payments: any[] = [];

  constructor(private http: HttpClient, private paymentService: PaymentHistoryService) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8080/payment-records').subscribe(data => {
      this.payments = data.map(payment => ({
        ...payment,
        transactionId: payment.transactionId, 
        paymentDateFormatted: this.convertToDate(payment.paymentDate),
        dueDateFormatted: this.convertToDate(payment.dueDate)
      }));
  
      this.payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    });
  }

  private convertToDate(dateValue: any): string {
    if (!dateValue) return 'N/A'; 

    let dateObj;
    if (typeof dateValue === 'number') {
      dateObj = new Date(dateValue);
    } else if (typeof dateValue === 'string') {
      dateObj = new Date(dateValue.replace(' ', 'T'));
    } else {
      return 'Invalid Date';
    }

    return formatDate(dateObj, 'dd.MMM.yyyy', 'en-US');
  }

  // Fetch the payment details and generate the PDF
  generatePDF(transactionId: string) {
    this.paymentService.getPaymentDetails(transactionId).subscribe(payment => {
      this.createPDF(payment);
    });
  }

  // Function to generate PDF
  private createPDF(payment: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // **Company Logo & Header**
    const logoUrl = 'https://cdn-icons-png.flaticon.com/512/1827/1827504.png';  
    doc.setFillColor(0, 102, 204);  
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.addImage(logoUrl, 'PNG', 15, 5, 20, 20);
    doc.text("Payment Invoice", pageWidth / 2, 15, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 35;

    // Function to Draw Table Row
    const drawRow = (label: string, value: string, rowY: number, isBold: boolean = false, r: number = 240, g: number = 240, b: number = 240) => {
      const rowX = 20;
      const rowWidth = pageWidth - 40;
      const rowHeight = 10;
      const labelX = rowX + 5;
      const valueX = rowX + rowWidth / 2 + 5;

      doc.setFillColor(r, g, b);  
      doc.rect(rowX, rowY, rowWidth, rowHeight, 'F');
      doc.setDrawColor(180, 180, 180);  
      doc.rect(rowX, rowY, rowWidth, rowHeight);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.text(label, labelX, rowY + rowHeight / 2 + 2);
      doc.text(value, valueX, rowY + rowHeight / 2 + 2);
    };

    // Invoice Details Section
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Invoice Details", 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    y += 10;

    drawRow("Transaction ID", payment.transactionId ?? "N/A", y, true, 220, 220, 250);  
    y += 12;
    drawRow("Meter Number", payment.meterNumber ?? "N/A", y, false, 250, 250, 250);
    y += 12;
    drawRow("Unit Consumed", `${payment.unitConsumed} kWh`, y, false, 250, 250, 250);
    y += 12;
    drawRow("Billing Month", payment.billingMonth ?? "N/A", y, false, 250, 250, 250);
    y += 12;
    // drawRow("Due Date", payment.duedate ?? "N/A", y, false, 250, 250, 250);
    drawRow("Due Date", this.convertToDate(payment.dueDate), y, false, 250, 250, 250);


    y += 12;

    // Billing Details Section
  drawRow("Total Bill Amount", `Rs. ${payment.totalBillAmount}`, y, true, 255, 235, 205);  
  y += 12;
  drawRow("Discount Applied", `Rs. ${payment.discountApplied}`, y, false, 240, 248, 255);  
  y += 12;
  drawRow("Final Amount Paid", `Rs. ${payment.finalAmountPaid}`, y, false, 255, 250, 250);
  y += 12;

    

    // Footer
    doc.setFillColor(0, 102, 204);
    doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Thank you for your payment!", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

    // Save the PDF
    doc.save(`Invoice_${payment.transactionId}.pdf`);
  }


  generateAllPDFs() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Smaller title font
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('All Payment Records', pageWidth / 2, 12, { align: 'center' });
  
    const headers = [
      ['Transaction ID', 'Meter Number', 'Unit Consumed', 'Billing Month', 'Due Date',
       'Total Amount', 'Discount', 'Final Amount', 'Method', 'Date']
    ];
  
    const data = this.payments.map((p: any) => [
      p.transactionId,
      p.meterNumber,
      p.unitConsumed,
      p.billingMonth,
      this.convertToDate(p.dueDate),
      `Rs.${parseFloat(p.totalBillAmount).toFixed(2)}`,
      `Rs.${parseFloat(p.discountApplied).toFixed(2)}`,
      `Rs.${parseFloat(p.finalAmountPaid).toFixed(2)}`,
      p.paymentMethod,
      this.convertToDate(p.paymentDate)
    ]);
  
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 18,
      theme: 'striped',
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
        fontSize: 7
      },
      bodyStyles: {
        textColor: 50,
        fontSize: 6
      },
      styles: {
        fontSize: 6,
        cellPadding: 1,
        halign: 'center',
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' },
        7: { cellWidth: 'auto' },
        8: { cellWidth: 'auto' },
        9: { cellWidth: 'auto' },
      },
      margin: { top: 15 }
    });
  
    doc.save('All_Payments.pdf');
  }
  
  
  
}
