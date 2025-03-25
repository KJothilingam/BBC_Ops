import { AfterViewInit, Component, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,  // ✅ Required for Standalone Components
  imports: [SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {

  @ViewChild('paymentGraph') paymentGraph!: ElementRef;
  @ViewChild('pieChart') pieChart!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {  // ✅ Ensure it runs only in the browser
      const { Chart } = await import('chart.js/auto');  // ✅ Lazy-load Chart.js

      this.createPaymentGraph(Chart);
      this.createPieChart(Chart);
    }
  }

  createPaymentGraph(Chart: any) {
    new Chart(this.paymentGraph.nativeElement, {
      type: 'line',
      data: {
        labels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
        datasets: [{
          label: 'Payments',
          data: [100000, 120000, 150000, 140000, 160000, 200000],
          borderColor: '#4318FF',
          borderWidth: 2,
          fill: false
        }]
      }
    });
  }

  createPieChart(Chart: any) {
    new Chart(this.pieChart.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Payments Done', 'Payments Pending'],
        datasets: [{
          data: [63, 25],
          backgroundColor: ['#4318FF', '#89CFF0']
        }]
      }
    });
  }
}
