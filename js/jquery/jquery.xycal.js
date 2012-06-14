/**
 * XYBASE Simple Calendar/Event Layout Component
 *
 * jquery.xycal.js v1.0.7
 *
 * Developer: Imam Kurniawan <geekzy@gmail.com><imam@xybase.com>
 * Copyright (c) 2012 XYBASE <http://www.xybase.com>
 *
 * Methods:
 * - getSelected :
 *   Get curently selected day
 *   return day object of selected day
 *
 * - setSelected(date) :
 *   Set the selected date, all related callbacks will also be invoked
 *   param date the Date object of the selected date
 *   return the selected date as Date Object
 *
 * - today :
 *   Navigate to Today's date
 *
 * Callbacks:
 * - onLoaded :
 *   Callback when the xycal component is loaded, scope of this is the xycal instance
 *
 * - onChangeDay(selected, evented)
 *   Callback when the day is changed/selected, scope of this is the xycal instance
 *   param selected the latest selected date as Date Object
 *   param evented boolean value of the selected date has any event(s). true - has event(s); false - no event(s)
 *
 * - onChangeMonth(selected)
 *   Callback when the month is changed, scope of this is the xycal instance
 *   param selected the latest selected date as Date Object
 *
 * - onChangeYear(selected)
 *   Callback when the year is changed, scope of this is the xycal instance
 *   param selected the latest selected date as Date Object
 *
 * Changes:
 * - [10/05/12] Fix event list referencing issue when using configuration, get it straight from selector
 * - [11/05/12] Add options for callback such as when xycal is loaded, date selected, month change & year change
 *              Add public methods to get/set the selected date and navigate to today's date.
 * - [14/05/12] Fix DOM Event bug when switching to other screen, replace .live with .click and reinitialize after change month
 *              Add reload functionality, Use new templating engine, rewrite all templates into new format
 * - [15/05/12] Revert templates, to use the old templating engine.
 * - [29/05/12] Add class to header row to style it easily
 * - [11/06/12] Fix calculating first day of the month index day index must be within 0 and 6
 *              Fix populating next month, created new function to get next numeric value of month
 *              Cleanup code base on jsLint (www.jslint.com)
 * - [14/06/12] Fix bug to preserving default options.
 */
(function ($) {
    "use strict";
    $.fn.xycal = function (options, params) {
        if (this.length === 0) { return this; }
        // has been created before
        var cal = $.data(this[0], 'xycal');
        if (this.length === 1 && cal) {
            if (typeof (options) === 'string' && cal[options]) {
                cal[options].call(cal, params);
            }
            return cal;
        }
        // new instance
        if (this.length !== 1 || !cal) {
            return this.each(function () {
                var el = $(this),
                    xycal = new $.xycal(el, options || {});

                $.data(this, 'xycal', xycal);
                return xycal;
            });
        }
    };

    // xycal constructor | public interface: $.xycal
    $.xycal = function (el, opts) {
        var xycal = this;
        xycal.el = el;
        xycal.settings = $.extend(true, {}, $.xycal.defaults, opts);
        xycal.messages = $.xycal.messages;

        if (!el.is('table')) {
            el.append('<table/>');
            el = el.find('table');
            el.css({width: '100%', 'border-collapse': 'collapse'});
        }
        if (el.find('thead').length === 0) { el.append('<thead/>'); }
        if (el.find('tbody').length === 0) { el.append('<tbody/>'); }
        if (el.find('tfoot').length === 0) { el.append('<tfoot/>'); }
        xycal._init();
    };

    // xytable class definition
    $.extend(true, $.xycal, {
        defaults: {
            date: new Date(),
            weekstart: 1,
            totalDays: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            events: [],
            eventMark: '.',
            dateFormat: 'dd/MM/yyyy',
            timeFormat: 'HH:mm',
            format: '#{df} #{tf}',
            ul: '<ul data-role="listview" data-inset="true" data-dividertheme="b"></ul>',
            li: '<li>#{desc}</li>',
            div: '<li data-role="list-divider">#{time} - #{title}</li>',
            callback: {
                /**
                 * Callback when the xycal component is loaded, scope of this is the xycal instance
                 */
                onLoaded: $.noop,
                /**
                 * Callback when the day is changed/selected, scope of this is the xycal instance
                 * @param selected the latest selected date as Date Object
                 * @param evented boolean value of the selected date has any event(s). true - has event(s); false - no event(s)
                 */
                onChangeDay: $.noop,
                /**
                 * Callback when the month is changed, scope of this is the xycal instance
                 * @param selected the latest selected date as Date Object
                 */
                onChangeMonth: $.noop,
                /**
                 * Callback when the year is changed, scope of this is the xycal instance
                 * @param selected the latest selected date as Date Object
                 */
                onChangeYear: $.noop
            }
        },
        messages: {
            days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            months: ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'],
            noEvents: 'No Events',
            calTitle: '#{m} #{y}'
        },
        prototype: {
            /** Public Methods **/

            /**
             * Public interface to get curently selected day
             *
             * @return day object of selected day
             */
            getSelected: function () {
                var xycal = this,
                    selected = xycal.el.find('table td.ui-xycal-selected');

                return new Date(xycal.y, xycal.m, selected.length > 0 ? xycal.d : 1);
            },
            /**
             * Public interface to set the selected date
             *
             * @param date the Date object of the selected date
             * @return the selected date as Date Object
             */
            setSelected: function (date) {
                if (!date instanceof Date) {
                    throw "Parameter of the selected date must be a Date Object";
                }

                var xycal = this, evented, cy = xycal.y, cm = xycal.m,
                    y = date.getFullYear(),
                    m = date.getMonth(),
                    d = date.getDate();

                // hide events
                xycal.el.find('ul').slideUp(200);
                // update instance state
                xycal.y = y;
                xycal.m = m;
                xycal.d = d;
                // update display
                xycal._populateHead(y, m);
                xycal._populateDays(y, m, d);
                // scroll to selected
                xycal.el.find('.ui-xycal-selected').scrollHere(300);
                evented = xycal.el.find('.ui-xycal-evented').length > 0;
                // Initialize Events for the selected date
                xycal._initTodayEvents(xycal.getSelected());

                // invoke callbacks
                xycal.settings.callback.onChangeDay.call(xycal, xycal.getSelected(), evented);
                if (cm !== xycal.m) { xycal.settings.callback.onChangeMonth.call(xycal, xycal.getSelected()); }
                if (cy !== xycal.y) { xycal.settings.callback.onChangeYear.call(xycal, xycal.getSelected()); }

                return xycal.getSelected();

            },
            /**
             * Navigate to Today's date
             */
            today: function () {
                var xycal = this, year = xycal.today.getFullYear(),
                    month = xycal.today.getMonth();

                // Initialize Header
                xycal._populateHead(year, month);

                // Initialize Date
                xycal._populateDays(year, month);

                // Initialize Today's Events
                xycal._initTodayEvents();
            },
            /**
             * Reload data
             */
            reload: function () {
                var xycal = this,
                    y = xycal.y, m = xycal.m, d = xycal.d;

                // Initialize Events
                xycal._initDayEvents();

                // Initialize Header
                xycal._populateHead(y, m);

                // Initialize Date
                xycal._populateDays(y, m, d);

                // Initialize Events
                xycal._initDOMEvents();
            },
            /** Private Methods (at least they should be) **/

            /**
             * Initialize xycal object
             */
            _init: function () {
                // Init Instance Vars
                this.today = this.settings.date;
                this.thead = this.el.find('thead');
                this.tbody = this.el.find('tbody');
                this.tfoot = this.el.find('tfoot');

                var // Init Local Vars
                    xycal = this,
                    year = xycal.today.getFullYear(),
                    month = xycal.today.getMonth();

                // set current year and month
                xycal.m = month;
                xycal.y = year;

                // Set widget class
                xycal.el.addClass('ui-xycal');

                // Initialize Events
                xycal._initDayEvents();

                // Initialize Header
                xycal._populateHead(year, month);

                // Initialize Date
                xycal._populateDays(year, month);

                // Initialize Events
                xycal._initDOMEvents();

                // Initialize Today's Events
                xycal._initTodayEvents();

                // Invoke onLoaded callback
                xycal.settings.callback.onLoaded.call(xycal);
            },
            /**
             * Populate the title of the calendar of the specified month and year
             *
             * @param m the numeric value of month
             * @param y the numeric value of year
             */
            _populateHead: function (y, m) {
                var xycal = this, calTitle, daysHead = '', days = [], i,
                    monthNames = xycal.messages.months,
                    dayNames = xycal.messages.days,
                    month = monthNames[m !== undefined ? m : xycal.today.getMonth()],
                    year = y !== undefined ? y : xycal.today.getFullYear(),
                    start = xycal.settings.weekstart,
                    // Local Templates
                    _calTitle = [
                        '<tr class="ui-xycal-nav">',
                            '<th class="ui-xycal-shift"><span class="left"></span></th>',
                            '<th colspan="5" class="ui-xycal-title">#{title}</th>',
                            '<th class="ui-xycal-shift"><span class="right"></span></th>',
                        '</tr>'
                    ].join(''),
                    _dayHead = '<th>#{d}</th>',
                    _daysHead = '<tr class="ui-xycal-days">#{days}</tr>';

                calTitle = $.tmpl(_calTitle, {
                    title: $.tmpl(xycal.messages.calTitle, {m: month, y: year})
                });

                // shift days
                for (i = start; i < dayNames.length; i += 1) { days.push(dayNames[i]); }
                for (i = 0; i < start; i += 1) { days.push(dayNames[i]); }
                $.each(days, function () {
                    var d = this;
                    daysHead += $.tmpl(_dayHead, {d: d});
                });
                daysHead = $.tmpl(_daysHead, {days: daysHead});

                // clear head on screen first
                xycal.thead.empty();
                xycal.thead.append(calTitle);
                xycal.thead.append(daysHead);
            },
            /**
             * Populate the days of the month and year
             */
            _populateDays: function (y, m, d) {
                var xycal = this, dCount = 0, i, ld, today, evented,
                    year = y !== undefined ? y : xycal.today.getFullYear(),
                    month = m !== undefined ? m : xycal.today.getMonth(),
                    lMonth = xycal._getLastMonth(month),
                    nMonth = xycal._getNextMonth(month),
                    days = xycal._getDaysOfMonth(month, year),
                    daysRow = '', weekRow = '', clazz = [],
                    mark = xycal.settings.eventMark,

                    // total left padding days (last month)
                    fDay = xycal._getFirstDayOfMonth(month, year),
                    // total right padding days (next month)
                    lDay = 7 - (days - fDay) % 7,
                    // total days of last month
                    lastDays = xycal._getDaysOfMonth(lMonth, year),

                    // Local Templates
                    _weekRow = '<tr>#{days}</tr>',
                    _dayCell = '<td class="#{clazz}">#{d}</td>',
                    _eventMark = '<span>#{mark}</span>';

                // populate last months padding
                for (i = 1; i <= fDay; i += 1) {
                    // break if fDay is sunday
                    if (fDay > 6) { break; }
                    clazz = []; ld = lastDays - (fDay - i);
                    evented = xycal._dayEvented(year, lMonth, (ld - 1));

                    clazz.push('ui-xycal-others');
                    if (evented) { clazz.push('ui-xycal-evented'); }

                    daysRow += $.tmpl(_dayCell, {d: ld, clazz: xycal._getClazz(clazz)});
                    dCount += 1;
                }

                // populate this month
                for (i = 1; i <= days; i += 1) {
                    clazz = [];
                    today = xycal._dayToday(year, month, i);
                    evented = xycal._dayEvented(year, month, i);

                    // wrap days up into a week, reset days and day counter
                    if (dCount === 7) {
                        weekRow += $.tmpl(_weekRow, {days: daysRow});
                        daysRow = '';
                        dCount = 0;
                    }

                    if (today) { clazz.push('ui-xycal-today'); }
                    if (evented) { clazz.push('ui-xycal-evented'); }
                    if (d && d === i) { clazz.push('ui-xycal-selected'); }

                    daysRow += $.tmpl(_dayCell, {d: i, clazz: this._getClazz(clazz)});
                    dCount += 1;
                }

                // populate next months padding
                for (i = 1; i <= lDay; i += 1) {
                    clazz = [];
                    if (dCount < 7) {
                        evented = xycal._dayEvented(year, nMonth, i);
                        clazz.push('ui-xycal-others');
                        if (evented) { clazz.push('ui-xycal-evented'); }
                        daysRow += $.tmpl(_dayCell, {d: i, clazz: xycal._getClazz(clazz)});
                        dCount += 1;
                    } else { break; }
                }

                if (dCount !== 7) {
                    for (i = 1; i <= 7 - dCount; i += 1) {
                        daysRow += $.tmpl(_dayCell, {d: (lDay + i), clazz: xycal._getClazz(clazz)});                        
                    }
                }

                weekRow += $.tmpl(_weekRow, {days: daysRow});

                // clear days on screen first
                xycal.tbody.empty();
                xycal.tbody.append(weekRow);
                xycal.tbody.find('.ui-xycal-evented')
                    .append($.tmpl(_eventMark, {mark: mark}));
            },
            /**
             * Initialize DOM Events
             */
            _initDOMEvents: function () {
                var navMonth, nextMonth, prevMonth, selectDay, populate,
                    mnav = $('.ui-xycal-shift'), xycal = this,
                    day = $('.ui-xycal tbody td:not(.ui-xycal-others)');

                populate = function (y, m, d) {
                    xycal.m = m;
                    xycal.y = y;
                    xycal.d = d;
                    xycal._populateHead(y, m);
                    xycal._populateDays(y, m, d);
                };

                navMonth = function () {
                    var el = $(this), y = xycal.y,
                        rnav = el.is('th') ? el.find('.right').length > 0 : el.is('.ui-xycal-shift .right').length > 0,
                        lnav = el.is('th') ? el.find('.left').length > 0 : el.is('.ui-xycal-shift .left').length > 0;

                    if (rnav) { nextMonth(); }
                    else if (lnav) { prevMonth(); }
                    // invoke onChangeMonth callback
                    xycal.settings.callback.onChangeMonth.call(xycal, xycal.getSelected());
                    // invoke onChangeYear callback
                    if (xycal.y !== y) {
                        xycal.settings.callback.onChangeYear.call(xycal, xycal.getSelected());
                    }
                    // re-initialize DOMEvents
                    xycal._initDOMEvents();
                };

                nextMonth = function () {
                    var m = xycal._getNextMonth(xycal.m),
                        y = m === 0 ? (xycal.y + 1) : xycal.y;

                    xycal.el.find('ul').slideUp(300);
                    populate(y, m);
                };

                prevMonth = function () {
                    var m = xycal._getLastMonth(xycal.m),
                        y = m === 11 ? (xycal.y - 1) : xycal.y;

                    xycal.el.find('ul').slideUp(300);
                    populate(y, m);
                };

                selectDay = function () {
                    var dCell = $(this), events = [],
                        y = xycal.y, m = xycal.m, d = /\d+/.exec(dCell.text()).join(''),
                        today = dCell.is('.ui-xycal-today'),
                        evented = dCell.is('.ui-xycal-evented'),
                        selected = dCell.is('.ui-xycal-selected');

                    if (selected) { return; }

                    xycal.d = d;
                    $('.ui-xycal-selected').removeClass('ui-xycal-selected');
                    if (!today) { dCell.addClass('ui-xycal-selected'); }
                    if (evented) {
                        events = xycal._getDayEvents(y, m, d);
                        xycal._loadEventListView(events);
                    }
                    // remove event list
                    else { xycal.el.find('ul').slideUp(200); }
                    // Invoke onChangeDay callback
                    xycal.settings.callback.onChangeDay.call(xycal, xycal.getSelected(), evented);
                };

                // navigation
                mnav.click(navMonth);
                day.click(selectDay);
            },
            /**
             * Initialize Day Events
             */
            _initDayEvents: function () {
                var parse, prepare, xycal = this,
                    settings = xycal.settings,
                    events = settings.events,
                    eventList = xycal.el.find('ul:not(.ui-xycal-evlist)');

                xycal.events = [];
                parse = function (ds) {
                    var df = settings.dateFormat,
                        tf = settings.timeFormat,
                        dtf = $.tmpl(settings.format, {df: df, tf: tf}),
                        milis = Date.parseDateFormat(ds, dtf);

                    if (milis > 0) { return new Date(milis); }
                    if (milis <= 0) { throw "Incorrect event date format - default date format is dd/MM/yyyy and time format is HH:mm"; }
                };

                prepare = function () {
                    $.each(events, function () {
                        var d, evt = this, dt = evt.date || false, tm = evt.time || '00:00';
                        if (!dt) { throw "Please specify date in event configuration"; }

                        d = parse($.tmpl(settings.format, {df: dt, tf: tm}));
                        xycal.events.push($.extend({_date: d}, evt));
                    });
                };

                // events is in the event list, grab it and put into this.events
                if (eventList && eventList.length > 0) {
                    // if it's selector or HTML Element then make it jQuery object
                    if (!eventList instanceof jQuery) { eventList = $(eventList); }
                    eventList.find('li[data]').each(function () {
                        var li = $(this), json = li.attr('data'), data = $.parseJSON(json),
                            strDt = data.date || '',
                            strTm = data.time || '00:00',
                            strDtTm = $.tmpl(settings.format, {df: strDt, tf: strTm}),
                            dt = parse(strDtTm);
                        // append the date object to data
                        data = $.extend({_date: dt}, data || {});
                        xycal.events.push(data);
                    });

                    // merge with events in settings
                    prepare();
                    // remove all ul
                    this.el.find('ul').remove();
                }
                // events already in settings
                else { prepare(); }
            },
            /**
             * Initialize Events for today
             */
            _initTodayEvents: function (date) {
                if (date && !date instanceof Date) {
                    throw "Parameter of the selected date must be a Date Object";
                }

                var xycal = this,
                    y = date ? date.getFullYear() : xycal.today.getFullYear(),
                    m = date ? date.getMonth() : xycal.today.getMonth(),
                    d = date ? date.getDate() : xycal.today.getDate(),
                    events = xycal._getDayEvents(y, m, d);

                if (events.length > 0) { xycal._loadEventListView(events); }
            },
            /**
             * Load events of selected day on a listview below the calendar
             * @param evts the events of the selected day
             */
            _loadEventListView: function (evts) {
                var xycal = this, settings = xycal.settings,
                    eul = xycal.el.find('ul.ui-xycal-evlist'),
                    ul = $(settings.ul).addClass('ui-xycal-evlist'),
                    li = settings.li, div = settings.div;

                if (eul.length > 0) { eul.replaceWith(ul); }
                else { xycal.el.append(ul); }

                ul = xycal.el.find('ul.ui-xycal-evlist');
                ul.hide();
                $.each(evts, function () {
                    var content, e = this;

                    // insert divider first if exist
                    if (div) {
                        content = $.tmpl(div, e);
                        ul.append(content);
                    }

                    // insert the list item
                    if (li) {
                        content = $.tmpl(li, e);
                        ul.append(content);
                    }
                });
                // init the list view widget for jQuery mobile
                if (ul.listview) { ul.listview(); }
                // scroll to it
                ul.slideDown(200);
                ul.scrollHere(300);
            },
            /**
             * Get event(s) of the day
             *
             * @param y the numeric year
             * @param m the numeric of month
             * @param d the numeric day of the month
             * @return the array of events of the day
             */
            _getDayEvents: function (y, m, d) {
                var xycal = this, dt = new Date(y, m, d),
                    evts = $.map(this.events, function (evt) {
                        var dd = evt._date;
                        if (dd && dd instanceof Date
                            && xycal._compareDate(dd, dt)) { return evt; }
                    });
                return evts;
            },
            /**
             * Get total days of the month
             *
             * @param m the numeric value of the month
             * @return the total days of the month
             */
            _getDaysOfMonth: function (m, y) {
                var xycal = this, year = y !== undefined ? y : this.today.getFullYear(),
                    month = m !== undefined ? m : xycal.today.getMonth(),
                    totalDays = xycal.settings.totalDays,
                    days = m === 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ?
                        29 : totalDays[month];
                return days;
            },
            /**
            * Get the numeric value of the first day of the month and year
            *
            * @param m the numeric value of month
            * @param y the numeric value of year
            * @return the numeric value of the first day
            */
            _getFirstDayOfMonth: function (m, y) {
                var xycal = this, month = m !== undefined ? m : xycal.today.getMonth(),
                    year = y !== undefined ? y : this.today.getFullYear(),
                    first, start = xycal.settings.weekstart;
                
                first = new Date(year, month, 1).getDay() - start;                
                
                return first < 0 ? 6 : first > 6 ? 0 : first;
            },
            /**
             * Get the previous numeric value of month of the given param
             *
             * @param m the numeric of month
             * @return the last numeric value of month
             */
            _getLastMonth: function (m) {
                var xycal = this, month = m !== undefined ? m : xycal.today.getMonth();
                return (month - 1) < 0 ? 11 : (month - 1);
            },
            /**
             * Get the next numeric value of month of the given param
             *
             * @param m the numeric of month
             * @return the next numeric value of month
             */
            _getNextMonth: function (m) {
                var xycal = this, month = m !== undefined ? m : xycal.today.getMonth();
                return (month + 1) > 11 ? 0 : (month + 1);
            },
            /**
             * Check if the date is today
             *
             * @param y the numeric year
             * @param m the numeric of month
             * @param d the numeric day of the month
             * @return true - the date is today; false - not today
             */
            _dayToday: function (y, m, d) {
                var xycal = this, dt = new Date(y, m, d);

                return xycal._compareDate(dt, xycal.today);
            },
            /**
             * Check if the date has any events
             *
             * @param y the numeric year
             * @param m the numeric of month
             * @param d the numeric day of the month
             * @return true - the date has event(s); false - no event(s)
             */
            _dayEvented: function (y, m, d) {
                var xycal = this, isEvented = false;
                $.each(this.events, function () {
                    var evt = this, dt = evt._date, dd = new Date(y, m, d);

                    isEvented = xycal._compareDate(dd, dt);
                    return !isEvented;
                });
                return isEvented;
            },
            /**
             * Convert Array of classes into String representation
             *
             * @param clazz the Array of classes
             * @return the string representation of the classes
             */
            _getClazz: function (clazz) {
                return clazz.length > 0 ? clazz.length > 1 ? clazz.join(' ') : clazz[0] : '';
            },
            /**
             * Compare between 2 Date object
             *
             * @param d1 first date object
             * @param d2 second date object
             * @return true - Equal; false - Not Equal
             */
            _compareDate: function (d1, d2) {
                var d1_y = d1.getFullYear(), d1_m = d1.getMonth(), d1_d = d1.getDate(),
                    d2_y = d2.getFullYear(), d2_m = d2.getMonth(), d2_d = d2.getDate();

                return d1_y === d2_y && d1_m === d2_m && d1_d === d2_d;
            }
        }
    });
}(jQuery));
