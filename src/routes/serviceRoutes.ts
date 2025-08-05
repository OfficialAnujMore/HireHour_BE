import { Router } from 'express'
import {
  bookService,
  deleteService,
  getMyBookedService,
  getMyService,
  getServicesByCategory,
  getUpcomingEvents,
  handleSlotApproval,
  holdSchedule,
  upsertService,
  getUserScheduleDates,
  getUserScheduleDatesExcludingService,
  getServiceBookedSlots,
  getServiceScheduleDates,
} from '../controllers/serviceController'
import {
  UPSERT_SERVICE,
  DELETE_SERVICE,
  BOOK_SERVICE,
  GET_SERVICE_PROVIDERS,
  GET_USER_SERVICES,
  UPCOMING_EVENTS,
  HOLD_SLOTS,
  APPROVE_SLOTS,
  GET_BOOKED_SERVICES,
  GET_USER_SCHEDULE_DATES,
  GET_SERVICE_BOOKED_SLOTS,
  GET_USER_SCHEDULE_DATES_EXCLUDING_SERVICE,
  GET_SERVICE_SCHEDULE_DATES,
} from './constants'
import { authentication } from '../middlewares/authentication'
import { authorization } from '../middlewares/authorization'

const authorizedServiceRouter = Router()
const serviceRouter = Router()

// SERVICE ROUTES
authorizedServiceRouter.post(
  UPSERT_SERVICE,
  authentication,
  authorization,
  upsertService,
)
authorizedServiceRouter.post(
  GET_USER_SERVICES,
  authentication,
  authorization,
  getMyService,
)
authorizedServiceRouter.post(
  APPROVE_SLOTS,
  authentication,
  authorization,
  handleSlotApproval,
)

authorizedServiceRouter.post(
  GET_BOOKED_SERVICES,
  authentication,
  authorization,
  getMyBookedService,
)

authorizedServiceRouter.get(
  GET_USER_SCHEDULE_DATES,
  authentication,
  authorization,
  getUserScheduleDates,
)

authorizedServiceRouter.get(
  GET_USER_SCHEDULE_DATES_EXCLUDING_SERVICE,
  authentication,
  authorization,
  getUserScheduleDatesExcludingService,
)

authorizedServiceRouter.get(
  GET_SERVICE_BOOKED_SLOTS,
  authentication,
  authorization,
  getServiceBookedSlots,
)

authorizedServiceRouter.get(
  GET_SERVICE_SCHEDULE_DATES,
  authentication,
  authorization,
  getServiceScheduleDates,
)


authorizedServiceRouter.delete(
  DELETE_SERVICE,
  authentication,
  authorization,
  deleteService,
)

serviceRouter.get(GET_SERVICE_PROVIDERS, authentication, getServicesByCategory)
serviceRouter.post(BOOK_SERVICE, authentication, bookService)
serviceRouter.post(HOLD_SLOTS, authentication, holdSchedule)
serviceRouter.post(UPCOMING_EVENTS, authentication, getUpcomingEvents)

export default { authorizedServiceRouter, serviceRouter }
