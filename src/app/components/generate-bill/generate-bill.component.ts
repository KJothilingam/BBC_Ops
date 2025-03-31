import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BillDetailsDialogComponent } from '../bill-details-dialog/bill-details-dialog.component';
import { BillService } from '../../services/bill.service';

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
    console.log("📤 Sending request payload:", this.bill);

    this.billService.generateBill(this.bill).subscribe(
      (response: any) => {
        console.log("📥 Response from backend:", response);

        if (response.success) {
          this.toastr.success('✅ Bill Generated Successfully!', 'Success');
          this.fetchBills();

          // 🔥 Ensure unitConsumed is passed correctly
          const billData = {
            ...response.bill,
            unitConsumed: response.bill.unitConsumed || 0 // Ensure correct data
          };
          
          this.dialog.open(BillDetailsDialogComponent, { data: billData });
        } else {
          this.toastr.error(`⚠️ Failed: ${response.message}`, 'Error');
        }
      },
      error => {
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

  fetchBills() {
    this.billService.getAllBills().subscribe(
      (data) => {
        this.bills = data.map(bill => ({
          ...bill,
          customer_id: bill.customer?.customerId || 'N/A',
          meterNumber: bill.customer?.meterNumber || 'N/A'
        }));
  
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
