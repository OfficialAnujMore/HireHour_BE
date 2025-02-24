import { Router } from 'express'
import {
  bookService,
  deleteService,
  getMyService,
  getServicesByCategory,
  getUpcomingEvents,
  upsertService,
} from '../controllers/serviceController'
import {
  UPSERT_SERVICE,
  DELETE_SERVICE,
  BOOK_SERVICE,
  GET_SERVICE_PROVIDERS,
  GET_USER_SERVICES,
  UPCOMING_EVENTS,
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
authorizedServiceRouter.delete(
  DELETE_SERVICE,
  authentication,
  authorization,
  deleteService,
)

serviceRouter.get(GET_SERVICE_PROVIDERS, authentication, getServicesByCategory)
serviceRouter.post(BOOK_SERVICE, authentication, bookService)
serviceRouter.post(UPCOMING_EVENTS, authentication, getUpcomingEvents)

export default {authorizedServiceRouter,serviceRouter}
