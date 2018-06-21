/* $Id: jquery.jr.links.js 13467 2012-11-30 21:57:46Z kolotev $

    Module:

        JATS Reader's Links module

    Author:

        Andrey Kolotev

    Synopsis:
        Links modules provides ability to hijack clicks on links
        (local & remote - relative to the current page).
        Local Links (those starting "#", e.g. "#IdX" for example)
        then handled by the browser, when it does built-in scolling
        and that scrolling is handled by Page Manager on its own.
        For all clicked likns (remote or local) this module instructs
        History Keeper module to mark the current location (offset),
        that will be used by user if back/forward browser's buttons are
        pressed.

        Another task of this module to alternate links to tables/figures
        to use report=objectonly parameter if it is not used yet to be
        able to deliver those parts of the content into objectbox on demand.

    Usage :

        $('article a').jr_Links({poc: '#jr-content'})

        @poc paramenter is the Point Of Contact with other modules
        (History Keeper for example).

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
    if (!$.jr) {
        $.jr = {};
    }

    var $u  = $.jr.utils

    $.jr.Links = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // This plugin depends on the presence of a "point of communication", which should
        // be passed as the 'poc' option.  If it was not passed, then there's no way to
        // function; just return.
        if ( options.poc === null ) {
            console.error('Links: point of communication (poc) was not provided');
            return;
        }

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;


        // Add a reverse reference to the DOM object
        base.$el.data("jr.Links", base);


        base.init = function(){
            base.options = $.extend({},$.jr.Links.defaultOptions, options);

            // remove onlick handler
            base.$el.prop("onclick", null);
            // and attribtue
            base.$el.removeAttr("onclick target");

            // alternate figure and table links to point to report=objectonly version
            base.$el.attr('href', base.modHrefForRepObjOnly(base.$el.attr('href')))

            // add new target attribute for all non local links
            if ( ! /^#/.test( base.$el.attr('href') ) )
                base.$el.attr('target', '_blank')

            // Initialization code here
            base.$poc       = $(base.options.poc)
            base.$el.bind($u.touch ? 'touchend' : 'click', base.clickHandler)           // attach event handler to handle page turning
        };

        // *********** Links Event Handlers
        base.clickHandler = function(e){
            var h = $(this).attr('href'),
                t = $(this).attr('target')

            if (e.type === "click" || e.type === 'touchend')
                base.$poc.trigger('jr:hk:mark:hp')

            if (e.type === 'touchend' && t == null)
                h != null ? window.location = h : 0

            return true
        };

        base.modHrefForRepObjOnly = function (url) {

            function _fixReport (_url, _rep) {
                var _hrefParts = _url.split('#')
                var _repObjOnly = "report=" + _rep
                if ( /\?/.test(_hrefParts[0]) ) {
                    _hrefParts[0] += '&' + _repObjOnly
                } else {
                    _hrefParts[0] += '?' + _repObjOnly
                }
                return _hrefParts.join("#")
            }
            if (! /\breport=/.test(url)) {
                if ( /\/(table|figure)\//.test(url) ) {
                    url = _fixReport(url, 'objectonly')
                } else if ( /\/articles\/.*\/(cited|pdf|epub|bin)/.test(url) ){
                } else if ( /\/articles\//.test(url) ){
                    url = _fixReport(url, 'reader')
                }
            }

            return url
        }

        // Run initializer
        base.init();
    };

    $.jr.Links.defaultOptions = {
    };

    $.fn.jr_Links = function(options){
        return this.each(function(){
            (new $.jr.Links(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.Links if it has been attached to the object.
    $.fn.getjr_Links = function(){
        return this.data("jr.Links");
    };

})(jQuery);
