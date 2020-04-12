import { CheckoutStatusType } from '../enums';
import { Timestamp } from '@google-cloud/firestore';

export interface ICheckoutSessionData {
  // The ID that firebase creates when we store this data in the DB
  id?: string;
  status: CheckoutStatusType;
  created: Timestamp;
  userId: string;
  courseId?: string;
}
