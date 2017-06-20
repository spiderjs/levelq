import {
    IFIFO,
} from './api';

import rx = require('rx');
import fs = require('fs');
import path = require('path');
import log4js = require('log4js');
import levelup = require('levelup');

const logger = log4js.getLogger('fq');

export class LevelQ implements IFIFO {
    private db: levelup.LevelUp;
    private start = 0;
    private end = 0;
    private writeindex = 0;
    private dbpath = '';

    constructor(public name: string, rootpath: string) {
        this.dbpath = path.join(process.cwd(), 'fq', name);

        this.db = levelup(this.dbpath, { valueEncoding: 'json' });
    }

    public open(): rx.Observable<{}> {
        return rx.Observable.create((ob) => {
            this.getIndex((error: any) => {
                if (error) {
                    ob.onError(error);
                    close();
                    return;
                }

                ob.onNext({});
                ob.onCompleted();
            });
        });
    }

    public close(): rx.Observable<{}> {
        this.db.close();
        return rx.Observable.create((ob) => {
            setTimeout(() => {
                this.deleteFolderRecursive(this.dbpath);
                ob.onNext({});
                ob.onCompleted();
            }, 4000);
        });
    }

    public push<T>(obj: T): rx.Observable<{}> {
        const index = this.writeindex;

        this.writeindex++;

        logger.debug(`[${this.name}] insert data at index(${this.start},${index})`);

        return rx.Observable.create((observer) => {
            this.db.put(`${index}`, obj, (error) => {
                this.end++;
                if (error) {
                    logger.error(`[${this.name}] push data at index(${this.start},${index}) -- error`, error);
                    observer.onError(error);
                } else {
                    logger.debug(`[${this.name}] push data at index(${this.start},${index}) -- success`);
                    observer.onNext({});
                    observer.onCompleted();
                }
            });
        });
    }

    public pop<T>(): rx.Observable<T> {
        return rx.Observable.create<T>((ob) => {
            this.doPop(ob);
        });
    }

    public size(): number {
        return this.end - this.start;
    }

    public saveindexer() {
        logger.info(`[${this.name}] save fq index(${this.start}, ${this.end}) ...`);

        this.db.put(`__fq_index`, { start: this.start, end: this.end }, (error) => {
            if (error) {
                logger.error(`[${this.name}] save fq index -- failed`, error);
            } else {
                logger.info(`[${this.name}] save fq index(${this.start}, ${this.end}) -- success`);
            }
        });
    }

    private doPop<T>(ob: rx.Observer<T>): void {
        if (this.start >= this.end) {
            ob.onCompleted();
            return;
        }

        const index = this.start;
        this.start++;

        logger.debug(`[${this.name}] get data at index(${index}, ${this.end}) ...`);

        this.db.get(`${index}`, (error, value) => {
            if (error) {
                if (error.notFound) {
                    logger.debug(`[${this.name}] get data at index(${index}, ${this.end}) -- not found`);
                    this.doPop<T>(ob);
                    return;
                }

                logger.debug(`[${this.name}] get data at index(${index}, ${this.end}) -- failed`, error);
                ob.onError(error);
                return;
            }

            this.db.del(`${index}`, (error2) => {
                if (error2) {
                    logger.error(`[${this.name}] delete data at index(${index}, ${this.end}) -- failed`, error);
                } else {
                    logger.debug(`[${this.name}] delete data at index(${index}, ${this.end}) -- success`);
                }
            });

            logger.debug(`[${this.name}] get data at index(${index}, ${this.end}) -- success`);
            ob.onNext(value);
            ob.onCompleted();
        });
    }

    private getIndex(callback: any) {
        logger.info(`[${this.name}] load fq index ...`);
        this.db.get(`__fq_index`, (error, value) => {
            if (error) {
                if (error.notFound) {
                    logger.info(`[${this.name}] load fq index -- not found`);
                    callback();
                    return;
                }
                logger.error(`[${this.name}] load fq index -- failed`, error);
            } else {
                this.start = value.start;
                this.end = value.end;
                this.writeindex = value.end;

                logger.info(`[${this.name}] load fq index -- success(${this.start}, ${this.end})`);
            }

            callback(error);
        });
    }

    private deleteFolderRecursive(path: string) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach((file, index) => {
                const curPath = path + '/' + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    this.deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }
}
