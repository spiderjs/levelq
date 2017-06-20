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
