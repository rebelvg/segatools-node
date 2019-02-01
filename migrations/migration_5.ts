import { namesCollection } from '../mongo';

export async function up(): Promise<void> {
  const allNames = await namesCollection()
    .find()
    .toArray();

  for (const nameRecord of allNames) {
    const timeUpdated =
      nameRecord._id.getTimestamp() > nameRecord.timeUpdated ? nameRecord._id.getTimestamp() : nameRecord.timeUpdated;

    await namesCollection().updateOne(
      { _id: nameRecord._id },
      {
        $set: {
          timeCreated: nameRecord._id.getTimestamp(),
          timeUpdated
        }
      }
    );
  }

  await namesCollection().createIndex('timeCreated');
}
