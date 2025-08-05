import { User } from './userInterface'

interface Service {
  id: string
  title: string
  description: string
  servicePreview: ServicePreview[]
  schedule: Schedule[]
  pricing: string
  category: string
  ratings: string
  user: User
  userId: string
  deletedAt?: Date
  isDisabled: boolean
  createdAt: Date
  updatedAt: Date
}

interface ServicePreview {
  id: string
  uri: string
  servicesId: string
}

interface Schedule {
  id: string
  date: string
  isAvailable: boolean
  servicesId?: string
  bookedUserId?: string
}

interface BookServiceRequestBody {
  userId: string
  cartItems: CartItem[]
  paymentDetails: PaymentDetails
}

interface PaymentDetails {
  paymentMethod: string
  amount: string
  currency: string
  transactionId?: string
}

interface CartItem {
  id: string
  userId: string
  serviceId: string
  schedule: Schedule
  quantity: number
}

interface UpsertServiceRequestBody {
  title: string
  description: string
  category: string
  pricing: string
  ratings?: string
  servicePreview?: {
    uri: string
    isBase64?: boolean
  }[]
  selectedDates?: {
    [date: string]: {
      selected: boolean
      isAvailable: boolean
    }
  }
  id?: string
  userId?: string
}

interface SlotApprovalRequestBody {
  serviceId: string
  scheduleId: string
  isApproved: boolean
  userId: string
}

interface HoldSlotRequestBody {
  schedule: {
    serviceId: string
    date: string
    userId: string
  }
}

interface GetServicesRequest {
  userId?: string
  categories?: string[]
}

interface GetUserServicesRequest {
  userId: string
  type?: 'active' | 'inactive' | 'all'
}

interface GetBookedServicesRequest {
  id: string
  type: string
}

interface DeleteServiceRequest {
  serviceId: string
  fcmToken?: string
}

interface UpcomingEventsRequest {
  userId: string
  type: 'upcoming' | 'past' | 'all'
  limit?: number
  offset?: number
}

export {
  Service,
  ServicePreview,
  Schedule,
  UpsertServiceRequestBody,
  BookServiceRequestBody,
  PaymentDetails,
  CartItem,
  SlotApprovalRequestBody,
  HoldSlotRequestBody,
  GetServicesRequest,
  GetUserServicesRequest,
  GetBookedServicesRequest,
  DeleteServiceRequest,
  UpcomingEventsRequest,
}
