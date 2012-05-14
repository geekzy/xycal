XY.Base.Template = function() {
    /** Private Zone **/
    var // Function names
        pageInit, parseEvents, loadEventsCal, refresh,
        // Variables
        xycalOpt;
        // Templates

    /** Implementations **/
    xycalOpt = {
        ul: '<ul data-role="listview" data-inset="true" data-dividertheme="a"></ul>',
        li: '<li><%=date%> - <%=desc%></li>',
        callback: {
            onLoaded: function() { XY.Base.App.notty('The XYCal is Loaded.'); },
            onChangeDay: function(selected, evented) {
                var day = selected.formatDate('dd/MM/yyyy');
                XY.Base.App.notty((evented ? 'An evented' : 'A') + ' day is selected : ' + day);
            },
            onChangeMonth: function(selected) {
                var month = selected.formatDate('MMM');
                XY.Base.App.notty('Month is changed : ' + month);
            },
            onChangeYear: function(selected) {
                var year = selected.formatDate('yyyy');
                XY.Base.App.notty('Year is changed : ' + year);
            }
        }
    };
    
    /**
     * Parse jsonp response from server
     * @scope private
     */
    parseEvents = function(data) {        
        var events = [];
        $.each(data.events, function() {
            var evlist = this.evlist;
            if (this.evtype !== 'All') {
                $.each(evlist, function() {
                    var evArr = this.evdet || [];
                    $.each(evArr, function() {
                        events.push(JSON.stringify({
                            date: this.evdate,
                            time: this.evtime,
                            loc: this.evlocation,
                            cat: this.evcat,
                            title: this.evtitle,
                            desc: this.content.replace(/<[\w\d\s="-:;\/]+>/g, '')
                        }));
                    });
                });
            }
        });
        return events;
    };
    
    /**
     * Get the latest data from server
     * @scope private
     */
    loadEventsCal = function() {
        var el = $('#xycal-demo'), xycal = el.xycal(xycalOpt);
                
        $.jsonp('http://edumobile.geekzy.net/eduConnect/events_p.php', 'proc_events', function(data) {
            var list, events = [];
            if (data.success) {
                events = parseEvents(data);
                list = $.tmpl('xycal_tmpl', {events: events});                
                el.append(list).xycal('reload');
            }
        }, {}, {beforeSend: XY.Base.App.showLoading, complete: XY.Base.App.hideLoading});
    };       

    /**
     * Function to initialize Main.index page
     * @scope public
     */
    pageInit = function() {
        loadEventsCal();
        console.log('Initialized - Template');
    };
    
    /**
     * Function to reload calendar events data
     * @scope public
     */
    refresh = function() {
        loadEventsCal();
    };
    
    return {
        /** Public Zone **/
        id: 'template',
        pageInit: pageInit,
        refresh: refresh
    };
}();
