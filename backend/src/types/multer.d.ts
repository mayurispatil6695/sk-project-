import { Multer } from 'multer';

declare global {
  namespace Express {
    interface Multer extends import('multer').Multer {}
    interface Request {
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
  }
}