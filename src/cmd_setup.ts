import { setupTypeScript } from './build/buildTypeScript';
import { utils } from './utils';

export async function cmd_setup(args: any): Promise<boolean> {
  const tipo: string = args.tipo;
  const packageName: string = args.packageName;
  utils.getPackageJsonFor(packageName);
  utils.add_to_git_ignore(packageName,
    'dist/**/*.test.*',
    'dist/**/__tests__',
  );
  if (tipo === 'typescript') {
    setupTypeScript(packageName, false);
    return true;
  } else if (tipo === 'react') {
    setupTypeScript(packageName, true);
    return true;
  }
  return false;
}
