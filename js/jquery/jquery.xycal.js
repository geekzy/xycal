/**
 * XYBASE Simple Calendar/Event Layout Component
 *
 * jquery.xycal.js v1.0.3
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
 */
(function ($) {
    $.fn.xycal = function(options) {
        if (this.length === 0) {return this;}
        // has been created before
        var cal = $.data(this[0], 'xycal');
        if (this.length === 1 && cal) {return cal;}
        // new instance
        else {
        return this.each(function() {
            var el = $(this),
                xycal = new $.xycal(el, options || {});

            $.data(this, 'xycal', xycal);
                return xycal;
            });
        }
    };

    // xycal constructor | public interface: $.xycal
    $.xycal = function(el, opts) {
        this.el = el;
        this.settings = $.extend(true, $.xycal.defaults, opts);
        this.messages = $.xycal.messages;

        if (!el.is('table')) {
            el.append('<table/>');
            el = el.find('table');
            el.css({width: '100%', 'border-collapse': 'collapse'});
        }
        if (el.find('thead').length === 0) {el.append('<thead/>');}
        if (el.find('tbody').length === 0) {el.append('<tbody/>');}
        this._init();
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
            days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
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
            getSelected: function() {
                var xycal = this;
                    selected = xycal.el.find('table td.ui-xycal-selected');

                return new Date(xycal.y, xycal.m, selected.length > 0 ? xycal.d : 1);
            },
            /**
             * Public interface to set the selected date
             *
             * @param date the Date object of the selected date
             * @return the selected date as Date Object
             */
            setSelected: function(date) {
                if (!date instanceof Date) {
                    throw "Parameter of the selected date must be a Date Object";
                }

                var evented, cy = this.y, cm = this.m,
                    y = date.getFullYear(),
                    m = date.getMonth(),
                    d = date.getDate();

                // hide events
                this.el.find('ul').slideUp(200);
                // update instance state
                this.y = y;
                this.m = m;
                this.d = d;
                // update display
                this._populateHead(y, m);
                this._populateDays(y, m, d);
                // scroll to selected
                this.el.find('.ui-xycal-selected').scrollHere(300);
                evented = this.el.find('.ui-xycal-evented').length > 0;
                // Initialize Events for the selected date
                this._initTodayEvents(this.getSelected());

                // invoke callbacks
                this.settings.callback.onChangeDay.call(this, this.getSelected(), evented);
                if (cm !== this.m) { this.settings.callback.onChangeMonth.call(this, this.getSelected()); }
                if (cy !== this.y) { this.settings.callback.onChangeYear.call(this, this.getSelected()); }

                return this.getSelected();

            },
            /**
             * Navigate to Today's date
             */
            today: function() {
                var year = this.today.getFullYear(),
                    month = this.today.getMonth();

                // Initialize Header
                this._populateHead(year, month);

                // Initialize Date
                this._populateDays(year, month);

                // Initialize Today's Events
                this._initTodayEvents();
            },
            /** Private Methods (at least they should be) **/

            /**
             * Initialize xycal object
             */
            _init: function() {
                // Init Instance Vars
                this.today = this.settings.date;
                this.thead = this.el.find('thead');
                this.tbody = this.el.find('tbody');

                var // Init Local Vars
                    year = this.today.getFullYear(),
                    month = this.today.getMonth();

                // set current year and month
                this.m = month;
                this.y = year;

                // Set widget class
                this.el.addClass('ui-xycal');

                // Initialize Events
                this._initDayEvents();

                // Initialize Header
                this._populateHead(year, month);

                // Initialize Date
                this._populateDays(year, month);

                // Initialize Events
                this._initDOMEvents();

                // Initialize Today's Events
                this._initTodayEvents();

                // Invoke onLoaded callback
                this.settings.callback.onLoaded.call(this);
            },
            /**
             * Populate the title of the calendar of the specified month and year
             *
             * @param m the numeric value of month
             * @param y the numeric value of year
             */
            _populateHead: function(y, m) {
                var calTitle, daysHead = '', days = [], i,
                    monthNames = this.messages.months,
                    dayNames = this.messages.days,
                    month = monthNames[m !== undefined ? m : this.today.getMonth()],
                    year = y !== undefined ? y : this.today.getFullYear(),
                    start = this.settings.weekstart,
                    // Local Templates
                    _calTitle = [
                        '<tr>',
                            '<th class="ui-xycal-shift"><span class="left"></span></th>',
                            '<th colspan="5" class="ui-xycal-title">#{title}</th>',
                            '<th class="ui-xycal-shift"><span class="right"></span></th>',
                        '</tr>'
                    ].join(''),
                    _dayHead = '<th>#{d}</th>',
                    _daysHead = '<tr>#{days}</tr>';

                calTitle = $.tmpl(_calTitle, {
                    title: $.tmpl(this.messages.calTitle, {m: month, y: year})
                });

                // shift days
                for (i = start; i < dayNames.length; i++) { days.push(dayNames[i]); }
                for (i = 0; i < start; i++) { days.push(dayNames[i]); }
                $.each(days, function(i, d) {
                    daysHead += $.tmpl(_dayHead, {d: d});
                });
                daysHead = $.tmpl(_daysHead, {days: daysHead});

                // clear head on screen first
                this.thead.empty();
                this.thead.append(calTitle);
                this.thead.append(daysHead);
            },
            /**
             * Populate the days of the month and year
             */
            _populateDays: function(y, m, d) {
                var dCount = 0, i, ld, today, evented,
                    year = y !== undefined ? y : this.today.getFullYear(),
                    month = m !== undefined ? m : this.today.getMonth(),
                    lMonth = this._getLastMonth(month),
                    days = this._getDaysOfMonth(month, year),
                    daysRow = '', weekRow = '', clazz = [],
                    mark = this.settings.eventMark,

                    // total left padding days (last month)
                    fDay = this._getFirstDayOfMonth(month, year),
                    // total right padding days (next month)
                    lDay = 7 - (days - fDay) % 7,
                    // total days of last month
                    lastDays = this._getDaysOfMonth(lMonth, year),

                    // Local Templates
                    _weekRow = '<tr>#{days}</tr>',
                    _dayCell = '<td class="#{clazz}">#{d}</td>',
                    _eventMark = '<span>#{mark}</span>';

                // populate last months padding
                for (i = 1; i <= fDay; i++) {
                    // break if fDay is sunday
                    if (fDay > 6) { break; }
                    clazz = []; ld = lastDays - (fDay - i);
                    evented = this._dayEvented(year, lMonth, (ld - 1));

                    clazz.push('ui-xycal-others');
                    if (evented) { clazz.push('ui-xycal-evented'); }

                    daysRow += $.tmpl(_dayCell, {d: ld, clazz: this._getClazz(clazz)});
                    dCount++;
                }

                // populate this month
                for (i = 1; i <= days; i++) {
                    clazz = [];
                    today = this._dayToday(year, month, i);
                    evented = this._dayEvented(year, month, i);

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
                    dCount++;
                }

                // populate next months padding
                for (i = 1; i <= lDay; i++) {
                    clazz = [];
                    if (dCount < 7) {
                        evented = this._dayEvented(year, lMonth, i);
                        clazz.push('ui-xycal-others');
                        if (evented) { clazz.push('ui-xycal-evented'); }
                        daysRow += $.tmpl(_dayCell, {d: i, clazz: this._getClazz(clazz)});
                        dCount++;
                    } else { break; }
                }

                if (dCount != 7) {
                    for (i = 1; i <= 7 - dCount; i++) {
                        daysRow += $.tmpl(_dayCell, {d: (lDay + i), clazz: this._getClazz(clazz)});
                    }
                }

                weekRow += $.tmpl(_weekRow, {days: daysRow});

                // clear days on screen first
                this.tbody.empty();
                this.tbody.append(weekRow);
                this.tbody.find('.ui-xycal-evented')
                    .append($.tmpl(_eventMark, {mark: mark}));
            },
            /**
             * Initialize DOM Events
             */
            _initDOMEvents: function() {
                // TODO implement event handlers and binding for cells and navigation
                var navMonth, nextMonth, prevMonth, selectDay, populate,
                    mnav = $('.ui-xycal-shift'), xycal = this,
                    day = $('.ui-xycal tbody td:not(.ui-xycal-others)');

                populate = function(y, m, d) {
                    xycal.m = m;
                    xycal.y = y;
                    xycal.d = d;
                    xycal._populateHead(y, m);
                    xycal._populateDays(y, m, d);
                };

                navMonth = function() {
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
                };

                nextMonth = function() {
                    var m = xycal._getNextMonth(xycal.m),
                        y = m === 0 ? (xycal.y + 1) : xycal.y;

                    xycal.el.find('ul').slideUp(300);
                    populate(y, m);
                };

                prevMonth = function() {
                    var m = xycal._getLastMonth(xycal.m),
                        y = m === 11 ? (xycal.y - 1) : xycal.y;

                    xycal.el.find('ul').slideUp(300);
                    populate(y, m);
                };

                selectDay = function() {
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
                mnav.live('click', navMonth);
                day.live('click', selectDay);
            },
            /**
             * Initialize Day Events
             */
            _initDayEvents: function() {
                var parse, prepare, xycal = this,
                    settings = xycal.settings,
                    events = settings.events,
                    eventList = xycal.el.find('ul');

                xycal.events = [];
                parse = function(ds) {
                    var df = settings.dateFormat,
                        tf = settings.timeFormat,
                        dtf = $.tmpl(settings.format, {df: df, tf: tf}),
                        milis = Date.parseDateFormat(ds, dtf);

                    if (milis > 0) { return new Date(milis); }
                    else { throw "Incorrect event date format - default date format is dd/MM/yyyy and time format is HH:mm"; }
                };

                prepare = function() {
                    $.each(events, function(i, evt) {
                        var d, dt = evt.date || false, tm = evt.time || '00:00';
                        if (!dt) { throw "Please specify date in event configuration"; }

                        d = parse($.tmpl(settings.format, {df: dt, tf: tm}));
                        xycal.events.push($.extend({_date: d}, evt));
                    });
                };

                // events is in the event list, grab it and put into this.events
                if (eventList && eventList.length > 0) {
                    // if it's selector or HTML Element then make it jQuery object
                    if (!eventList instanceof jQuery) { eventList = $(eventList); }
                    eventList.find('li[data]').each(function() {
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
            _initTodayEvents: function(date) {
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
            _loadEventListView: function(evts) {
                var xycal = this, settings = xycal.settings, eul = xycal.el.find('ul'),
                    ul = settings.ul, li = settings.li, div = settings.div;

                if (eul.length > 0) { eul.replaceWith(ul); }
                else { xycal.el.append(ul); }

                ul = xycal.el.find('ul');
                ul.hide();
                $.each(evts, function(i, e) {
                    var content;

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
            _getDayEvents: function(y, m, d) {
                var xycal = this, dt = new Date(y, m, d),
                    evts = $.map(this.events, function(evt) {
                        var dd = evt._date;;
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
            _getDaysOfMonth: function(m, y) {
                var year = y !== undefined ? y : this.today.getFullYear(),
                    month = m !== undefined ? m : this.today.getMonth(),
                    totalDays = this.settings.totalDays,
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
            _getFirstDayOfMonth: function(m, y) {
                var month = m !== undefined ? m : this.today.getMonth(),
                    year = y !== undefined ? y : this.today.getFullYear(),
                    start = this.settings.weekstart;

                return new Date(year, month, 1).getDay() - start;
            },
            /**
             * Get the previous numeric value of month of the given param
             *
             * @param m the numeric of month
             * @return the last numeric value of month
             */
            _getLastMonth: function(m) {
                var month = m !== undefined ? m : this.today.getMonth();
                return (month - 1) < 0 ? 11 : (month - 1);
            },
            /**
             * Get the next numeric value of month of the given param
             *
             * @param m the numeric of month
             * @return the next numeric value of month
             */
            _getNextMonth: function(m) {
                var month = m !== undefined ? m : this.today.getMonth();
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
            _dayToday: function(y, m, d) {
                var d = new Date(y, m, d);

                return this._compareDate(d, this.today);
            },
            /**
             * Check if the date has any events
             *
             * @param y the numeric year
             * @param m the numeric of month
             * @param d the numeric day of the month
             * @return true - the date has event(s); false - no event(s)
             */
            _dayEvented: function(y, m, d) {
                // TODO implement this function to check if the date has any events.
                var xycal = this, isEvented = false;
                $.each(this.events, function(i, evt) {
                    var dt = evt._date, dd = new Date(y, m, d);

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
            _getClazz: function(clazz) {
                return clazz.length > 0 ? clazz.length > 1 ? clazz.join(' ') : clazz[0] : '';
            },
            /**
             * Compare between 2 Date object
             *
             * @param d1 first date object
             * @param d2 second date object
             * @return true - Equal; false - Not Equal
             */
            _compareDate: function(d1, d2) {
                var d1_y = d1.getFullYear(), d1_m = d1.getMonth(), d1_d = d1.getDate(),
                    d2_y = d2.getFullYear(), d2_m = d2.getMonth(), d2_d = d2.getDate();

                return d1_y === d2_y && d1_m === d2_m && d1_d === d2_d;
            }
        }
    });
})(jQuery);
