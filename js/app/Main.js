XY.Base.Main = function() {
	/** Private Zone **/
	var // Function names
		pageInit, calInit;
		// Variables
		// Templates

	/** Implementations **/

	/**
	 * Function to initialize Main.index page
	 * @scope public
	 */
	pageInit = function() {
		console.log('Initialized - Main');
	};
	
	/**
	 * Function to initialize calendar demo page
	 * @scope public
	 */
	calInit = function() {
		var events = [
			{date: '01/05/2012', title: 'ABC', desc: 'Aaa Bbb Ccc'}
		];
	    $('.edu-cal').xycal({events: events});
		console.log('Initialized - Calendar');
	}

	return {
		/** Public Zone **/
		id: 'main',
		pageInit: pageInit,
		calInit: calInit
	};
}();
