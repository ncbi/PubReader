/* $Id: jquery.jr.historykeeper.js 13234 2012-11-19 15:26:39Z maloneyc $

    Module:

        JATS Reader's History Keeper

    Author:

        Andrey Kolotev

    Synopsis:

        History Keeper (HK) is a module, which monitors hash part of the URL
        and instructing Page Manager to turn pages to the destination defined
        in hash.

        HK monitors events from Page Manager by attaching to the
        same element as Page Manager broadcast event with name
        'jr:pm:pages:changed' and keeps track of the precentage offset
        within an article.

        When other module trigger event 'jr:hk:mark:hp' HK module changes
        the hash part of the url to preserve that point in history
        that user would be able to use back/forward browser's buttons

    Usage:
        $('#jr-content').jr_HistoryKeeper()

    Assumptions:

    Events:
        'jr:hk:mark:hp' - Mark history point

    Dependencies:
        - jquery 1.7.2
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
    var evt = {
        MARK_HP: 'jr:hk:mark:hp'
    }
    //
    $.jr.HistoryKeeper = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("jr.HistoryKeeper", base);


        //
        base.init = function(){
            base.options = $.extend({},$.jr.HistoryKeeper.defaultOptions, options);

            // Put your initialization code here

            // *** Bind Events

            // bind hash hange event
            window.addEventListener("hashchange", base.hashchangeHandler);
            //bind custom event
            base.$el.bind(evt.MARK_HP, base.eventHandler);
            base.$el.bind('jr:pm:pages:changed', base.eventHandler);

            // initial check of hash
            base.hashchangeHandler()
        };

        //
        base.hashchangeHandler      = function (e) {
            var hash = window.location.hash,
                pocEvent = $.Event("jr:pm:go:page", { originalEvent: e });

            if (/^#!po=/.test(hash)) {
                var po = parseFloat(hash.slice(5))
                // console.info('trigger go:page event with po=%s', po)
                base.$el.trigger(pocEvent, {'po': po})
            }else if (/^#/.test(hash)) {
                base.$el.trigger(pocEvent, {'id': hash})
            }
        }

        base.eventHandler           = function (e, o) {
            e.preventDefault();

            var et = e.type;

            if ( (et === evt.MARK_HP) && base._po != null) {
                if (window.location.hash !== ('#!po=' + base._po))
                    history.pushState(null, null, '#!po=' + base._po)
           } else if (et === 'jr:pm:pages:changed') {
                //console.info('eventHandler %s po=%s', et, o.po)
                base._po = o.po
            }

            return true
        }
        // Run initializer
        base.init();
    };

    $.jr.HistoryKeeper.defaultOptions = {
    };

    $.fn.jr_HistoryKeeper = function(options){
        return this.each(function(){
            (new $.jr.HistoryKeeper(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.HistoryKeeper if it has been attached to the object.
    $.fn.getjr_HistoryKeeper = function(){
        return this.data("jr.HistoryKeeper");
    };

})(jQuery);
