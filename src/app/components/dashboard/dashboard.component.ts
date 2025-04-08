import { AfterViewInit, Component, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { Chart } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { RecentPaymentsComponent } from "../recent-payments/recent-payments.component";
import { DefaulterBillsComponent } from "../defaulter-bills/defaulter-bills.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,  
  imports: [SidebarComponent, CommonModule, RecentPaymentsComponent, DefaulterBillsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {

  //graph
  @ViewChild('paymentGraph') paymentGraph!: ElementRef;
  @ViewChild('pieChart') pieChart!: ElementRef;
  @ViewChild('weeklyChart') weeklyChartRef!: ElementRef;
  weeklyPaymentsData: number[] = [];
  weekLabels: string[] = [];
  paymentSummary = { pending: 0, paid: 0, overdue: 0 };
  months: string[] = [];
  monthlyPayments: number[] = [];

  private weeklyChartInstance!: Chart;
  private pieChartInstance!: Chart;
  private monthlyChartInstance!: Chart;
  // top
  totalCustomers: number = 0;
  totalPayments: number = 0;
  pendingPayments: number = 0;

  constructor(private dashboardService: DashboardService,@Inject(PLATFORM_ID) private platformId: any) {}
    ngOnInit(): void {
      this.dashboardService.getDashboardData().subscribe(data => {
        this.totalCustomers = data.totalCustomers;
        this.totalPayments = data.totalPayments;
        this.pendingPayments = data.pendingPayments;
      });
    
      this.dashboardService.getPaymentSummary().subscribe(summary => {
        this.paymentSummary = summary;
        setTimeout(() => this.createPieChart(), 500);
      });
    
      this.dashboardService.getMonthlyPayments().subscribe(data => {
        this.months = data.months;
        this.monthlyPayments = data.amounts;
        setTimeout(() => this.createPaymentGraph(), 500);
      });
    
      this.dashboardService.getWeeklyPayments().subscribe(data => {
        this.weekLabels = data.weeks.map((week: number) => `Week ${week}`);
        this.weeklyPaymentsData = data.amounts;
        setTimeout(() => this.createWeeklyChart(), 500);
      });
    }
  

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {  
      await import('chart.js/auto');
      this.createPieChart();
      this.createPaymentGraph();
      setTimeout(() => {
        this.createWeeklyChart();
      }, 500);
    }
  }

  createPaymentGraph() {
    if (!this.paymentGraph || !this.paymentGraph.nativeElement) return;
  
    if (this.monthlyChartInstance) this.monthlyChartInstance.destroy(); 
  
    this.monthlyChartInstance = new Chart(this.paymentGraph.nativeElement, {
      type: 'line',
      data: {
        labels: this.months,
        datasets: [{
          label: 'Total Payments',
          data: this.monthlyPayments,
          borderColor: '#4318FF',
          borderWidth: 2,
          fill: false
        }]
      }
    });
  }

  createPieChart() {
    if (!this.pieChart || !this.pieChart.nativeElement) return;
  
    if (this.pieChartInstance) this.pieChartInstance.destroy(); // ✅ Destroy old chart
  
    this.pieChartInstance = new Chart(this.pieChart.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Paid', 'Pending', 'Overdue'],
        datasets: [{
          data: [this.paymentSummary.paid, this.paymentSummary.pending, this.paymentSummary.overdue],
          backgroundColor: ['#4CAF50', '#FFEB3B', '#F44336']
        }]
      }
    });
  }
  createWeeklyChart() {
    if (!this.weeklyChartRef || !this.weeklyChartRef.nativeElement) {
      console.error("Weekly chart canvas not found!");
      return;
    }
  
    const ctx = this.weeklyChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error("Unable to get 2D context for Weekly chart");
      return;
    }
  
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.weekLabels,
        datasets: [{
          label: 'Total Payments per Week',
          data: this.weeklyPaymentsData,
          backgroundColor: [
            '#1F487E', // Dark Blue
            '#2D6A94',
            '#4C9FAD',
            '#2D6A94',
            '#B6E3E9'  // Lightest Blue
          ],
          borderRadius: 5,
          maxBarThickness: 60, // Adjust bar width
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { drawOnChartArea: false, color: "rgba(0, 0, 0, 0.1)" }, // Fixed issue here
            ticks: { color: "#555", font: { weight: 'bold' } }
          },
          x: {
            grid: { display: false }, // Hide x-axis grid lines
            ticks: { color: "#555", font: { weight: 'bold' } }
          }
        },
        plugins: {
          legend: { display: false } // Hide legend for cleaner look
        }
      }
    });
  }
  
  

}
