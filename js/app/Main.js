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
            li: '<li>#{date} - #{desc}</li>'
        });
        
        $('.nottyme').click(function() {
            $.notty({                
                content: $('<p>This is a notification</p>')
                    .css({
                        'font-size': '120%', 
                        'margin': '3px', 
                        'text-align': 'center',
                        'font-weight': 'bold'
                    })
                    .outerHTML().join(''),
                timeout: 3000,
                showTime: false,                
                nohide: true
            });
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
