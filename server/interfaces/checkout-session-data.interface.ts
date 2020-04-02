import { CheckoutStatusType } from '../enums';
import { Timestamp } from '@google-cloud/firestore';

export interface ICheckoutSessionData {
  status: CheckoutStatusType;
  created: Timestamp;
  userId: string;
  courseId?: string;
}
