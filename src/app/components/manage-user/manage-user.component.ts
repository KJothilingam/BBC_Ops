import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CustomerService } from '../../services/customer.service';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css']
})
export class ManageUserComponent implements OnInit {
  searchText: string = '';
  selectedFile: File | null = null;
  message: string = '';
  showBulkUpload: boolean = false;
  customers: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  @Input() customer: any = {};
  showModal: boolean = false;
  selectedCustomer: any = {};
  newCustomer: any = {};
  showUpdateForm: boolean = false;
  isUpdating: boolean = false; // Loader state

  constructor(private customerService: CustomerService, private toastr: ToastrService) {}

  ngOnInit() {
    this.fetchCustomers();
  }

  fetchCustomers() {
    this.customerService.fetchCustomers().subscribe({
      next: (data) => {
        this.customers = data;
      },
      error: (err) => console.error("Error fetching customers:", err)
    });
  }
  openUpdateModal(customer: any) {
    this.selectedCustomer = { ...customer }; // Clone customer data to prevent direct modification
}
openAddModal() {
  this.newCustomer = {};
}



  toggleBulkUpload() {
    this.showBulkUpload = !this.showBulkUpload;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
  
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (fileType !== 'csv') {
        this.toastr.error('Only CSV files are allowed!', 'Invalid File Type');
        this.selectedFile = null;
        event.target.value = ''; // Reset file input
        return;
      }
  
      this.selectedFile = file;
    }
  }
  

  // uploadFile() {
  //   if (!this.selectedFile) {
  //     this.toastr.error("Please select a CSV file.", "Error");
  //     return;
  //   }
  
  //   this.customerService.uploadCSV(this.selectedFile).subscribe({
  //     next: (response) => {
  //       if (response.validRecords > 0 && response.rejectedRecords > 0) {
  //         // ⚠️ Partial success: some records were rejected
  //         this.toastr.warning(
  //           `Partial Upload:
  //           ✅ Added: ${response.validRecords}
  //           ❌ Rejected: ${response.rejectedRecords}`,
  //           "Warning"
  //         );
  //       } else if (response.validRecords > 0) {
  //         // ✅ All records were successfully uploaded
  //         this.toastr.success("All records added successfully!", "Success");
  //       } else {
  //         // ❌ No records were added
  //         this.toastr.error("Failed to add all records.", "Error");
  //       }
  
  //       this.fetchCustomers(); // Refresh the customer list after upload
  //     },
  //     error: (err) => {
  //       console.error("Upload Error:", err);
  
  //       if (err.status === 400 && err.error) {
  //         const response = err.error;
  //         this.toastr.error(
  //           `Upload Failed:
  //           ❌ Rejected: ${response.rejectedRecords}
  //           Message: ${response.message}`,
  //           "Error"
  //         );
  //       } else {
  //         this.toastr.error("Failed to upload file. Please try again.", "Error");
  //       }
  //     }
  //   });
  // }

  uploadFile() {
    if (!this.selectedFile) {
      this.toastr.error("Please select a CSV file.", "Error");
      return;
    }
  
    this.customerService.uploadCSV(this.selectedFile).subscribe({
      next: (response) => {
        if (response.validRecords > 0 && response.rejectedRecords > 0) {
          // ⚠️ Partial success: some records were rejected
          this.toastr.warning(
            `Partial Upload:
            ✅ Added: ${response.validRecords}
            ❌ Rejected: ${response.rejectedRecords}`,
            "Warning"
          );
  
          if (response.errors && response.errors.length > 0) {
            this.generateExcel(response.errors);
          }
        } else if (response.validRecords > 0) {
          // ✅ All records were successfully uploaded
          this.toastr.success("All records added successfully!", "Success");
        } else {
          // ❌ No records were added
          this.toastr.error("Failed to add all records.", "Error");
        }
  
        this.fetchCustomers(); // Refresh the customer list after upload
      },
      error: (err) => {
        console.error("Upload Error:", err);
        this.toastr.error("Failed to upload file. Please try again.", "Error");
      }
    });
  }

  generateExcel(errors: string[]) {
    const worksheet = XLSX.utils.json_to_sheet(errors.map(error => ({ "Skipped Record": error })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SkippedRecords");
  
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
    saveAs(data, "Skipped_Records.xlsx");
  }
  
  
  get filteredCustomers() {
    return this.customers.filter(customer =>
      (customer.name && customer.name.toLowerCase().includes(this.searchText.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(this.searchText.toLowerCase())) ||
      (customer.phoneNumber && customer.phoneNumber.includes(this.searchText)) ||
      (customer.meterNumber && customer.meterNumber.includes(this.searchText)) || // 🔍 Search by Meter Number
      (customer.customerId && customer.customerId.toString().includes(this.searchText)) // 🔍 Search by Customer ID
    );
  }
  

  get paginatedCustomers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCustomers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  deleteCustomer(customer: any) {
    if (!customer || !customer.customerId) {
      this.toastr.error("Invalid customer data", "Error");
      return;
    }

    const confirmation = confirm(`Are you sure you want to delete ${customer.name} (ID: ${customer.customerId})?`);
    if (!confirmation) return;

    this.customerService.deleteCustomer(customer.customerId).subscribe({
      next: (response) => {
        if (response?.status) {
          this.toastr.success(`${customer.name} deleted successfully!`, "Success");
          this.customers = this.customers.filter(c => c.customerId !== customer.customerId);
        } else {
          this.toastr.error("Customer not found or already deleted.", "Error");
        }
      },
      error: (err) => {
        console.error("Error deleting customer:", err);
        this.toastr.error("Failed to delete customer. Please try again.", "Error");
      }
    });
  }

  addCustomer() {
    this.customerService.addCustomer(this.newCustomer).subscribe({
      next: (response) => {
        this.toastr.success('Customer added successfully!', 'Success');
        this.fetchCustomers(); // Refresh customer list
        this.newCustomer = {}; // Reset form
      },
      error: (err) => {
        this.toastr.error('Failed to add customer.', 'Error');
        console.error(err);
      }
    });
  }
  

  toggleUpdateForm(customer?: any) {
    if (customer) {
      this.selectedCustomer = { ...customer };
    } else {
      this.selectedCustomer = {};
    }
    this.showUpdateForm = !this.showUpdateForm;
    this.showBulkUpload = false;
  }

  updateCustomer() {
    if (!this.selectedCustomer || !this.selectedCustomer.customerId) {
      this.toastr.error('Invalid customer data. Please select a valid customer.', 'Update Failed');
      return;
    }
  
    this.isUpdating = true; // Show loader
  
    this.customerService.updateCustomer(this.selectedCustomer.customerId, this.selectedCustomer)
      .subscribe({
        next: (response) => {
          console.log("Update Response:", response); // Debugging log
  
          if (response && response.status) { // ✅ Handle success case
            this.toastr.success('Customer updated successfully!', 'Success');
  
            // Update local UI list
            const index = this.customers.findIndex(c => c.customerId === this.selectedCustomer.customerId);
            if (index !== -1 && response.customer) {
              this.customers[index] = { ...response.customer };
            }
  
            this.customers = [...this.customers]; // Force UI refresh
  
            // ✅ Close modal explicitly
            this.showUpdateForm = false;
            this.selectedCustomer = {};  
          } else {
            console.warn("Unexpected Response:", response);
            this.toastr.error(response?.message || 'Failed to update customer.', 'Error');
          }
        },
        error: (err) => {
          console.error("Update Error:", err);
          this.toastr.error('Something went wrong. Please try again.', 'Update Failed');
        }
      }).add(() => {
        this.isUpdating = false; // Hide loader in all cases
      });
  }
  
  
  
  get totalPages() {
    return Math.ceil(this.filteredCustomers.length / this.itemsPerPage);
  }
}
