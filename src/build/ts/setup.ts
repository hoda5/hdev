import { writeFileSync, readFileSync } from 'fs';
import { utils } from '../../utils';
import { resolve, join } from 'path';

export function projectUsesTypeScript(packageName: string) {
  return utils.exists(packageName, 'tsconfig.json');
}

export async function setupTypeScript(name: string, withReact: boolean) {
  ajust_packagejson();
  save_tsconfig();
  save_tslint();
  install_pkgs();
  async function ajust_packagejson() {
    const packageJSON = await utils.getPackageJsonFor(name);
    if (!packageJSON.scripts) {
      packageJSON.scripts = {};
    }
    packageJSON.scripts.build = 'tsc';
    packageJSON.scripts.watch = 'tsc -w';
    packageJSON.scripts.lint = 'tslint --project .';
    packageJSON.scripts.lintfix = 'tslint --project . --fix';
    if (packageJSON.dependencies && packageJSON.dependencies.react) withReact = true;
    packageJSON.jest = {
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
      moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
      ],
      coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
      ],
      collectCoverage: true,
      coverageReporters: [
        'json-summary',
        'lcov',
        'text',
      ],
    };
    writeFileSync(utils.path(name, 'package.json'),
      JSON.stringify(packageJSON, null, 2), 'utf-8');
  }
  function save_tsconfig() {
    const tsconfig = JSON.parse(readFileSync(resolve(join(__dirname, '../../tsconfig.json')), 'utf-8'));
    if (withReact) tsconfig.compilerOptions.lib.push('dom');
    writeFileSync(utils.path(name, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2), 'utf-8');
  }
  function save_tslint() {
    const tslint = JSON.parse(readFileSync(resolve(join(__dirname, '../../tslint.json')), 'utf-8'));
    writeFileSync(utils.path(name, 'tslint.json'),
      JSON.stringify(tslint, null, 2), 'utf-8');
  }
  function install_pkgs() {
    const argsDeps = [
    ];
    if (!/^@hoda5\/(hdev|h5global)$/g.test(name)) {
      argsDeps.push('@hoda5/h5global@latest');
    }
    const argsDevs = [
      'typescript@latest',
      'tslint@latest',
      'jest@latest',
      'ts-jest@latest',
      '@types/jest@latest',
    ];
    if (!/^@hoda5\/(hdev)$/g.test(name)) {
      argsDevs.push('@hoda5/h5dev@latest');
    }
    if (withReact) {
      argsDeps.push('react@latest');
      argsDevs.push('@types/react@latest');
    }
    if (argsDeps.length) {
      utils.exec('npm', ['install', '--save', ...argsDeps], { cwd: utils.path(name), title: '' });
    }
    if (argsDevs.length) {
      utils.exec('npm', ['install', '--save-dev', ...argsDevs], { cwd: utils.path(name), title: '' });
    }
  }
}
