/* $Id: jquery.jr.paginationstatus.js 13234 2012-11-19 15:26:39Z maloneyc $

    Module:
        JATS Reader's Pagination Status

    Author:
        Andrey Kolotev

    Synopsis:
        $('#jr-dash').jr_PaginationStatus({poc: '#jr-content'})
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

    // Options
    //      @param poc      - Point of Communication selector
    $.jr.PaginationStatus = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // This plugin depends on the presence of a "point of communication", which should
        // be passed as the 'poc' option.  If it was not passed, then there's no way to
        // function; just return.
        if ( options.poc == null ) {
            console.error('PaginationStatus: point of communication (poc) was not provided');
            return;
        }

        // Add a reverse reference from the DOM object back to this pageprogressbar object
        base.$el.data("jr.PaginationStatus", base);

        // Initialization method
        base.init = function(){
            base.options = $.extend({}, $.jr.PaginationStatus.defaultOptions, options);
            base.$poc   = $(base.options.poc);
            // Monitor paging events
            base.$poc.bind('jr:pm:pages:changed', base.eventHandler);
        };


        // *********** PaginationStatus Event Handlers

        // Handle paging information.  This is called for 'jr:pm:pages:changed' events.
        // p contains the paging information:
        //    p.pn: new page number
        //    p.po: the percentage offset that we are at in the book
        //    p.lp: last page
        base.eventHandler = function(e, p){
            if( !$.isPlainObject(p) ) return true;
            var et = e.type

            if ( et === 'jr:pm:pages:changed') {
                base.$el.find('.jr-pg-pn').html(p.pn)
                base.$el.find('.jr-pg-lp').html(p.lp)
                base.$el.find('.jr-pg-po').html(Math.floor(p.po))
            }

            return true;
        };

        // Run initializer
        base.init();
    };

    $.jr.PaginationStatus.defaultOptions = {
    };

    $.fn.jr_PaginationStatus = function(options){
        return this.each(function(){
            (new $.jr.PaginationStatus(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.PaginationStatus if it has been attached to the object.
    $.fn.getjr_PaginationStatus = function(){
        return this.data("jr.PaginationStatus");
    };

})(jQuery);
