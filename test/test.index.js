/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var Linkage = require('../src/index.js');
var howdo = require('blear.utils.howdo');
var collection = require('blear.utils.collection');
var event = require('blear.core.event');
var districtData= require('district.json', 'json');


describe('测试文件', function () {
    it('3', function (done) {
        var divEl = document.createElement('div');

        divEl.id = 'lk' + new Date().getTime();
        divEl.innerHTML = '<select></select><select></select><select></select>';


        document.body.appendChild(divEl);

        var linkage = new Linkage({
            el: '#' + divEl.id + ' select'
        });
        var districtDataMap = {
            0: []
        };

        var eachChildren = function (item) {
            districtDataMap[item.value] = item.children;

            collection.each(item.children, function (index, child) {
                eachChildren(child);
            });
        };

        collection.each(districtData, function (index, item) {
            districtDataMap[0].push(item);
            eachChildren(item);
        });

        console.log(districtDataMap);

        linkage.on('data', function (index, parent, next) {
            setTimeout(function () {
                next(districtDataMap[parent || 0]);
            }, 1);
        });

        linkage.on('beforeProcess', function () {
            var els = linkage.getElements();
            collection.each(els, function (index, el) {
                el.disabled = true;
            });
        });

        var select0El = linkage.getElements()[0];
        var select1El = linkage.getElements()[1];
        var select2El = linkage.getElements()[2];

        linkage.on('afterProcess', function () {
            var els = linkage.getElements();
            collection.each(els, function (index, el) {
                el.disabled = false;
            });
        });

        var delay = function (next) {
            setTimeout(function () {
                next();
            }, 1);
        };

        howdo
            .task(function (next) {
                linkage.setValue([1, 11, 111], next);
                linkage.setValue([1, 11, 111]);
            })
            .task(function (next) {
                select0El.value = '2';
                event.emit(select0El, 'change');

                setTimeout(function () {
                    expect(select0El.value).toEqual('2');
                    expect(select1El.value).toEqual('');
                    expect(select2El.value).toEqual('');
                    next();
                }, 300);
            })
            .task(function (next) {
                select1El.value = '22';
                event.emit(select1El, 'change');
                setTimeout(function () {
                    expect(select0El.value).toEqual('2');
                    expect(select1El.value).toEqual('22');
                    expect(select2El.value).toEqual('');
                    next();
                }, 300);
            })
            .task(function (next) {
                select2El.value = '222';
                event.emit(select2El, 'change');
                event.emit(select2El, 'change');
                setTimeout(function () {
                    expect(select0El.value).toEqual('2');
                    expect(select1El.value).toEqual('22');
                    expect(select2El.value).toEqual('222');
                    next();
                }, 300);
            })
            .task(function (next) {
                expect(linkage.getValue()).toEqual(['2', '22', '222']);

                delay(next);
            })
            .task(function (next) {
                linkage.destroy();
                document.body.removeChild(divEl);
                delay(next);
            })
            .follow(done);
    }, 100000);
});
