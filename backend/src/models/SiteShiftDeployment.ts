import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteShiftDeployment extends Document {
  site: string;
  date: string;
  text: string;
  updatedAt: Date;
}

const SiteShiftDeploymentSchema = new Schema<ISiteShiftDeployment>({
  site: { type: String, required: true },   // <-- unique: true removed
  date: { type: String, required: true },
  text: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

// Compound unique index – one document per site per day
SiteShiftDeploymentSchema.index({ site: 1, date: 1 }, { unique: true });

export default mongoose.model<ISiteShiftDeployment>('SiteShiftDeployment', SiteShiftDeploymentSchema);