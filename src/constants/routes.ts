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
    CUSTOMERS: "/admin/customers",
    SETTINGS: "/admin/settings",
  },
  DELIVERY: {
    PORTAL: "/delivery",
    HISTORY: "/delivery/history",
    EARNINGS: "/delivery/earnings",
    PROFILE: "/delivery/profile",
  },
} as const;

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: "cart" | "wishlist";
}

export interface RoleSidebarConfig {
  sectionLabel: string;
  headerTitle: string;
  headerSubtitle: string;
  headerIcon: LucideIcon;
  items: NavItem[];
}

export const customerNavItems: NavItem[] = [
  { name: "Home", path: APP_ROUTES.PUBLIC.HOME, icon: Home },
  { name: "Shop Catalog", path: APP_ROUTES.PUBLIC.SHOP, icon: ShoppingBag },
  { name: "My Account", path: APP_ROUTES.CUSTOMER.PORTAL, icon: User },
  { name: "My Orders", path: APP_ROUTES.CUSTOMER.ORDERS, icon: PackageCheck },
  { name: "Wishlist", path: APP_ROUTES.CUSTOMER.WISHLIST, icon: Heart, badge: "wishlist" },
  { name: "Shopping Cart", path: APP_ROUTES.PUBLIC.CART, icon: ShoppingCart, badge: "cart" },
  { name: "Profile Settings", path: APP_ROUTES.CUSTOMER.PROFILE, icon: Settings },
];

export const adminNavItems: NavItem[] = [
  { name: "Overview", path: APP_ROUTES.ADMIN.PORTAL, icon: LayoutDashboard },
  { name: "Products", path: APP_ROUTES.ADMIN.PRODUCTS, icon: Package },
  { name: "Orders", path: APP_ROUTES.ADMIN.ORDERS, icon: ShoppingCart },
  { name: "Customers", path: APP_ROUTES.ADMIN.CUSTOMERS, icon: Users },
  { name: "Settings", path: APP_ROUTES.ADMIN.SETTINGS, icon: Settings },
];

export const deliveryNavItems: NavItem[] = [
  { name: "Active Deliveries", path: APP_ROUTES.DELIVERY.PORTAL, icon: LayoutDashboard },
  { name: "Order History", path: APP_ROUTES.DELIVERY.HISTORY, icon: History },
  { name: "Earnings", path: APP_ROUTES.DELIVERY.EARNINGS, icon: DollarSign },
  { name: "Profile", path: APP_ROUTES.DELIVERY.PROFILE, icon: User },
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
  },
};
