import { Schema, model, models, Model, Types } from "mongoose";

export interface ICustomerAddress {
    recipient_name?: string;
    phone?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    pin_code: string;
    address_type?: "home" | "work" | "other";
    is_default: boolean;
}

export interface ICustomer {
    user_id: Types.ObjectId | string;
    addresses: ICustomerAddress[];
    createdAt?: Date;
    updatedAt?: Date;
}

const customerAddressSchema = new Schema<ICustomerAddress>({
    recipient_name: { type: String },
    phone: { type: String },
    address_line_1: { type: String, required: true },
    address_line_2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pin_code: { type: String, required: true },
    address_type: {
        type: String,
        enum: ["home", "work", "other"],
        default: "home"
    },
    is_default: { type: Boolean, default: false }
}, { _id: false });

const customerSchema = new Schema<ICustomer>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        addresses: [customerAddressSchema],
    },
    { timestamps: true, _id: false }
);

const Customer: Model<ICustomer> =
    (models.Customer as Model<ICustomer>) ||
    model<ICustomer>("Customer", customerSchema);

export default Customer;
