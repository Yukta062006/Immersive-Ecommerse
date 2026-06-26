import mongoose from "mongoose";

export interface IAddress {
  label: string;
  firstName: string;
  lastName: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export const addressSchema = new mongoose.Schema<IAddress>(
  {
    label: { type: String, default: "Home" },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    street1: { type: String, required: true, trim: true },
    street2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "US" },
    phone: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);
