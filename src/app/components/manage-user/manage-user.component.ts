import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CustomerService } from '../../services/customer.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private customerService: CustomerService ,  private toastr: ToastrService) {}

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

  toggleBulkUpload() {
    this.showBulkUpload = !this.showBulkUpload;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.message = "Please select a CSV file.";
      return;
    }

    this.customerService.uploadCSV(this.selectedFile).subscribe({
      next: (response) => {
        this.message = response.message;
        this.fetchCustomers();
      },
      error: (err) => {
        this.message = err.message;
      }
    });
  }

  get filteredCustomers() {
    return this.customers.filter(customer =>
      customer.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      customer.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
      customer.phoneNumber.includes(this.searchText)
    );
  }

  get paginatedCustomers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCustomers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage() {
    if ((this.currentPage * this.itemsPerPage) < this.filteredCustomers.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  deleteCustomer(customer: any) {
    console.log("Deleting customer:", customer);  // Debugging log
  
    if (!customer || !customer.name || !customer.customerId) {
      console.error("Invalid customer data", customer);
      this.toastr.error("Invalid customer data", "Error");
      return;
    }
  
    const confirmation = confirm(`Are you sure you want to delete ${customer.name} (ID: ${customer.customerId})?`);
    if (confirmation) {
      this.customerService.deleteCustomer(customer.customerId).subscribe({
        next: (response) => {
          if (response.status) {
            this.toastr.success(`${customer.name} (ID: ${customer.customerId}) deleted successfully!`, "Success");
            this.customers = this.customers.filter(c => c.customerId !== customer.customerId);
          } else {
            this.toastr.error("Customer not found.", "Error");
          }
        },
        error: (err) => {
          console.error("Error deleting customer:", err);
          this.toastr.error("Failed to delete customer. Please try again.", "Error");
        }
      });
    }
  }
  
  

  addCustomer() {
    console.log("Add Customer Clicked");
  }

  editCustomer(customer: any) {
    console.log("Edit Customer", customer);
  }

  get totalPages() {
    return Math.ceil(this.filteredCustomers.length / this.itemsPerPage);
  }
  
}
