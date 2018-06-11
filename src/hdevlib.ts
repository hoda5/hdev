import * as mocha from 'mocha';
import { expect as l_expect } from 'chai';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';

if (typeof window === 'undefined') {
    let MockBrowser = require('mock-browser').mocks.MockBrowser;
    let mock = new MockBrowser();
    (global as any).window = MockBrowser.createWindow();
    (global as any).document = mock.getDocument();
    (global as any).navigator = mock.getNavigator();
    (global as any).location = mock.getLocation();
    (global as any).history = mock.getHistory();
    (global as any).localStorage = mock.getLocalStorage();
    (global as any).sessionStorage = mock.getSessionStorage();
    require('core-js/es6/map');
    require('core-js/es6/set');
}

declare global {
    let expect: typeof l_expect;
    let reactRender: typeof _reactRender;
}
(global as any).expect = l_expect;
(global as any).reactRender = _reactRender;

export {
    mocha
}

export function _reactRender<P>(e: React.ReactElement<P>) {
    const renderer = TestRenderer.create(e);
    const root = renderer.root;
    return {
        renderer,
        root,
        byClassName(className: string) {
            return root.findByProps({ className });
        },
        textContent(className: string, expectedTextContent: string) {
            expect(root.findByProps({ className }).children).to.be.eqls([expectedTextContent]);
        }
    }
}

// if (!describe) describe = mocha.describe;
// if (!it) it = mocha.it;
// import {getErrorSource} from 'source-map-support';
// export {
//     describe,
//     it,
//     expect
// };

// getErrorSource()
