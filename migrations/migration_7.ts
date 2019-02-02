import { namesCollection, messagesCollection } from '../mongo';

export async function up(): Promise<void> {
  const allNames = await namesCollection()
    .find()
    .toArray();

  const allMessages = await messagesCollection()
    .find()
    .toArray();

  for (const nameRecord of allNames) {
    let linesCount = 0;

    allMessages.forEach(messageRecord => {
      messageRecord.lines.forEach(line => {
        if (line.speakerId === nameRecord.nameId) {
          linesCount++;
        }
      });
    });

    await namesCollection().updateOne(
      { _id: nameRecord._id },
      {
        $set: {
          linesCount
        }
      }
    );
  }

  await namesCollection().createIndex('linesCount');
}
