import { Schema, model, models } from "mongoose";
import "@/models/delivery-partner.model";

const userSchema = new Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
        },
        dob: {
            type: Date,
        },
        profile_picture: {
            type: String
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: "male"
        },
        role: {
            type: String,
            enum: ["admin", "customer", "delivery-partner"],
            default: "customer",
        },
        phone: {
            type: String,
        },
        password: {
            type: String,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

userSchema.virtual("deliveryPartner", {
    ref: "DeliveryPartner",
    localField: "_id",
    foreignField: "user_id",
    justOne: true,
});

const User = models.User || model("User", userSchema);

export default User;
