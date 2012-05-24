/*
 * jQuery Commonly Usage Plugins Collection
 *
 * jquery.xycommon.js v2.1
 *
 * Copyright (c) 2009 XYBASE, <imam@xybase.com><geekzy@gmail.com>
 *
 */
(function($) {
    /* --------------------------------------------------------------------------- *
     * ------------------------ STATIC METHOD PLUGINS ---------------------------- *
     * --------------------------------------------------------------------------- */
    $.extend({
        // template cache shouldn't be used directly
        cache: {},
        // public interface: $.namespace *adopting from Ext Core :D thx jack!
        namespace: function() {
            var o, d;
            $.each(arguments, function() {
                d = this.split(".");
                o = window[d[0]] = window[d[0]] || {};
                $.each(d.slice(1), function() {
                    o = o[this] = o[this] || {};
                });
            });
            return o;
        },
        // public interface: $.tmpl
        tmpl : function(tmpl, vals, rgxp) {
            // default to doing no harm
            tmpl = tmpl   || '';
            vals = vals || {};

            // regular expression for matching our placeholders; e.g., #{my-cLaSs_name77}
            rgxp = rgxp || /#\{([^{}]*)\}/g;

            // function to making replacements
            var repr = function (str, match) {
                return typeof vals[match] === 'string' || typeof vals[match] === 'number' ? vals[match] : '';
            };

            return tmpl.replace(rgxp, repr);
        },
        // public interface: $.template
        // John Resig - http://ejohn.org/ - MIT Licensed
        template : function(str, data){
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = !/\W/.test(str) ?
                    $.cache[str] = $.cache[str] ||
                    $.template(document.getElementById(str).innerHTML) :

                    // Generate a reusable function that will serve as a template
                    // generator (and which will be cached).
                    new Function("obj",
                        "var p=[],print=function(){p.push.apply(p,arguments);};" +

                        // Introduce the data as local variables using with(){}
                        "with(obj){p.push('" +

                        // Convert the template into pure JavaScript
                        str
                            .replace(/[\r\t\n]/g, " ")
                            .split("<#").join("\t")
                            .replace(/((^|#>)[^\t]*)'/g, "$1\r")
                            .replace(/\t=(.*?)#>/g, "',$1,'")
                            .split("\t").join("');")
                            .split("#>").join("p.push('")
                            .split("\r").join("\\'")
                            + "');}return p.join('').trim();");

            // Provide some basic currying to the user
            return data ? fn( data ) : fn;
        },
        // public interface: $.popup
        popup : function(options) {
            var openoptions,
                opts = $.extend({
                    url: '#',
                    left: "", top: "",
                    width: 800, height: 600,
                    name: "_blank",
                    location: "no", menubar: "no", toolbar: "no", status: "yes", scrollbars: "yes", resizable: "yes",
                    normal: false
                }, options || {});

            if (opts.normal) {
                opts.menubar = "yes";
                opts.status = "yes";
                opts.toolbar = "yes";
                opts.location = "yes";
            }

            opts.width = opts.width < screen.availWidth ? opts.width : screen.availWidth;
            opts.height = opts.height < screen.availHeight ? opts.height : screen.availHeight;

            openoptions = 'width=' + opts.width + ',height=' + opts.height + ',location=' + opts.location +
                ',menubar=' + opts.menubar + ',toolbar=' + opts.toolbar + ',scrollbars=' +
                opts.scrollbars + ',resizable=' + opts.resizable + ',status=' + opts.status;

            if (opts.top !== '') {
                openoptions += ",top=" + opts.top;
            }
            if (opts.left !== '') {
                openoptions += ",left=" + opts.left;
            }

            return window.open(opts.url, opts.name, openoptions);
        },
        // public interface: $.execute
        execute : function(functionName, context /*, args */) {
            var i, args = Array.prototype.slice.call(arguments).splice(2),
                namespaces = functionName.split("."),
                func = namespaces.pop();

            for(i = 0; i < namespaces.length; i++) {
                context = context[namespaces[i]];
            }

            return context[func].apply(this, args);
        },
        // public interface $.jsonp
        jsonp : function(url, callback, fn, data, options) {
            $.ajax($.extend({
                url: url,
                data: data || {},
                dataType: 'jsonp',
                jsonp: false,
                jsonpCallback: callback,
                success: fn
            }, options || {}));
        },
        // public interface $.cachedScript
        cachedScript : function(url, options, succFn) {
            // allow user to set any option except for dataType, cache, and url
            options = $.extend(options || {}, {
                dataType: "script",
                cache: true,
                url: url,
                success: succFn || $.noop
            });

            // Use $.ajax() since it is more flexible than $.getScript
            // Return the jqXHR object so we can chain callbacks
            return jQuery.ajax(options);
        },
        // public interface $.randomString
        randomString : function(len, special) {
            len = len || 8;
            special = special || false;

            var i = 0, str = '', rndNum;

            while (i < len){
                rndNum = (Math.floor((Math.random() * 100)) % 94) + 33;
                if (!special){
                    if ((rndNum >= 33) && (rndNum <= 47)) { continue; }
                    if ((rndNum >= 58) && (rndNum <= 64)) { continue; }
                    if ((rndNum >= 91) && (rndNum <= 96)) { continue; }
                    if ((rndNum >= 123) && (rndNum <= 126)) { continue; }
                }
                i++;
                str += String.fromCharCode(rndNum);
            }

            return str;
        },
        // public interface $.loading
        loading : function() {
            var waitPage = $('[data-role=page].wait');
            waitPage.bind('pageshow', function(e, ui) {
                $.mobile.showPageLoadingMsg();
            });
            waitPage.bind('pagehide', function(e, ui) {
                $.mobile.hidePageLoadingMsg();
            });
        },
        // public interface $.pluck
        pluck : function(obj, key, nodup) {
            var plucked = [];
            nodup = nodup || false;
            $.each(obj, function() {
                var val = this[key], exists = $.inArray(val, plucked) != -1;
                if (!nodup || (nodup && !exists)) { plucked.push(val); }
            });
            return plucked;
        },
        // public interface $.empty of string value as str
        empty: function(str) {
            return str === '';
        },
        // public interface $.bool of string value as val
        bool: function(val) {
            return (/^true$/i).test(val);
        }
    });
    /* --------------------------------------------------------------------------- *
     * ----------------------- SELECTOR BASED PLUGINS ---------------------------- *
     * --------------------------------------------------------------------------- */
    var plugins = {
        /**
         * Clear a node contents
         */
        clear: function() {
            return this.each(function() {
                $(this).html('');
            });
        },
        /**
         * Load options of select with ajax
         *
         * @param {String} url
         * @param {Object} options
         */
        loadOptions: function(url, options) {
            return this.each(function() {
                var select = $(this),
                    tmpl = '<option value="#{id}" title="#{title}">#{label}</option>',
                    opts = $.extend({
                        // Default options
                        url:        url || '',  // URL is a mandatory param when remote true
                        type:       'GET',      // default request method
                        data:       {},         // default params to send to request
                        cache:      false,      // caching option
                        dataType:   'json',     // default data type from server
                        value:      '',         // default selected value
                        remote:     true,       // call ajax to get the options
                        key:        'options',  // key of the list
                        select:    function(val) {
                            select.val(val);
                        },
                        beforeSend: function() {
                            select.disableElement();
                            var loader = $.tmpl(tmpl, {
                                id: '',
                                label: 'Loading...'
                            });
                            select.html(loader);
                        },
                        success: function(data) {
                            select.clear();
                            if (data instanceof Object) {
                                data = data[this.key];
                            }
                            if (data) {
                                $.each(data, function() {
                                    var label = this['label'], value = $.extend({title:label}, this),
                                        opt = $.tmpl(tmpl, value);
                                    select.append(opt);
                                });
                                this.select(this.value);
                                this.afterLoaded.call(select);
                            }
                        },
                        afterLoaded: function() {},
                        complete: function() { select.enableElement(); }
                    }, options || {});

                // Call AJAX Request
                if (opts.remote) {
                    $.ajax(opts);
                }
                // Get options entries from data
                else {
                    opts.beforeSend();
                    opts.success.call(opts, opts.data);
                }
            });
        },
        /**
         * Check if current view is scrolled into the matched selector
         */
        isScrolledIntoView: function() {
            var elm = $(this[0]),
                docViewTop = $(window).scrollTop(),
                docViewBottom = docViewTop + $(window).height(),
                elemTop = elm.offset().top,
                elemBottom = elemTop + elm.height();

            return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom));
        },
        /**
         * Scroll to the first element in selector
         * @param delay [optional] the delay of the scrolling 500ms by default
         */
        scrollHere: function(delay) {
            var elm = $(this[0]);
            $('html, body').animate({
                scrollTop: elm.offset().top
            }, delay || 500);
        },
        /**
         * Do jQuery Mobile silentscroll to the first element in selector
         */
        silentScroll: function() {
            var elm = $(this[0]);
            $.mobile.silentScroll(elm.offset().top)
        },
        /**
         * Disbale elements
         * @param clazz (optional) the disabled style class by default will be ui-state-disabled
         */
        disableElement: function(clazz) {
            return this.each(function() {
                $(this).addClass(clazz || "ui-state-disabled")
                       .attr("disabled", "disabled");
            });
        },
        /**
         * Enable elements
         * @param clazz (optional) the disabled style class by default will be ui-state-disabled
         */
        enableElement: function(clazz) {
            return this.each(function() {
                $(this).removeClass(clazz || "ui-state-disabled")
                       .removeAttr("disabled");
            });
        },
        /**
         * Set/Unset an input element readonly
         * @param status set to false to remove attribute readonly
         */
        readonly: function(status) {
            return this.each(function() {
                if (typeof status == 'undefined' || status !== false) { $(this).attr('readonly', 'readonly'); }
                else { $(this).removeAttr('readonly'); }
            });
        },
        /**
         * Serialize a Form into a string of json
         * dependency: json2.js
         * @param toObject true will output an object instead of json
         */
        jsonSerialize: function (toObject, exception) {
            var obj = {}, form = this[0], lastName = '', arr = [];
            if (!JSON) { throw 'Please include json2.js'; }

            if (form.tagName !== 'FORM') {
                return '';
            }

            $(form.elements).each(function () {
                var elt = $(this), count = $(':input[name=' + this.name + ']', form).length;
                if ((elt.is(':checkbox') || elt.is(':radio')) && !this.checked) { return; }
                if (!$.empty(this.name) || (exception && !$.inArray(this.name, exception))) {
                    if (!toObject || (toObject && elt.val() != null)) {
                        if (count > 1 && !elt.is(':radio')) {
                            arr.push(elt.val());
                            if (this.name != lastName) { arr = []; arr.push(elt.val()); }
                            obj[this.name] = arr;
                        } else { obj[this.name] = elt.val(); arr = []; }
                        lastName = this.name;
                    }
                }
            });

            return toObject ? obj : JSON.stringify(obj);
        },
        /**
         * Clear form inputs
         */
        formClear: function(except) {
            return this.each(function() {
                var form = $(this), isForm = this.tagName === 'FORM';
                if (!isForm) { return; }

                except = $.isArray(except) ? except : [except];
                $('*', form).filter(':input').each(function() {
                    var input = $(this), id = input.is(':checkbox, :radio') ? input.attr('name') : input.attr('id'),
                        skip = $.inArray(id, except) != -1;
                    if (input.is(':button, :submit') || skip) { return true; }
                    else if (input.is(':text, [type=hidden], select')) { input.val(''); }
                    else if (input.is(':checkbox, :radio')) {
                        $(':input[name="'+input.attr('name')+'"]', form)
                            .each(function() { this.checked = false; });
                    }
                });
            });
        },
        /**
         * Generate random id for the selected elements
         * @params len the length of the generated randorm string
         */
        randomId: function(len) {
            return this.each(function() {
                var el = $(this);
                el.attr('id', $.randomString(len || 8));
            });
        },
        /**
         * Get the outter html of the selected element(s)
         * this function is unchainable
         * @return array of the outer HTML
         */
        outerHTML: function() {
            return $.map(this, function(el) {
                return el.outerHTML;
            });
        },
        /**
         * Switch existing class with new class
         * @param fclazz existing class to change
         * @param nclazz new class to assign
         */
        switchClass: function(fclazz, nclazz) {
            return this.each(function() {
                var el = $(this);
                el.toggleClass(fclazz || '', false).addClass(nclazz || '');
            });
        }
    };
    // initialize plugins
    $.each(plugins, function(i) {
        $.fn[i] = this;
    });

})(jQuery);

// extending String to check if boolean value
String.prototype.bool = function() {
    return (/^true$/i).test(this);
};
// extending String to check if it's empty
String.prototype.empty = function() {
    return this == '';
};
// extending String to test if it starts with str
String.prototype.startsWith = function(str) {
    return (this.match('^' + str) == str);
};
// extending String to test if it ends with str
String.prototype.endsWith = function(str) {
    return (this.match(str + '$') == str);
};
// extending String to remove the whitespace from the beginning and end
String.prototype.trim = function() {
    return (this.replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, ''));
};
// extending String to convert the first letter to upper case
String.prototype.toUpperFirst = function() {
    return this.toLowerCase().replace(/(^[a-z])/g, function($1) { return $1.toUpperCase(); });
};
// extending String to convert dashed string into camel case
String.prototype.toCamel = function() {
    return this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
};
// extending String to count occurance in a string
String.prototype.count = function(ch) {
    return this.split(ch || '').length;
};