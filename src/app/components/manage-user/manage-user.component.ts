import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css'] // ✅ Fixed
})
export class ManageUserComponent {
  searchText: string = '';

  customers = [
    {
      customerId: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '9876543210',
      address: 'Kathmandu, Nepal',
      unitConsumption: 150,
      billDueDate: new Date('2024-04-10')
    },
    {
      customerId: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phoneNumber: '9807654321',
      address: 'Lalitpur, Nepal',
      unitConsumption: 120,
      billDueDate: new Date('2024-05-15')
    }
  ];

  get filteredCustomers() {
    return this.customers.filter(customer =>
      customer.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      customer.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
      customer.phoneNumber.includes(this.searchText)
    );
  }

  addCustomer() {
    console.log("Add Customer Clicked");
  }

  editCustomer(customer: any) {
    console.log("Edit Customer", customer);
  }

  deleteCustomer(customerId: number) {
    this.customers = this.customers.filter(customer => customer.customerId !== customerId);
    console.log("Customer Deleted", customerId);
  }
}
