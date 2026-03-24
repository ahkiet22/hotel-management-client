# 🏨 Hotel Management (Paradise Hotel) - Frontend Client

A modern, high-performance, and feature-rich hotel management dashboard built with **Angular 21+**. This project provides a comprehensive interface for managing hotel operations, including room bookings, customer services, billing, and staff management.

## 🚀 Key Features

- **📊 Dashboard & Management**: Real-time overview of occupancy, recent bookings, and revenue.
- **🛏️ Room Management**: Manage room types (Standard, Deluxe, Suite), status (Vacant, Occupied, Reserved), and pricing.
- **📅 Booking System**: Streamlined check-in/check-in workflows, service tracking, and booking history.
- **💳 Payment & Invoicing**: Automated invoice generation, payment status tracking, and SePay integration readiness.
- **🛠️ Service Management**: Track and manage extra services like F&B, Laundry, Spa, and Transportation.
- **🔔 Notifications & Logs**: Real-time system notifications and detailed activity logs for security and tracking.
- **🔐 Secure Auth**: Role-based access control (Admin, Staff, Customer) with JWT and Refresh Token support.

## 🛠️ Technology Stack

- **Core**: [Angular 21](https://angular.dev/) (Signal-based architecture)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/guide/packages/lucide-angular)
- **Frameworks**: [Spartan NG](https://www.spartan.ng/) (UI Components), [RxJS](https://rxjs.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Deployment**: [Angular SSR](https://angular.dev/guide/ssr) (Server-Side Rendering) for SEO and performance

## 📂 Project Structure

```text
src/app/
├── core/             # Centralized services, guards, interceptors, and interfaces
│   ├── interfaces/   # Unified TypeScript interfaces based on backend schema
│   ├── services/     # API services extending BaseService
│   └── constants/    # Global configuration and endpoints
├── features/         # Feature modules (Manager, Customer, Auth, etc.)
│   ├── manager/      # Room, Booking, Payment management UI
│   └── auth/         # Login, Register, Forgot Password flows
├── stores/           # Global state management using Angular Signals
├── shared/           # Reusable pipes, directives, and utility functions
└── libs/ui/          # Custom and Spartan-based UI library components
```

## ⚙️ Development Guide

### Prerequisites
- Node.js (Latest LTS)
- Angular CLI (`npm install -g @angular/cli`)

### Installation
```bash
npm install
```

### Start Local Server
```bash
npm run start
```
Navigate to `http://localhost:4200/`.

### Build for Production
```bash
npm run build
```
---
