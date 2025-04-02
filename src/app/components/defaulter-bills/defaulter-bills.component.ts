import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-defaulter-bills',
  imports:[CommonModule],
  standalone: true,
  templateUrl: './defaulter-bills.component.html',
  styleUrls: ['./defaulter-bills.component.css']
})
export class DefaulterBillsComponent implements OnInit {
  overdueBills: any[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadOverdueBills();
  }

  loadOverdueBills() {
    this.dashboardService.getOverdueBills().subscribe({
      next: (data) => {
        console.log("API Response:", data); // ✅ Debugging log
  
        // Check if 'data' contains the expected overdue bill array
        if (Array.isArray(data)) {
          this.overdueBills = data.map(bill => ({
            meterNumber: bill.customer?.meterNumber || 'N/A',
            dueDate: new Date(bill.dueDate).toISOString().split('T')[0],
            totalBillAmount: bill.totalBillAmount
          }));
        } else {
          console.error("🚨 Unexpected response format! Expected an array but got:", data);
        }
      },
      error: (err) => console.error("❌ Error fetching overdue bills:", err)
    });
  }
  
}
