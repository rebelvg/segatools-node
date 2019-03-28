import { Context } from 'koa';
import { chapters } from './data/chapters';

export async function find(ctx: Context, next) {
  ctx.body = chapters;
}
