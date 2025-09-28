import mongoose from 'mongoose';

const ItemCarritoSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    quantity: { type: Number, default: 1, min: 1 }
}, { _id: false });

const CarritoSchema = new mongoose.Schema({
    products: { type: [ItemCarritoSchema], default: [] }
}, { timestamps: true });

export const CarritoModel = mongoose.model('Carrito', CarritoSchema);
