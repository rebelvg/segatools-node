import { messagesCollection } from '../src/mongo';

export async function up(): Promise<void> {
  const allMessages = await messagesCollection()
    .find()
    .toArray();

  for (const messageRecord of allMessages) {
    await messagesCollection().updateOne(
      { _id: messageRecord._id },
      {
        $set: {
          linesCount: messageRecord.lines.length
        }
      }
    );
  }

  await messagesCollection().createIndex('percentDone');
  await messagesCollection().createIndex('linesCount');
}
