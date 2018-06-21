/* $Id: jquery.jr.switcher.js 15003 2013-03-25 15:53:07Z kolotev $

    Module:

        JATS Reader's Switcher

    Author:

        Andrey Kolotev

    Synopsis:

        Switcher (S) is button like element, which has a 2 states on and off.
        It controls assosiated objects/panels. Switchers are independent controls unless
        they are included into the Group (SG) or placed on Toolbar (T) and initiated with
        "type": "radio". SG or T is a point of communication between all Switchers
        of given SG or T.

        The controled object suppose to listen on the Switcher's DOM element for
        ON/OFF events "jr:switch:on:after" and "jr:switch:off:after" and do
        corresponding to the switcher state action.

    Usage:
        Switcher:
            $('switcher-selector').jr_Switcher({
                'state': false,
                'type': 'radio',
                'poc': 'toolbar-or-group-selector',
                'autoOff' : 'false or true'})
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

(function($){

    if(!$.jr){
        $.jr = new Object();
    };


    //
    var $u  = $.jr.utils,
        evt = {
        SW_ON_BEFORE:   'jr:switch:on:before',  // event emmited before state turned to ON
        SW_ON:          'jr:switch:on',         // turn switch ON
        SW_ON_STATELESS:'jr:switch:on:stateless',         // turn switch ON
        SW_ON_AFTER:    'jr:switch:on:after',   // state changed to ON
        SW_OFF_BEFORE:  'jr:switch:off:before', // event emmited before state turned to OFF
        SW_OFF:         'jr:switch:off',        // turn switch OFF
        SW_OFF_STATELESS:'jr:switch:off:stateless',        // turn switch OFF
        SW_OFF_AFTER:   'jr:switch:off:after'   // state changed to OFF
    };


    // ========================================================================= $.jr.Switcher
    // switcher reacts on users clicks/touches to reveal the panel and updates it own state
    // based on its type when other switchers broadcast evt.SW_ON_AFTER event if own type is radio.
    // options = {
    //      state:  'true of false - for initial state of the switcher true - ON, false - OFF'
    //              false state is default
    //      type:   'radio' or 'chkbox' - radio means exclusivity of the switcher,
    //                                    all other switchers of the group or toolbar
    //                                    if applicable should turn OFF it this one goes ON
    //                                    'radio' type is default
    //      poc:    'point of communication with switchers in SG or in Toolbar'
    //              default point of communication is a parent element in the DOM tree.
    //      autoOff: the flag which indicates to turn switch off if the action took place
    //               outside of the panel, which this switch controls
    // }

    $.jr.Switcher = function(el, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el        = $(el);
        base.el         = el;

        // Add a reverse reference to the DOM object
        base.$el.data("jr.Switcher", base);
        base.clickEvName = $u.touch ? 'touchend' : 'click'

        //
        base.init = function() {
            base.options    = $.extend({}, $.jr.Switcher.defaultOptions, options);
            base.$poc       = $(base.options.poc)       // point of communication
            base.type       = base.options.type         // type of the switcher radio/chkbox
            base.autoOff    = base.options.autoOff
            base.stateless  = false

            {
                var s = $u.lsGet('state_' + base.$el.attr('id'))
                base.options.state = (s != null ? s : base.options.state)
            }

            // sanity checks
            if (typeof base.options.state !== "boolean")
                base.options.state = $.jr.Switcher.defaultOptions.state;

            if (typeof base.autoOff !== "boolean")
                base.autoOff = base.options.autoOff = $.jr.Switcher.defaultOptions.autoOff;

            if (base.type !== "radio" && base.type !== "chkbox")
                base.type = base.options.type = $.jr.Switcher.defaultOptions.type;

            // Initialization code here
            base.$el.bind(base.clickEvName, base.clickHandler)             // attach event handler to handle clicking on the switch
            base.$el.bind(evt.SW_ON, base.turnOnHandler)                   // attach event to be programmatically turned ON
            base.$el.bind(evt.SW_ON_STATELESS, base.turnOnHandler)         // attach event to be programmatically turned ON
            //
            if (base.options.state)
                base.$el.trigger(evt.SW_ON)

            base.$el.removeClass('hidden')
        };

        //
        base.toggleSwitch = function () {
            // if switch is ON
            if (base.state) {                                           // turn itself OFF
                base.$poc.unbind(evt.SW_ON_AFTER, base.turnOffHandler)
                base.$poc.unbind(evt.SW_OFF, base.turnOffHandler)
                base.$poc.unbind(evt.SW_OFF_STATELESS, base.turnOffHandler)
                //
                base.$poc.trigger(evt.SW_OFF_BEFORE)                     // broadcast event for other buttons
                base.$el.trigger(evt.SW_OFF_BEFORE)                      // broadcast event for controlable object/panel
                //
                base.state = ! base.state
                base.$el.removeClass('on')
                //
                if (base.autoOff) {
                    $(document).unbind(base.clickEvName, base.turnOffHandler);
                    $(document).unbind("show.canvas", base.turnOffHandler);
                }
                //
                base.$poc.trigger(evt.SW_OFF_AFTER)                     // broadcast event for other buttons
                base.$el.trigger(evt.SW_OFF_AFTER)                      // broadcast event for controlable object/panel
            } else {                                                    // turn itself ON
                base.$poc.trigger(evt.SW_ON_BEFORE)                     // broadcast event for other buttons
                base.$el.trigger(evt.SW_ON_BEFORE)                      // broadcast event for controlable object/panel
                //
                base.state = ! base.state
                base.$el.addClass('on')
                base.$el.bind(evt.SW_OFF, base.turnOffHandler)           // bind itself to be notified programmatically
                base.$el.bind(evt.SW_OFF_STATELESS, base.turnOffHandler)           // bind itself to be notified programmatically
                //
                if (base.autoOff) {
                    $(document).bind(base.clickEvName, base.turnOffHandler);
                    $(document).bind("show.canvas", base.turnOffHandler);
                }
                //
                base.$poc.trigger(evt.SW_ON_AFTER)
                base.$el.trigger(evt.SW_ON_AFTER)

                // if radio, then bind itself to listen other switchers evt.SW_ON_AFTER event
                // but it has to be after 2 above triggers, to prevent loops or unexpected effects.
                if (base.type === "radio") {
                    base.$poc.bind(evt.SW_ON_AFTER, base.turnOffHandler) // bind itself to be notified by other other buttons
                }
            }
            // save state of the switcher
            if (! base.stateless)
                $u.lsSet('state_' + base.$el.attr('id'), base.state)
        };

        // ***********
        base.turnOnHandler = function(e) {
            base.stateless = (e.type === evt.SW_ON_STATELESS ? true : false)
            if (! base.state)
                base.toggleSwitch()
        };

        //
        base.turnOffHandler = function(e) {
            base.stateless = (e.type === evt.SW_OFF_STATELESS ? true : false)
            if (base.state)
                base.toggleSwitch()
        };

        //
        base.clickHandler = function(e) {
            e.stopPropagation()
            base.toggleSwitch()
        };

        // Run initializer
        base.init();
    };

    //
    $.jr.Switcher.defaultOptions = {
        state:      false,                      // false corresponds to OFF and true corresponds to ON
        type:       'radio',                    // radio or chkbox
        poc:        null,                       // toolbar selector
        autoOff:    true                       // automatically turn off if action was taken place outside of contrable panel
    };

    // jQuery like chainable wrapper
    $.fn.jr_Switcher = function(options) {
        return this.each(function(){
            (new $.jr.Switcher(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.Panel if it has been attached to the object.
    $.fn.getjr_Switcher = function() {
        return this.data("jr.Switcher");
    };
})(jQuery);
