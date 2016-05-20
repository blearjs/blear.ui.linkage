/**
 * # 数据格式
 * ```
 * [{
 *     text: "文本",
 *     value: "值"
 * }]
 * ```
 * @author ydr.me
 * @create 2016-05-09 13:59
 */



'use strict';

var UI =       require('blear.ui');
var object =   require('blear.utils.object');
var array =    require('blear.utils.array');
var howdo =    require('blear.utils.howdo');
var typeis =   require('blear.utils.typeis');
var fun =      require('blear.utils.function');
var selector = require('blear.core.selector');
var event =    require('blear.core.event');

var defaults = {
    el: 'select',
    placeholder: {
        text: '请选择',
        value: ''
    }
};

var Linkage = UI.extend({
    className: 'Linkage',
    constructor: function (options) {
        var the = this;

        Linkage.parent(the);
        the[_options] = options = object.assign(true, {}, defaults, options);
        the[_selectEls] = selector.query(options.el);
        the[_value] = [];
        the[_processing] = false;
        the.length = the[_selectEls].length;
        // 公开的 cache，便于继承对象重写
        the._cache = {};
        the[_onChangeEvents] = [];
        the[_initChangeEvent]();
    },


    /**
     * 设置值
     * @param value
     * @param callback
     * @returns {Linkage}
     */
    setValue: function (value, callback) {
        var the = this;

        the[_value] = value;
        the[_setValue](0, callback);

        return the;
    },


    /**
     * 获取当前选中的值
     * @returns {*}
     */
    getValue: function () {
        return this[_value];
    },


    /**
     * 获取元素
     * @returns {*}
     */
    getElements: function () {
        return this[_selectEls];
    },


    /**
     * 销毁实例
     */
    destroy: function () {
        var the = this;

        array.each(the[_selectEls], function (index, el) {
            event.un(el, 'change', the[_onChangeEvents][index]);
        });

        Linkage.parent.destroy(the);
    }
});
var pro = Linkage.prototype;
var _options = Linkage.sole();
var _processing = Linkage.sole();
var _selectEls = Linkage.sole();
var _setValue = Linkage.sole();
var _getData = Linkage.sole();
var _value = Linkage.sole();
var _renderHTML = Linkage.sole();
var _renderSelect = Linkage.sole();
var _onChangeEvents = Linkage.sole();
var _initChangeEvent = Linkage.sole();
var _resetToPlaceholder = Linkage.sole();


/**
 * a、b 是否相似
 * @param a
 * @param b
 * @returns {boolean}
 */
var isLike = function (a, b) {
    return String(a) === String(b);
};


/**
 * 初始化 onchange
 */
pro[_initChangeEvent] = function () {
    var the = this;
    var options = the[_options];

    array.each(the[_selectEls], function (index, el) {
        event.on(el, 'change', the[_onChangeEvents][index] = function () {
            if (the[_processing]) {
                return;
            }

            var value = this.value;
            var then = index + 1;

            the[_value][index] = value;

            while (then < the[_value].length) {
                the[_value][then] = options.placeholder.value;
                then++;
            }

            the[_setValue](index, function () {
                the.emit('change', the[_value]);
            });
        });
    });
};


/**
 * 重置为占位状态
 * @param start
 */
pro[_resetToPlaceholder] = function (start) {
    var the = this;
    var options = the[_options];
    var html = the[_renderHTML](0, [options.placeholder], options.placeholder.value);

    while (start < the.length) {
        the[_selectEls][start].innerHTML = html;
        start++;
    }
};


/**
 * 设置值
 * @param start
 * @param callback
 */
pro[_setValue] = function (start, callback) {
    var the = this;

    if (the[_processing]) {
        return;
    }

    the[_resetToPlaceholder](start);
    callback = fun.noop(callback);
    the[_processing] = true;
    the.emit('beforeProcess');
    var queue = new Array(the.length - start);

    howdo
        .each(queue, function (index, _, next) {
            index = index + start;
            var parent = the[_value][index - 1];

            the[_getData](index, parent, function (list) {
                the[_renderSelect](index, list);
                next();
            });
        })
        .follow(function () {
            the[_processing] = false;
            the.emit('afterProcess');
            callback.call(the);
        });
};


/**
 * 渲染 html
 * @param index
 * @param list
 * @param value
 * @returns {string}
 */
pro[_renderHTML] = function (index, list, value) {
    var html = '';

    array.each(list, function (_, item) {
        var selected = isLike(value, item.value);

        html += '<option ' + (selected ? 'selected' : '') +
            ' value="' + item.value + '">' + item.text + '</option>'
    });

    return html;
};


/**
 * 渲染 select
 * @param index
 * @param list
 */
pro[_renderSelect] = function (index, list) {
    var the = this;
    var selectEl = the[_selectEls][index];
    var value = the[_value][index];
    var options = the[_options];
    var html = the[_renderHTML](index, [options.placeholder], value);

    html += the[_renderHTML](index, list, value);
    selectEl.innerHTML = html;
};


/**
 * 获取数据
 * @param index
 * @param parent
 * @param callback
 */
pro[_getData] = function (index, parent, callback) {
    var the = this;
    var id = [index, parent].join('ø');
    var list = the._cache[id];

    if (list) {
        return callback(list);
    }

    the.emit('data', index, parent, function (list) {
        the._cache[id] = list;
        callback(list);
    });
};


Linkage.defaults = defaults;
module.exports = Linkage;
