import * as fs from 'fs';
import { Buffer } from 'buffer';

let envJson: {
  SERVER: {
    PORT: number;
    LOGIN_REDIRECT: string;
  };
  DB_URI: string;
  GOOGLE: {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    CALLBACK_HOST: string;
  };
};

if (process.env.CONFIG_BASE64) {
  envJson = JSON.parse(Buffer.from(process.env.CONFIG_BASE64, 'base64').toString('utf-8'));
} else {
  envJson = JSON.parse(fs.readFileSync('./config.json', { encoding: 'utf-8' }));
}

export const env = envJson;
