/* $Id: jquery.jr.panel.istrip.js 13234 2012-11-19 15:26:39Z maloneyc $

    Module:

        JATS Reader's Image Strip

    Author:

        Andrey Kolotev

    Synopsis:

        Image strip panel contains thumbnails of all
        figures and tables images, which you can hover
        (on mouse capable devices) and get figpopup or
        click and get ObjectBox with content of corresponding
        object

    Usage:

        $('panel-selector').jr_PanelIstrip()

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


    var $u  = $.jr.utils,
        $doc = $(document),
        $html = $doc.children(),
        evt = {
            // subsriber for these events
            NEXT_PAGE:          'jr:is:go:next:page',
            PREV_PAGE:          'jr:is:go:prev:page',
            // publisher for these events
            PAGES_CHANGED:      'jr:is:pages:changed'
        }

    // ========================================================================= $.jr.PanelIstrip


    $.jr.PanelIstrip = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el        = $(el);
        base.el         = el;

        // Add a reverse reference to the DOM object
        base.$el.data("jr.PanelIstrip", base);

        base.init = function() {

            base.options    = $.extend({},$.jr.PanelIstrip.defaultOptions, options);
            base.$style     = $('<style type="text/css"/>')
            base.$panevp    = $('<div class="panevp"/>')
            base.$pane      = $('<div class="pane"/>')

            $.isNumeric(base.minM = parseFloat(base.options.minM))
                ? null
                : base.minM = $.jr.PanelIstrip.defaultOptions.minM;

            // collect figures & tables
            base.fts = $('article').find('.fig[id] img.small-thumb, .table-wrap[id] img.small-thumb')

            // put figures and tables on display
            if (base.fts.length === 0) {
                base.$el.trigger('jr:panel:hide:stateless')
                return
            }

            var t = $u.touch

            base.fts.each (function (idx) {
                var $ft     = $(this),
                    $el     = $ft.parent().closest('*[id]'),
                    $aF     = $el.find('a').first(),
                    _id     = $el.attr('id'),
                    $img    = $ft.clone()

                var $a = $('<a/>').css({'background-image': 'url(' + $img.attr('src') + ')'})
                                  .attr('rid', _id).attr('rid-figpopup', _id).attr('co-class', 'co-fig')
                ! t ? $a.on('click', base.handleObjectBox) : 0
                $a.attr('title',
                        $img.attr('alt') != null ? $img.attr('alt') : $img.attr('title') != null ? $img.attr('title') : "")
                  .attr('rid', _id)
                $aF.attr('href') != null ? $a.attr('href', $aF.attr('href')) : 0;

                base.$pane.append($a)
            });


            base.$itm = base.$pane.children().first();
            $('head').append(base.$style)
            base.$el.append(base.$panevp.append(base.$pane));
            base.pi = {fp: 0, lp: 0, cp: 0, changed: false};

            $(document).bind('keydown', base.kbdHandler);
            $(window).bind("resize", base.handleResize)
            base.$el.bind("jr:panel:show:after", base.Reflow);

            base.$el.bind(evt.NEXT_PAGE,    base.handleNextPage);
            base.$el.bind(evt.PREV_PAGE,    base.handlePrevPage);
            //
            if (t)
                base.$el.swipe({threshold: 25, swipeLeft: base.handleNextPage, swipeRight: base.handlePrevPage});
            //
            if ($.fn.figPopup != null) {
                var fp_cfg = new $.fn.figPopup(),
                    a = base.$pane.find('a')
                a.popupSensor({statIfLonger: 500, delayIn: fp_cfg.delayIn, delayOut: fp_cfg.delayOut, touchable: t})
                if ($.fn.hoverIntent && !t)
                   a.hoverIntent(fp_cfg)
            }


            base.flowItems()
        };

        //
        base.flowItems      = function () {
            base.arrangeMargin()
            base.calcPages()
        }
        //
        base.calcMetrics    = function () {
            var $panevp = base.$panevp,
                panevp  = $panevp.get(0),
                $pane   = base.$pane,
                $itm    = base.$itm;

            base.$pane_m = {
                iw: $panevp.innerWidth(),
                sw: panevp.scrollWidth + (- $pane.position().left),
                pl: $pane.position().left
            }

            base.$itm_m = {
                ow: $itm.outerWidth()
            }
        }
        //
        base.arrangeMargin  = function () {
            base.$panevp.css({width: 'auto', display: 'block'})
            base.calcMetrics()

            var iwpane  = base.$pane_m.iw,                              // inner width of scrolling box
                owItm   = base.$itm_m.ow,                               // outer width of one item
                paneFit = Math.floor (iwpane / (owItm + base.minM*2)),  // items would fit into box
                itmMrg  = Math.round((iwpane - owItm * paneFit) / paneFit / 2);     // adjusted one item margins
                iwpaneFixed = (owItm + itmMrg*2)*Math.floor(iwpane/(owItm + itmMrg*2)) // adjusted width to get items align due to arithmethic rounding.

            if (iwpaneFixed > 0 )
                base.$panevp.css({width: iwpaneFixed, display: 'block'})

            base.$pane.children().css({marginLeft: itmMrg.toPrecision(4) + 'px', marginRight: itmMrg.toPrecision(4) + 'px'})
        }
        //
        base.calcPages      = function () {
            base.fPage(base.calcFPage())
            base.lPage(base.calcLPage())
            base.cPage(base.calcCPage())
            if (base.pagesChanged()) {
                base.triggerPagesChanged();
            }
        }
        //
        base.makePageFunc   = function (pname, fname) {
            return function (pNum) {
                var _p = base.pi[pname];
                if (_p == null || _p === 0) { base.pi[pname] = base[fname]() }
                base.pi[pname] = ( $.isNumeric( pNum ) ? parseInt(pNum) : (base.pi[pname] != null ? base.pi[pname] : 0) );
                if (_p !== base.pi[pname]) {
                    base.pagesChanged(true);
                }
                return base.pi[pname]
            }
        };

        //
        base.fPage          = base.makePageFunc('fp', 'calcFPage')
        base.lPage          = base.makePageFunc('lp', 'calcLPage')
        base.cPage          = base.makePageFunc('cp', 'calcCPage')
        //
        base.pagesChanged           = function (o) {
            typeof o === "boolean" ?  base.pi.changed  = o : 0;
            return base.pi.changed;
        };

        //
        base.calcFPage              = function () {
            return 1
        }
        //
        base.calcCPage              = function () {
            var _cp         = base.pxOffset2Page( base.contentPosLeft(), 'r' ),
                _fp         = base.fPage(),
                _lp         = base.lPage();

            (_cp <  _fp ) ?  _cp = _fp : (_cp > _lp) ? _cp = _lp : 0;
            return _cp;
        };
        //
        base.calcLPage              = function () {
            return base.pxOffset2Page( base.contentWidth() - 1, 'f' )
        }
        // @type is one of the Math functions to use
        // Math.floor or Math.round
        // the 1st one is good for calculating
        // page number, where the pixels actually
        // location, the 2nd one is good
        // for keeping aproximate context.
        base.pxOffset2Page = function (pxOffset, type) {
            return type != null && type === 'r'
                    ? Math.round((pxOffset) / base.pageWidth()) + 1
                    : Math.floor((pxOffset) / base.pageWidth()) + 1
        }

        //
        base.pageWidth = function () { return base.$pane_m.iw = base.$panevp.innerWidth()};
        base.contentWidth = function () { return base.$pane_m.sw = base.$panevp.get(0).scrollWidth + (- base.$pane.position().left)};
        base.contentPosLeft = function () { return base.$pane_m.pl = - base.$pane.position().left };

        // notify subsribers about page information change
        base.triggerPagesChanged     = function () {
            base.$el.trigger(evt.PAGES_CHANGED, {pn: base.cPage(), lp: base.lPage()});
        };

        // nextPage
        base.nextPage               = function () {
            var cp = base.cPage();
            return cp < base.lPage() ? cp + 1 : cp;
        };

        // previous Page
        base.prevPage               = function () {
            var cp = base.cPage();
            return cp > base.fPage() ? cp - 1 : cp;
        };

        base.goNextPage             = function() { base.goPage( base.nextPage() ); };
        base.goPrevPage             = function() { base.goPage( base.prevPage() ); };

        base.Reflow = function() {
                base.flowItems()
                base.goPage(base.calcCPage())
        }

        // pNum is page number to jump to
        base.goPage                 = function(pNum) {
            // sanity check for pNum
            if ( $.isNumeric(pNum) === true
                && pNum >= base.fPage()
                && pNum <= base.lPage() ) {

                var _pw     = base.pageWidth(),
                    _nCp = Math.floor(parseFloat(pNum));
                var translPattern = $u.csstransforms3d && $html.hasClass('animate') ? $u.transl3DPattern : $u.transl2DPattern
                base.$pane.css ( $u.transformCssPropName, (translPattern).replace(/@/g, - (_pw * (_nCp - 1))) )
                base.cPage(_nCp)
                if (base.pagesChanged()) {
                    base.triggerPagesChanged();
                }
            }

        };

        //
        base.handleObjectBox     = function (e) {
            if (e != null) {
                e.preventDefault();
                // ignore click event on touch devices
                if (! ($u.touch && e.type === 'click')) {
                    var $t = $(this)
                    $('#'+$t.attr('rid')).find('a').first().trigger('open')
                }
            }
        }

        //
        base.handleNextPage     = function (e) {
            if (e != null){
                e.preventDefault();
            }
            base.goNextPage()
            return false
        }
        //
        base.handlePrevPage     = function (e) {
            if (e != null){
                e.preventDefault();
            }
            base.goPrevPage()
            return false
        }
        //
        base.handleResize        = function (e) {
            if ( $.isNumeric(base.ReflowTimerId) ) {
                clearTimeout(base.ReflowTimerId);
            }
            base.ReflowTimerId = setTimeout(base.Reflow, 1000)
        }

        base.kbdHandler = function(e) {
            var kc = e.keyCode;

            if (kc === 188 ) {          // less then
                base.goPrevPage();
            } else if (kc === 190) {     // more then
                base.goNextPage();
            }
        };

        // Run initializer
        base.init();
    };

    $.jr.PanelIstrip.defaultOptions = {
        'minM': 5 // minimum Margin (on left and right)
    };

    $.fn.jr_PanelIstrip = function(options){
        return this.each(function(){
            (new $.jr.PanelIstrip(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.PanelIstrip if it has been attached to the object.
    $.fn.getjr_PanelIstrip = function(){
        return this.data("jr.PanelIstrip");
    };


})(jQuery);
