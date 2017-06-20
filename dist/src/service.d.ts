/// <reference types="rx-core" />
/// <reference types="rx-core-binding" />
/// <reference types="rx-lite" />
/// <reference types="rx-lite-aggregates" />
/// <reference types="rx-lite-backpressure" />
/// <reference types="rx-lite-coincidence" />
/// <reference types="rx-lite-experimental" />
/// <reference types="rx-lite-joinpatterns" />
/// <reference types="rx-lite-time" />
import { IFIFO } from './api';
import rx = require('rx');
export declare class LevelQService {
    private rootpath;
    private autosave;
    private qs;
    private timer;
    private processing;
    constructor(rootpath: string, autosave: number);
    createQ(name: string): rx.Observable<IFIFO>;
    closeQ(name: string): rx.Observable<{}>;
    private saveQ(name, fq);
    private processSave();
}
