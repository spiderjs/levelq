/// <reference types="rx-core" />
/// <reference types="rx-core-binding" />
/// <reference types="rx-lite" />
/// <reference types="rx-lite-aggregates" />
/// <reference types="rx-lite-backpressure" />
/// <reference types="rx-lite-coincidence" />
/// <reference types="rx-lite-experimental" />
/// <reference types="rx-lite-joinpatterns" />
/// <reference types="rx-lite-time" />
import rx = require('rx');
export interface IFIFO extends ISave {
    name: string;
    push<T>(obj: T): rx.Observable<{}>;
    pop<T>(): rx.Observable<T>;
    size(): number;
}
export interface ISave {
    saveindexer(): void;
    close(): rx.Observable<{}>;
    open(): rx.Observable<{}>;
}
