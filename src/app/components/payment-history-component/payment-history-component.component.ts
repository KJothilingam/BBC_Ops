import { CommonModule, formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-history-component',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './payment-history-component.component.html',
  styleUrls: ['./payment-history-component.component.css']
})
export class PaymentHistoryComponentComponent implements OnInit {
  
  payments: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8080/payment-records').subscribe(data => {
      this.payments = data.map(payment => ({
        ...payment,
        transactionId: payment.transactionId, // Ensure Transaction ID is used
        paymentDateFormatted: this.convertToDate(payment.paymentDate),
        dueDateFormatted: this.convertToDate(payment.dueDate)
      }));
  
      // Sort payments in descending order based on paymentDate
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
}
