import { messagesCollection } from '../mongo';

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
