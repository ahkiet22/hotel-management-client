export const ROUTES = {
  MANAGER: {
    ROOT: '/manager',

    DASHBOARD: '/manager/dashboard',

    USERS: '/manager/users',

    ROOMS: '/manager/rooms',
    ROOM_TYPES: '/manager/room-types',
    SERVICES: '/manager/services',

    BOOKINGS: '/manager/bookings',

    PAYMENTS: '/manager/payments',
    RECEIPTS: '/manager/receipts',

    REVIEWS: '/manager/reviews',

    REPORTS: {
      BOOKINGS: '/manager/reports/bookings',
      OCCUPANCY: '/manager/reports/occupancy',
      REVENUE: '/manager/reports/revenue',
      CUSTOMERS: '/manager/reports/customers',
      REVIEWS: '/manager/reports/reviews',
    },

    SETTINGS: {
      LOGS: '/manager/settings/logs',
    },
  },
} as const;
