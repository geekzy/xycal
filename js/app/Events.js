XY.Base.Events = function() {
    /** Private Zone **/
    var // Function names
        loadData, pageInit, parseEvents, parseEventCats, loadEventsCal, refresh,
        // Variables
        eventcalOpt,
        // Templates
        data_ul = '<ul style="display:none;">#{li}</ul>',
        data_li = "<li data='#{data}'></li>";

    /** Implementations **/
    eventcalOpt = {
        ul: '<ul data-role="listview" data-inset="true" data-dividertheme="a"></ul>',
        li: '<li>#{date} - #{desc}</li>',
        callback: {
            onLoaded: function() {},
            onChangeDay: function(selected, evented) {},
            onChangeMonth: function(selected) {},
            onChangeYear: function(selected) {}
        }
    };

    /**
     * JSONP Routine to load events data from its endpoint
     * @param callback the callback function to
     * @return
     */
    loadData = function(fn, opt) {
        fn = fn || function(data) { console.log(data) };
        opt = $.extend({
            beforeSend: XY.Base.App.showLoading,
            complete: XY.Base.App.hideLoading,
            data: {}
        }, opt || {});

        $.jsonp('http://edumobile.geekzy.net/eduConnect/events_jsonp.php', 'proc_events', fn, opt.data, opt);
    }

    /**
     * Parse jsonp response from server to get its categories
     * @scope private
     */
    parseEventCats = function(data) {
        return $.pluck(data.events, 'evcat', true);
    };

    /**
     * Parse jsonp response from server
     * @scope private
     */
    parseEvents = function(data, cat) {
        var events = [];
        $.each(data.events, function() {
            var evcat = this.evcat;
            if (!cat || cat === 'all' || (cat && evcat && evcat === cat)) {
                events.push(this);
            }
        });
        return events;
    };

    /**
     * Get the latest events categories from server
     * @scope private
     */
    loadEventCats = function() {
        loadData(function(data) {
            var li, cats = [], tmpl = '',
                content = $('#events-cats [data-role=content]');

            if (data.success) {
                cats = parseEventCats(data);
                tmpl = $.template('evcatslist', {catlist: cats});
                content.append(tmpl);
                content.find('ul').listview();
                content.find('ul li a.evcat').click(function() {
                    XY.Base.Events.cat = $(this).attr('data-cat'); 
                    $.mobile.changePage('events-cal.html'); 
                });
            }
        });
    };

    /**
     * Get the latest data from server
     * @scope public
     */
    loadEventsCal = function() {               
        var events = [], el = $('#xycal-events'), cat = XY.Base.Events.cat;
        loadData(function(data) {
            if (data.success) {
                $.each(parseEvents(data, cat), function() {
                    var ev = this;
                    events.push({
                        date: ev.evdate,
                        time: ev.evtime,
                        loc: ev.evlocation,
                        title: ev.evtitle,
                        desc: ev.content.replace(/(<([^>]+)>)/ig, "")
                    });
                });
                eventcalOpt.events = events;
                el.xycal(eventcalOpt);
            }
        });
    };

    /**
     * Function to initialize Main.index page
     * @scope public
     */
    pageInit = function() {
        loadEventCats();
        console.log('Initialized - Event Categories');
    };

    /**
     * Function to reload calendar events data
     * @scope public
     */
    refresh = function() {
        pageInit();
    };

    return {
        /** Public Zone **/
        id: 'events',
        pageInit: pageInit,
        loadEventsCal: loadEventsCal,
        refresh: refresh
    };
}();
