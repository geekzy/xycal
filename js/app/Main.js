XY.Base.Main = function() {
    /** Private Zone **/
    var // Function names
        pageInit, srcInit;
        // Variables
        // Templates

    /** Implementations **/

    /**
     * Function to initialize Main.index page
     * @scope public
     */
    pageInit = function() {
        $('#xycal-demo').xycal({
            ul: '<ul data-role="listview" data-inset="true" data-dividertheme="a"></ul>',
            li: ['<li data-icon="false">',
                    '<a href="#{action}">',
                        '<div class="ui-grid-a xy-2-column">',
                            '<div class="ui-block-a xy-align-center xy-evt-icon">',
                                '<p>',                                    
                                    '#{time}',
                                '</p>',
                            '</div>',
                            '<div class="ui-block-b"><p>#{title}</p><p>#{loc}</p></div>',
                        '</div>',
                    '</a>',
                '</li>'].join(''),
            div: false,
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
        });

        $('.nottyme').click(function() {
            XY.Base.App.notty('This is a notification');
        });
        $('.events').click(function() {
            $.mobile.changePage('events-cat.html');
        });
        console.log('Initialized - Main');
    };

    /**
     * Function to initialize xycal usage page
     * @scope public
     */
    srcInit = function() {
        console.log('Initialized - XYCal Usage');
    }

    return {
        /** Public Zone **/
        id: 'main',
        pageInit: pageInit,
        srcInit: srcInit
    };
}();
