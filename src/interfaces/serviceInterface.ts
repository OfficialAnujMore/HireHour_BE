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
  schedule: Schedule
}

interface UpsertServiceRequestBody {
  title: string
  description: string
  category: string
  pricing: string
  ratings?: string
  servicePreview?: {
    uri: string
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

export {
  Service,
  ServicePreview,
  Schedule,
  UpsertServiceRequestBody,
  BookServiceRequestBody,
}
