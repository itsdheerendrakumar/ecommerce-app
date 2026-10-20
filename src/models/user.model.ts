import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    dob: {
        type: Date
    },
    role: {
        type: String,
        enum: ["admin", "customer", "delivery-partner"],
        default: "customer"
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    }
});

const User = models.User || model("User", userSchema);

export default User;