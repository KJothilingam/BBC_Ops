import { Component } from '@angular/core';
import { ReportRequest, ReportService } from '../../services/report.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {
  reportList: ReportRequest[] = [];

  constructor(private authService: AuthService,private reportService: ReportService) {}

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
    this.reportService.updateReportStatus(request.requestId, request.status).subscribe({
      next: () => {
        console.log('Status updated successfully');
        const logMessage = `Status updated : Request ID: ${request.requestId} ,Request Status: ${request.status}`;
        this.authService.logAction(logMessage);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert('Failed to update status');
      }
    });
  }
  
  
}
