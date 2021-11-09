import { messagesCollection, namesCollection, usersCollection } from '../src/mongo';

export async function up(): Promise<void> {
  await messagesCollection().createIndex('timeUpdated');

  await namesCollection().createIndex('nameId', { unique: true });
  await namesCollection().createIndex('timeUpdated');

  await usersCollection().createIndex('token', { unique: true });
  await usersCollection().createIndex('createdAt');
  await usersCollection().createIndex('updatedAt');
}
