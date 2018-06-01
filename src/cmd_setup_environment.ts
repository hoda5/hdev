import { utils } from './utils';
import { readFileSync, writeFileSync } from 'fs';

export function check_environment() {
  const npmOk = process.env.NPM_PACKAGES === process.env.HOME + '/.npm-packages';
  return npmOk;
}
export function cmd_setup_environment() {
  const shell = 'bash'; // args.shell
  const BEGIN_HDEV_CONFIG = '### begin hdev config ###';
  const END_HDEV_CONFIG = '### end hdev config ###';
  const HOME = process.env.HOME;

  const bashcfg: string[] =
    [
      BEGIN_HDEV_CONFIG,
      ...env(),
      ...completion(),
      END_HDEV_CONFIG,
    ];
  save_bashrc();
  save_npmrc();
  // tslint:disable-next-line:no-console
  console.log('ambiente configurado. Reinicie o terminal');
  return true;

  function env() {
    return [
      'alias hdev="' + process.argv[1] + '"',
      'export NPM_PACKAGES="' + HOME + '/.npm-packages"',
      'export PATH="$NPM_PACKAGES/bin:$PATH"',
      'unset MANPATH',
      'export MANPATH="$NPM_PACKAGES/share/man:$(manpath)"',
    ];
  }

  function completion() {
    const lines = utils.pipe(process.argv[0], [process.argv[1], 'completion', shell], {
      cwd: process.cwd(),
      title: '',
    }).out.replace(/hdev\.js/g, 'hdev').split('\n');
    return lines.filter((l) => l && !/###/g.test(l));
  }
  function save_bashrc() {
    let lines = readFileSync(HOME + '/.bashrc', 'utf-8').split('\n');
    let ignore = false;
    lines = lines.filter((line) => {
      const isBegin = line === BEGIN_HDEV_CONFIG;
      const isEnd = line === END_HDEV_CONFIG;
      if (isBegin) ignore = true;
      const r = !ignore;
      if (isEnd) ignore = false;
      return r;
    });
    while (lines.length && (!lines[lines.length - 1].trim())) lines.pop();
    lines.push('', ...bashcfg);
    writeFileSync(HOME + '/.bashrc', lines.join('\n'), 'utf-8');
  }
  function save_npmrc() {
    const lines = [
      'prefix=' + HOME + '/.npm-packages',
    ];
    writeFileSync(HOME + '/.npmrc', lines.join('\n'), 'utf-8');
  }
}
