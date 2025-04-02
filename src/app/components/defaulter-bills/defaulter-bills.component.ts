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
  overdueBills: any[] = []; // Stores all bills
  displayedBills: any[] = []; // Stores currently displayed 3 bills
  currentIndex: number = 0; // Tracks current pagination index
  pageSize: number = 3; // Number of records per page

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadOverdueBills();
  }

  loadOverdueBills() {
    this.dashboardService.getOverdueBills().subscribe({
      next: (data) => {
        console.log("API Response:", data);
        if (Array.isArray(data)) {
          this.overdueBills = data.map(bill => ({
            meterNumber: bill.customer?.meterNumber || 'N/A',
            dueDate: new Date(bill.dueDate).toISOString().split('T')[0],
            totalBillAmount: bill.totalBillAmount
          }));
          this.updateDisplayedBills(); // Load initial 3 records
        } else {
          console.error("🚨 Unexpected response format:", data);
        }
      },
      error: (err) => console.error("❌ Error fetching overdue bills:", err)
    });
  }

  updateDisplayedBills() {
    this.displayedBills = this.overdueBills.slice(this.currentIndex, this.currentIndex + this.pageSize);
  }

  nextRecords() {
    if (this.currentIndex + this.pageSize < this.overdueBills.length) {
      this.currentIndex += this.pageSize;
      this.updateDisplayedBills();
    }
  }

  previousRecords() {
    if (this.currentIndex - this.pageSize >= 0) {
      this.currentIndex -= this.pageSize;
      this.updateDisplayedBills();
    }
  }
}
