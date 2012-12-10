/*!
 * $Id: jquery.jr.objectbox.js 13548 2012-12-07 16:22:09Z maloneyc $
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
        $.jr = {};
    }

    var $u = $.jr.utils,
        t = $.jr.utils.touch

    $.jr.ObjectBox = function (el, options) {
        // To avoid scope issues, use "base" instead of "this"
        // to reference this class from internal events and functions.
        var base = this;

        // Provide access to the DOM and jQuery versions of the element
        base.el = el;
        var $el = $(el);
        base.$el = $el;

        // Provide access back to this object from the jQuery element
        base.$el.data('jr.ObjectBox', base);
        base.init = function() {
            base.options = $.extend({}, $.jr.ObjectBox.defaultOptions, options)

            base.$el.on((base.options.handleClick ? 'touchend.jr-ob click.jr-ob ' : '' ) + 'open', function(e) {
                if (base.options.preventDefault) e.preventDefault();
                if ( !base.$el.is('.jr-objectbox-trigger') ) {
                    base.open();
                }
                return !base.options.preventDefault;
            });

            // For external content, if not provided as options, get the href and path from
            // data-href and data-path attributes
            if (!base.options.href && $el.attr('data-href')) {
                base.options.href = $el.attr('data-href');
            }
            if (!base.options.path && $el.attr('data-path')) {
                base.options.path = $el.attr('data-path');
            }
        };

        base.open = function() {
            if ( $.jr.ObjectBox.OB.is(':visible') ) {
                $.jr.ObjectBox.clean();
            }
            // mark the trigger element (used for positioning OB and, optionally, to receive focus on close:
            base.$el.addClass('jr-objectbox-trigger');

            // For the title text of the OB, use the element's text, the @alt value of a child (e.g., IMG):
            //var titleText = base.$el.text() !== '' ? base.$el.text() : ( base.$el.children('[alt]').length ? base.$el.children('[alt]:first').attr('alt') : '' );
            // Set the titlebar text:
            //if ( titleText !== '' ) {
            //    $.jr.ObjectBox.OB.find('.title-text').text(titleText);
            //}

            base.options.objectBoxClass !== ''
                ? $.jr.ObjectBox.OB.addClass(base.options.objectBoxClass).data('objectBoxClass', base.options.objectBoxClass)
                : 0;

            // If the "contentLocal" option value is false (default), load the content in an IFRAME:
            if ( !base.options.contentLocal ) {
                var $drawer = $.jr.ObjectBox.OB.find('.jr-objectbox-drawer');
                $drawer.load(base.options.href, function() {
                    $drawer.find('img[data-src]').each(function() {
                        var $t = $(this);
                        $t.attr('src', $t.attr('data-src').replace(/\{\$path\}/g, base.options.path))
                    }).end()
                });
            } else {
                // content is local, find it either from contentId or the contentLocalAttr
                var contentSelector = base.options.contentId != ''
                    ? '#' + base.options.contentId
                    : base.options.contentLocalAttrPrefix + base.$el.attr(base.options.contentLocalAttr);

                // Append the content and display the object box:
                $(contentSelector)
                    .clone(true).removeAttr('id').removeClass('hidden')
                    .find('[id]').removeAttr('id').end()
                    .find('img[data-src]').each(function() {
                        var $t = $(this);
                        $t.attr('src', $t.attr('data-src'))}).end()
                    .appendTo($.jr.ObjectBox.OB.find('.jr-objectbox-drawer'));
            }

            $.jr.ObjectBox.open()

            // send focus to ObjectBox:
            if ( base.options.focusOnOpen == true ) {
                $(options.focusOnOpenElement).focus();
            }

            // Bind event handlers to main content area to close OB:
            $('#jr-content').on(t ? 'touchend.jr-ob' : 'click.jr-ob', function(){
                $.jr.ObjectBox.close();
            });
        };

        // Run initializer
        base.init();
    };

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
    };

    function __hideAndCleanOB (e) {$.jr.ObjectBox.OB.addClass('hidden');$.jr.ObjectBox.clean()}
    //
    $.jr.ObjectBox.close = function() {
        $.jr.ObjectBox.OB
            .addClass('thidden')
            .css({
                maxHeight: 'none' /*,
                width: 'initial',
                height: 'initial' */
            })
        var transFlag = parseFloat($.jr.ObjectBox.OB.css($u.transitionDuration)) > 0
        transFlag
            ? $.jr.ObjectBox.OB.one($u.transitionEndEvName, __hideAndCleanOB)
            : setTimeout(__hideAndCleanOB, 50)
        // Remove bound event handlers:
        $('#jr-content').off('click.jr-ob touchend.jr-ob');
        // clear the hint used for OB positioning:
        $('.jr-objectbox-drawer').data('refLength','');
        // Announce the OB has closed:
        $.jr.ObjectBox.OB.trigger('ObjectBoxClose');
    };

    $.jr.ObjectBox.defaultOptions = {
        contentLocal: false,
        contentId: '',
        contentLocalAttr: 'rid',
        contentLocalAttrPrefix: '#',
        focusOnOpen: false,
        focusOnOpenElement: '.jr-objectbox-close',
        objectBoxClass: '',
        handleClick: true,
        href: '',
        path: '',
        preventDefault: 'true'
    };

    $.jr.ObjectBox.open = function() {
        $.jr.ObjectBox.OB
            .removeClass('hidden')
            .trigger('ObjectBoxOpen');
        setTimeout(function() {$.jr.ObjectBox.OB.removeClass('thidden')}, 50)
    };

    $.jr.ObjectBox.OB = $('#jr-objectbox');

    // This is the jQuery plugin function, which should be invoked on the
    // object box trigger elements.
    $.fn.jr_ObjectBox = function( options ) {
        return this.each(function() {
            ( new $.jr.ObjectBox( this, options ) );
        });
    };

    // This function returns the ObjectBox object from the jQuery wrapper of the element
    // that it was instantiated on.  Note that this breaks the jQuery chain.
    $.fn.getjr_ObjectBox = function() {
        return this.data("jr.ObjectBox");
    };

    $('.jr-objectbox-close').on(t ? 'touchend.jr-ob' : 'click.jr-ob', function(event){
        event.preventDefault();
        event.stopPropagation();
        $.jr.ObjectBox.close();
        return false;
    });

    // Close ObjectBox after paging:
    $('.pr-pn').change(function(){
        if ( $.jr.ObjectBox.OB.is(':visible') ) {
            $.jr.ObjectBox.close();
        }
    });

})( jQuery );