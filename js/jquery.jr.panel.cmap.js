/* $Id: jquery.jr.panel.cmap.js 14983 2013-03-22 19:47:47Z kolotev $

    Module:

        JATS Reader's Content Map PanelCmap

    Author:

        Andrey Kolotev

    Synopsis:

        Content Map PanelCmap module provides collects
        overall picture of the content in summary like view
        it collects:
            h2 section titles
            figures (icons or/and labels)
            tables
            videos


    Usage:

        $('panel-selector').jr_PanelCmap({poc: "paged-content-selector"})

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


    // ========================================================================= $.jr.PanelCmapCmap


    $.jr.PanelCmap = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el        = $(el);
        base.el         = el;

        // Add a reverse reference to the DOM object
        base.$el.data("jr.PanelCmap", base);

        base.init = function(){
            base.options = $.extend({},$.jr.PanelCmap.defaultOptions, options);
            base.$poc    = $(base.options.poc)
            base.mapList = $('article h2[id]')
            base.$cnt    = base.$el.find('.cnt')

            base.$cnt.length == 1 ?
                base.mapList.each( function () {
                    var $t = $(this),
                        _id = $t.attr('id')
                    $('<a href="#' + _id + '"></a>')
                        .on('click', base.handleLinks)
                        .append($t.contents().clone())
                        .data('rid', _id)
                        .attr('style', $t.attr('style'))
                        .appendTo( base.$cnt );
                }) : 0
            base.$poc.bind("jr:pm:pages:changed", $.throttle(1000, base.pagesChangedHandler))
        };

       //
        base.pagesChangedHandler = function(e, o) {
            var et = e.type
            if ( et === 'jr:pm:pages:changed') {
                base.pm == null ? base.pm = base.$poc.getjr_PageManager() : 0
                base.pi = o
                base.updateMapHighliting()
            }
        };
        //
        base.updateMapHighliting = function() {
            base.$cnt.children().each (function() {
                var $t = $(this)
                $t.data('page', base.pm.id2Page($t.data('rid')))
            });

            base.$cnt.children().each (function() {
                var $t = $(this),
                    $next = $t.next();
                if ( $t.data('page') <= base.pi.pn
                      &&  ($next.length === 0
                           || base.pi.pn < $next.data('page')
                           || ($t.data('page') == base.pi.pn && $t.data('page') == $next.data('page'))
                           )
                    ) {
                    $t.addClass('current')
                } else {
                    $t.removeClass('current')
                }
            });
        };

        //
        base.closePanel          = function (e) {
            e != null ? e.preventDefault() : null;
            base.$el.trigger('jr:panel:hide')
            return false;
        }

        //
        base.handleLinks     = function (e) {
	    window.location.hash = '' // PMC-15846
            var $t = $(this)
            base.closePanel();
            return true;
        }

        // Run initializer
        base.init();
    };

    $.jr.PanelCmap.defaultOptions = {
        'poc': null
    };

    $.fn.jr_PanelCmap = function(options){
        return this.each(function(){
            (new $.jr.PanelCmap(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.PanelCmap if it has been attached to the object.
    $.fn.getjr_PanelCmap = function(){
        return this.data("jr.PanelCmap");
    };


})(jQuery);
