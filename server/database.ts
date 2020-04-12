import { FirebaseCollectionType } from './enums';

const Firestore = require('@google-cloud/firestore');
const serviceAccountPath = `./service-accounts/${process.env.SERVICE_ACCOUNT_FILE_NAME}`;

// It takes projectId and the relative path to the Service Account Key JSON file.
export const db = new Firestore({
  projectId: process.env.PROJECT_ID,
  keyFileName: serviceAccountPath
});

export async function getDocData(docPath: FirebaseCollectionType | string): Promise<any> {
  const snapshot = await db.doc(docPath).get();

  return snapshot.data();
}
