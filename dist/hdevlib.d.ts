/// <reference types="chai" />
import * as mocha from 'mocha';
import { expect as l_expect } from 'chai';
declare global  {
    let expect: typeof l_expect;
}
export { mocha };
