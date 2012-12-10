/*
  $Id: jquery.jr.pageprogressbar.js 13234 2012-11-19 15:26:39Z maloneyc $
  JATS Reader Page Progress Bar.
  Documentation:  https://confluence.ncbi.nlm.nih.gov/x/mQCN.
*/

/* For debugging convenience, uncomment this.  Then, calling debug() sets some
   globals for easy access to these objects.
function debug() {
    jrpm = $('#jr-content').data('jr.PageManager');
    jrpr = $('#jr-progress').data('jr.PageProgressBar');
    ri = jrpr.rangeinput;
}
*/
/*
  This work is in the public domain and may be reproduced, published or
  otherwise used without the permission of the National Library of Medicine (NLM).

  We request only that the NLM is cited as the source of the work.

  Although all reasonable efforts have been taken to ensure the accuracy and
  reliability of the software and data, the NLM and the U.S. Government  do
  not and cannot warrant the performance or results that may be obtained  by
  using this software or data. The NLM and the U.S. Government disclaim all
  warranties, express or implied, including warranties of performance,
  merchantability or fitness for any particular purpose.
*/

(function($) {
    if(!$.jr){
        $.jr = {};
    }

    $.jr.PageProgressBar = function(el, options) {
        var base = this;
        base.el = el;
        var $el = base.$el = $(el);
        $el.data('jr.PageProgressBar', base);

        // This plugin depends on the presence of a "point of communication", which should
        // be passed as the 'poc' option.  If it was not passed, then there's no way to
        // function; just return.
        if ( options.poc === null ) {
            console.error('PageProgressBar: point of communication (poc) was not provided');
            return;
        }

        // These constants are used to identify the source of a paging event.
        var RANGEINPUT = 0,
            PAGEMANAGER = 1;

        // Initialization method
        base.init = function() {
            base.options = $.extend({}, $.jr.PageProgressBar.defaultOptions, options);
            base.$poc = $(base.options.poc);
            // Monitor paging events
            base.$poc.bind('jr:pm:pages:changed', handlePageManEvent);

            // Assume at the start that we're hidden
            base.visible = false;

            // $input is the jquery wrapper of the <input> element itself.
            var $input = base.$input =
                $el.html(
                    '<div class="pr-text">' +
                    '  <span class="pr-np"></span> of <span class="pr-lp"></span>' +
                    //' · <span class="pr-pct"></span>' +
                    '</div>' +
                    '<input type="range" />'
                ).children('input').rangeinput({
                    css: {
                        slider: 'pr-slider',
                        input: "pr-pn",
                        handle: 'pr-handle',
                        progress: ''
                    },
                    min: 1,
                    max: 50,
                    value: 10,
                    step: 1,
                    progress: false
                });

            // The actual input field will be hidden
            $input.hide();
            //console.info("$input is %o", $input);

            // Move the <input> element to be the first child of div.pr-text
            var $prtext = $el.children('.pr-text');
            $prtext.hide()
            $prtext.prepend($input);
            //$prtext.prepend("Location ");

            // rangeinput is the RangeInput api object.
            base.rangeinput = base.$input.data('rangeinput');
            // A few other pointers to jQuery objects that we'll handle
            base.$pageNumSpan = $prtext.children('.pr-np');
            base.$lastPageSpan = $prtext.children('.pr-lp');
            base.$percentSpan = $prtext.children('.pr-pct');

            // This stores info about the last event that we ourselves fired.
            // It is used to detect when an event that comes back is a "loop-back"
            // event, so that we can break the cycle.
            base.lastEvent = {
                source: -1,
                max: 50,
                value: -1
            };

            // This stores the latest event that we got from the page manager while
            // we were hidden.  When hidden, we don't pass events down to the rangeinput.
            // The rangeinput uses the geometry of the slider to position the handle, and
            // when display is "none", the geometry is not accessible.
            // So this saves the event, and when we become visible, then we pass it along.
            base.lastPageManEvent = {
                found: false,  // true if this holds a new, valid event
                maxpage: 50,
                pagenum: -1,
                offset: 0
            };


            // Tie change events to turn the page:
            $input.change(handleRangeInputEvent);

            // Bind to show/hide events
            $el.bind("jr:panel:hide:after", handlePanelHideEvent);
            $el.bind("jr:panel:show:after", handlePanelShowEvent);
        };

        // Handle the event when the progress bar is made visible
        function handlePanelShowEvent() {
            var lpe = base.lastPageManEvent;
            if (lpe.found) {
                sendSetRange(lpe.maxpage, lpe.pagenum, lpe.offset);
                base.lastPageManEvent.found = false;
            }
        }
        function handlePanelHideEvent() {
        }

        // Handle events that come from the rangeinput widget.  These happen when the user
        // manipulates it, in order to change the page
        function handleRangeInputEvent(event, value) {
            //console.info("pageprogressbar:  received rangeinput change event: %o.  " +
            //    "value = %d", event, value);

            if (typeof value === "undefined") {
                // The user pressed "Enter" while inside the text box, so we came
                // here directly.  Relay the new value to the rangeinput widget.
                //console.info("  user changed the input field directly");
                base.rangeinput.setValue(base.$input.val());
                return;
            }

            // We might be getting this event in response to a setRange() call
            // that we made in the handlePageManEvent.  In that case, we want to break the
            // loop, and not send this to the pagemanager
            // *Do* send the event to the pagemanager if any of these are true:
            //   - lastEvent is undefined
            //   - lastEvent.source is not PAGEMANAGER
            //   - either max or value doesn't match

            var levt = base.lastEvent;
            var max = base.rangeinput.getConf().max;
            if ( !levt || levt.source != PAGEMANAGER || levt.max != max ||
                 ( !isNaN(value) && levt.value != value ) )
            {
                //var infoMsg = "pageprogressbar:  firing a new page number event; ";
                //if (levt) {
                //    infoMsg += "was: max = " + levt.max + ", value = " + levt.value + "; ";
                //}
                //infoMsg += "now: max = " + max + ", value = " + value;
                //console.info(infoMsg);

                levt.source = RANGEINPUT;  //
                levt.max = max;
                levt.value = value;
                var pocEvent = jQuery.Event("jr:pm:go:page", { originalEvent: event });
                base.$poc.trigger(pocEvent, {pn: value});
            }
            else {
                levt.source = RANGEINPUT;
            }
        }

        // Handle paging events from the PageManager ('jr:pm:pages:changed' events).
        // p contains the paging information:
        //    p.pn: new page number
        //    p.po: the percentage offset that we are at in the book
        //    p.lp: last page
        function handlePageManEvent(e, p) {
            if ( ! $.isPlainObject(p) ) return true;
            var et = e.type;
            if ( et === 'jr:pm:pages:changed' && p.pn !== null && p.lp !== null) {
                //console.info("pageprogressbar:  got paging event: lp: " + p.lp +
                //         ", pn: " + p.pn + ", po: " + p.po);

                // We might be getting this event in response to a page change event that
                // we ourselves fired.  In that case, we want to break the loop, and not
                // send this paging info down to the rangeinput widget.
                // *Do* send the event to rangeinput if any of these are true:
                //   - lastEvent is undefined
                //   - lastEvent.source is not RANGEINPUT
                //   - either max or value doesn't match

                var levt = base.lastEvent;
                if (!levt || levt.source !== RANGEINPUT || levt.max != p.lp || levt.value != p.pn) {
                    if ($el.css("display") != "none")
                    {
                        sendSetRange(p.lp, p.pn, p.po);
                    }
                    else {
                        // Save it for later
                        base.lastPageManEvent.found = true;
                        base.lastPageManEvent.maxpage = p.lp;
                        base.lastPageManEvent.pagenum = p.pn;
                        base.lastPageManEvent.offset = p.po;
                    }
                }
                else {
                    levt.source = PAGEMANAGER;
                }

                // Even if this is in response to a paging event that we fired, we still
                // want to set the text fields.  This is important because the page manager
                // computes the p.po percentage offset.
                base.$pageNumSpan.text(p.pn);
                base.$lastPageSpan.text(p.lp);
                base.$percentSpan.text(Math.floor(p.po) + "%");
            }
            return true;
        }

        function sendSetRange(maxpage, pagenum, offset) {
            var levt = base.lastEvent;

            //var infoMsg = "pageprogressbar:  setting rangeinput's range; ";
            //if (levt) {
            //    infoMsg += "was: max = " + levt.max + ", value = " + levt.value + "; ";
            //}
            //infoMsg += "now: max = " + maxpage + ", value = " + pagenum;
            //console.info(infoMsg);

            levt.source = PAGEMANAGER;
            levt.max = maxpage;
            levt.value = pagenum;
            base.rangeinput.setRange(undefined, maxpage, pagenum);
        }

        // Run initializer
        base.init();
    };

    $.jr.PageProgressBar.defaultOptions = {
    };

    // This is the jQuery plugin function.  The whole thing is kicked off from here.
    // It should be invoked on a pre-existing DOM object, and the argument is a set
    // of options.  For example:
    //   $('#jr-progress').jr_PageProgressBar({poc: '#jr-content'});

    $.fn.jr_PageProgressBar = function(options) {
        // The 'this' keyword refers to the jQuery object the plugin was invoked on,
        // which, in general, is a list; but is actually just one element.  Hence the
        // 'each'.
        return this.each(function() {
            // Here, the 'this' keyword refers to a single DOM element
            (new $.jr.PageProgressBar(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.PageProgressBar if it has been attached to the object.
    $.fn.getjr_PageProgressBar = function(){
        return this.data("jr.PageProgressBar");
    };

})(jQuery);
