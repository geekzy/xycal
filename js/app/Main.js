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
	    
		console.log('Initialized - Calendar');
	}

	return {
		/** Public Zone **/
		id: 'main',
		pageInit: pageInit,
		calInit: calInit
	};
}();
