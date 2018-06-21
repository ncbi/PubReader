/**
 * jquerytools rangeinput widget.
 *
 * This version of this file is from https://github.com/Klortho/jquerytools, forked from
 * https://github.com/Patrick64/jquerytools, which was forked from
 * https://github.com/jquerytools/jquerytools.
 *
 * @license
 * jQuery Tools @VERSION Rangeinput - HTML5 <input type="range" /> for humans
 *
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://flowplayer.org/tools/rangeinput/
 *
 * Since: Mar 2010
 * Date: @DATE
 */
(function($) {

  /* Test console.  This waits ten seconds, and then pops up an alert box.

    dcon = (function() {
        var starttime = (new Date()).getTime();
        var text = "Console, start:  " + starttime + ".\n";

        var info = function(msg) {
            var t = (new Date()).getTime() - starttime;
            text += t + ": " + msg + "\n";
        };
        var display = function() {
            alert(text);
        };

        window.setTimeout(display, 10000);

        return {
            starttime: starttime,
            info: info,
            display: display
        };
    })();
  */


    $.tools = $.tools || {version: '@VERSION'};

    var tool;

    // The default configuration for new rangeinputs
    tool = $.tools.rangeinput = {

        conf: {
            min: 0,
            max: 100,       // as defined in the standard
            step: 'any',    // granularity of the value. a non-zero float or int (or "any")
            steps: 0,
            value: 0,
            precision: undefined,
            vertical: 0,
            keyboard: true,
            progress: false,
            speed: 100,

            // set to null if not needed
            css: {
                input:    'range',
                slider:   'slider',
                progress: 'progress',
                handle:   'handle'
            }
        }
    };

//{{{ fn.drag

    /*
        FULL featured drag and drop. 0.7 kb minified, 0.3 gzipped. done.
        Who told d'n'd is rocket science? Usage:

        $(".myelement").drag({y: false}).bind("drag", function(event, x, y) {
            // do your custom thing
        });

        Configuration:
            x: true,        // enable horizontal drag
            y: true,        // enable vertical drag
            drag: true      // true = perform drag, false = only fire events

        Events: dragStart, drag, dragEnd.
    */
    var doc, draggable;

    $.fn.drag = function(conf) {

        // disable IE specialities
        document.ondragstart = function () { return false; };

        conf = $.extend({x: true, y: true, drag: true}, conf);

        var eventlist =
            typeof Modernizer == "undefined"
                ? "touchstart touchend mousedown mouseup"
                : Modernizr.touch ? "touchstart touchend" : "mousedown mouseup";
        //dcon.info("Binding to events " + eventlist);
        doc = doc || $(document).bind(eventlist, function(e) {
            //dcon.head(e.type);
            var el = $(e.target);

            // Only consider events of the right type, and, in the case of touch events,
            // only those when the user has just one finger touching the device.
            if ( ( e.type == "mousedown" ||
                   e.type == "touchstart" && e.originalEvent.touches.length == 1 ) &&
                 el.data("drag") )
            {
                // touchstart/touchmove use e.orginalEvent.pageX/Y instead of e.pageX/Y
                var offset = el.position();
                //dcon.info("offset.left = " + offset.left + ", offset.top = " + offset.top);
                var x0, y0;
                if (e.type == "mousedown") {
                    //dcon.info("e.pageX = " + e.pageX + ", e.originalEvent.pageX = " + e.pageX);
                    x0 = (e.pageX || e.originalEvent.pageX) - offset.left,
                    y0 = (e.pageY || e.originalEvent.pageY) - offset.top;
                }
                else {  // touchstart
                    //dcon.info("..screenX = " + e.originalEvent.touches[0].screenX);
                    x0 = e.originalEvent.touches[0].screenX - offset.left;
                    y0 = e.originalEvent.touches[0].screenY - offset.top;
                }
                //dcon.info("event " + e.type + ", x0 = " + x0);

                var start = true;

                var eventlist =
                    typeof Modernizer == "undefined"
                        ? "touchmove.drag mousemove.drag"
                        : Modernizr.touch ? "touchmove.drag" : "mousemove.drag";
                //dcon.info("Binding to events " + eventlist);
                doc.bind(eventlist, function(e) {
                    //dcon.head(e.type);

                    var x, y;
                    if (e.type == "mousemove") {
                        //dcon.info("e.pageX = " + e.pageX + ", e.originalEvent.pageX = " + e.pageX);
                        x = (e.pageX || e.originalEvent.pageX) - x0,
                        y = (e.pageY || e.originalEvent.pageY) - y0;
                    }
                    else {  // touchstart
                        //dcon.info("..screenX = " + e.originalEvent.touches[0].screenX);
                        x = e.originalEvent.touches[0].screenX - x0;
                        y = e.originalEvent.touches[0].screenY - y0;
                    }
                    //dcon.info("event " + e.type + ", x = " + x);

                    var props = {};

                    if (conf.x) { props.left = x; }
                    if (conf.y) { props.top = y; }

                    if (start) {
                        el.trigger("dragStart");
                        start = false;
                    }
                    if (conf.drag) { el.css(props); }
                    el.trigger("drag", [y, x]);
                    draggable = el;
                });

                //dcon.info("Setting preventDefault()");
                e.preventDefault();

            } else {

                try {
                    if (draggable) {
                        draggable.trigger("dragEnd");
                    }
                } finally {
                    //dcon.info("Unbinding from events mousemove.drag touchmove.drag");
                    doc.unbind("mousemove.drag touchmove.drag");
                    draggable = null;
                }
            }

        });

        return this.data("drag", true);
    };

//}}}



    function round(value, precision) {
        var n = Math.pow(10, precision);
        return Math.round(value * n) / n;
    }

    // get hidden element's width or height even though it's hidden
    function dim(el, key) {
        var v = parseInt(el.css(key), 10);
        if (v) { return v; }
        var s = el[0].currentStyle;
        return s && s.width && parseInt(s.width, 10);
    }

    function hasEvent(el) {
        var e = el.data("events");
        return e && e.onSlide;
    }

    function RangeInput(input, conf) {

        // private variables
        var self = this,
             css = conf.css,
             root = $("<div><div/><a href='#'/></div>").data("rangeinput", self),
             vertical,
             value,         // current value
             origo,         // handle's start point
             len,               // length of the range
             pos;               // current position of the handle

        // create range
        input.before(root);

        var handle = root.addClass(css.slider).find("a").addClass(css.handle),
             progress = root.find("div").addClass(css.progress);

        // get (HTML5) attributes into configuration
        $.each("min,max,step,value".split(","), function(i, key) {
            var val = input.attr(key);
            if (parseFloat(val)) {
                conf[key] = parseFloat(val, 10);
            }
        });

        var range = conf.max - conf.min,
             step = conf.step == 'any' ? 0 : conf.step,
             precision = conf.precision;

        if (precision === undefined) {
            try {
                precision = step.toString().split(".")[1].length;
            } catch (err) {
                precision = 0;
            }
        }

        // Replace built-in range input (type attribute cannot be changed)
        if (input.attr("type") == 'range') {
            var def = input.clone().wrap("<div/>").parent().html(),
                clone = $(def.replace(/type/i, 'type="text" data-orig-type'));
            
            clone.val(conf.value);
            input.replaceWith(clone);
            input = clone;
        }

        input.addClass(css.input);

        var fire = $(self).add(input);
        var fireOnSlide = true;


        /**
            The flesh and bone of this tool. All sliding is routed trough this.

            @param evt types include: click, keydown, blur and api (setValue call)
            @param isSetValue when called trough setValue() call (keydown, blur, api)

            vertical configuration gives additional complexity.
         */
        function slide(evt, x, val, isSetValue) {

            // calculate value based on slide position
            if (val === undefined) {
                val = x / len * range;

            // x is calculated based on val. we need to strip off min during calculation
            } else if (isSetValue) {
                val -= conf.min;
            }

            // increment in steps
            if (step) {
                val = Math.round(val / step) * step;
            }

            // count x based on value or tweak x if stepping is done
            if (x === undefined || step) {
                x = val * len / range;
            }

            // crazy value?
            if (isNaN(val)) { return self; }

            // stay within range
            x = Math.max(0, Math.min(x, len));
            val = x / len * range;

            if (isSetValue || !vertical) {
                val += conf.min;
            }

            // in vertical ranges value rises upwards
            if (vertical) {
                if (isSetValue) {
                    x = len -x;
                } else {
                    val = conf.max - val;
                }
            }

            // precision
            val = round(val, precision);
            if (val == value) { return self; }

            // onSlide
            var isClick = evt.type == "click";
            if (fireOnSlide && value !== undefined && !isClick) {
                evt.type = "onSlide";
                fire.trigger(evt, [val, x]);
                if (evt.isDefaultPrevented()) { return self; }
            }

            // Speed of animation (really duration):  if it was a click, use the configured value;
            // if it's a drag, then use zero (instant).
            var speed = isClick ? conf.speed : 0;

            // Function called at the end of the animation will fire a change event.
            var callback = function()  {
                //console.info("rangeinput:  firing a rangeinput change event.");
                evt.type = "change";
                fire.trigger(evt, [val]);
             };

            if (vertical) {
                handle.animate({top: x}, speed, callback);
                if (conf.progress) {
                    progress.animate({height: len - x + handle.height() / 2}, speed);
                }

            } else {
                handle.animate({left: x}, speed, callback);
                if (conf.progress) {
                    progress.animate({width: x + handle.width() / 2}, speed);
                }
            }

            // store current value
            value = val;
            pos = x;

            // se input field's value
            input.val(val);

            return self;
        }


        $.extend(self, {

            getValue: function() {
                return value;
            },

            setValue: function(val, e) {
                init();
                return slide(e || $.Event("api"), undefined, val, true);
            },

            setMax: function(val) {
                //console.info("Setting max to " + val);
                conf.max = val;
                range = conf.max - conf.min;
                return self.setValue(value);
            },

            setRange: function(min, max, val) {
                if (typeof min !== "undefined") { conf.min = min; }
                if (typeof max !== "undefined") { conf.max = max; }
                range = conf.max - conf.min;
                return self.setValue(typeof val !== "undefined" ? val : value);
            },

            getConf: function() {
                return conf;
            },

            getProgress: function() {
                return progress;
            },

            getHandle: function() {
                return handle;
            },

            getInput: function() {
                return input;
            },

            step: function(am, e) {
                e = e || $.Event();
                var step = conf.step == 'any' ? 1 : conf.step;
                self.setValue(value + step * (am || 1), e);
            },

            // HTML5 compatible name
            stepUp: function(am) {
                return self.step(am || 1);
            },

            // HTML5 compatible name
            stepDown: function(am) {
                return self.step(-am || -1);
            }

        });

        // callbacks
        $.each("onSlide,change".split(","), function(i, name) {

            // from configuration
            if ($.isFunction(conf[name]))  {
                $(self).bind(name, conf[name]);
            }

            // API methods
            self[name] = function(fn) {
                if (fn) { $(self).bind(name, fn); }
                return self;
            };
        });


        // dragging
        handle.drag({drag: false}).bind("dragStart", function() {

            /* do some pre- calculations for seek() function. improves performance */
            init();

            // avoid redundant event triggering (= heavy stuff)
            fireOnSlide = hasEvent($(self)) || hasEvent(input);


        }).bind("drag", function(e, y, x) {

            if (input.is(":disabled")) { return false; }
            slide(e, vertical ? y : x);

        }).bind("dragEnd", function(e) {
            if (!e.isDefaultPrevented()) {
                e.type = "change";
                fire.trigger(e, [value]);
            }

        }).click(function(e) {
            return e.preventDefault();
        });

        // clicking
        root.click(function(e) {
            if (input.is(":disabled") || e.target == handle[0]) {
                return e.preventDefault();
            }
            init();
            var fix = vertical ? handle.height() / 2 : handle.width() / 2;
            slide(e, vertical ? len-origo-fix + e.pageY  : e.pageX -origo -fix);
        });

        if (conf.keyboard) {

            input.keydown(function(e) {

                if (input.attr("readonly")) { return; }

                var key = e.keyCode,
                     up = $([75, 76, 38, 33, 39]).index(key) != -1,
                     down = $([74, 72, 40, 34, 37]).index(key) != -1;

                if ((up || down) && !(e.shiftKey || e.altKey || e.ctrlKey)) {

                    // UP:  k=75, l=76, up=38, pageup=33, right=39
                    if (up) {
                        self.step(key == 33 ? 10 : 1, e);

                    // DOWN:    j=74, h=72, down=40, pagedown=34, left=37
                    } else if (down) {
                        self.step(key == 34 ? -10 : -1, e);
                    }
                    return e.preventDefault();
                }
            });
        }


        input.blur(function(e) {
            var val = $(this).val();
            if (val !== value) {
                self.setValue(val, e);
            }
        });


        // HTML5 DOM methods
        $.extend(input[0], { stepUp: self.stepUp, stepDown: self.stepDown});


        // calculate all dimension related stuff
        function init() {
            vertical = conf.vertical || dim(root, "height") > dim(root, "width");

            if (vertical) {
                len = dim(root, "height") - dim(handle, "height");
                origo = root.offset().top + len;

            } else {
                len = dim(root, "width") - dim(handle, "width");
                origo = root.offset().left;
            }
        }

        function begin() {
            init();
            //self.setValue(conf.value !== undefined ? conf.value : conf.min);
        }
        begin();

        // some browsers cannot get dimensions upon initialization
        if (!len) {
            $(window).load(begin);
        }
    }

    $.expr[':'].range = function(el) {
        var type = el.getAttribute("type");
        return type && type == 'range' || !!$(el).filter("input").data("rangeinput");
    };


    // jQuery plugin implementation
    $.fn.rangeinput = function(conf) {

        // already installed
        if (this.data("rangeinput")) { return this; }

        // extend configuration with globals
        conf = $.extend(true, {}, tool.conf, conf);

        var els;

        this.each(function() {
            var el = new RangeInput($(this), $.extend(true, {}, conf));
            var input = el.getInput().data("rangeinput", el);
            els = els ? els.add(input) : input;
        });

        return els ? els : this;
    };


}) (jQuery);

