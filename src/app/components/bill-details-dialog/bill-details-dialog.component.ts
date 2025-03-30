import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bill-details-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bill-details-dialog.component.html',
  styleUrls: ['./bill-details-dialog.component.css']
})
export class BillDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BillDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public bill: any
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
