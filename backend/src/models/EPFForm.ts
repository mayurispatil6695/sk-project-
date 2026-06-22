import mongoose, { Schema, Document } from 'mongoose';

export interface IEPFForm extends Document {
  employeeId: string;
  employee: mongoose.Types.ObjectId;
  
  // Section 1-6
  memberName: string;
  fatherOrSpouseName: string;
  relationshipType: 'father' | 'spouse';
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Transgender';
  maritalStatus: 'Single' | 'Married' | 'Widow' | 'Widower' | 'Divorcee';
  email: string;
  mobileNumber: string;
  
  // Section 7-8
  previousEPFMember: boolean;
  previousPensionMember: boolean;
  
  // Section 9 - Previous Employment
  previousUAN?: string;
  previousPFAccountNumber?: string;
  dateOfExit?: Date;
  schemeCertificateNumber?: string;
  pensionPaymentOrder?: string;
  
  // Section 10 - International Worker
  internationalWorker: boolean;
  countryOfOrigin?: string;
  passportNumber?: string;
  passportValidityFrom?: Date;
  passportValidityTo?: Date;
  
  // Section 11 - KYC Details
  bankAccountNumber?: string;
  ifscCode?: string;
  aadharNumber: string;
  panNumber?: string;
  
  // Section 12 - Declaration Details
  firstEPFMember: boolean;
  enrolledDate: Date;
  firstEmploymentWages: number;
  epfMemberBeforeSep2014: boolean;
  epfAmountWithdrawn: boolean;
  epsAmountWithdrawn: boolean;
  epsAmountWithdrawnAfterSep2014: boolean;
  
  // Signatures
  declarationDate: Date;
  declarationPlace?: string;
  employerDeclarationDate: Date;
  
  // Status
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: Date;
  approvedAt?: Date;
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
}

const EPFFormSchema: Schema = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      ref: 'Employee'
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    
    // Section 1-6
    memberName: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true
    },
    fatherOrSpouseName: {
      type: String,
      required: [true, 'Father/Spouse name is required'],
      trim: true
    },
    relationshipType: {
      type: String,
      enum: ['father', 'spouse'],
      default: 'father'
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Transgender']
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Widow', 'Widower', 'Divorcee']
    },
    email: {
      type: String,
      trim: true
    },
    mobileNumber: {
      type: String,
      trim: true
    },
    
    // Section 7-8
    previousEPFMember: {
      type: Boolean,
      default: false
    },
    previousPensionMember: {
      type: Boolean,
      default: false
    },
    
    // Section 9
    previousUAN: {
      type: String,
      trim: true
    },
    previousPFAccountNumber: {
      type: String,
      trim: true
    },
    dateOfExit: {
      type: Date
    },
    schemeCertificateNumber: {
      type: String,
      trim: true
    },
    pensionPaymentOrder: {
      type: String,
      trim: true
    },
    
    // Section 10
    internationalWorker: {
      type: Boolean,
      default: false
    },
    countryOfOrigin: {
      type: String,
      trim: true
    },
    passportNumber: {
      type: String,
      trim: true
    },
    passportValidityFrom: {
      type: Date
    },
    passportValidityTo: {
      type: Date
    },
    
    // Section 11
    bankAccountNumber: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    aadharNumber: {
      type: String,
      required: [true, 'Aadhar number is required'],
      trim: true
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true
    },
    
    // Section 12
    firstEPFMember: {
      type: Boolean,
      default: true
    },
    enrolledDate: {
      type: Date,
      default: Date.now
    },
    firstEmploymentWages: {
      type: Number,
      min: [0, 'Wages cannot be negative']
    },
    epfMemberBeforeSep2014: {
      type: Boolean,
      default: false
    },
    epfAmountWithdrawn: {
      type: Boolean,
      default: false
    },
    epsAmountWithdrawn: {
      type: Boolean,
      default: false
    },
    epsAmountWithdrawnAfterSep2014: {
      type: Boolean,
      default: false
    },
    
    // Signatures
    declarationDate: {
      type: Date,
      default: Date.now
    },
    declarationPlace: {
      type: String,
      trim: true
    },
    employerDeclarationDate: {
      type: Date,
      default: Date.now
    },
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft'
    },
    submittedAt: {
      type: Date
    },
    approvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
EPFFormSchema.index({ employeeId: 1 }, { unique: true });
EPFFormSchema.index({ status: 1 });
EPFFormSchema.index({ aadharNumber: 1 });

export default mongoose.model<IEPFForm>('EPFForm', EPFFormSchema);