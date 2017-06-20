import {
    only, skip, slow, suite, test, timeout,
} from 'mocha-typescript';

import {
    IFIFO, LevelQService,
} from '../src';

import log4js = require('log4js');
import crypto = require('crypto');
import assert = require('assert');

const logger = log4js.getLogger('fq');

const service = new LevelQService('./fq', 10);

let fq: IFIFO;

@suite('engine test')
class FQTest {
    @test('create levelq')
    public createLevelQ(done: any) {
        service.createQ('test')
            .subscribe((q) => {
                fq = q;
                done();
            }, (error) => {
                done(error);
            });
    }

    @test('insert data')
    @timeout(10000)
    public insertTest(done: any) {
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

    @test('pop data')
    @timeout(10000)
    public popTest(done: any) {
        const counter = fq.size();
        let index = 0;
        for (let i = 0; i < counter; i++) {
            const z = i;
            fq.pop<any>()
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

    @test('close levelq')
    public closeLevelQ(done: any) {
        service.closeQ('test')
            .subscribe(() => {
                done();
            }, (error) => {
                done(error);
            });
    }
}
