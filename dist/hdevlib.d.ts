/// <reference types="chai" />
/// <reference types="react" />
import * as mocha from 'mocha';
import { expect as l_expect } from 'chai';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
declare global  {
    let expect: typeof l_expect;
    let reactRender: typeof _reactRender;
}
export { mocha };
export declare function _reactRender<P>(e: React.ReactElement<P>): {
    renderer: TestRenderer.ReactTestRenderer;
    root: TestRenderer.ReactTestInstance;
    byClassName(className: string): TestRenderer.ReactTestInstance;
    textContent(className: string, expectedTextContent: string): void;
};
