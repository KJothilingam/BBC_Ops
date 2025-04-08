import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  imports: [FormsModule,CommonModule, SidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  employee: any;
  editedEmployee: any = {};
  showModal: boolean = false;

  constructor(private toastr: ToastrService,private authService: AuthService) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.authService.getEmployeeDetails(userId).subscribe(
        (data) => {
          this.employee = data;
        },
        (error) => {
          console.error('Error fetching employee details:', error);
        }
      );
    }
  }

  openEditModal() {
    this.showModal = true;
    this.editedEmployee = { ...this.employee }; 
  }

  closeEditModal() {
    this.showModal = false;
  }

  updateEmployee() {
    console.log('Updating Employee:', this.editedEmployee);

    this.authService.updateEmployeeDetails(this.editedEmployee).subscribe(
      (response) => {
        console.log('Updated successfully:', response);
        this.employee = { ...this.editedEmployee };
        this.showModal = false;

        // Show toast instead of alert
        this.toastr.success('Profile updated successfully!', 'Success');
      },
      (error) => {
        console.error('Error updating profile:', error);
        this.toastr.error('Failed to update profile. Please try again.', 'Error');
      }
    );
  }
  
}
