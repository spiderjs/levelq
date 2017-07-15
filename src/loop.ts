import {
    IFIFO, LevelQService,
} from '../src';
import rx = require('rx');
import log4js = require('log4js');

const logger = log4js.getLogger('fq');
const service = new LevelQService('./fq', 10);

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
    },
    (error) => {
        logger.error(error);
    },
    () => {
        logger.debug(`test -- completed`);
    });
