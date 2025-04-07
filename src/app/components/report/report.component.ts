import { Component } from '@angular/core';
import { ReportRequest, ReportService } from '../../services/report.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {
  reportList: ReportRequest[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getAllReports().subscribe({
      next: (data) => this.reportList = data,
      error: (err) => console.error('Error fetching reports:', err)
    });
  }
  updateStatus(request: ReportRequest): void {
    this.reportService.updateReportStatus(request.requestId, request.status).subscribe({
      next: () => {
        console.log('Status updated successfully');
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert('Failed to update status');
      }
    });
  }
  
  
}
