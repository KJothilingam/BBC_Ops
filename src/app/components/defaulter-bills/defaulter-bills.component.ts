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
  displayedBills: any[] = []; 
  currentIndex: number = 0; 
  pageSize: number = 3; 

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
          this.updateDisplayedBills(); 
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
