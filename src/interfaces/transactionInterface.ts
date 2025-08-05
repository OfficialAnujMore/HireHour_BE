import { User } from './userInterface'
import { Service } from './serviceInterface'

interface TransactionSchedule {
  scheduleId: string
  date: Date
}

interface TransactionItem {
  id: string
  transactionId: string
  serviceId: string
  serviceTitle: string
  servicePrice: string
  serviceProviderId: string
  venue: string
  meetingUrl: string
  address: string
  city: string
  postalCode: string
  state: string
  country: string
  createdAt: Date
  updatedAt: Date
  schedules: TransactionSchedule[]
}

interface Transaction {
  id: string
  userId: string
  paymentId: string
  transactionType: string
  paymentStatus: string
  totalAmount: number
  tax: number
  serviceId: string
  createdAt: Date
  updatedAt: Date
  transactionItems: TransactionItem[]
  user?: User
  service?: Service
}

// Transaction Management
interface GetTransactionsRequest {
  userId: string
  type?: 'all' | 'completed' | 'pending' | 'cancelled'
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
}

interface CreateTransactionRequest {
  userId: string
  cartItems: CartItem[]
  paymentDetails: PaymentDetails
}

interface PaymentDetails {
  paymentMethod: string
  amount: string
  currency: string
  transactionId?: string
  tax: string
  totalAmount: string
  paymentStatus: string
  transactionType: string
  paymentId: string
}

interface CartItem {
  id: string
  userId: string
  serviceId: string
  schedule: any
  quantity: number
  title: string
  pricing: string
  venue: string
  meetingUrl: string
  addressInfo: {
    address: string
    city: string
    postalCode: string
    state: string
    country: string
  }
}

interface TransactionFilterRequest {
  userId: string
  status?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  serviceId?: string
}

interface TransactionSummary {
  totalTransactions: number
  totalAmount: number
  completedTransactions: number
  pendingTransactions: number
  cancelledTransactions: number
  averageTransactionValue: number
}

interface InvoiceRequest {
  transactionId: string
  userId: string
  format?: 'pdf' | 'email'
}

interface RefundRequest {
  transactionId: string
  userId: string
  reason: string
  amount?: string
}

interface TransactionAnalyticsRequest {
  userId: string
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

interface ExportTransactionsRequest {
  userId: string
  format: 'csv' | 'excel' | 'pdf'
  filters?: Partial<TransactionFilterRequest>
}

export {
  Transaction,
  TransactionItem,
  TransactionSchedule,
  GetTransactionsRequest,
  CreateTransactionRequest,
  PaymentDetails,
  CartItem,
  TransactionFilterRequest,
  TransactionSummary,
  InvoiceRequest,
  RefundRequest,
  TransactionAnalyticsRequest,
  ExportTransactionsRequest,
} 