/**
 * XYBASE Simple Calendar/Event Layout Component
 *
 * jquery.xycal.js v0.1
 *
 * Developer: Imam Kurniawan <geekzy@gmail.com><imam@xybase.com>
 * Copyright (c) 2012 XYBASE <http://www.xybase.com>
 */
(function($) {
    $.fn.xycal = function(options) {
        if (this.length === 0) {return this;}
        // has been created before
        var cal = $.data(this[0], 'xycal');
        if (this.length == 1 && cal) {return cal;}
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
        if (el.find('thead').length === 0) {el.append('<thead/>');}
        if (el.find('tbody').length === 0) {el.append('<tbody/>');}
        this.Init();
    };

    // xytable class definition
    $.extend(true, $.xycal, {
        defaults: {
            date: new Date(),
            weekstart: 1,
            totalDays: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            events: []
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
             * Initialize xycal object
             */
            Init: function() {
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

                // Initialize Header
                this._populateHead(year, month);
                // Initialize Date
                this._populateDays(year, month);
                // Initialize Events
                this._initDOMEvents();
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
                    month = monthNames[m != undefined ? m : this.today.getMonth()],
                    year = y != undefined ? y : this.today.getFullYear(),
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
            _populateDays: function(y, m) {
                var dCount = 0, d, ld, rd, today, evented,
                    year = y != undefined ? y : this.today.getFullYear(),
                    month = m != undefined ? m : this.today.getMonth(),
                    lMonth = this._getLastMonth(month),
                    days = this._getDaysOfMonth(month, year),
                    daysRow = '', weekRow = '', clazz = [],
                    start = this.settings.weekstart,

                    // total left padding days (last month)
                    fDay = this._getFirstDayOfMonth(month, year),
                    // total right padding days (next month)
                    lDay = 7 - (days - fDay) % 7,
                    // total days of last month
                    lastDays = this._getDaysOfMonth(lMonth, year),

                    // Local Templates
                    _weekRow = '<tr>#{days}</tr>',
                    _dayCell = '<td class="#{clazz}">#{d}</td>';

                // populate last months padding
                for (d = 0; d < fDay;) {
                    // break if fDay is sunday
                    if (fDay > 6) { break; }
                    clazz = []; ld = lastDays - (fDay - ++d);
                    evented = this._dayEvented(year, lMonth, (ld - 1));

                    clazz.push('ui-xycal-others');
                    if (evented) { clazz.push('ui-xycal-evented'); }

                    daysRow += $.tmpl(_dayCell, {d: ld, clazz: this._getClazz(clazz)});
                    dCount++;
                }

                // populate this month
                for (d = 0; d < days;) {
                    clazz = []; d++;
                    today = this._dayToday(year, month, d);
                    evented = this._dayEvented(year, month, d);

                    // wrap days up into a week, reset days and day counter
                    if (dCount === 7) {
                        weekRow += $.tmpl(_weekRow, {days: daysRow})
                        daysRow = '';
                        dCount = 0;
                    }

                    if (today) { clazz.push('ui-xycal-today'); }
                    if (evented) { clazz.push('ui-xycal-evented'); }

                    daysRow += $.tmpl(_dayCell, {d: d, clazz: this._getClazz(clazz)});
                    dCount++;
                }

                // populate next months padding
                for (d = 0; d < lDay;) {
                    clazz = []; d++;
                    if (dCount < 7) {
                        evented = this._dayEvented(year, lMonth, d);
                        clazz.push('ui-xycal-others');
                        if (evented) { clazz.push('ui-xycal-evented'); }
                        daysRow += $.tmpl(_dayCell, {d: d, clazz: this._getClazz(clazz)});
                        dCount++;
                    } else { break; }
                }

                if (dCount != 7) {
                    for (d = 0; d < 7 - dCount;) {
                        daysRow += $.tmpl(_dayCell, {d: (lDay + ++d), clazz: this._getClazz(clazz)});
                    }
                }

                weekRow += $.tmpl(_weekRow, {days: daysRow});

                // clear days on screen first
                this.tbody.empty();
                this.tbody.append(weekRow);
            },
            /**
             * Initialize DOM Events
             */
            _initDOMEvents: function() {
                // TODO implement event handlers and binding for cells and navigation
                var nextMonth, prevMonth, selectDay, populate,
                    xycal = this,
                    lnav = $('.ui-xycal-shift .left'),
                    rnav = $('.ui-xycal-shift .right'),
                    day = $('.ui-xycal tbody td:not(.ui-xycal-others)');

                populate = function(y, m) {
                    xycal.m = m;
                    xycal.y = y;
                    xycal._populateHead(y, m);
                    xycal._populateDays(y, m);
                };

                nextMonth = function() {
                    var m = xycal._getNextMonth(xycal.m),
                        y = m == 0 ? (xycal.y + 1) : xycal.y;
                    populate(y, m);
                };

                prevMonth = function() {
                    var m = xycal._getLastMonth(xycal.m),
                        y = m == 11 ? (xycal.y - 1) : xycal.y;
                    populate(y, m);
                };

                selectDay = function() { 
                    var dCell = $(this), today = dCell.is('.ui-xycal-today');
                    $('.ui-xycal-selected').removeClass('ui-xycal-selected');
                    if (!today) { dCell.addClass('ui-xycal-selected'); }
                    // if evented populate the related events
                };

                // navigation
                rnav.live('click', nextMonth);
                lnav.live('click', prevMonth);
                day.live('click', selectDay);
            },
            /**
             * Get total days of the month
             *
             * @param m the numeric value of the month
             * @return the total days of the month
             */
            _getDaysOfMonth: function(m, y) {
                var year = y != undefined ? y : this.today.getFullYear(),
                    month = m != undefined ? m : this.today.getMonth(),
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
                var month = m != undefined ? m : this.today.getMonth(),
                    year = y != undefined ? y : this.today.getFullYear(),
                    start = this.settings.weekstart;

                return (new Date(year, month, 0).getDay() + 1) - start;
            },
            /**
             * Get the previous numeric value of month of the given param
             *
             * @param m the numeric of month
             * @return the last numeric value of month
             */
            _getLastMonth: function(m) {
                var month = m != undefined ? m : this.today.getMonth();
                return (month - 1) < 0 ? 11 : (month - 1);
            },
            /**
             * Get the next numeric value of month of the given param
             *
             * @param m the numeric of month
             * @return the next numeric value of month
             */
            _getNextMonth: function(m) {
                var month = m != undefined ? m : this.today.getMonth();
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
                var day = this.today.getDate(),
                    month = this.today.getMonth(),
                    year = this.today.getFullYear();

                return year === y && month === m && day === d;
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
                return false;
            },
            /**
             * Convert Array of classes into String representation
             * @param clazz the Array of classes
             * @return the string representation of the classes
             */
            _getClazz: function(clazz) {
                return clazz.length > 0 ? clazz.length > 1 ? clazz.join(' ') : clazz[0] : '';
            }
        }
    });
})(jQuery);
