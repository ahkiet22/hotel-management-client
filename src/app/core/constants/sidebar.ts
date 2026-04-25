import { ROUTES } from './routes';
import { PERMISSIONS, PermissionType } from './permissions';
import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  LucideIconData,
  Settings,
  Star,
  Ticket,
  Users,
} from 'lucide-angular';

export interface SidebarItem {
  title: string;
  href?: string;
  icon?: LucideIconData;
  children?: SidebarItem[];
  permission?: PermissionType | PermissionType[];
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: ROUTES.MANAGER.DASHBOARD,
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD.VIEW,
  },
  {
    title: 'User Management',
    icon: Users,
    permission: PERMISSIONS.MANAGE_USERS.VIEW,
    children: [
      {
        title: 'Users',
        href: ROUTES.MANAGER.USERS,
        permission: PERMISSIONS.MANAGE_USERS.VIEW,
      },
    ],
  },
  {
    title: 'Room Management',
    icon: BedDouble,
    permission: PERMISSIONS.MANAGE_ROOMS.VIEW,
    children: [
      { title: 'Rooms', href: ROUTES.MANAGER.ROOMS, permission: PERMISSIONS.MANAGE_ROOMS.VIEW },
      { title: 'Room Types', href: ROUTES.MANAGER.ROOM_TYPES, permission: PERMISSIONS.MANAGE_ROOM_TYPES.VIEW },
      { title: 'Services', href: ROUTES.MANAGER.SERVICES, permission: PERMISSIONS.MANAGE_SERVICES.VIEW },
    ],
  },
  {
    title: 'Booking',
    icon: CalendarCheck,
    permission: PERMISSIONS.MANAGE_BOOKINGS.VIEW,
    children: [{ title: 'Bookings', href: ROUTES.MANAGER.BOOKINGS, permission: PERMISSIONS.MANAGE_BOOKINGS.VIEW }],
  },
  {
    title: 'Coupons',
    icon: Ticket,
    href: ROUTES.MANAGER.COUPONS,
    permission: PERMISSIONS.MANAGE_BOOKINGS.VIEW,
  },
  {
    title: 'Finance',
    icon: CreditCard,
    permission: PERMISSIONS.MANAGE_FINANCE.VIEW,
    children: [
      { title: 'Payments', href: ROUTES.MANAGER.PAYMENTS, permission: PERMISSIONS.MANAGE_FINANCE.VIEW },
      { title: 'Receipts', href: ROUTES.MANAGER.RECEIPTS, permission: PERMISSIONS.MANAGE_FINANCE.VIEW },
    ],
  },
  {
    title: 'Reviews',
    icon: Star,
    href: ROUTES.MANAGER.REVIEWS,
    permission: PERMISSIONS.MANAGE_REVIEWS.VIEW,
  },
  {
    title: 'Reports',
    icon: BarChart3,
    permission: PERMISSIONS.REPORTS.VIEW,
    children: [
      { title: 'Booking Report', href: ROUTES.MANAGER.REPORTS.BOOKINGS },
      { title: 'Occupancy', href: ROUTES.MANAGER.REPORTS.OCCUPANCY },
      { title: 'Revenue', href: ROUTES.MANAGER.REPORTS.REVENUE },
      { title: 'Customer', href: ROUTES.MANAGER.REPORTS.CUSTOMERS },
      { title: 'Review Report', href: ROUTES.MANAGER.REPORTS.REVIEWS },
    ],
  },
  {
    title: 'System',
    icon: Settings,
    permission: PERMISSIONS.SYSTEM.LOGS,
    children: [{ title: 'Logs', href: ROUTES.MANAGER.SETTINGS.LOGS, permission: PERMISSIONS.SYSTEM.LOGS }],
  },
];
