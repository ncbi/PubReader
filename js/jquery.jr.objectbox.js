/*!
 * $Id: jquery.jr.objectbox.js 21813 2014-05-09 20:29:43Z kolotev $
 * JATS Reader ObjectBox.
 * Documentation:  https://confluence.ncbi.nlm.nih.gov/x/nACN.
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

(function ($) {
    if (!$.jr) {
        $.jr = {}
    }

    var $u = $.jr.utils
        

    $.jr.ObjectBox = function (el, options) {
        // To avoid scope issues, use "base" instead of "this"
        // to reference this class from internal events and functions.
        var base = this,
            $el  = $(el)

        // Provide access to the DOM and jQuery versions of the element
        base.el = el
        base.$el = $el

        // Provide access back to this object from the jQuery element
        $el.data('jr.ObjectBox', base)
        //
        base.init = function() {
            var opts = base.options = $.extend({}, $.jr.ObjectBox.defaultOptions, options),
                $el  = base.$el
            
            $el.on('click', base.handleClick)
               .on('pointerup.jr-ob', base.handlePointerUp) 
               .on('open.jr-ob', base.handleOpen)
               .on('refresh.jr-on', base.handleRefresh)

            // For external content, if not provided as options, get the href and path from
            // data-href and data-path attributes
            if (!opts.href && $el.attr('data-href')) {
                opts.href = $el.attr('data-href');
            }

            if (!opts.path && $el.attr('data-path')) {
                opts.path = $el.attr('data-path');
            }

            if ( opts.focusOnOpen == true ) {
                var $oel = $(opts.focusOnOpenElement)
                if ( ! $.isNumeric($oel.attr('tabindex')) )
                    $oel.attr('tabindex', "0")
            }
        }
        //
        base.checkFPF = function () { // checkFPF - check FigPopup Flag (check presense of figpoup functionality)
            return $(this).data('figpopup.flag') == true
        }
        //
        base.handlePointerUp = function(e) {
            e.stopPropagation()
            if (
                (e.originalEvent != null 
                    && e.originalEvent.pointerType == "mouse")
                    // do not add "touch" condtion here, 
                    // otherwise object box and figpopup 
                    // would appear at the same time.
                    || $(e.target).parents().addBack().filter(base.checkFPF).length == 0
            ) {
                $(this).trigger('open')
            }
        }
        // .filter(function() { 
        //  return $(this).data("selected") == true 
        // });

        //
        base.handleClick = function(e) {
            e.preventDefault()
            return false
        }

        //
        base.handleOpen = function(e) {
            if ( ! $el.is('.jr-objectbox-trigger') )
                base.open()
        }
        //
        base.handleRefresh = function(e) {
            base.open();
        }
        //
        base.open = function() {

            var opts = base.options,
                $el  = base.$el
                
            if ( $.jr.ObjectBox.OB.is(':visible') ) {
                $.jr.ObjectBox.clean();
                $.jr.ObjectBox.OB.trigger('show:after')
            }
            // mark the trigger element (used for positioning OB and, optionally, to receive focus on close:
            $el.addClass('jr-objectbox-trigger');

            // For the title text of the OB, use the element's text, the @alt value of a child (e.g., IMG):
            //var titleText = $el.text() !== '' ? $el.text() : ( $el.children('[alt]').length ? $el.children('[alt]:first').attr('alt') : '' );
            // Set the titlebar text:
            //if ( titleText !== '' ) {
            //    $.jr.ObjectBox.OB.find('.title-text').text(titleText);
            //}

            opts.objectBoxClass != ''
                ? $.jr.ObjectBox.OB.addClass(opts.objectBoxClass).data('objectBoxClass', opts.objectBoxClass)
                : 0;

            // If the "contentLocal" option value is false (default), load the content in an IFRAME:
            if ( !opts.contentLocal ) {
                var $drawer = $.jr.ObjectBox.OB.find('.jr-objectbox-drawer');
                $drawer.load(opts.href, function() {
                    $drawer.find('img[data-src]').each(function() {
                        var $t = $(this);
                        $t.attr('src', $t.attr('data-src').replace(/\{\$path\}/g, opts.path))
                    }).end()
                });
            } else {
                // content is local, find it either from contentId or the contentLocalAttr
                var contentSelector = opts.contentId != ''
                    ? '#' + opts.contentId
                    : opts.contentLocalAttrPrefix + $el.attr(opts.contentLocalAttr);
    
                // Append the content and display the object box:
                $(document.getElementById(contentSelector.substr(1)))
                    .clone(true).removeAttr('id').removeClass('hidden')
                    .find('[id]').each(function() {
                        var $t = $(this)
                        $t.attr('id', 'ob_' + $t.attr('id'))
                    }).end()
                    .find('[rid]').each(function() {
                        var $t = $(this)
                        $t.attr('rid', 'ob_' + $t.attr('rid'))
                    }).end()
                    //.find('[id]').removeAttr('id').end()
                    .find('img[data-src]').each(function() {
                        var $t = $(this)
                        $t.attr('src', $t.attr('data-src'))}).end()
                    .appendTo($.jr.ObjectBox.OB.find('.jr-objectbox-drawer'));
            }

            $.jr.ObjectBox.open({'o': opts})
        }

        // Run initializer
        base.init();
    }

    //
    $.jr.ObjectBox.clean = function() {
        $.jr.ObjectBox.OB
            .find('.title-text').text('')
            .end()
            .find('.jr-objectbox-drawer').empty();

        if ( $('.jr-objectbox-trigger').length ) {
            var trigger = $('.jr-objectbox-trigger'),
                objectBoxClass = trigger.data('jr.ObjectBox').options.objectBoxClass;
            if ( objectBoxClass !== '' ) {
                $.jr.ObjectBox.OB.removeClass( objectBoxClass );
            }
            trigger.removeClass('jr-objectbox-trigger');
        }
    }

    function __hideAndCleanOB (e) {
        // trigger "hide:after" here is for focus tracking purposes
        $.jr.ObjectBox.OB.blur().addClass('hidden').trigger("hide:after")
        //
        $.jr.ObjectBox.clean()
    } 
    //
    $.jr.ObjectBox.close = function() {

        $.jr.ObjectBox.OB
            .addClass('thidden')
            
        var transFlag = parseFloat($.jr.ObjectBox.OB.css($u.transitionDuration)) > 0
        transFlag
            ? $.jr.ObjectBox.OB.one($u.transitionEndEvName, __hideAndCleanOB)
            : setTimeout(__hideAndCleanOB, 50)
        // Remove bound event handlers:
        $('#jr-content').off('pointerup.jr-ob');
        // clear the hint used for OB positioning:
        $('.jr-objectbox-drawer').data('refLength','')
        // Announce the OB has closed:
        $.jr.ObjectBox.OB.trigger('ObjectBoxClose')
        $(document).unbind('keydown', $.jr.ObjectBox.kbdHandler)
        $.jr.ObjectBox.OB.off('jr:go:pos')
        $('body').off('pointerup', $.jr.ObjectBox.docPointerHandler);
        $.jr.ObjectBox.OB.off('pointerup', $.jr.ObjectBox.obPointerHandler)
    }

    $.jr.ObjectBox.defaultOptions = {
        contentLocal: false,
        contentId: '',
        contentLocalAttr: 'rid',
        contentLocalAttrPrefix: '#',
        focusOnOpen: true,
        focusOnOpenElement: '#jr-objectbox', //.jr-objectbox-close
        objectBoxClass: '',
        href: '',
        path: '',
        preventDefault: 'true'
    }

    $.jr.ObjectBox.open = function(opt) {
        //
        function _initNcbiMedia () {
            if (typeof jQuery.fn.ncbimedia == "undefined")
                return
            
            var $drawer = $.jr.ObjectBox.OB.find('.jr-objectbox-drawer')
            $drawer.find('.ncbimedia').ncbimedia()
        }

        if (! $.jr.ObjectBox.OB.is(':visible')) {
            var $el
            if ( opt.o != null && opt.o.focusOnOpen == true ) {
                $el = $(opt.o.focusOnOpenElement)
            }
            
            $.jr.ObjectBox.OB
                .removeClass('hidden')
                .trigger('ObjectBoxOpen')
                
            setTimeout(function(){$.jr.ObjectBox.OB.removeClass('thidden')}, 50)

            // local function to call at the end of the transition.
            function _fn () {
                $.jr.ObjectBox.OB.trigger('show:after')
                setTimeout(function(){$.jr.ObjectBox.OB.focus()}, 100)
                _initNcbiMedia()
                $('body').on('pointerup', $.jr.ObjectBox.docPointerHandler);
                $.jr.ObjectBox.OB.on('pointerup', $.jr.ObjectBox.obPointerHandler)
            }

            
            transFlag = parseFloat($.jr.ObjectBox.OB.css($u.transitionDuration)) > 0;
            transFlag
                ? $.jr.ObjectBox.OB.one($u.transitionEndEvName, _fn)
                : setTimeout(_fn, 50)
            
            $(document).on('keydown', $.jr.ObjectBox.kbdHandler)
            $.jr.ObjectBox.OB.on('jr:go:pos', $.jr.ObjectBox.goPosHandler)
        }else {
            _initNcbiMedia()
        }
    }
    
    $.jr.ObjectBox.docPointerHandler = function(e) {
        //console.info('ObjectBox.docPointerHandler: %o', e)
        $.jr.ObjectBox.close()
    }

    $.jr.ObjectBox.obPointerHandler = function(e) {
        e.stopPropagation()
    }

    $.jr.ObjectBox.kbdHandler = function(e) {
        var $t = $(e.target),
            $ob = $.jr.ObjectBox.OB

        if ($t.closest($ob).length == 0 && $ob.closest($t).length == 0) return
        
        if (e.keyCode == 27)
            $.jr.ObjectBox.close()
    }
    
    $.jr.ObjectBox.goPosHandler = function(e, o) {
        
        if ( !$.isPlainObject(o)) o = { pos: {left: 0, top: 0}} 
        
        var $drawer = $.jr.ObjectBox.OB.find('.jr-objectbox-drawer'),
            dTop    = $drawer.scrollTop(),
            dLeft   = $drawer.scrollLeft(),
            ih      = $drawer.innerHeight(),
            iw      = $drawer.innerWidth()
        
        $drawer.stop().animate({ scrollTop: dTop + o.pos.top - ih/2, scrollLeft: dLeft + o.pos.left - iw / 2 });
    }


    $.jr.ObjectBox.OB = $('#jr-objectbox');

    // This is the jQuery plugin function, which should be invoked on the
    // object box trigger elements.
    $.fn.jr_ObjectBox = function( options ) {
        return this.each(function() {
            ( new $.jr.ObjectBox( this, options ) );
        });
    }

    // This function returns the ObjectBox object from the jQuery wrapper of the element
    // that it was instantiated on.  Note that this breaks the jQuery chain.
    $.fn.getjr_ObjectBox = function() {
        return this.data("jr.ObjectBox");
    }

    $('.jr-objectbox-close').on('pointerup.jr-ob', 
        function(e){
            e.preventDefault();
            e.stopPropagation();
            $.jr.ObjectBox.close();
    });

    // Close ObjectBox after paging:
    $('.pr-pn').change(function(){
        if ( $.jr.ObjectBox.OB.is(':visible') ) {
            $.jr.ObjectBox.close();
        }
    });

})( jQuery );
