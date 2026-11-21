import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  History,
  DollarSign,
  User,
  Shield,
  Truck,
  ShoppingBag,
  Heart,
  Home,
  PackageCheck,
} from "lucide-react";

export const APP_ROUTES = {
  PUBLIC: {
    HOME: "/",
    SHOP: "/shop",
    CART: "/cart",
    PRODUCT: (id: string | number) => `/product/${id}`,
  },
  CUSTOMER: {
    PORTAL: "/customer",
    ORDERS: "/customer/orders",
    WISHLIST: "/customer/wishlist",
    PROFILE: "/customer/profile",
    CHECKOUT: "/customer/checkout",
  },
  ADMIN: {
    PORTAL: "/admin",
    DASHBOARD: "/admin/dashboard",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/orders",
    USERS: "/admin/users",
    CUSTOMERS: "/admin/users",
    SETTINGS: "/admin/settings",
  },
  DELIVERY: {
    PORTAL: "/delivery",
    HISTORY: "/delivery/history",
    EARNINGS: "/delivery/earnings",
    PROFILE: "/delivery/profile",
  },
} as const;

export type UserRole = "admin" | "customer" | "delivery-partner";

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: "cart" | "wishlist";
  isProtected?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface RoleSidebarConfig {
  sectionLabel: string;
  headerTitle: string;
  headerSubtitle: string;
  headerIcon: LucideIcon;
  items: NavItem[];
  sections?: NavSection[];
}

export const customerNavSections: NavSection[] = [
  {
    label: "Explore & Shop",
    items: [
      { name: "Home", path: APP_ROUTES.PUBLIC.HOME, icon: Home, isProtected: false },
      { name: "Shop Catalog", path: APP_ROUTES.PUBLIC.SHOP, icon: ShoppingBag, isProtected: false },
    ],
  },
  {
    label: "My Shopping",
    items: [
      { name: "Shopping Cart", path: APP_ROUTES.PUBLIC.CART, icon: ShoppingCart, badge: "cart", isProtected: false },
      { name: "Saved Wishlist", path: APP_ROUTES.CUSTOMER.WISHLIST, icon: Heart, badge: "wishlist", isProtected: true },
    ],
  },
  {
    label: "Account & Orders",
    items: [
      { name: "Dashboard", path: APP_ROUTES.CUSTOMER.PORTAL, icon: User, isProtected: true },
      { name: "Order History", path: APP_ROUTES.CUSTOMER.ORDERS, icon: PackageCheck, isProtected: true },
      { name: "Profile Settings", path: APP_ROUTES.CUSTOMER.PROFILE, icon: Settings, isProtected: true },
    ],
  },
];

export const customerNavItems: NavItem[] = customerNavSections.flatMap((s) => s.items);

export const guestNavSections: NavSection[] = customerNavSections
  .map((section) => ({
    label: section.label,
    items: section.items.filter((item) => !item.isProtected),
  }))
  .filter((section) => section.items.length > 0);

export const guestNavItems: NavItem[] = guestNavSections.flatMap((s) => s.items);

export const adminNavItems: NavItem[] = [
  { name: "Overview", path: APP_ROUTES.ADMIN.PORTAL, icon: LayoutDashboard, isProtected: true },
  { name: "Products", path: APP_ROUTES.ADMIN.PRODUCTS, icon: Package, isProtected: true },
  { name: "Orders", path: APP_ROUTES.ADMIN.ORDERS, icon: ShoppingCart, isProtected: true },
  { name: "Users", path: APP_ROUTES.ADMIN.USERS, icon: Users, isProtected: true },
  { name: "Profile Settings", path: APP_ROUTES.ADMIN.SETTINGS, icon: Settings, isProtected: true },
];

export const deliveryNavItems: NavItem[] = [
  { name: "Active Deliveries", path: APP_ROUTES.DELIVERY.PORTAL, icon: LayoutDashboard, isProtected: true },
  { name: "Order History", path: APP_ROUTES.DELIVERY.HISTORY, icon: History, isProtected: true },
  { name: "Earnings", path: APP_ROUTES.DELIVERY.EARNINGS, icon: DollarSign, isProtected: true },
  { name: "Profile", path: APP_ROUTES.DELIVERY.PROFILE, icon: User, isProtected: true },
];

export const SIDEBAR_ROLE_CONFIGS: Record<string, RoleSidebarConfig> = {
  admin: {
    sectionLabel: "Admin Console",
    headerTitle: "Admin Portal",
    headerSubtitle: "Administrator",
    headerIcon: Shield,
    items: adminNavItems,
  },
  "delivery-partner": {
    sectionLabel: "Rider App",
    headerTitle: "Delivery Hub",
    headerSubtitle: "Delivery Partner",
    headerIcon: Truck,
    items: deliveryNavItems,
  },
  customer: {
    sectionLabel: "Customer Portal",
    headerTitle: "StoreFront",
    headerSubtitle: "Customer Account",
    headerIcon: ShoppingBag,
    items: customerNavItems,
    sections: customerNavSections,
  },
  guest: {
    sectionLabel: "StoreFront",
    headerTitle: "StoreFront",
    headerSubtitle: "Welcome Guest",
    headerIcon: ShoppingBag,
    items: guestNavItems,
    sections: guestNavSections,
  },
};

export function getSidebarRoleConfig(
  role?: string | null,
  isAuthenticated = false
): RoleSidebarConfig {
  if (!isAuthenticated) {
    return SIDEBAR_ROLE_CONFIGS.guest;
  }

  if (role === "admin") {
    return SIDEBAR_ROLE_CONFIGS.admin;
  }

  if (role === "delivery-partner") {
    return SIDEBAR_ROLE_CONFIGS["delivery-partner"];
  }

  return SIDEBAR_ROLE_CONFIGS.customer;
}
