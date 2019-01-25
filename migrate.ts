import * as fs from 'fs';

import { getMongoClient, migrationsCollection } from './mongo';

async function migrate() {
  const mongoClient = await getMongoClient();

  const files = fs.readdirSync('./migrations');

  const migrationNames: string[] = await migrationsCollection().distinct('name', {});

  for (const fileName of files) {
    if (migrationNames.includes(fileName)) {
      continue;
    }

    const { up } = await import(`./migrations/${fileName}`);

    await up();

    await migrationsCollection().insertOne({
      name: fileName,
      timeCreated: new Date()
    });

    console.log(`${fileName} migration done.`);
  }

  await mongoClient.close();
}

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});

migrate().catch(error => {
  throw error;
});
