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
        if (this.length == 1 && cal) {return grid;}
		// new instance
		else {
            return this.each(function() {
                var el = $(this), 
                    opts = $.extend({id: el.attr('id')}, options),
                    xycal = new $.xycal(opts);
                
                $.data(this, 'xycal', xycal);
                return xycal;
            });
        }
	};
	
	// xycal constructor | public interface: $.xycal
    $.xytable = function(options) {
        var id = options.id, el = $('#' + id);
        this.settings = $.extend(true, {el: el}, $.xycal.defaults, options);
        if (el.find('thead').length === 0) {el.append('<thead/>');}
        if (el.find('tbody').length === 0) {el.append('<tbody/>');}
        this.Init();
    };
    
    // xytable class definition
    $.extend(true, $.xytable, {
        defaults: {
            id: 'xycal',
            events: []
        },
        messages: {},
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
});
