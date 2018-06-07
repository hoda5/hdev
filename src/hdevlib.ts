import * as mocha from 'mocha';
import { expect as l_expect } from 'chai';
declare global {
    let expect: typeof l_expect;
}
(global as any).expect = l_expect;

export {
    mocha
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
