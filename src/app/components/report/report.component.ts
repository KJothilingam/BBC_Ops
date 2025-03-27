import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  imports: [SidebarComponent, CommonModule]
})
export class ReportComponent implements AfterViewInit, OnDestroy {
  private weeklyChart!: Chart;
  weeklyPaymentsData = [1000, 2000, 2500, 3000, 3500, 4000, 4200, 4500, 4800];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    // Check if running in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.createChart();
    }
  }

  createChart() {
    // Ensure this code runs only in the browser
    if (isPlatformBrowser(this.platformId)) {
      const canvas = document.getElementById('weeklyChart') as HTMLCanvasElement;
      if (!canvas) {
        console.error("Canvas element not found!");
        return;
      }

      this.weeklyChart = new Chart(canvas.getContext('2d')!, {
        type: 'bar',
        data: {
          labels: ['17', '18', '19', '20', '21', '22', '23', '24', '25'],
          datasets: [{
            label: 'Payments',
            data: this.weeklyPaymentsData,
            backgroundColor: ['#4D6EF5', '#6EC6F0', '#4D6EF5', '#6EC6F0', '#4D6EF5', '#6EC6F0', '#4D6EF5', '#6EC6F0', '#4D6EF5'],
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "#555",
                font: { weight: 'bold' }
              }
            },
            x: {
              ticks: { color: "#555", font: { weight: 'bold' } }
            }
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.weeklyChart) {
      this.weeklyChart.destroy();
    }
  }

  paymentDetails = [
    { name: 'Mithlesh Kumar Singh', address: 'Kritipur, Kathmandu', date: '12.Jan.2021', amount: 2500 },
    { name: 'Suron Mahajan', address: 'Natole, Lalitpur', date: '21.Feb.2021', amount: 4000 }
  ];
  
  pendingPayments = [
    { name: 'Lily Bloom', scno: 9821, amount: 2000, image: 'assets/user1.png' },
    { name: 'Atlas Corrigan', scno: 7032, amount: 900, image: 'assets/user2.png' }
  ];
}
