export interface PaymentRequest {
  billId: number;
  amount: number;
  paymentMethod: string;
  customerName?: string; // Added (optional)
  customerEmail?: string; // Added (optional)
}

export interface PaymentResponse {
  transactionId?: number;
  bill?: any;
  customer?: any;
  amountPaid: number;
  paymentDate: number;
  transactionStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  success: boolean; // Added
  message: string; // Added
}
