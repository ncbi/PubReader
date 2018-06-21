/* $Id$

    Module:

        JATS Reader's Remote Table of Content Panel

    Author:

        Andrey Kolotev

    Synopsis:

        Remote Table of Content Panel module provides an
        asynchronous retrival of table of content 
        from Books Project for the whole Book.

    Usage:

        $('panel-selector').jr_PanelRtoc({poc: "paged-content-selector"})

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


    // ========================================================================= $.jr.PanelRtoc


    $.jr.PanelRtoc = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el        = $(el);
        base.el         = el;

        // Add a reverse reference to the DOM object
        base.$el.data("jr.PanelRtoc", base);

        base.init = function(){
            base.options = $.extend({},$.jr.PanelRtoc.defaultOptions, options);
            base.$poc    = $(base.options.poc)
            base.$cnt    = base.$el.find('.cnt')

            if (base.$cnt.length == 1) {
                // wrap existing anchors into ul list
                var $aList      = base.$cnt.children().filter('a'),
                    $aSelect    = $aList.has('.select').last(),
                    $aSelected

                // check for presence of anchor with class expand
                // or treat last anchor in the list as the one
                // which need to be selected with h2 elements.
                $aSelect.length == 0 && $aList.length > 0 
                    ? 0 
                    : $aSelected = $aSelect

                if ($aSelected != null && $aSelected.length > 0)
                    $aSelected.removeClass("select").addClass("selected")
                        .prop("onclick", null).removeProp("onclick").removeAttr("href onclick target")

                // wrap all existing anchors into <ul>
                if ($aList.length > 0) {
                    var $ul = $('<ul>')
                    $aList.each( function () {
                        $(this).appendTo($('<li>').appendTo($ul))
                    })
                    $ul.appendTo( base.$cnt )
                }
            }
            base.$el.one("jr:panel:show:after", base.AfterShowHandler);
        }

        // Execute remote request for table of content
        // 
        base.AfterShowHandler = function() {
            var tocUrl = $("meta[name='bk-toc-url']").attr("content")
            
            if (tocUrl) {
                var $spinner_cnt = $("<center/>"),
                    $spinner = $("<span class='spinner'/>").appendTo($spinner_cnt)
                
                    $spinner_cnt.appendTo(base.$cnt)

                $.ajax({
                    'url': tocUrl, 
                    'dataType': 'html',
                    'success': function(result) {
                        var $result = $(result)
                        $spinner_cnt.remove()
                        $("<hr/>").appendTo(base.$cnt)
                        $result.find('#source-contents').removeAttr("class id").appendTo(base.$cnt)
                        $result.find('a').on('pointerup', base.handleLinks)
                        var loc = $("meta[name='bk-non-canon-loc']").attr("content"),
                            $loc = $("a[href='" + loc.substring(0, loc.indexOf('?')) + "']")
                            $loc.addClass('current').removeAttr('href')

                        if (loc && $loc && $loc.get() && $loc.offset()) {
                            var scrllTop = $loc.offset().top - base.$cnt.offset().top + base.$cnt.scrollTop() - Math.round(base.$cnt.height()/3)
                            base.$cnt.animate({'scrollTop': scrllTop})
                        }
                    },
                    'error': function(xhr){
                        $spinner_cnt.remove()
                        var $errorInfo = $('<center class="ajax_error">').text("An error occured on attempt to retrive Table of Content. [" + xhr.status + " " + xhr.statusText + "] " + this.url)
                        $errorInfo.appendTo(base.$cnt)
                        base.$el.one("jr:panel:hide:after", $errorInfo, base.onErrorAfterHideHandler);
                        base.$el.one("jr:panel:show:after", base.AfterShowHandler);
                    }
                });
            }
        }        

        //
        base.onErrorAfterHideHandler = function(e) {
            var $errorInfo = e.data
            $errorInfo.remove()
        }
        //
        base.closePanel          = function (e) {
            e != null ? e.preventDefault() : null;
            base.$el.trigger('jr:panel:hide')
            return false;
        }

        //
        base.handleLinks     = function (e) {
            base.closePanel();
            return true;
        }

        // Run initializer
        base.init();
    };

    $.jr.PanelRtoc.defaultOptions = {
        'poc': null
    };

    $.fn.jr_PanelRtoc = function(options){
        return this.each(function(){
            (new $.jr.PanelRtoc(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.PanelRtoc if it has been attached to the object.
    $.fn.getjr_PanelRtoc = function(){
        return this.data("jr.PanelRtoc");
    };


})(jQuery);
