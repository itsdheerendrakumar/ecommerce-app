import { Schema, model, models, Model, Types } from "mongoose";

export interface IAddress {
    address: string;
    city: string;
    pin_code: string;
}

export interface IDeliveryPartner {
    user_id: Types.ObjectId | string;
    address: IAddress;
    vehicle_name: string;
    vehicle_number: string;
    aadhar_number: string;
    license_number: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    duty_status?: "on-duty" | "off-duty" | "in-delivery";
    completed_deliveries?: number;
    total_ratings?: number;
}

const addressSchema = new Schema<IAddress>(
    {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        pin_code: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const deliveryPartnerSchema = new Schema<IDeliveryPartner>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        address: {
            type: addressSchema,
            required: true,
        },
        vehicle_name: {
            type: String,
            required: true,
        },
        vehicle_number: {
            type: String,
            required: true,
        },
        aadhar_number: {
            type: String,
            required: true,
        },
        license_number: {
            type: String,
            required: true,
        },
        bank_name: {
            type: String,
            required: true,
        },
        account_number: {
            type: String,
            required: true,
        },
        ifsc_code: {
            type: String,
            required: true,
            uppercase: true,
        },
        emergency_contact_name: {
            type: String,
            required: true,
        },
        emergency_contact_phone: {
            type: String,
            required: true,
        },
        duty_status: {
            type: String,
            enum: ["on-duty", "off-duty", "in-delivery"],
            default: "on-duty",
        },
        completed_deliveries: {
            type: Number,
            default: 0,
            min: 0,
        },
        total_ratings: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
        _id: false
    }
);

const DeliveryPartner: Model<IDeliveryPartner> =
    (models.DeliveryPartner as Model<IDeliveryPartner>) ||
    model<IDeliveryPartner>("DeliveryPartner", deliveryPartnerSchema);

export default DeliveryPartner;
