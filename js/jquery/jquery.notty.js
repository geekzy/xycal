/*!
 * jQuery Notty
 * http://www.userdot.net/#!/jquery
 *
 * Copyright 2011, UserDot www.userdot.net
 * Licensed under the GPL Version 3 license.
 * Version 1.0.0
 *
 */
(function($){
    $.notty = function(settings){
        var container, notty, hide, image, right, left, inner;
        settings = $.extend({
            title: undefined,
            content: undefined,
            style: undefined,
            timeout: 0,
            img: undefined,
            showTime: true,
            click: function() {
                var $el = $(this);
                $el.removeClass("pop").addClass("remove").delay(300).queue(function() {
                    var p = $el.parents('#nottys');
                    $el.clearQueue();
                    $el.remove();
                    // remove container
                    if (p.find('div').length == 0) { p.remove(); }
                });
            },
            nohide: false
        }, settings);
        container = $("#nottys");
        if (!container.length){
            container = $("<div>", {
                id:"nottys"
            }).appendTo(document.body);
        };
        notty = $("<div>");
        notty.addClass("notty pop");
        if (settings.style) {
            notty.addClass(settings.style);
        }
        hide = $("<div>", {
            click: function() {
                var $el = $(this).parent();
                $el.removeClass("pop").addClass("remove").delay(300).queue(function() {
                    var p = $el.parents('#nottys');
                    $el.clearQueue();
                    $el.remove();
                    // remove container
                    if (p.find('div').length == 0) { p.remove(); }
                })
            }
        });
        hide.addClass("hide");
        hide.html("Hide notification");
        if (settings.img != undefined){
            image = $("<div>", {
                style:"background: url('"+settings.img+"')"
            });
            image.addClass("img");
            left = $("<div class='left'>");
            right = $("<div class='right'>");
            if (settings.title != undefined){
                var htmlTitle = "<h2>"+settings.title+"</h2>"
            } else {
                var htmlTitle = ""
            }
            if (settings.content != undefined){
                var htmlContent = settings.content
            } else {
                var htmlContent = ""
            }
            inner = $("<div>", {
                html:htmlTitle + htmlContent
            });
            inner.addClass("inner");
            inner.appendTo(right);
            image.appendTo(left);
            left.appendTo(notty);
            right.appendTo(notty)
        } else {
            if (settings.title != undefined){
                var htmlTitle = "<h2>"+settings.title+"</h2>"
            } else {
                var htmlTitle = ""
            }
            if (settings.content != undefined){
                var htmlContent=settings.content
            } else {
                var htmlContent=""
            }
            inner=htmlTitle+htmlContent;
            notty.html(inner)
        }
        hide.appendTo(notty);
        function timeSince(time){
            var time_formats=[[2,"One second","1 second from now"],[60,"seconds",1],[120,"One minute","1 minute from now"],[3600,"minutes",60],[7200,"One hour","1 hour from now"],[86400,"hours",3600],[172800,"One day","tomorrow"],[604800,"days",86400],[1209600,"One week","next week"],[2419200,"weeks",604800],[4838400,"One month","next month"],[29030400,"months",2419200],[58060800,"One year","next year"],[2903040000,"years",29030400],[5806080000,"One century","next century"],[58060800000,"centuries",2903040000]];
            var seconds=(new Date-time)/1000;
            var token="ago",list_choice=1;
            if(seconds<0){
                seconds=Math.abs(seconds);
                token="from now";
                list_choice = 1;
            }
            var i=0,format;
            while(format = time_formats[i++])if(seconds<format[0]){
                if(typeof format[2]=="string")return format[list_choice];else return Math.floor(seconds/format[2])+" "+format[1]
            }
            return time
        };
        if (settings.showTime != false) {
            var timestamp = Number(new Date());
            timeHTML = $("<div>", {
                html:"<strong>"+timeSince(timestamp)+"</strong> ago"
            });
            timeHTML.addClass("time").attr("title",timestamp);
            if (settings.img != undefined) {
                timeHTML.appendTo(right)
            } else {
                timeHTML.appendTo(notty)
            }
            setInterval(function(){
                $(".time").each(function(){
                    var timing=$(this).attr("title");
                    $(this).html("<strong>"+timeSince(timing)+"</strong> ago");
                })
            },4000)
        }
        if (!settings.nohide) {
            notty.hover(function(){
                hide.show()
            }, function(){
                hide.hide()
            });
        }
        notty.prependTo(container);
        notty.show();
        if (settings.timeout){
            setTimeout(function(){
                notty.removeClass("pop").addClass("remove").delay(300).queue(function(){
                    var p = notty.parents('#nottys');
                    notty.clearQueue();
                    notty.remove();
                    // remove container
                    if (p.find('div').length == 0) { p.remove(); }
                })
            },settings.timeout)
        }
        if (settings.click != undefined){
            notty.addClass("click");
            notty.click(function(event){
                var target = $(event.target);
                if (!target.is(".hide")) {
                    settings.click.call(this);
                }
            })
        }
        return this
    }
})(jQuery);
