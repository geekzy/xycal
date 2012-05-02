XY.Base.Main = function() {
	/** Private Zone **/
	var // Function names
		pageInit;
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

	return {
		/** Public Zone **/
		id: 'main',
		pageInit: pageInit
	};
}();