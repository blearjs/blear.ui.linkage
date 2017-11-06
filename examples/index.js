/**
 * 文件描述
 * @author ydr.me
 * @create 2017-11-06 11:18
 * @update 2017-11-06 11:18
 */


'use strict';

var Linkage = require('../src/index');
var districtData = require('../data/district.json');
var array = require('blear.utils.array');
var object = require('blear.utils.object');

var districtDataMap = {
    0: []
};

var eachChildren = function (item) {
    districtDataMap[item.value] = item.children;

    if (!item.children) {
        return;
    }

    array.each(item.children, function (index, child) {
        eachChildren(child);
    });
};

array.each(districtData, function (index, item) {
    districtDataMap[0].push(item);
    eachChildren(item);
});

console.log(districtDataMap);

var linkage = new Linkage({
    el: '#demo select',
    placeholder: {
        text: function (index) {
            return '请选择' + ['省份', '城市', '区域'][index];
        },
        value: ''
    },
    getData: function (index, parent, next) {
        if (index && !parent) {
            return next([]);
        }

        setTimeout(function () {
            next(districtDataMap[parent || 0]);
        }, 500);
    }
});


linkage.on('beforeProcess', function () {
    var els = linkage.getElements();
    array.each(els, function (index, el) {
        el.disabled = true;
    });
});

var select0El = linkage.getElements()[0];
var select1El = linkage.getElements()[1];
var select2El = linkage.getElements()[2];

linkage.on('afterProcess', function () {
    var els = linkage.getElements();
    array.each(els, function (index, el) {
        el.disabled = false;
    });
});

linkage.on('change', function (val) {
    console.log('change =>', val);
});

linkage.setValue([0]);
