// new namespace
XY = {};
XY.Base = {};
XY.Base.App = function() {
	/** Private Zone **/
	var // Function names
		appInit, loadScript, pageInit,
		// Variables
		// Templates
		moduleJSTpl = 'js/app/#{name}.js';

	/** Implementations **/

	/**
	 * Function to write to HTML document
	 * @scope private
	 * @param content The raw content to write to HTML document
	 */
	write = function(content) {
        document.write(content);
    };

	/**
	 * Function to write meta tag to HTML document
	 * @scope private
	 * @name name The name of the meta tag
	 * @param content The content of the meta tag
	 */
    meta = function(name, content) {
        write('<meta name="'+ name +'" content="'+ content +'">');
    };

	/**
	 * Function to load Applicaiton javascript and all scripts & stysheets defined in /app/app.json
	 * @scope private
	 */
	loadScript = function() {
		var i, path, options = {}, xhr = new XMLHttpRequest();
		xhr.open('GET', 'js/app.json', false);
		xhr.send();

		meta('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no');
		meta('apple-mobile-web-app-capable', 'yes');
		meta('apple-touch-fullscreen', 'yes');

		options = eval("(" + xhr.responseText + ")");

		for (i = 0; i < options.css.length; i++) {
			path = options.css[i].path;
			write('<link rel="stylesheet" href="'+ path +'">')
		}

		for (i = 0; i < options.js.length; i++) {
			path = options.js[i].path;
			write('<script type="text/javascript" charset="utf-8" src="'+ path +'"></script>')
		}

		XY.Base.MODE = options.mode;
	};

	/**
	 * Global application initialization this only executed once
	 * @scope public
	 */
	appInit = function() {

		// Load stylesheets and scripts
		loadScript();

	};

	/**
	 * Function to load current page initialization scripts defined in data-initjs attribute
	 * in data-role="page" element, must be full path of the public function of the module.
	 * @scope public
	 */
	pageInit = function() {
		var mode = XY.Base.MODE || 'DEV', execute,
			pages = $('div[data-role=page]'), page, module, script;

		execute = function() {
			// Execute current page initialization
			console.log('function to initialize : ' + script);
			$.execute(script, window);
		}

		pages.hide();
		$(pages.get(0)).show().addClass('active');
		page = pages.filter('[data-initjs].active');
		script = page.attr('data-initjs');
		module = script.count('.') > 2 ?
			$.tmpl(moduleJSTpl, {name: script.split('.')[2]}) : false;

		// production mode
		if (mode === 'PROD') {
			// loadScript
			console.log('including : ' + module);
			if (module) {
				$.getScript(module, execute);
			}
		}
		// development mode
		else { execute(); }
	};

	return {
		/** Public Zone **/
		appInit: appInit,
		pageInit: pageInit
	};
}();
XY.Base.App.appInit();
