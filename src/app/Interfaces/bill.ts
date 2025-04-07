// bill.ts
export interface Customer {
    customerId: number;
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    unitConsumption: number;
    billDueDate: number[];
    meterNumber: string;
    connectionType: string;
    createdAt: number[];
  }
  
  export interface Bill {
    billId: number;
    customer: Customer; // ✅ Instead of just customerId
    invoiceId: string;
    monthDate: number;
    paymentStatus: string;
    totalBillAmount: number;
    discountApplied: number;
    createdAt: number;
    dueDate: number;
    unitConsumed: number;
  }
  