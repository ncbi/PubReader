/* $Id: jquery.jr.pagemanager.js 21813 2014-05-09 20:29:43Z kolotev $

    Module:

        JATS Reader's Page Manager

    Author:

        Andrey Kolotev

    Synopsis:

        Page Manager (PM) is a module, which controls and performs page turning
        process in JATS Reader.

    Usage:

        $('#jr-content').jr_PageManager()

    Assumptions:

        Page enumeration starts from numeric value 1

    Dependencies:
        - jquery 1.7.2
        - jquery.touch.Swipe (will be replaced with NCBI event API)
        - Custom version of Modernizr 2.5.3
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
    }

    // check the presense of Modernizr
    if (typeof Modernizr == "undefined") {console.error("jr.PageManager is dependent on Modernizr, which is not defined"); return false}

    // some localized "global" variables ("global" within this function)
    var $win                = $(window),
        $doc                = $(document),
        $html               = $doc.children(),
        $u                  = $.jr.utils,
        evt                 = {
            // subsriber for these events
            NEXT_PAGE:          'jr:pm:go:next:page',
            PREV_PAGE:          'jr:pm:go:prev:page',
            GO_PAGE:            'jr:pm:go:page',
            FIRST_PAGE:         'jr:pm:go:1st:page',
            LAST_PAGE:          'jr:pm:go:last:page',
            GO_POS:             'jr:go:pos',

            // publisher for these events
            PAGE_TURN_BEFORE:   'jr:pm:page:turn:before',
            PAGE_TURN_AFTER:    'jr:pm:page:turn:after',
            PAGES_CHANGED:      'jr:pm:pages:changed'
        },
        pmState              = {
            SCROLL:          'jr:pm:state:scroll',
            PAGE:            'jr:pm:state:page'
	}

    $.jr.PageManager    = function(el, options) {

        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base        = this;

        // Access to jQuery and DOM versions of element
        base.$el        = $(el);
        base.el         = el;

        // Add a reverse reference to the DOM object
        base.$el.data("jr.PageManager", base);

        // init()
        base.init         = function() {

            base.options  = $.extend({},$.jr.PageManager.defaultOptions, options);
            
            //
            base.contentPollingIntervalMin =  base.contentPollingInterval = 1000
            base.contentPollingIntervalMax =  1000 * 1024
            base.contentPollingIntervalMul = 2;

            // find article elment
            base.$article    = base.$el.find('> article').first();

            // check that we have got at least one article
            if (base.$article.length !== 1) {
                console.error("jr.PageManager was not able to find article's content")
                return false;
            };
            
            //
            
            // if so then set article as a member
            base.article     = base.$article.get(0);

            //
            base.transXcurr  = 0

            // save the current right offset
            base.right = parseFloat(base.$el.css('right'));

            // bind mouse and touch events
            if ($u.touch && $.fn.swipe !== null) {
                // bind touch events
                base.$el.swipe({threshold: 25, swipe:          base.swipeHandler});
                // tap over side of the content areas to simplify page turning process.
                base.$el.on('pointerdown', base.tapHandler);
            }

            // setup page manager state for scrolling or paging 
            // (narrow vs normal/wide devices/screens)
            base.applyPMState()

            // setup polling of page dimensions
            base.calcMetrics()
            
            // check if inter units navigation info present
            base.metaPrevUnitHref = $('meta[name=jr-prev-unit]').attr('content');
            base.metaNextUnitHref = $('meta[name=jr-next-unit]').attr('content');
            // *** Bind Events

            // bind keyboard event
            $doc.on('keydown',            base.kbdHandler);

            // bind scroll event
            base.$el.on('scroll', base.scrollHandler)

            // bind custom events to implement API for turning pages
            // from outside of this component
            base.$el.on(evt.NEXT_PAGE,    base.eventHandler);
            base.$el.on(evt.PREV_PAGE,    base.eventHandler);
            base.$el.on(evt.FIRST_PAGE,   base.eventHandler);
            base.$el.on(evt.LAST_PAGE,    base.eventHandler);
            base.$el.on(evt.GO_PAGE,      base.eventHandler);
            base.$el.on(evt.GO_POS,       base.eventHandler);

            //
            $doc.on('jr:user:active pointerup', $.throttle(500, base.resetContentPollingInterval))


            //
            $win.on('resize', $.throttle(500, base.resetContentPollingInterval))
            $win.on('resize', $.throttle(500, base.resetRightPropOnWinResize))
            $win.on('resize', $.throttle(500, base.onWinResize))
            $win.on('scroll', $.throttle(500, base.onWinScroll))

            
            // bind mouseweel events
            base.$el.mousewheel(base.mousewheelHandler)
            
            //
            base.startPollingContentMetrics()
            
            //
            base.$el.trigger("show:after")

            // check the presence of cookie
            // to jump to last page if inter unit navigation provided.
            { 
                var initEvent = $u.lsGet('jr:pm:init:phase')
                if (initEvent == evt.LAST_PAGE) {
                    $u.lsSet('jr:pm:init:phase', null);
                    base.$el.trigger(initEvent)
                }
            }
            //
            return true;
        };

        // *********** Page Manager's methods
        // Pages related functions
        //
        base.calcPages              = function () {
            base.fPage(base.calcFPage())
            base.cPage(base.calcCPage())
            base.lPage(base.calcLPage())
            if (base.pagesChanged()) {
                base.triggerPagesChanged();
            }
        }

        // *** Pages setters/getters
        //
        base.fPage              = function (pNum) {
            var _fp = base._fp;
            if (_fp === null || _fp === 0) { base._fp    = base.calcFPage() }
            base._fp = ( $.isNumeric( pNum ) ?   base._fp = parseInt(pNum, 10) : (base._fp !== null ? base._fp : 0) );
            if (_fp !== base._fp) {
                base.pagesChanged(true);
            }
            return base._fp
        };
        //
        base.lPage               = function (pNum) {
            var _lp = base._lp;
            if (_lp === null || _lp === 0) { base._lp    = base.calcLPage() }
            base._lp = ($.isNumeric( pNum ) ?   base._lp = parseInt(pNum, 10) : (base._lp !== null ? base._lp : 0) );
            if (_lp !== base._lp) {
                base.pagesChanged(true);
            }
            return base._lp
        };
        //
        base.cPage               = function (pNum) {
            var _cp = base._cp;
            if (_cp === null || _cp === 0) { base._cp    = base.calcCPage() }
            base._cp = ($.isNumeric( pNum ) ? base._cp = parseInt(pNum, 10) : (base._cp !== null ? base._cp : 0) );
            if (_cp !== base._cp) {
                base.pagesChanged(true);
            }
            return base._cp
        };

        //
        base.pagesChanged           = function (o) {
            if (typeof o == "boolean")
                base._pChanged  = o
            return base._pChanged
        };

        //
        base._dumpPages             = function () {
            console.trace()
            var piobj = base.pInfo()
            console.info('_dumpPages(): fp=%s cp=%s lp=%s pChanged=%s cp/lp: %s%% [pInfo: cp: %s ln: %s po: %s%%]', base._fp, base._cp, base._lp, base._pChanged, (base._cp/base._lp).toPrecision(4)*100, piobj.pn, piobj.lp, piobj.po);
        };

        // *** Pages calculator
        //
        base.calcFPage              = function () {
            var _fp         = (base.contentWidth() > 0 ) ? 1 : 0
            return _fp
        }
        //
        base.calcCPage              = function () {
            var _cp = base.pxOffset2Page( base.contentPosLeft(), 'f' ),
                _fp = base.fPage(),
                _lp = base.lPage();
 
            if (_cp <  _fp ) {
                _cp = _fp
            } else if ( _cp > _lp ) {
                _cp = _lp
            }

            return _cp;
        };
        //
        base.calcLPage              = function () {
            var _lp         = base.pxOffset2Page( base.contentWidth() - 1, 'f' )
            return _lp;
        }

        // Content Metrics related functions
        //
        base.calcMetrics            = function () {
            //
            base.adjustContentRightSide()

            //            
            base.contentColumnGap(true)
            base.contentPosLeft(true)
            base.contentWidth(true)
            base.pageWidth(true)

            if (base.metricsChanged()) {
                var _poInPP = base.cPage2OffsetInPP()
                //console.info('PageManager: calcMetrics(): _poInPP = %s', _poInPP)
                
                base.calcPages()

                if (base._pmState === pmState.PAGE) {
                    // adjust current page if it is become missaligned
                    // because of the resizing
                    base.goPage(base.ppOffset2Page(_poInPP))
                }

                base.metricsChanged(false)
            }
        }
        //
        base.contentColumnGap          = function (o) {
            var _cg         = base._cg;
            if (o === true) {
                base._cg        = parseFloat( base.$article.css($u.columnGapCssPropName) );
                if (_cg !== base._cg) {
                    base.metricsChanged(true);
                }
            }
            return base._cg;
        };

        //
        base.contentPosLeft         = function (o) {
            var _pl         = base._pl;

            if (o === true) {
                if (base._pmState == pmState.SCROLL) {
                    // the viewport is narrower than 6in
                    base._pl = $win.scrollTop()
                } else {
                    if ( base.options.useTrans ) {
                        base._pl    = - base.$article.position().left
                    } else {
                        base._pl    = base.el.scrollLeft;
                    }
                }
            }

            //if (_pl !== base._pl) {
            //    base.metricsChanged(true);
            //}

            return base._pl;
        };

        //
        base.contentWidth           = function (o) {
            var _cw         = base._cw
            if (o === true) {

                if (base._pmState == pmState.SCROLL) {
                    // the viewport is narrower than 6in
                    base._cw = $doc.height()
                } else {
                    var sw = base.article.scrollWidth
                    if ( sw > base.article.clientWidth ) { // on browsers where scrollwidth larger then client width we do not need cpu intensive steps down below
                        base._cw    = sw
                    } else {                             // special case, it is CPU intensive, therefore it is called from content width polling funciton
                        base.$article.css('overflow', 'hidden');
                        base._cw    = base.article.scrollWidth
                        base.$article.css('overflow', 'visible');
                    }
                }

                if (_cw !== base._cw) {
                    base.metricsChanged(true);
                }
            }

            return base._cw;
        };
        // for horizontal paging base.pageWidth - means actualy width
        // for vertical scrolling base.pageWidth - means vertical height
        base.pageWidth              = function (o) {

            var _pw         = base._pw;

            if (o === true) {
                if (base._pmState == pmState.SCROLL) {
                    // the viewport is narrower than 6in
                    base._pw    = $win.height()
                } else {
                    base._pw    = parseFloat( base.$article.innerWidth() + base.contentColumnGap(o));
                    //console.info('PageManager: base.pageWidth(): $article.innerWidth = %s columnGap = %s pageWidth = %s', base.$article.innerWidth(), base.contentColumnGap(o), base._pw)
                }
            }

            if (_pw !== base._pw) {
                base.metricsChanged(true);
            }

            return base._pw;
        };

        //
        base.metricsChanged         = function (o) {
            if (typeof o == "boolean") {
                base._mChanged = o;
            }
            return base._mChanged;
        };
        //
        base._dumpMetrics           = function () {
            console.info('_dumpMetrics(): cgap=%s pleft=%s cwidth=%s pwidth=%s _mChanged=%s',
                        base._cg, base._pl, base._cw, base._pw, base._mChanged);
        };

        //*** caclculators of page navigation
        // nextPage
        base.nextPage               = function () {
            var cp              = base.cPage();
            return cp < base.lPage() ? cp + 1 : base.metaNextUnitHref !== null ? cp + 1 : cp;
        };
        // previous Page
        base.prevPage               = function () {
            var cp              = base.cPage();
            return cp > base.fPage() ? cp - 1 : base.metaPrevUnitHref !== null ? cp - 1 : cp;
        };
        // current Page number -> offset in Percentage points
        base.cPage2OffsetInPP         = function (page) {
            var _lp = base.lPage(),
                _cp = $.isNumeric(page) ? Math.min(_lp, Math.max(1, page)) : base.cPage()
            //return _lp > 1 ? 100 * (_cp - 1) / ( base.lPage() - 1 ) : 100;
            return _lp > 1 ? ( 100 * (_cp/_lp - .5/_lp) ): typeof _lp !== 'undefined' ? 100 : 0
        }

        // PercentagePointsOffset -> Page number
        base.ppOffset2Page = function (pp) {
            var _pp   = Math.min(100, Math.max(0,pp)),
                _lp   = base.lPage()
            _lp > 1 ? _pp = _pp * (1+1/_lp) - 1/_lp : 0
            _pp = Math.max(0,_pp)
            return _lp  > 1 ? Math.floor( (( _pp/100 * (_lp))) / (1+1/_lp) ) + 1: 1
        }

        // relative offset in pixels -> Page number
        //base.pxOffset2Page = function (pxOffset) {
        //    return Math.floor(pxOffset / base.pageWidth()) + 1;
        //};

        // @type is one of the Math functions to use
        // Math.floor or Math.round
        // the 1st one is good for calculating
        // page number, where the pixels actually
        // location, the 2nd one is good
        // for keeping aproximate context.
        base.pxOffset2Page = function (pxOffset, type) {

            if (base._pmState == pmState.SCROLL) 
                pxOffset += base.$article.offset().top

            
            var pg = type != null && type == 'r'
                    ?  Math.round((pxOffset) / base.pageWidth()) + 1
                    :  Math.floor((pxOffset) / base.pageWidth()) + 1

            // console.info('PageManager: pxOffset2Page(): pxOffset = %s pageWidth = %s page = %s', pxOffset, base.pageWidth(), pg)

            return pg
        };
        // id of DOM element -> Page number
        // @param id - id of the DOM element (in pure id or in this form "#xxx" with hash oin front)
        // @returns pn - Page Number, where it is located.
        base.id2Page = function (id) {
            var pn, pxo, $id
            if (id != null && id !== '') {
                ! /^#/.test(id) ? id = '#' + id : 0
                $id = $($u.jqSafeId(id))
                if ($id.length == 1) {
                    //console.info('PageManager: id2Page(): id = %s contentPosLeft = %s id.position().left = %s', id, base.contentPosLeft(true), $id.position().left)
                    pxo = $id.position().left + base.contentPosLeft(true)  // pixels offset
                    pn  = base.pxOffset2Page(pxo)                          // page number
                    //console.info('PageManager: id2Page(): pxo = %s pn = %s', pxo, pn)
                }
            }
            return pn
        };

        //*** polling related functions
        //
        base.startPollingContentMetrics           = function () {
            base.clearPollContentMetricsIntervalId()
            if (base._pmState == pmState.PAGE) {
                base.pollContentMetricsIntervalId = setInterval(base.pollContentMetrics, base.contentPollingInterval)
                base.isPollingContentMetrics(true)
            }
        };

        //
        base.stopPollingContentMetrics            = function () {
            base.clearPollContentMetricsIntervalId()
            base.isPollingContentMetrics(false)
        };
        //
        base.clearPollContentMetricsIntervalId    = function () {
            if ( $.isNumeric(base.pollContentMetricsIntervalId) ) {
                clearInterval(base.pollContentMetricsIntervalId)
                base.pollContentMetricsIntervalId = null
            }
        };

        //
        base.resetContentPollingInterval    = function () {
            base.contentPollingInterval != base.contentPollingIntervalMin
                ? (base.contentPollingInterval = base.contentPollingIntervalMin,
                   base.stopPollingContentMetrics(), base.startPollingContentMetrics())
                : 0
        };
        
        //
        base.resetRightPropOnWinResize      = function () {
            base.$el.css('right', '')
            base.right = parseFloat(base.$el.css('right'))
        };
        
        //
        base.applyPMState                   = function () {
            if (window.matchMedia("(max-width: 5in)").matches ||
                window.matchMedia("(max-height: 5in)").matches) { // do not forget to sync with css
                // the viewport is narrower than 6in
                base._pmState = pmState.SCROLL
                if ($u.touch && $.fn.swipe != null && typeof base.$el.swipe === "function") {
                    base.$el.swipe("disable")
                }
                base.$el.unmousewheel(base.mousewheelHandler)
                base.$article.css($u.transformCssPropName, 'none')
                base.stopPollingContentMetrics()
            } else {
                base._pmState = pmState.PAGE
                if ($u.touch && $.fn.swipe !== null && typeof base.$el.swipe === "function") {
                    base.$el.swipe("enable")
                }
                base.$el.mousewheel(base.mousewheelHandler)
                base.startPollingContentMetrics()
            }
        };

        //
        base.onWinResize                       = function () {
            base.applyPMState()
            base.calcMetrics()
        };

        //
        base.onWinScroll                       = base.onWinResize
	
        // get polling flag or set if option is provided
        base.isPollingContentMetrics = function (o) {
            if (typeof o == "boolean") {
                return base._isPollingContentMetrics = o;
            }
            return base._isPollingContentMetrics;
        };
        //
        base.colW_colC_aW = function () {
            var $el         = base.$article,
                _cssColW    = $el.css($u.columnWidthCssPropName),
                _cssColC    = $el.css($u.columnCountCssPropName),
                _cssColG    = $el.css($u.columnGapCssPropName),
                _aW         = $el.innerWidth(),
                _colW, _colWG, _colWHG, _colC, _colG   = parseFloat( _cssColG )
            //
            if (_cssColC == "auto" && _cssColW !== "auto") {
                _colW   = parseFloat(_cssColW)
                _colC   = Math.floor((_aW + _colG) / (_colW + _colG))
            } else if ($.isNumeric(_cssColC)) {
                _colC = _cssColC
            }
            //
            if ($.isNumeric(_colC)) {
                _colW   = (_aW + _colG) / _colC - _colG       // column width less gap
                _colWHG = (_aW + _colG) / _colC - Math.floor(_colG/2) // column width with half gap
                _colWG  = (_aW + _colG) / _colC               // column width with full gap
                return ({cw: _colW, cwg: _colWG, cwhg: _colWHG, cc: _colC, cg: _colG, aw: _aW, cssCW: _cssColW, cssCC: _cssColC})
            }else {
                return undefined
            }

        }
        // adjust right side of the content
        // for perfect alignment of columns
        // with content width during page turning
        // process
        base.adjustContentRightSide = function () {
            var _rPos       = parseFloat(base.$el.css('right')),        // current right side position
                _rDelta     = _rPos - base.right,
                _ci         = base.colW_colC_aW(),
                _adjW
            //
            if (_ci != null)
                _adjW = ((_ci.aw + _rDelta) % _ci.cc) + (_ci.cg % _ci.cc )
                //_adjW = (_ci.aw + _rDelta) % Math.floor( (_ci.aw + _rDelta + _ci.cg) / (_ci.cwg) )

            //
            if (_adjW != null && base.right + _adjW !== _rPos) {
                // console.warn('original right: %s need adjustments %s', base.right, base.right + _adjW)
                // console.trace()
                base.$el.css('right', base.right + _adjW);
            }
        }
        // Infinite polling of the content metrics
        base.pollContentMetrics       = function () {
            // adjust scrollLeft property
            if (base.el.scrollLeft !== 0) {base.$el.scrollLeft(0)}
            if (base.el.scrollTop !== 0) {base.$el.scrollTop(0)}

            if (base.isPollingContentMetrics()) {
                // poll contentWidth here to prevent
                // frequent switch to overflow css property
                // for those browsers, which do not support
                // scrollWidth on child element if parent
                // has overflow auto to hidden to minimize CPU load.
                // go to current page if isPollingContentMetrics is not true

                // save current position just in case metrics had changed we
                // can jump to the closest page based on calculation %% offset
                base.calcMetrics()

            }
            // after each poll increase interval until it reaches max
            base.contentPollingInterval <= base.contentPollingIntervalMax
                ? (base.contentPollingInterval *= base.contentPollingIntervalMul, base.stopPollingContentMetrics(), base.startPollingContentMetrics())
                : 0
        };

        base.pInfo                     = function () {
            return {    
                        pn: base.cPage(), 
                        po: base.cPage2OffsetInPP().toPrecision(6), 
                        lp: base.lPage(),
                        pu: base.metaPrevUnitHref, 
                        nu: base.metaNextUnitHref
            }
        }
        // *********** Page Manager notification functions
        // notify subsribers before page jump
        base.triggerPageTurnBefore     = function () {
            //console.info('triggerPageTurnBefore() pn: %s po: %s lp: %s', base.cPage(), base.cPage2OffsetInPP(), base.lPage())
            base.$el.trigger(evt.PAGE_TURN_BEFORE, base.pInfo());
        };
        // notify subsribers after page jump
        base.triggerPageTurnAfter     = function () {
            //console.info('triggerPageTurnAfter() pn: %s po: %s lp: %s', base.cPage(), base.cPage2OffsetInPP(), base.lPage())
            base.$el.trigger(evt.PAGE_TURN_AFTER, base.pInfo());
            base.pagesChanged(false);
        };
        // notify subsribers about page information change
        base.triggerPagesChanged     = function () {
            base.$el.trigger(evt.PAGES_CHANGED, base.pInfo());
            base.resetContentPollingInterval()
        };


        // *********** Page Manager action functions
        base.goNextPage             = function() { base.goPage( base.nextPage() ); };
        base.goPrevPage             = function() { base.goPage( base.prevPage() ); };
        base.goFirstPage            = function() { base.goPage( base.fPage() ); };
        base.goLastPage             = function() { base.goPage( base.lPage() ); };

        // goPage (pageNum)
        // pNum is page number to jump to
        base.goPage                 = function(pNum) { 
            // console.trace()
            // console.info('PageManager: goPage(): pNum = %s start: style = %s', pNum, base.$article.attr('style'))

            var _cp     = base.cPage(),
                _mCh    = base.metricsChanged(),
                _pCh    = base.pagesChanged(),
                _pw     = base.pageWidth();
            // sanity check for pNum
            if ($.isNumeric(pNum) === true &&
                pNum >= base.fPage() &&
                pNum <= base.lPage() &&
                ( _mCh === true || pNum !== _cp)) {

                // set new current page
                var nCp = Math.floor(parseFloat(pNum));
                // check if geometry or pagination changed
                // or current page is not matching new page
                if (_mCh || _pCh || nCp !== _cp) {
                    // trigger before event
                    base.triggerPageTurnBefore()
                    base.stopPollingContentMetrics()

                    var _translateX = (_pw * (nCp - 1))
                    base.transX = _translateX

                    if (base.transX != base.transXcurr) {
                        base.transXcurr = base.transX

                        if (base._pmState === pmState.SCROLL) {
                            $win.scrollTop(base.transX)
                            base.cPage(nCp)
                            base.pagesChanged() ? base.triggerPagesChanged() : 0
                        } else {
                            if ( base.options.useTrans ) {
                                var transFlag = parseFloat(base.$article.css($u.transitionDuration)) > 0
                                //
                                if (transFlag) {
                                    base.$article.unbind($u.transitionEndEvName)
                                    base.$article.one($u.transitionEndEvName, base.transitionEnd)
                                }

                                // set transform property with new value
                                base.cPage(nCp)
                                base.pagesChanged() ? base.triggerPagesChanged() : 0

                                var translPattern = $u.csstransforms3d && $html.hasClass('animate') ? $u.transl3DPattern : $u.transl2DPattern
                                base.$article.css ( $u.transformCssPropName, (translPattern).replace(/@/g, - base.transX) )

                                // just in case if transitions are not supported or not set
                                // execute transitionEnd()
                                ! transFlag ? base.transitionEnd() : 0
                            } else {
                                base.$el.stop(true, true);
                                base.$el.animate({
                                    scrollLeft: base.transX
                                }, 250, base.transitionEnd);
                            }
                        }
                    } else {
                        base.startPollingContentMetrics();
                    }
                }
            }else if ($.isNumeric(pNum) == true && pNum < base.fPage() && base.metaPrevUnitHref != null)
            {
                var href = base.metaPrevUnitHref
                window.open(href, "_self")
                $u.lsSet('jr:pm:init:phase', evt.LAST_PAGE)
            }else if ($.isNumeric(pNum) == true && pNum > base.lPage() && base.metaNextUnitHref != null) {
                var href = base.metaNextUnitHref
                window.open(href, "_self")
            }
            //console.info('pagemanager: goPage(): end: style=  %s', base.$article.attr('style'))   
        };
        //
        base.transitionEnd             = function (e) {
            //console.info('transitionEnd e.type = ' + (e == null ? "undefined" : e.type))
            //console.info('PageManager: transitionEnd(): style=  %s', base.$article.attr('style'))   
            base.triggerPageTurnAfter();                                // trigger after event
            base.startPollingContentMetrics();
        };

        // *********** Pager Event Handlers

        // swipeHandler (event)
        base.swipeHandler   = function(e, direction, distance, duration) {
            var pDef = false;                                           // prevent default event flag

            if (direction == "left") {
                base.goNextPage();
                pDef = true;
            } else  if (direction == "right") {
                base.goPrevPage();
                pDef = true;
            }

            if (pDef) {
                e.preventDefault();
            }
        };
        // clickHandler (event)
        base.clickHandler           = function (e) {
            if (e.type == 'click') {
                var $t = $(e.currentTarget)
                var _offsetP = ( e.clientX - $t.position().left ) / $t.innerWidth();
                if (_offsetP <= 0.2 ) {
                    base.goPrevPage()
                }else if (_offsetP >= 0.8) {
                    base.goNextPage()
                }
            }
            return false
        };
        //
        base.tapHandler         = function (e) {
            // unbind click events for touch devices
            if (base._touch == null) {
                base.$el.unbind('click', base.clickHandler); // to prevent double page turn
                base._touch = true
            }
            // check that the touch was on left or right border
            if (e.type == 'pointerdown') {
                base.$el.on('pointerup pointermove', base.tapHandler);
                //base._pageX = e.originalEvent.targetTouches[0].pageX
                base._pageX = e.originalEvent.pageX
            }
            // move
            // touch move cancels tap, by reseting base._touchClientX value
            if (e.type == 'pointermove' || e.type == 'pointercancel') {
                base._pageX = null
            }
            // end
            // if event is touchend and there is value in base._touchClientX
            // the event considered as tap, otherwise swipe handler will
            // handle the event
            if (e.type == 'pointerup' && base._pageX != null) {
                var _pageX      = base._pageX
                    _oW         = base.$el.outerWidth()
                    _lbW        = parseFloat(base.$el.css('border-left-width')),
                    _rbW        = parseFloat(base.$el.css('border-right-width')),
                    _touchX     = _pageX - base.$el.position().left;
                if (_touchX < _lbW) {
                    base.goPrevPage()
                } else if ((_oW - _touchX) < _rbW) {
                    base.goNextPage()
                }
                base._pageX = null
            }

            if (e.type == 'pointerup' || e.type == 'pointercancel') {
                base.$el.unbind('pointerup pointermove pointercancel', base.tapHandler);
            }

            return true
        };
        // kbdHandler
        // FIXME - there should be a way to identify which article is active to apply keyboard events
        // need to think how to decide which <article> is active.
        base.kbdHandler = function(e) {
            // console.error('PageManager: kbdHandler(): focused = %s document.activeElement = %s', $.trackFocus.focused().get(0), document.activeElement)
            var kc = e.keyCode,
                $t  = $(e.target)
            
            // ignore key strokes if element controled by pagemanager (or its children or parents) is not focused
            if (base.$el.closest($t).length == 0 && $t.closest(base.$el).length == 0) return
            
            if (base._pmState === pmState.PAGE) {
                 // the viewport is wider than 6in
                if (kc == 9) { // tab key
                    e.preventDefault()
                }else if (kc == 38 || kc == 37 || kc == 33 ) {         // up arrow | left arrow | page Down buttons
                    base.goPrevPage();
                } else if (kc == 40 || kc == 39 || kc == 34 || kc == 32) {    // down arrow | right arrow | page Up buttons
                    base.goNextPage();
                } else if (kc == 35 ) {                // End button
                    base.goLastPage();
                } else if (kc == 36 ) {                // Home button
                    base.goFirstPage();
                }
            }
        };

        // o = {
        //      pn: PageNumber,
        //      po: PageOffsetInPercentagePoints
        //      px: PageOffsetInPixles
        // })
        // pn and po parameters are mutually exclusive, that
        // means it has to be one or another, but not both.
        base.eventHandler = function(e, o) {
            var et = e.type;

            // console.info('PageManager: base.eventHandler(): et: %s', et)

            if ( !$.isPlainObject(o)) {o = { pn: base.fPage() }; }

            if (et == evt.NEXT_PAGE) {
                base.goNextPage();
            } else  if (et == evt.PREV_PAGE) {
                base.goPrevPage();
            } else  if (et == evt.FIRST_PAGE) {
                base.goFirstPage();
            } else  if (et == evt.LAST_PAGE) {
                base.goLastPage();
            } else  if (et == evt.GO_PAGE && $.isNumeric(parseFloat(o.pn)) ) {
                base.goPage(parseFloat(o.pn));
            } else  if (et == evt.GO_PAGE && $.isNumeric(parseFloat(o.po)) ) {
                base.goPage(base.ppOffset2Page(parseFloat(o.po)));
            } else  if (et == evt.GO_PAGE && $.isNumeric(parseFloat(o.px)) ) {
                base.goPage(base.pxOffset2Page(parseFloat(o.px + base.contentPosLeft(true))));
            } else  if (et == evt.GO_PAGE && typeof o.id == "string" && o.id !== '') {
                // console.info('PageManager:eventHandler(): event %s to id = %s', evt.GO_PAGE, o.id)
                base.goPage(base.id2Page(o.id));
            } else  if (et == evt.GO_POS && o.pos != null && $.isNumeric(parseFloat(o.pos.left)) ) {
                if (base._pmState === pmState.SCROLL){
                    base.goPage(base.pxOffset2Page(o.pos.top))
                }else {
                    base.goPage(base.pxOffset2Page(parseFloat(o.pos.left + base.contentPosLeft(true))));
                }
            }
        };

        base.scrollHandler = function(e) {
            // console.info('PageManager: base.scrollHandler()')
            //console.trace()
            e.preventDefault();
            var et = e.type;

            if (base._pmState === pmState.PAGE) {
                if (base.el.scrollLeft !== 0
                    || base.el.scrollTop !== 0) {
                    
                    var id = window.location.hash
                    
                    if (id != null && id !== '') {
                        base.$el.unbind('scroll', base.scrollHandler)
                        base.stopPollingContentMetrics()
                        
                        if (base.el.scrollLeft !== 0) {
                            //console.info('PageManager: base.scrollHandler(): scrollLeft(0)')
                            base.$el.scrollLeft(0)
                        }

                        if (base.el.scrollTop !== 0) {
                            //console.info('PageManager: base.scrollHandler(): scrollTop(0)')
                            base.$el.scrollTop(0)
                        }
                        
                        //base.calcMetrics()
                        //base.goPage(base.id2Page(id))
                        base.$el.on('scroll', base.scrollHandler)
                        base.startPollingContentMetrics()
                    }
                }
            }
            // hack to avoid mousewheel event at the time of clicking on href with "#target_id"
            base.wheelScrollLastTime = new Date().getTime() 
            // console.info('wheelScrollLastTime = %s', base.wheelScrollLastTime)
            //
            return false
        }

    	//	
    	base.mousewheelHandler	= function (e, d, dx, dy) { // event, delta, deltaX, deltaY
            var wheelSrollStarted,
                nowTime = new Date().getTime()

            
            if('wheelScrollLastTime' in base) {
                if(nowTime - base.wheelScrollLastTime > 200 )
                    wheelSrollStarted = true
            } else {
                wheelSrollStarted = true
            }
            
            if (wheelSrollStarted) {
                //console.info('PageManager: base.mousewheelHandler() ! deltaD = %s', Math.abs(d))

                if (d < 0)
                    base.goNextPage()
                else if (d > 0)
                    base.goPrevPage()
            
                base.wheelScrollLastTime = nowTime;
            }
    	}

        // *********** Run initializer
        base.init();
    };

    $.jr.PageManager.defaultOptions = {
        useTrans : true // with false value it is not working properly if more then one columns
                        // present and content is not occupaing all columns on the last page.
    };

    $.fn.jr_PageManager = function(options) {
        return this.each(function(){
            (new $.jr.PageManager(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.PageManager if it has been attached to the object.
    $.fn.getjr_PageManager = function() {
        return this.data("jr.PageManager");
    };

})(jQuery);
