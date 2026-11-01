import "server-only";
import { connectDb } from "@/lib/db";
import { generateTemporaryPassword } from "@/lib/utils";
import { hashPassword } from "@/lib/bycrypt";
import { DeliveryPartnerFormData } from "@/lib/validations/delivery-partner";
import User from "@/models/user.model";
import DeliveryPartner from "@/models/delivery-partner.model";
import ApiError from "@/lib/api-error";

export async function createDeliveryPartner(payload: DeliveryPartnerFormData): Promise<void> {
    await connectDb();
    const password = generateTemporaryPassword();
    const hashedPassword = await hashPassword(password);
    const { name, email, phone, dob, address, city, pin_code, ...rest } = payload;
    const isExist = await User.findOne({ email });
    if (isExist) {
        throw new ApiError(400, "Delivery partner already exists");
    }
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        dob,
        role: "delivery-partner"
    });

    await DeliveryPartner.create({
        user_id: user._id,
        address: { address, city, pin_code },
        ...rest,
        duty_status: "off-duty",
    });

    return;
}

export async function getUserListing(role: "customer" | "delivery-partner") {
    await connectDb();
    const users = await User.find({ role })
        .select("-password")
        .populate({
            path: "deliveryPartner",
            model: DeliveryPartner,
        })
        .sort({ createdAt: -1 });
    return users;
}
