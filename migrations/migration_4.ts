import { messagesCollection } from '../src/mongo';

export async function up(): Promise<void> {
  const allMessages = await messagesCollection()
    .find()
    .toArray();

  for (const messageRecord of allMessages) {
    const timeUpdated =
      messageRecord._id.getTimestamp() > messageRecord.timeUpdated
        ? messageRecord._id.getTimestamp()
        : messageRecord.timeUpdated;

    await messagesCollection().updateOne(
      { _id: messageRecord._id },
      {
        $set: {
          timeCreated: messageRecord._id.getTimestamp(),
          timeUpdated
        }
      }
    );
  }

  await messagesCollection().createIndex('timeCreated');
}
