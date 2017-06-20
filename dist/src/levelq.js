"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rx = require("rx");
const fs = require("fs");
const path = require("path");
const log4js = require("log4js");
const levelup = require("levelup");
const logger = log4js.getLogger('fq');
class LevelQ {
    constructor(name, rootpath) {
        this.name = name;
        this.start = 0;
        this.end = 0;
        this.writeindex = 0;
        this.dbpath = '';
        this.dbpath = path.join(process.cwd(), 'fq', name);
        this.db = levelup(this.dbpath, { valueEncoding: 'json' });
    }
    open() {
        return rx.Observable.create((ob) => {
            this.getIndex((error) => {
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
    close() {
        this.db.close();
        return rx.Observable.create((ob) => {
            setTimeout(() => {
                this.deleteFolderRecursive(this.dbpath);
                ob.onNext({});
                ob.onCompleted();
            }, 4000);
        });
    }
    push(obj) {
        const index = this.writeindex;
        this.writeindex++;
        logger.debug(`[${this.name}] insert data at index(${this.start},${index})`);
        return rx.Observable.create((observer) => {
            this.db.put(`${index}`, obj, (error) => {
                this.end++;
                if (error) {
                    logger.error(`[${this.name}] push data at index(${this.start},${index}) -- error`, error);
                    observer.onError(error);
                }
                else {
                    logger.debug(`[${this.name}] push data at index(${this.start},${index}) -- success`);
                    observer.onNext({});
                    observer.onCompleted();
                }
            });
        });
    }
    pop() {
        return rx.Observable.create((ob) => {
            this.doPop(ob);
        });
    }
    size() {
        return this.end - this.start;
    }
    saveindexer() {
        logger.info(`[${this.name}] save fq index(${this.start}, ${this.end}) ...`);
        this.db.put(`__fq_index`, { start: this.start, end: this.end }, (error) => {
            if (error) {
                logger.error(`[${this.name}] save fq index -- failed`, error);
            }
            else {
                logger.info(`[${this.name}] save fq index(${this.start}, ${this.end}) -- success`);
            }
        });
    }
    doPop(ob) {
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
                    this.doPop(ob);
                    return;
                }
                logger.debug(`[${this.name}] get data at index(${index}, ${this.end}) -- failed`, error);
                ob.onError(error);
                return;
            }
            this.db.del(`${index}`, (error2) => {
                if (error2) {
                    logger.error(`[${this.name}] delete data at index(${index}, ${this.end}) -- failed`, error);
                }
                else {
                    logger.debug(`[${this.name}] delete data at index(${index}, ${this.end}) -- success`);
                }
            });
            logger.debug(`[${this.name}] get data at index(${index}, ${this.end}) -- success`);
            ob.onNext(value);
            ob.onCompleted();
        });
    }
    getIndex(callback) {
        logger.info(`[${this.name}] load fq index ...`);
        this.db.get(`__fq_index`, (error, value) => {
            if (error) {
                if (error.notFound) {
                    logger.info(`[${this.name}] load fq index -- not found`);
                    callback();
                    return;
                }
                logger.error(`[${this.name}] load fq index -- failed`, error);
            }
            else {
                this.start = value.start;
                this.end = value.end;
                this.writeindex = value.end;
                logger.info(`[${this.name}] load fq index -- success(${this.start}, ${this.end})`);
            }
            callback(error);
        });
    }
    deleteFolderRecursive(path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach((file, index) => {
                const curPath = path + '/' + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.deleteFolderRecursive(curPath);
                }
                else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }
}
exports.LevelQ = LevelQ;
//# sourceMappingURL=levelq.js.map