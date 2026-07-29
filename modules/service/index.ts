export type {
  ServiceRequest,
  ServiceType,
} from "./types/service";

export {
  serviceTypes,
} from "./types/service";

export {
  createServiceRequest,
  getServiceRequests,
  completeServiceRequest,
} from "./services/service.service";