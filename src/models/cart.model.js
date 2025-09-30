import mongoose from "mongoose";
const { Schema } = mongoose;

const CartSchema = new Schema(
  {
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", CartSchema);
