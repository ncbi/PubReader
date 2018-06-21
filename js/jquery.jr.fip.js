/* JATS Reader Find in page module */

/* 
*/

/* Example of use
 *
 * $('fip-ui-selector').jr_Fip({ 'poc': 'switcher-selector', 'fipTargets': [
 *      {'fipTarget': 'selectorA1 with searchable content', 'poc': 'selectorB1 of element which holds content and controls it (pagemanager for example'},
 *      {'fipTarget': 'selectorA2 with searchable content', 'poc': 'selectorB2 of element which holds content and controls it (objectbox for example)'}
 *      ]
 * })
*/


(function($){

    if(!$.jr){
        $.jr = new Object();
    }


    //
    var $u      = $.jr.utils,
	    $win	= $(window),
        $doc    = $(document),
        state   = {UNDEFIND: - 1, HIDDEN: 0, EXPOSED: 1},
        evt     = {
                    ACTIVATED:      'jr:fip:activated',
                    DISMISSED:      'jr:fip:dismissed',
                    SEARCHED:       'jr:fip:searched',
                    MATCH_NEXT:     'jr:fip:match:next',
                    MATCH_PREV:     'jr:fip:match:prev'
                }
    
    $.jr.Fip = function(el, options) {
        
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el        = $(el);
        base.el         = el;
        
        
        // Add a reverse reference to the DOM object
        base.$el.data("jr.Fip", base);

        base.init = function() {
            base.options    = $.extend({}, $.jr.Fip.defaultOptions, options);
            base.fipTargets = base.options.fipTargets
            base.$poc       = $(base.options.poc)
            base.state      = state.UNDEFIND

            //
            base.$mgB       = base.$el.find('#jr-fip-mg')
            base.$doneB     = base.$el.find('#jr-fip-done')
            base.$nextB     = base.$el.find('#jr-fip-next')
            base.$prevB     = base.$el.find('#jr-fip-prev')
            base.$termF     = base.$el.find('#jr-fip-term')
            base.$matchesP  = base.$el.find('#jr-fip-matches')
            //
            var pup = 'pointerup'
            $doc.on('keydown', base.docKbdHandler)
            base.$mgB.on(pup, base.mgClkHandler)
            base.$doneB.on(pup, base.doneClkHandler)
            base.$nextB.on(pup, base.nextClkHandler)
            base.$prevB.on(pup, base.prevClkHandler)
            //
            base.$termF.on('keyup', base.termKUHandler)
            //
            base.state      = state.HIDDEN
            //
            base.$el.on('focusin', base.focusInHandler)
            base.$el.on('pointerup', base.pointerUpHandler)

            base.$poc.on("jr:switch:on:after", base.showHandler)
            base.$poc.on("jr:switch:off:before", base.hideHandler)

            //
            $win.on('resize', $.throttle(500, base.resizeHandler))
            //
            base.resetCounters()
            
        }
        
        base.docKbdHandler = function (e) {
            var kc = e.keyCode,
                km = e.ctrlKey || e.metaKey, // key meta character
                ks = e.shiftKey, // shift key
                $t  = $(e.target),
                $el = base.$el

            if (km && kc === 70) { // Ctrl+F or Command+F handling
                e.preventDefault()
                e.stopPropagation()
                base.$poc.trigger("jr:switch:on")
                if (base.state == state.EXPOSED) {
                    base.$termF.focus().select()
                }
            }else  if (base.state == state.EXPOSED) {
                if (kc == 27 ) { // ESC key handling
                    if ($t.closest($el).length + $el.closest($t).length > 0)
                        base.$poc.trigger("jr:switch:off")
                } else if ( (km && kc == 71 ) || kc == 114 )
                    if (ks)
                        base.prevClkHandler (e) // left arrow for navigating found items Shift+(F3 or Command+G/Ctrl+G)
                    else
                        base.nextClkHandler (e) // right arrow for navigating found items F3 or Command+G/Ctrl+G
            }
        }

        //
        base.termKbdHandler = function (e) {
            var kc = e.keyCode,
                km = e.ctrlKey || e.metaKey, // key meta character
                ks = e.shiftKey, // shift key
                $t  = $(e.target),
                $el = base.$el

            
            if (base.state == state.EXPOSED) {
                if (kc == 27 ) { // ESC key handling
                    e.preventDefault()
                    if ($t.closest($el).length + $el.closest($t).length > 0)
                        base.$poc.trigger("jr:switch:off")
                } else if (km && kc === 70) { // Ctrl+F or Command+F handling
                    e.preventDefault()
                    base.$termF.focus().select()
                }
                e.stopPropagation()
            }
        }

        //
        base.exposeUI = function () {
            if (base.fipTargets.length > 0) {
                
                if (base.state !== state.EXPOSED) {
                    base.$el.removeClass('hidden')
                    base.state = state.EXPOSED
                    base.term  = ''
                    base.$el.trigger(evt.ACTIVATED)
                }
                base.$termF.focus().select()
                base.$termF.on('keydown', base.termKbdHandler)
            }
        }
        
        //
        base.hideUI = function () {
            if (base.state == state.EXPOSED) {
                base.cleanMarks()
                base.$el.addClass('hidden')
                base.state = state.HIDDEN
                $.trackFocus.refocus()
                base.$el.trigger(evt.DISMISSED)
                base.$termF.off('keydown', base.termKbdHandler)
            }
        }

        base.showHandler = function (e) {
            base.exposeUI()
        }
        
        base.hideHandler = function (e) {
            base.hideUI()
        }

        base.focusInHandler = function (e) {
            base.setFipTargetPoc()
        }
        
        base.pointerUpHandler = function (e) {
            e.stopPropagation()
        }

        base.setFipTargetPoc = function () {
            var $active = $.trackFip.active()

            if (base.fipMarkTotal > 0 && $active.get(0) != base.$active.get(0)) 
                base.cleanMarks()
            
            base.$fipTargetPoc       = null
            base.$fipTarget = null
            base.$active    = $active
            
            $.each(base.fipTargets, function(i, v) {

                var $ft = $(v.fipTarget),
                    $poc = $(v.poc)

                if ( $ft.length == 1 && $poc.length == 1
                        && ($active.closest($ft).length > 0 || $ft.closest($active).length > 0) ) {
                        base.$fipTargetPoc = $poc
                        base.$fipTarget = $ft
                        return false
                }

                return true  
            })
        }
        
        base.doneClkHandler = function (e) {
            e.preventDefault()
            base.$poc.trigger("jr:switch:off")
        }
        
        base.nextClkHandler = function (e) {
            e.preventDefault()
            base.npClkStep(1)
        }
        
        base.prevClkHandler = function (e) {
            e.preventDefault()
            base.npClkStep(-1)
        }
       
        base.npClkStep = function (step) {
            
                if (base.fipMarkTotal > 0) {
                    base.removeActiveMark()
                    base.fipMarkCurrent += step
                    var c = base.fipMarkCurrent, 
                        t = base.fipMarkTotal;
                    base.fipMarkCurrent = (c < 0 ? t - 1 : (c >= t ? 0 : c))
                    base.updateMatches()
                    base.setActiveMark()
                    if (t > 1 && Math.abs(step) > 0)
                        base.$el.trigger(step > 0 ? evt.MATCH_NEXT : evt.MATCH_PREV)
                }
        }
        //
        base.termKUHandler = function (e) {
            var kc = e.keyCode,
                km = e.ctrlKey || e.metaKey, // key meta character
                ks = e.shiftKey // shift key

            if (kc == 13 ) {
                if (! base.findHandler(e)) {
                    if (ks)
                        base.prevClkHandler (e)
                    else
                        base.nextClkHandler (e)
                }
            }
        }
        //
        base.mgClkHandler = function (e) {
            e.preventDefault()

            if (! base.findHandler(e)) {
                base.nextClkHandler (e)
            }
        }
        //
        base.getTermVal = function () {
            return base.$termF.val().trim()
        }
        //
        base.findHandler = function (e) { // returns true if the search was performed and false otherwise
            base.$termF.select()
            var t = base.getTermVal()

            // to hide keyboard to reveal content we need to blur from "term" field
            if (e != null && e.originalEvent != null 
                    && e.originalEvent.pointerType == "mouse") {
                base.$fipTarget.focus()
            }
                
            //
            if (t.length > 0 && t.toLowerCase() != base.term) {
                base.cleanMarks()
                base.find(t)
                return true
            }
            
            return false
        }

        //
        base.find = function (term) {
            if (base.$fipTarget instanceof jQuery) {
                if (! base.$fipTarget.is(':visible')) 
                    $.trackFocus.refocus()
                
                var _term  = term.toLowerCase(),
                    term_re = new RegExp('(' + $u.regexp.escape(_term) + ')','gi'),
                    _found = base.$fipTarget.find(":not(iframe,script)")
                    .contents()
                    .filter( function() {return this.nodeType == 3 && this.nodeValue.match(/\S/)} )
                    .filter( function() {
                        var t = this,
                            $t = $(t)
                        // insertion of inline-block element <i> is a hack to make
                        // calculation of fip_mark possible in Chrome on Android devices
                        // because the position() funciton call on inline elements
                        // was giving absolute position instead of relative one.
                        if (t.nodeValue.toLowerCase().indexOf(_term) >= 0 && window.getComputedStyle($t.parent()[0]).opacity > 0)
                            $t.replaceWith(t.nodeValue.replace(term_re, '<span class="fip_mark"><i style="display:inline-block" />$1</span>'))
                        else 
                            return false
    
                        return true
                    } )

                    base.term = _term
                //
                if (_found.length > 0) {
                    base.fipMarks       = base.$fipTarget.find("span.fip_mark")
                    base.fipMarkTotal   = base.fipMarks.length
                    base.fipMarkCurrent = 0
                    for (var i = 0; i < base.fipMarks.length; i++) {
                        var p = base.positionInArticle($(base.fipMarks[i]))
                        if (p.left > 0 && p.top > 0) {
                            base.fipMarkCurrent = i
                            break
                        }
                    }
                    base.npClkStep(0)
                }

                base.$el.trigger(evt.SEARCHED, {term: _term, count: _found.length})
            }
        }

        //
        base.removeActiveMark = function () {
            $(base.fipMarks.get(base.fipMarkCurrent)).removeClass('fip_active')
        }
        
        // 
        base.getActiveMark = function () {
            var _mark       = $(base.fipMarks.get(base.fipMarkCurrent)).addClass('fip_active')
            return _mark
        }
        
        //
        base.setActiveMark = function () {
            var _mark       = base.getActiveMark(),
                _markPos    = base.positionInArticle(_mark),
                _pocEvent   = $.Event("jr:go:pos")

            if (_markPos) {
                base.$fipTargetPoc.trigger(_pocEvent, {'pos': _markPos})
            }
        }
        //
        base.cleanMarks = function () {
            if (base.fipMarkTotal > 0)
                base.$fipTarget.find("span.fip_mark").each(function() {
                    with (this.parentNode) {
                        this.removeChild(this.firstChild) // remove <i/>
                        replaceChild(this.firstChild, this) // replace with text node.
                        normalize() // normalize nodes to prevent fragmentation, 
                                    // which would break subsequent searches.
                    }
                })
            base.resetCounters()
            base.updateMatches()
        }
        //
        base.positionInArticle = function ($el) {
            if ($el instanceof jQuery) {
                var elPos = $el.children().first().position(),
                    p = $el.parentsUntil('article')

                p.map (function() {
                    var $t = $(this), t = this
                    
                    if ($t.css("position") != 'static') {
                        var tPos = $t.position()

                        elPos.left += tPos.left
                        elPos.top += tPos.top
                    }
                })
                
                return elPos
            }
            
            return null
        }
        
        base.updateMatches = function () {
            var t = base.fipMarkTotal
            base.$matchesP.text ( t == 0 ? 'no matches' : (base.fipMarkCurrent + 1) + ' of ' + t + ' match' + (t > 1 ? 'es' : '') )
        }
        
        base.resetCounters = function () {
            base.fipMarkCurrent = 0
            base.fipMarkTotal   = 0
            base.fipMarks       = $([])
        }

        base.resizeHandler = function (e) {
            if (base.state == state.EXPOSED) {
                base.setActiveMark()
            }
        }
        
        // Run initializer
        base.init();

    };
    
    //
    $.jr.Fip.defaultOptions = {
	'poc' : null,
        'fipTargets': []
    };

    // jQuery like chainable wrapper
    $.fn.jr_Fip = function(options) {
        return this.each(function(){
            (new $.jr.Fip(this, options))
        })
    }

    // This function breaks the chain, but returns
    // the jr.Panel if it has been attached to the object.
    $.fn.getjr_Fip = function() {
        return this.data("jr.Fip")
    }

})(jQuery)
