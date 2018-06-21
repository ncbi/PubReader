/* $Id: jquery.jr.panel.js 13234 2012-11-19 15:26:39Z maloneyc $

    Module:

        JATS Reader's Panel

    Author:

        Andrey Kolotev

    Synopsis:

        Panel (P) module is dedicated to the support of rectangular panels, which
        are appearing on user's demand  by interacting with Switcher or could be manipulated
        programmatically but better to manipulate panel via Switcher.

    Usage:
        Panel
            $('panel-selector').jr_Panel({'poc': 'switcher-selector', 'inverted': false, propogateClick: false})

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
        $doc = $(document),
        evt = {
        P_SHOW:             'jr:panel:show',        // show panel event
        P_SHOW_STATELESS:   'jr:panel:show:stateless', // show panel without saving state event
        P_HIDE:             'jr:panel:hide',        // hide panel event
        P_HIDE_STATELESS:   'jr:panel:hide:stateless', // hide panel without saving state event
        P_SHOW_AFTER:       'jr:panel:show:after',
        P_HIDE_AFTER:       'jr:panel:hide:after',

    }


    // ========================================================================= $.jr.Panel
    // options = {
    //      poc:    'point of communication with switchers in SG or in Toolbar'
    //              default point of communication is a parent element in the DOM tree.
    // }


    $.jr.Panel = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el        = $(el);
        base.el         = el;

        // Add a reverse reference to the DOM object
        base.$el.data("jr.Panel", base);

        base.init = function(){//var t = new Date; console.info('%s.%s: Panel[%s]: init(): started', t.getTime(), t.getMilliseconds(), base.$el.attr('id'))
            base.options = $.extend({},$.jr.Panel.defaultOptions, options);

            //
            base.$poc   = $(base.options.poc)
            // Initialization code here
            base.clickEvName = $u.touch ? 'touchend' : 'click'

            base.$el.bind(evt.P_SHOW,     base.showHandler)             // attach event handler to handle show requests
            base.$el.bind(evt.P_SHOW_STATELESS, base.showHandler)       // attach event handler to handle show requests
            base.$el.bind(evt.P_HIDE,     base.hideHandler)             // attach event handler to handle hide requests
            base.$el.bind(evt.P_HIDE_STATELESS, base.hideHandler)       // attach event handler to handle hide requests
            base.$el.bind(base.clickEvName, base.clickHandler)          // attach event handler to handle hide requests
            base.$poc.bind("jr:switch:on:after", base.options.inverted ? base.hideHandler : base.showHandler)
            base.$poc.bind("jr:switch:off:before", base.options.inverted ? base.showHandler : base.hideHandler)
            base.$el.find('.jr-p-close').bind(base.clickEvName, base.hideHandler)
        };


        //
        base.clickHandler = function(e) {
            ! base.options.propogateClick && (e.type === "click"  || e.type === "touchend")
                ? e.stopPropagation() : 0
            $doc.trigger('jr:user:active')
        };


        //
        base.hideHandler = function(e) {

            if (e.type === evt.P_HIDE || e.type === base.clickEvName) {
                base.$poc.trigger("jr:switch:off")
            } else if (e.type === evt.P_HIDE_STATELESS) {
                base.$poc.trigger("jr:switch:off:stateless")
            } else {
                base.$el.addClass('hidden')
                base.$el.trigger(evt.P_HIDE_AFTER)
            }
        };

        //
        base.showHandler = function(e) {
            if (e.type === evt.P_SHOW) {
                base.$poc.trigger("jr:switch:on")
            } else if (e.type === evt.P_SHOW_STATELESS) {
                base.$poc.trigger("jr:switch:on:stateless")
            } else {
                base.$el.removeClass('hidden')
                base.$el.trigger(evt.P_SHOW_AFTER)
            }

        };

        // Run initializer
        base.init();
    };

    $.jr.Panel.defaultOptions = {
        'poc': null,
        'propogateClick': false,
        'inverted': false
    };

    $.fn.jr_Panel = function(options){
        return this.each(function(){
            (new $.jr.Panel(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.Panel if it has been attached to the object.
    $.fn.getjr_Panel = function(){
        return this.data("jr.Panel");
    };


})(jQuery);
