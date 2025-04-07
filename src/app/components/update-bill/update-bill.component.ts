import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillService } from '../../services/bill.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-bill',
  templateUrl: './update-bill.component.html',
  styleUrls: ['./update-bill.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule,CommonModule]
})
export class UpdateBillComponent implements OnInit {
  billForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private billService: BillService,
    private dialogRef: MatDialogRef<UpdateBillComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.billForm = this.fb.group({
      billId: [{ value: '', disabled: true }],
      customerId: ['', Validators.required],
      invoiceId: ['', Validators.required],
      monthDate: ['', Validators.required],
      paymentStatus: ['', Validators.required],
      totalBillAmount: ['', Validators.required],
      discountApplied: [''],
      createdAt: [''],
      dueDate: ['', Validators.required],
      unitConsumed: ['', Validators.required],
      meterNumber: [''] // ✅ Add this
    });
    

    this.loadBillData();
  }


  onSubmit() {
    if (this.billForm.valid) {
      const updatedBill = {
        ...this.billForm.getRawValue(),
        billId: this.data.billId
      };
      this.billService.updateBill(updatedBill).subscribe(response => {
        console.log('Updated successfully:', response);
        this.dialogRef.close('updated');
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
  formatDate(dateValue: string | number): string {
    const date = new Date(dateValue); // Works with both string and number
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  loadBillData() {
    this.billService.getBillById(this.data.billId).subscribe(data => {
      const formattedData = {
        billId: data.billId,
        customerId: data.customer.customerId,
        invoiceId: data.invoiceId,
        monthDate: this.formatDate(data.monthDate),
        paymentStatus: data.paymentStatus,
        totalBillAmount: data.totalBillAmount,
        discountApplied: data.discountApplied,
        createdAt: this.formatDate(data.createdAt),
        dueDate: this.formatDate(data.dueDate),
        unitConsumed: data.unitConsumed,
        meterNumber: data.customer.meterNumber
      };
  
      this.billForm.patchValue(formattedData);
    });
  }
  
  
  
  
}
