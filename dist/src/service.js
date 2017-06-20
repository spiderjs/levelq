"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const levelq_1 = require("./levelq");
const rx = require("rx");
const log4js = require("log4js");
const logger = log4js.getLogger('fq');
class LevelQService {
    constructor(rootpath, autosave) {
        this.rootpath = rootpath;
        this.autosave = autosave;
        this.qs = new Map();
        this.processing = false;
    }
    createQ(name) {
        const q = new levelq_1.LevelQ(name, this.rootpath);
        return q.open().map(() => {
            this.saveQ(name, q);
            return q;
        });
    }
    closeQ(name) {
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
    saveQ(name, fq) {
        if (this.qs.size === 0) {
            this.timer = setInterval(() => {
                this.processSave();
            }, this.autosave * 1000);
        }
        this.qs.set(name, fq);
    }
    processSave() {
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
exports.LevelQService = LevelQService;
//# sourceMappingURL=service.js.map