import { Component, OnInit, NgZone } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recent-payments',
  imports: [CommonModule],
  templateUrl: './recent-payments.component.html',
  styleUrls: ['./recent-payments.component.css']
})
export class RecentPaymentsComponent implements OnInit {
  payments: any[] = [];

  constructor(private dashboardService: DashboardService, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.loadPayments();  
  }
  

  loadPayments() {
    this.dashboardService.getLatestPayments().subscribe({
      next: (data) => {
        console.log("Payments fetched:", data);
        this.payments = data.map(payment => ({
          ...payment,
          paymentDate: new Date(payment.paymentDate) 
        }));
      },
      error: (error) => {
        console.error("Error fetching payments:", error);
      }
    });
  }
  
}
