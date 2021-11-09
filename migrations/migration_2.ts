import { messagesCollection } from '../src/mongo';

export async function up(): Promise<void> {
  await messagesCollection().updateMany(
    {},
    {
      $set: {
        proofRead: false
      }
    }
  );
}
