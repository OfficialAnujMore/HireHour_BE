import { Router } from 'express'
import {
  createService,
  bookService,
  // deleteService,
  getMyService,
  getServicesByCategory,
  getUpcomingEvents,
} from '../controllers/serviceController'
import {
  ADD_SERVICE,
  BOOK_SERVICE,
  DELETE_SERVICE,
  GET_SERVICE_PROVIDERS,
  GET_USER_SERVICES,
  UPCOMING_EVENTS,
} from './constants'
import { authentication } from '../middlewares/authentication'

const serviceRouter = Router()
// SERVICE ROUTES
serviceRouter.post(ADD_SERVICE, authentication, createService)
serviceRouter.post(GET_USER_SERVICES, authentication, getMyService)
serviceRouter.get(GET_SERVICE_PROVIDERS, authentication, getServicesByCategory)
// serviceRouter.post(DELETE_SERVICE, authentication, deleteService)
serviceRouter.post(BOOK_SERVICE, authentication, bookService)
serviceRouter.post(UPCOMING_EVENTS, authentication, getUpcomingEvents)

export default serviceRouter
