import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVariant {
  size: string;
  price: number;
  cutPrice?: number;
  stock: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  categoryId: mongoose.Types.ObjectId;
  stock: number;
  variants: IVariant[];
  features?: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>({
  size: { type: String, required: true },
  price: { type: Number, required: true },
  cutPrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String },
  rating: { type: Number, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    images: [{ type: String }],
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, required: true, default: 0 },
    variants: [VariantSchema],
    features: [{ type: String }],
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
