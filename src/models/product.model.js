import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const ProductoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    price: { type: Number, required: true, index: true },
    status: { type: Boolean, default: true, index: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true, index: true },
    thumbnails: { type: [String], default: [] }
}, { timestamps: true });

ProductoSchema.plugin(mongoosePaginate);

export const ProductoModel = mongoose.model('Producto', ProductoSchema);
