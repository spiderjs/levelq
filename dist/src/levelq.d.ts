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
export declare class LevelQ implements IFIFO {
    name: string;
    private db;
    private start;
    private end;
    private writeindex;
    private dbpath;
    constructor(name: string, rootpath: string);
    open(): rx.Observable<{}>;
    close(): rx.Observable<{}>;
    push<T>(obj: T): rx.Observable<{}>;
    pop<T>(): rx.Observable<T>;
    size(): number;
    saveindexer(): void;
    private doPop<T>(ob);
    private getIndex(callback);
    private deleteFolderRecursive(path);
}
