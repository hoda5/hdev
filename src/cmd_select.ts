import { utils } from './utils';

export async function cmd_select(args: any): Promise<boolean> {
  return utils.root !== args;
}
