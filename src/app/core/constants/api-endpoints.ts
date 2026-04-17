export const API_PREFIX = '/api/v1';

export const buildEndpoint = (path: string) => `${API_PREFIX}${path}`;

type Id = string | number;

export const VERSION = 'api/v1';

// Define all backend API endpoints
export const API_ENDPOINT = {
  AUTH: {
    REGISTER: buildEndpoint('/auth/register'),
    LOGIN: buildEndpoint('/auth/login'),
    LOGOUT: buildEndpoint('/auth/logout'),
    REFRESH: buildEndpoint('/auth/refresh'),
    FORGOT_PASSWORD: buildEndpoint('/auth/forgot-password'),
    RESET_PASSWORD: buildEndpoint('/auth/reset-password'),
    CHANGE_PASSWORD: buildEndpoint('/auth/change-password'),
  },

  USERS: {
    BASE: buildEndpoint('/users'),
    DETAIL: (id: Id) => buildEndpoint(`/users/${id}`),
  },

  ROOMS: {
    BASE: buildEndpoint('/rooms'),
    DETAIL: (id: Id) => buildEndpoint(`/rooms/${id}`),
    ADD_SERVICE: (id: Id) => buildEndpoint(`/rooms/add-service/${id}`),
    REMOVE_SERVICE: (id: Id) => buildEndpoint(`/rooms/remove-service/${id}`),
  },

  ROOM_TYPES: {
    BASE: buildEndpoint('/room-types'),
    DETAIL: (id: Id) => buildEndpoint(`/room-types/${id}`),
    AVAILABLE: buildEndpoint('/room-types/available'),
  },

  BOOKINGS: {
    BASE: buildEndpoint('/bookings'),
    DETAIL: (id: Id) => buildEndpoint(`/bookings/${id}`),
  },

  PAYMENTS: {
    BASE: buildEndpoint('/payments'),
    DETAIL: (id: Id) => buildEndpoint(`/payments/${id}`),
  },

  RECEIPTS: {
    BASE: buildEndpoint('/receipts'),
    DETAIL: (id: Id) => buildEndpoint(`/receipts/${id}`),
  },

  SERVICES: {
    BASE: buildEndpoint('/services'),
    DETAIL: (id: Id) => buildEndpoint(`/services/${id}`),
  },

  REVIEWS: {
    BASE: buildEndpoint('/reviews'),
    DETAIL: (id: Id) => buildEndpoint(`/reviews/${id}`),
  },

  REPORTS: {
    BOOKINGS: buildEndpoint('/reports/bookings'),
    OCCUPANCY: buildEndpoint('/reports/occupancy'),
    REVIEWS: buildEndpoint('/reports/reviews'),
    REVENUE: buildEndpoint('/reports/revenue'),
    CUSTOMERS: buildEndpoint('/reports/customers'),
    EXPORT: (type: string) => buildEndpoint(`/reports/export/${type}`),
  },

  SETTINGS: {
    LOGS: buildEndpoint('/admin/logs'),
  },
} as const;
