import { IFIFO, ISave } from './api';
import { LevelQ } from './levelq';

import rx = require('rx');
import log4js = require('log4js');

const logger = log4js.getLogger('fq');

export class LevelQService {
    private qs = new Map<string, ISave>();
    private timer: any;
    private processing = false;
    constructor(private rootpath: string, private autosave: number) {

    }

    public createQ(name: string): rx.Observable<IFIFO> {
        const q = new LevelQ(name, this.rootpath);

        return q.open().map(() => {
            this.saveQ(name, q);
            return q;
        });
    }

    public closeQ(name: string): rx.Observable<{}> {

        const fq = this.qs.get(name);

        if (fq) {
            this.qs.delete(name);

            if (this.qs.size === 0 && this.timer) {
                clearInterval(this.timer);
                this.timer = undefined;
            }

            return fq.close();
        }

        return rx.Observable.just({});
    }

    private saveQ(name: string, fq: ISave) {

        if (this.qs.size === 0) {
            this.timer = setInterval(() => {
                this.processSave();
            }, this.autosave * 1000);
        }

        this.qs.set(name, fq);
    }

    private processSave() {
        if (this.processing) {
            return;
        }

        this.processing = true;

        for (const fq of this.qs.values()) {
            fq.saveindexer();
        }

        this.processing = false;
    }
}
