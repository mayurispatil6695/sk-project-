import mongoose, { Schema, Document } from 'mongoose';

export interface ICleaningPhoto extends Document {
  photoUrl: string;
  cloudinaryPublicId: string;
  site: string;
  remark?: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CleaningPhotoSchema = new Schema<ICleaningPhoto>({
  photoUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  site: { type: String, required: true },
  remark: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<ICleaningPhoto>('CleaningPhoto', CleaningPhotoSchema);