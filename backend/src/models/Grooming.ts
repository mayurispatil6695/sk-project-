import mongoose, { Schema, Document } from 'mongoose';

export interface IGrooming extends Document {
  employeeId: string;
  date: string;
  shirt: boolean;
  pant: boolean;
  cap: boolean;
  shoes: boolean;
  idCard: boolean;
  // new fields
  nails?: boolean;
  singleBangles?: boolean;
  studs?: boolean;
  shaving?: boolean;
  haircut?: boolean;
  apron?: boolean;
  westcoat?: boolean;
  supervisorId?: string;
}

const GroomingSchema = new Schema({
  employeeId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  shirt: { type: Boolean, default: false },
  pant: { type: Boolean, default: false },
  cap: { type: Boolean, default: false },
  shoes: { type: Boolean, default: false },
  idCard: { type: Boolean, default: false },
  nails: { type: Boolean, default: false },
  singleBangles: { type: Boolean, default: false },
  studs: { type: Boolean, default: false },
  shaving: { type: Boolean, default: false },
  haircut: { type: Boolean, default: false },
  apron: { type: Boolean, default: false },
  westcoat: { type: Boolean, default: false },
  supervisorId: { type: String },
}, { timestamps: true });

GroomingSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model<IGrooming>('Grooming', GroomingSchema);