import { importMessages } from '../scripts/import-messages';
import { importNames } from '../scripts/import-names';

export async function up(): Promise<void> {
  await importMessages();
  await importNames();
}
