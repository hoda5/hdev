"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mocha = require("mocha");
exports.mocha = mocha;
var chai_1 = require("chai");
var TestRenderer = require("react-test-renderer");
if (typeof window === 'undefined') {
    var MockBrowser = require('mock-browser').mocks.MockBrowser;
    var mock = new MockBrowser();
    global.window = MockBrowser.createWindow();
    global.document = mock.getDocument();
    global.navigator = mock.getNavigator();
    global.location = mock.getLocation();
    global.history = mock.getHistory();
    global.localStorage = mock.getLocalStorage();
    global.sessionStorage = mock.getSessionStorage();
    require('core-js/es6/map');
    require('core-js/es6/set');
}
global.expect = chai_1.expect;
global.reactRender = _reactRender;
function _reactRender(e) {
    var renderer = TestRenderer.create(e);
    var root = renderer.root;
    return {
        renderer: renderer,
        root: root,
        byClassName: function (className) {
            return root.findByProps({ className: className });
        },
        textContent: function (className, expectedTextContent) {
            expect(root.findByProps({ className: className }).children).to.be.eqls([expectedTextContent]);
        }
    };
}
exports._reactRender = _reactRender;
// if (!describe) describe = mocha.describe;
// if (!it) it = mocha.it;
// import {getErrorSource} from 'source-map-support';
// export {
//     describe,
//     it,
//     expect
// };
// getErrorSource()
//# sourceMappingURL=hdevlib.js.map