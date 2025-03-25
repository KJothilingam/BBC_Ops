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

  users = [
    { uid: 112, name: 'Mithlesh Kumar Singh', address: 'Kritipur, Kathmandu', scno: '12358G', amount: '987569326' },
    { uid: 113, name: 'Suron Maharjan', address: 'Natole, Lalitpur', scno: '86523B', amount: '987569326' },
    { uid: 114, name: 'Sandesh Bajracharya', address: 'Bhinchhebahal, Lalitpur', scno: '78365D', amount: '987569326' }
  ];

  get filteredUsers() {
    return this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      user.address.toLowerCase().includes(this.searchText.toLowerCase()) ||
      user.scno.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  addUser() {
    console.log("Add User Clicked");
  }

  editUser(user: any) {
    console.log("Edit User", user);
  }

  deleteUser(uid: number) {
    this.users = this.users.filter(user => user.uid !== uid);
    console.log("User Deleted", uid);
  }
}
