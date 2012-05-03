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
        if (el.find('thead').length === 0) {el.append('<thead/>');}
        if (el.find('tbody').length === 0) {el.append('<tbody/>');}
        this.Init();
    };
    
    // xytable class definition
    $.extend(true, $.xycal, {
        defaults: {
			date: new Date(),
			weekstart: 1,
            events: []
        },
        messages: {
			days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
			months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
			noEvents: 'No Events'
		},
        prototype: {
            /**
             * Initialize xycal object
             */
            Init: function() {
                this.thead = this.el.find('thead');
                this.tbody = this.el.find('tbody');
                
                // Initialize Header
                
                // Initialize Date
                
                // Initialize Events
            }
        }
    });
})(jQuery);
