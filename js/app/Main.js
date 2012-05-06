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
        var events = [
			{date: '01/05/2012', time: '08:30', title: 'ABC', desc: 'Aaa Bbb Ccc'}
		];
	    $('.edu-cal').xycal({events: events});
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
