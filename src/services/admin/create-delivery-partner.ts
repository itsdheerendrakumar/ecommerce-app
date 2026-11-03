import "server-only";
import { connectDb } from "@/lib/db";
import { generateTemporaryPassword } from "@/lib/utils";
import { hashPassword } from "@/lib/bycrypt";
import { DeliveryPartnerFormData } from "@/lib/validations/delivery-partner";
import User from "@/models/user.model";
import DeliveryPartner from "@/models/delivery-partner.model";
import ApiError from "@/lib/api-error";

export interface GetUserListingParams {
    role: "customer" | "delivery-partner";
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface GetUserListingResult {
    users: any[];
    meta: PaginationMeta;
}

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

export async function getUserListing({
    role,
    page = 1,
    limit = 10,
    search,
    startDate,
    endDate,
}: GetUserListingParams): Promise<GetUserListingResult> {
    await connectDb();

    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, Math.min(100, limit));
    const skip = (pageNumber - 1) * limitNumber;

    const filter: Record<string, any> = { role };

    if (search && search.trim()) {
        const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(escaped, "i");

        let partnerUserIds: any[] = [];
        if (role === "delivery-partner") {
            const partnerMatches = await DeliveryPartner.find({
                $or: [
                    { vehicle_name: searchRegex },
                    { vehicle_number: searchRegex },
                    { aadhar_number: searchRegex },
                    { license_number: searchRegex },
                    { bank_name: searchRegex },
                    { "address.city": searchRegex },
                    { "address.address": searchRegex },
                ],
            })
                .select("user_id")
                .lean();

            partnerUserIds = partnerMatches.map((p) => p.user_id);
        }

        filter.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            ...(partnerUserIds.length > 0 ? [{ _id: { $in: partnerUserIds } }] : []),
        ];
    }

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
            const start = new Date(startDate);
            if (!isNaN(start.getTime())) {
                start.setHours(0, 0, 0, 0);
                filter.createdAt.$gte = start;
            }
        }
        if (endDate) {
            const end = new Date(endDate);
            if (!isNaN(end.getTime())) {
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }
        if (Object.keys(filter.createdAt).length === 0) {
            delete filter.createdAt;
        }
    }

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNumber);

    const users = await User.find(filter)
        .select("-password")
        .populate({
            path: "deliveryPartner",
            model: DeliveryPartner,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);

    return {
        users,
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages,
        },
    };
}
