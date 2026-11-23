import "server-only";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import Order, { IOrder } from "@/models/order.model";

/**
 * Service to fetch all historical orders for a given customer account.
 */
export async function getCustomerOrdersService(userId: string): Promise<IOrder[]> {
  await connectDb();

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const orders = await Order.find({ user_id: userObjectId })
    .sort({ createdAt: -1 })
    .lean();

  return orders as unknown as IOrder[];
}
