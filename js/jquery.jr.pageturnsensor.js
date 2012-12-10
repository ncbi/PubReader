/* $Id: jquery.jr.pageturnsensor.js 13234 2012-11-19 15:26:39Z maloneyc $
    Module:

        JATS Reader's Page Turn Button
        This module controls buttons, which should be provided
        for mouse capable platforms

    Author:

        Andrey Kolotev

    Synopsis:

        call it as :
            // associate with left button
            $('#jr-pm-left').jr_PageTurnSensor({action: 'next', actionEv: 'jr:pm:go:next:page', piEv: 'jr:pm:pages:changed', poc: '#jr-content'})
            // associate with right button
            $('#jr-pm-right').jr_PageTurnSensor({action: 'prev', actionEv: 'jr:pm:go:prev:page', piEv: 'jr:pm:pages:changed' poc: '#jr-content'})


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

    var $u = $.jr.utils

    // Options
    //      @param action   - indicator of page turning destination [next, prev, first, last]
    //      @param poc      - Point of Communication selector
    $.jr.PageTurnSensor = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // this plugin depends on the selector 'directionIncrement' and 'pocSelector'
        // if it was not passed, there is nothing to show
        if ( options.poc    == null ) {console.error('PageTurnSensor: Point Of Content (poc) with Page Manager is not provided'); return}
        if ( options.action == null ) {console.error('PageTurnSensor: action is not provided'); return}
        if ( options.actionEv == null ) {console.error('PageTurnSensor: actionEv is not provided'); return}
        if ( options.piEv == null ) {console.error('PageTurnSensor: piEv is not provided'); return}

        // Access to jQuery and DOM versions of element
        base.$el        = $(el);
        base.el         = el;

        // check mandatory options
        if (options.poc == null) {return}

        // Add a reverse reference to the DOM object
        base.$el.data("jr.PageTurnSensor", base);
        //
        base.clickEvName = $u.touch ? 'touchend' : 'click'

        //
        base.init = function(){

            base.options = $.extend({},$.jr.PageTurnSensor.defaultOptions, options);

            // initialization code here
            base.$poc       = $(base.options.poc)
            base.$el.bind(base.clickEvName, base.clickHandler)          // attach event handler to handle page turns
            base.$poc.bind(base.options.piEv, base.piHandler)           // monitor paging info to change own state
        };


        // *********** Handle Events

        // activate clicks and notify page manager to tunr next o previous page
        base.clickHandler = function(e){
            base.options.actionEv != null
                ? base.$poc.trigger(base.options.actionEv)
                : 0
        };

        // handle page information
        // *********** PageTurnSensor Event Handlers
        base.piHandler      = function(e, p){
            var et = e.type

            if( ! $.isPlainObject(p) ) return true;

            if ( p.pn != null && p.lp != null) {

                if ( (base.options.action === 'prev' || base.options.action === 'first') ) {
                    if ( p.pn === 1 ) {
                        base.$el.addClass('hidden')
                    }else {
                        base.$el.removeClass('hidden')
                    }
                }else if ( (base.options.action === 'next' || base.options.action === 'last') ) {

                    if ( p.pn === p.lp ) {
                        base.$el.addClass('hidden')
                    }else {
                        base.$el.removeClass('hidden')
                    }
                }
            }

            return true;
        };


        // Run initializer
        base.init();
    };

    $.jr.PageTurnSensor.defaultOptions = {
        action: 'next',     // possible values are 'next', 'prev', 'first', 'last'
        poc: null
    };

    $.fn.jr_PageTurnSensor = function(options){
        return this.each(function(){
            (new $.jr.PageTurnSensor(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.PageTurnSensor if it has been attached to the object.
    $.fn.getjr_PageTurnSensor = function(){
        return this.data("jr.PageTurnSensor");
    };

})(jQuery);

