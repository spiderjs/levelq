"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const rx = require("rx");
const log4js = require("log4js");
const logger = log4js.getLogger('fq');
const service = new src_1.LevelQService('./fq', 10);
service.createQ('test')
    .flatMap((fifo) => {
    return rx.Observable.timer(0, 10).map(() => fifo);
})
    .flatMap((fifo) => {
    return fifo
        .push({ hello: '-------------------------' })
        .map(() => fifo);
})
    .flatMap((fifo) => {
    return fifo.pop();
})
    .subscribe(() => {
    logger.debug(`test ....`);
}, (error) => {
    logger.error(error);
}, () => {
    logger.debug(`test -- completed`);
});
//# sourceMappingURL=loop.js.map