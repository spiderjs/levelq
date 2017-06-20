"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_typescript_1 = require("mocha-typescript");
const src_1 = require("../src");
const log4js = require("log4js");
const assert = require("assert");
const logger = log4js.getLogger('fq');
const service = new src_1.LevelQService('./fq', 10);
let fq;
let FQTest = class FQTest {
    createLevelQ(done) {
        service.createQ('test')
            .subscribe((q) => {
            fq = q;
            done();
        }, (error) => {
            done(error);
        });
    }
    insertTest(done) {
        const counter = 10000;
        let index = 0;
        for (let i = 0; i < counter; i++) {
            fq.push({ i })
                .subscribe(() => {
                index++;
                if (index === counter) {
                    assert(fq.size() === counter);
                    done();
                }
            }, (error) => {
                done(error);
            });
        }
    }
    popTest(done) {
        const counter = fq.size();
        let index = 0;
        for (let i = 0; i < counter; i++) {
            const z = i;
            fq.pop()
                .subscribe((data) => {
                index++;
                assert(data.i === z, 'pop data check');
                if (index === counter) {
                    assert(fq.size() === 0, 'size test');
                    done();
                }
            }, (error) => {
                done(error);
            });
        }
    }
    closeLevelQ(done) {
        service.closeQ('test')
            .subscribe(() => {
            done();
        }, (error) => {
            done(error);
        });
    }
};
__decorate([
    mocha_typescript_1.test('create levelq'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FQTest.prototype, "createLevelQ", null);
__decorate([
    mocha_typescript_1.test('insert data'),
    mocha_typescript_1.timeout(10000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FQTest.prototype, "insertTest", null);
__decorate([
    mocha_typescript_1.test('pop data'),
    mocha_typescript_1.timeout(10000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FQTest.prototype, "popTest", null);
__decorate([
    mocha_typescript_1.test('close levelq'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FQTest.prototype, "closeLevelQ", null);
FQTest = __decorate([
    mocha_typescript_1.suite('engine test')
], FQTest);
//# sourceMappingURL=fq_test.js.map