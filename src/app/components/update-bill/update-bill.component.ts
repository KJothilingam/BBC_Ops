import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BillService } from '../../services/bill.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-update-bill',
  templateUrl: './update-bill.component.html',
  styleUrls: ['./update-bill.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule]
})
export class UpdateBillComponent implements OnInit {
  billForm!: FormGroup;
  readonly PER_UNIT_RATE = 41.50;
  originalBillData: any;

  constructor(
    private fb: FormBuilder,
    private billService: BillService,
    private dialogRef: MatDialogRef<UpdateBillComponent>,
    private authService: AuthService,
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
      finalAmount: [''],
      createdAt: [''],
      dueDate: ['', Validators.required],
      unitConsumed: ['', Validators.required],
      meterNumber: ['']
    });

    this.loadBillData();

    this.billForm.get('unitConsumed')?.valueChanges.subscribe((units: number) => {
      if (units != null && !isNaN(units)) {
        const total = units * this.PER_UNIT_RATE;
        this.billForm.get('totalBillAmount')?.setValue(total.toFixed(2), { emitEvent: false });
        this.updateFinalAmount();
      }
    });

    this.billForm.get('discountApplied')?.valueChanges.subscribe(() => {
      this.updateFinalAmount();
    });
  }

  updateFinalAmount() {
    const total = parseFloat(this.billForm.get('totalBillAmount')?.value || '0');
    const discount = parseFloat(this.billForm.get('discountApplied')?.value || '0');
    const final = total - discount;
    this.billForm.get('finalAmount')?.setValue(final.toFixed(2), { emitEvent: false });
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
        const logMessage = `Updated Bill  - Bill ID: ${updatedBill?.billId}`;
        this.authService.logAction(logMessage);
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  resetForm() {
    this.billForm.patchValue(this.originalBillData);
  }

  formatDate(dateValue: string | number): string {
    const date = new Date(dateValue);
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
        totalBillAmount: (data.unitConsumed * this.PER_UNIT_RATE).toFixed(2),
        discountApplied: data.discountApplied,
        finalAmount: ((data.unitConsumed * this.PER_UNIT_RATE) - (data.discountApplied || 0)).toFixed(2),
        createdAt: this.formatDate(data.createdAt),
        dueDate: this.formatDate(data.dueDate),
        unitConsumed: data.unitConsumed,
        meterNumber: data.customer.meterNumber
      };

      this.originalBillData = { ...formattedData };
      this.billForm.patchValue(formattedData);
    });
  }
}
