import mongoose, { Schema, Document, Model } from 'mongoose';
import { WIDGET_TYPES, type WidgetData, type WidgetType } from '@/lib/widgets';

export interface IWidget extends Document {
  type: WidgetType;
  title?: string;
  data: WidgetData;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WidgetSchema = new Schema<IWidget>(
  {
    type: {
      type: String,
      required: true,
      enum: WIDGET_TYPES,
    },
    title: { type: String },
    data: { type: Schema.Types.Mixed, required: true },
    position: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Widget: Model<IWidget> = mongoose.models.Widget || mongoose.model<IWidget>('Widget', WidgetSchema);

export default Widget;
