import { AfterViewInit, Component, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { PaymentHistoryComponentComponent } from "../payment-history-component/payment-history-component.component";
import { Chart } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { RecentPaymentsComponent } from "../recent-payments/recent-payments.component";
import { DefaulterBillsComponent } from "../defaulter-bills/defaulter-bills.component";
// import { DefaulterBillsComponent } from "../defaulter-bills/defaulter-bills.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,  // ✅ Required for Standalone Components
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
    if (isPlatformBrowser(this.platformId)) {  // ✅ Ensure it runs only in the browser
      // const { Chart } = await import('chart.js/auto');  // ✅ Lazy-load Chart.js
      // this.createPaymentGraph(Chart);
      // this.createPieChart(Chart);
      await import('chart.js/auto');
      this.createPieChart();
      this.createPaymentGraph();
      setTimeout(() => {
        this.createWeeklyChart();
      }, 500);
    }
  }

  // createPaymentGraph() {
  //   if (!this.paymentGraph || !this.paymentGraph.nativeElement) return;

  //   new Chart(this.paymentGraph.nativeElement, {
  //     type: 'line',
  //     data: {
  //       labels: this.months,
  //       datasets: [{
  //         label: 'Total Payments',
  //         data: this.monthlyPayments,
  //         borderColor: '#4318FF',
  //         borderWidth: 2,
  //         fill: false
  //       }]
  //     }
  //   });
  // }

  createPaymentGraph() {
    if (!this.paymentGraph || !this.paymentGraph.nativeElement) return;
  
    if (this.monthlyChartInstance) this.monthlyChartInstance.destroy(); // ✅ Destroy old chart
  
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
  
  // createPieChart() {
  //   if (!this.pieChart || !this.pieChart.nativeElement) return;

  //   new Chart(this.pieChart.nativeElement, {
  //     type: 'pie',
  //     data: {
  //       labels: ['Paid', 'Pending', 'Overdue'],
  //       datasets: [{
  //         data: [this.paymentSummary.paid, this.paymentSummary.pending, this.paymentSummary.overdue],
  //         backgroundColor: ['#4CAF50', '#FFEB3B', '#F44336']
  //       }]
  //     }
  //   });
  // }

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
  
  
  
  // createWeeklyChart() {
  //   if (!this.weeklyChartRef || !this.weeklyChartRef.nativeElement) return;
  
  //   if (this.weeklyChartInstance) this.weeklyChartInstance.destroy(); // ✅ Destroy old chart
  
  //   this.weeklyChartInstance = new Chart(this.weeklyChartRef.nativeElement.getContext('2d'), {
  //     type: 'bar',
  //     data: {
  //       labels: this.weekLabels,
  //       datasets: [{
  //         label: 'Total Payments per Week',
  //         data: this.weeklyPaymentsData,
  //         backgroundColor: ['#4D6EF5', '#6EC6F0'],
  //         borderRadius: 5
  //       }]
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       aspectRatio: 2,
  //       scales: {
  //         y: {
  //           beginAtZero: true,
  //           ticks: { color: "#555", font: { weight: 'bold' } }
  //         },
  //         x: {
  //           ticks: { color: "#555", font: { weight: 'bold' } }
  //         }
  //       }
  //     }
  //   });
  // }
  

  // paymentDetails = [
  //   { name: 'Mithlesh Kumar Singh', address: 'Kritipur, Kathmandu', date: '12.Jan.2021', amount: 2500 },
  //   { name: 'Suron Mahajan', address: 'Natole, Lalitpur', date: '21.Feb.2021', amount: 4000 }
  // ];
  
  // pendingPaymentss= [
  //   { name: 'Lily Bloom', scno: 9821, amount: 2000, image: 'assets/user1.png' },
  //   { name: 'Atlas Corrigan', scno: 7032, amount: 900, image: 'assets/user2.png' }
  // ];
  // private weeklyChart!: Chart;
  // weeklyPaymentsData = [1000, 2000, 2500, 3000, 3500, 4000, 4200, 4500, 4800];

  
  
    // createChart() {
    //   if (isPlatformBrowser(this.platformId)) {
    //     const canvas = document.getElementById('weeklyChart') as HTMLCanvasElement;
    //     if (!canvas) {
    //       console.error("Canvas element not found!");
    //       return;
    //     }
  
    //     this.weeklyChart = new Chart(canvas.getContext('2d')!, {
    //       type: 'bar',
    //       data: {
    //         labels: ['17', '18', '19', '20', '21', '22', '23', '24', '25'],
    //         datasets: [{
    //           label: 'Payments',
    //           data: this.weeklyPaymentsData,
    //           backgroundColor: ['#4D6EF5', '#6EC6F0', '#4D6EF5', '#6EC6F0', '#4D6EF5', '#6EC6F0', '#4D6EF5', '#6EC6F0', '#4D6EF5'],
    //           borderRadius: 5
    //         }]
    //       },
    //       options: {
    //         responsive: true,
    //         maintainAspectRatio: false,
    //         scales: {
    //           y: {
    //             beginAtZero: true,
    //             ticks: {
    //               color: "#555",
    //               font: { weight: 'bold' }
    //             }
    //           },
    //           x: {
    //             ticks: { color: "#555", font: { weight: 'bold' } }
    //           }
    //         }
    //       }
    //     });
    //   }
    // }

}
