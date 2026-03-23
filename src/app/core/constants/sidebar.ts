import { ROUTES } from './routes';
import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  LucideIconData,
  Settings,
  Star,
  Users,
} from 'lucide-angular';

export interface SidebarItem {
  title: string;
  href?: string;
  icon?: LucideIconData;
  children?: SidebarItem[];
  roles?: string[];
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: ROUTES.MANAGER.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    icon: Users,
    children: [
      {
        title: 'Users',
        href: ROUTES.MANAGER.USERS,
      },
    ],
  },
  {
    title: 'Room Management',
    icon: BedDouble,
    children: [
      { title: 'Rooms', href: ROUTES.MANAGER.ROOMS },
      { title: 'Room Types', href: ROUTES.MANAGER.ROOM_TYPES },
      { title: 'Services', href: ROUTES.MANAGER.SERVICES },
    ],
  },
  {
    title: 'Booking',
    icon: CalendarCheck,
    children: [{ title: 'Bookings', href: ROUTES.MANAGER.BOOKINGS }],
  },
  {
    title: 'Finance',
    icon: CreditCard,
    children: [
      { title: 'Payments', href: ROUTES.MANAGER.PAYMENTS },
      { title: 'Receipts', href: ROUTES.MANAGER.RECEIPTS },
    ],
  },
  {
    title: 'Reviews',
    icon: Star,
    href: ROUTES.MANAGER.REVIEWS,
  },
  {
    title: 'Reports',
    icon: BarChart3,
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
    children: [{ title: 'Logs', href: ROUTES.MANAGER.SETTINGS.LOGS }],
  },
];
