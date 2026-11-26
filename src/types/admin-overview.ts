import type { OrderStatus } from "@/models/order.model";

export type OverviewRange = "7d" | "30d" | "90d" | "all";

export interface OverviewOrderStatusItem {
  status: OrderStatus;
  label: string;
  count: number;
  revenue: number;
}

export interface OverviewCategoryItem {
  category: string;
  revenue: number;
  unitsSold: number;
  orderCount: number;
}

export interface OverviewPaymentMethodItem {
  method: "stripe" | "cod";
  label: string;
  count: number;
  revenue: number;
}

export interface OverviewPaymentStatusItem {
  status: string;
  label: string;
  count: number;
  amount: number;
}

export interface OverviewQueueOrder {
  _id: string;
  order_number: string;
  order_status: OrderStatus;
  payment_status: string;
  payment_method: "stripe" | "cod";
  currency: string;
  total_amount: number;
  recipient_name: string;
  city: string;
  customer_email: string;
  items_count: number;
  delivery_partner?: {
    _id: string;
    name: string;
    phone?: string;
  } | null;
  createdAt: string;
}

export interface OverviewLowStockProduct {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
}

export interface OverviewTopProduct {
  productId: string;
  name: string;
  category: string;
  image?: string;
  unitsSold: number;
  revenue: number;
  currentStock: number | null;
}

export interface OverviewActiveRider {
  _id: string;
  name: string;
  phone?: string;
  duty_status: "on-duty" | "off-duty" | "in-delivery";
  completed_deliveries: number;
  vehicle_number?: string;
  city?: string;
}

export interface AdminOverviewData {
  range: OverviewRange;
  currency: string;
  generatedAt: string;
  kpis: {
    netRevenue: number;
    grossRevenue: number;
    refundedAmount: number;
    revenueDeltaPercent: number | null;
    totalOrders: number;
    paidOrders: number;
    ordersDeltaPercent: number | null;
    averageOrderValue: number;
    needsFulfillment: number;
    unassignedActive: number;
    inTransitCount: number;
    deliveredCount: number;
    cancelledReturnedCount: number;
    fulfillmentRate: number;
    cancellationRate: number;
  };
  catalogSummary: {
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    outOfStockCount: number;
    lowStockCount: number;
    totalInventoryUnits: number;
    catalogValue: number;
  };
  usersAndFleet: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomersInRange: number;
    totalRiders: number;
    onDutyRiders: number;
    inDeliveryRiders: number;
    offDutyRiders: number;
    totalCompletedDeliveries: number;
  };
  charts: {
    revenueTrend: {
      categories: string[];
      labels: string[];
      revenue: number[];
      orders: number[];
    };
    orderStatusBreakdown: OverviewOrderStatusItem[];
    categoryRevenue: OverviewCategoryItem[];
    paymentBreakdown: {
      byMethod: OverviewPaymentMethodItem[];
      byStatus: OverviewPaymentStatusItem[];
      transactionsSummary: {
        succeeded: number;
        failed: number;
        pending: number;
        canceled: number;
      };
    };
  };
  actionQueues: {
    ordersNeedingAction: OverviewQueueOrder[];
    lowStockProducts: OverviewLowStockProduct[];
    topSellingProducts: OverviewTopProduct[];
    activeRiders: OverviewActiveRider[];
  };
  systemHealth: {
    failedWebhooks: number;
    failedPayments: number;
    expiredUploadSessions: number;
  };
}
