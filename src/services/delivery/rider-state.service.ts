import "server-only";
import mongoose from "mongoose";
import DeliveryPartner from "@/models/delivery-partner.model";
import Order from "@/models/order.model";
import type { DutyStatus } from "@/constants/delivery";

/**
 * Recalculates and persists a delivery partner's duty_status based on their
 * currently active "out_for_delivery" orders.
 */
export async function syncDeliveryPartnerDutyStatus(
  riderUserId: string | mongoose.Types.ObjectId
): Promise<DutyStatus | null> {
  const idStr = String(riderUserId);
  if (!mongoose.Types.ObjectId.isValid(idStr)) {
    return null;
  }

  const userObjectId = new mongoose.Types.ObjectId(idStr);

  const [partner, activeDeliveryCount] = await Promise.all([
    DeliveryPartner.findOne({ user_id: userObjectId }),
    Order.countDocuments({
      delivery_partner_id: userObjectId,
      order_status: "out_for_delivery",
    }),
  ]);

  if (!partner) {
    return null;
  }

  let nextStatus: DutyStatus = (partner.duty_status as DutyStatus) || "off-duty";

  if (activeDeliveryCount > 0) {
    nextStatus = "in-delivery";
  } else if (partner.duty_status === "in-delivery") {
    nextStatus = "on-duty";
  }

  if (partner.duty_status !== nextStatus) {
    partner.duty_status = nextStatus;
    await partner.save();
  }

  return nextStatus;
}
