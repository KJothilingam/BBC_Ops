import { Component } from '@angular/core';
import { ReportRequest, ReportService } from '../../services/report.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';
import { ToastrService } from 'ngx-toastr';
import { AuditService } from '../../services/audit.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {
  reportList: ReportRequest[] = [];

  constructor(private auditService: AuditService,private toastr: ToastrService ,private authService: AuthService,private reportService: ReportService,private customerService: CustomerService) {}

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
  
  downloadPDF() {
    this.auditService.getAuditLogs().subscribe((logs: any[]) => {
      logs.sort((a, b) => b.id - a.id);
  
      const doc = new jsPDF();
  
      doc.setFontSize(18);
      doc.text('Employee Audit Logs', 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
      const columns = ['Employee ID', 'Name', 'Designation', 'Action', 'Timestamp']; // Removed 'ID'
      const rows = logs.map(log => [
        log.employeeId ?? 'N/A',
        log.name,
        log.designation,
        log.actionMessage,
        new Date(log.timestamp).toLocaleString()
      ]);
  
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 40,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          halign: 'center'
        },
        didDrawPage: (data) => {
          const pageHeight = doc.internal.pageSize.height;
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Page ${doc.getNumberOfPages()}`, data.settings.margin.left, pageHeight - 10);
        }
      });
  
      doc.save('Employee_Audit_Logs.pdf');
    });
  }
  
  
  
  
  
}
