import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr'; // ✅ Import ToastrService
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
    customer_id:'',
    unitConsumed: 0
  };
  filteredBills: any[] = [];
  selectedStatus: string = '';
  bills: any[] = [];

  constructor(
    private billService: BillService,
    private toastr: ToastrService, // ✅ Use Toastr instead of MatSnackBar
    private dialog: MatDialog
  ) {}

  /** Automatically calculates due date when monthDate is selected */
  updateDueDate() {
    if (this.bill.monthDate) {
      let selectedDate = new Date(this.bill.monthDate);
      selectedDate.setDate(selectedDate.getDate() + 10); // Add 10 days
      this.bill.dueDate = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
  }

  generateBill() {
    this.billService.generateBill(this.bill).subscribe(
      (response: any) => {
        if (response.success) {
          // ✅ Show success message in Toastr
          this.toastr.success('✅ Bill Generated Successfully!', 'Success');
          this.fetchBills();
          // ✅ Open the dialog with bill details
          this.dialog.open(BillDetailsDialogComponent, {
            data: response.bill
          });
        } else {
          // ❌ Show error if bill generation failed
          this.toastr.error(`⚠️ Failed: ${response.message}`, 'Error');
        }
      },
      error => {
        // ❌ Handle 400 Bad Request - Bill already generated or invalid data
        if (error.status === 400) {
          this.toastr.warning('⚠️ Error: Bill already generated or invalid input.', 'Warning');
        } else {
          this.toastr.error(`⚠️ Error: ${error.error.message}`, 'Error');
        }
      }
    );
  }

  openDatePicker(event: MouseEvent) {
    (event.target as HTMLInputElement).showPicker(); // Opens the date picker
  }

  ngOnInit(): void {
    this.fetchBills();
<<<<<<< HEAD
    // this.updateOverdueBills();
=======
    // this.updateOverdueBills();
>>>>>>> cd9b82cbdfb029c14712ead41d9395346d935f7b
  }
  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';  // Yellow
      case 'PAID':
        return 'status-paid';  // Green
      case 'OVERDUE':
        return 'status-overdue';  // Red
      default:
        return '';
    }
  }
  fetchBills() {
    this.billService.getAllBills().subscribe(
      (data) => {
        // console.log("API Response:", data); 
  
        this.bills = data.map(bill => ({
          ...bill,
          customer_id: bill.customer?.customerId || 'N/A',
          meterNumber: bill.customer?.meterNumber || 'N/A' // ✅ Correct mapping
        }));
  
        // console.log("Processed Data:", this.bills); 
        this.filteredBills = [...this.bills];
      },
      (error) => {
        console.error('Error fetching bills:', error);
      }
    );
  }
  
  
  filterBills() {
    if (!this.selectedStatus) {
      this.filteredBills = [...this.bills]; // ✅ Ensure all records are shown when no filter is selected
    } else {
      this.filteredBills = this.bills.filter(bill => bill.paymentStatus === this.selectedStatus);
    }
  }
  
   /** ✅ Call backend to update overdue bills on startup */
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
