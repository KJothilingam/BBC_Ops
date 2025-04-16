import { Component } from '@angular/core';
import { ReportRequest, ReportService } from '../../services/report.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {
  reportList: ReportRequest[] = [];

  constructor(private toastr: ToastrService ,private authService: AuthService,private reportService: ReportService,private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getAllReports().subscribe({
      next: (data) => {
        this.reportList = data.sort((a, b) => b.requestId - a.requestId);
      },
      error: (err) => console.error('Error fetching reports:', err)
    });
  }
  
  // updateStatus(request: ReportRequest): void {
  //   this.reportService.updateReportStatus(request.requestId, request.status).subscribe({
  //     next: () => {
  //       console.log('Status updated successfully');
  //       const logMessage = `Status updated : Request ID: ${request.requestId} ,Request Status: ${request.status}`;
  //       this.authService.logAction(logMessage);
  //     },
  //     error: (err) => {
  //       console.error('Error updating status:', err);
  //       alert('Failed to update status');
  //     }
  //   });
  // }

  updateStatus(request: ReportRequest): void {
    if (request.status !== 'COMPLETED') {
      // Allow changing to any status other than COMPLETED
      this.updateStatusInBackend(request);
      return;
    }
  
    const requestType = request.requestType;
  
    if (['NAME_CHANGE', 'EMAIL_CHANGE', 'PHONE_CHANGE', 'ADDRESS_CHANGE'].includes(requestType)) {
      this.customerService.getCustomerById(request.customerId.toString()).subscribe({
        next: (customerData) => {
          let isUpdated = false;
          let backendValue = '';
          const newValueTrimmed = request.newValue?.trim().toLowerCase();
  
          switch (requestType) {
            case 'NAME_CHANGE':
              backendValue = customerData.name?.trim().toLowerCase();
              isUpdated = backendValue === newValueTrimmed;
              break;
            case 'EMAIL_CHANGE':
              backendValue = customerData.email?.trim().toLowerCase();
              isUpdated = backendValue === newValueTrimmed;
              break;
            case 'PHONE_CHANGE':
              backendValue = customerData.phoneNumber?.toString().trim();
              isUpdated = backendValue === request.newValue?.trim(); // phone can stay case-sensitive
              break;
            case 'ADDRESS_CHANGE':
              backendValue = customerData.address?.trim().toLowerCase();
              isUpdated = backendValue === newValueTrimmed;
              break;
          }
  
          console.log(`Comparison for ${requestType}: Backend -> "${backendValue}", New -> "${request.newValue}"`);
  
          if (isUpdated) {
            this.updateStatusInBackend(request);
          } else {
            this.toastr.warning(
              `Verification failed! The new ${requestType.replace('_CHANGE', '').toLowerCase()} is not yet updated in the customer record.`
            );
            request.status = 'IN_PROCESS'; // revert selection
          }
        },
        error: (err) => {
          console.error('Error verifying customer data:', err);
          this.toastr.error('Failed to verify customer information.');
          request.status = 'IN_PROCESS';
        }
      });
    } else {
      // No verification needed
      this.updateStatusInBackend(request);
    }
  }
  
  
  
  
  private updateStatusInBackend(request: ReportRequest): void {
    this.reportService.updateReportStatus(request.requestId, request.status).subscribe({
      next: () => {
        console.log('Status updated successfully');
        const logMessage = `Status updated : Request ID: ${request.requestId} ,Request Status: ${request.status}`;
        this.authService.logAction(logMessage);
        this.toastr.success('Status updated successfully');
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.toastr.error('Failed to update status');
      }
    });
  }
  
  
  
}
