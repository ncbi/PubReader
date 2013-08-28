/* JATS Reader Find in page module */

/* 
*/

/* Example of use
 *
 * $('fip-ui-selector').jr_Fip({ 'fipTargets': [
 *      {'fipTarget': 'selectorA1 with searchable content', 'poc': 'selectorB1 of element which holds content and controls it (pagemanager for example'},
 *      {'fipTarget': 'selectorA2 with searchable content', 'poc': 'selectorB2 of element which holds content and controls it (objectbox for example)'}
 *      ]
 * })
*/


(function($){

    if(!$.jr){
        $.jr = new Object();
    };


    //
    var $u      = $.jr.utils,
        $doc    = $(document),
        state   = {UNDEFIND: - 1, HIDDEN: 0, EXPOSED: 1}
    
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
            base.state      = state.UNDEFIND

            //
            base.$mgB       = base.$el.find('#jr-fip-mg')
            base.$doneB     = base.$el.find('#jr-fip-done')
            base.$nextB     = base.$el.find('#jr-fip-next')
            base.$prevB     = base.$el.find('#jr-fip-prev')
            base.$termF     = base.$el.find('#jr-fip-term')
            base.$matchesP  = base.$el.find('#jr-fip-matches')
            //
            $doc.bind('keydown', base.docKDHandler)
            base.$mgB.bind('click', base.mgClkHandler)
            base.$doneB.bind('click', base.doneClkHandler)
            base.$nextB.bind('click', base.nextClkHandler)
            base.$prevB.bind('click', base.prevClkHandler)
            //
            base.$termF.bind('keyup', base.termKUHandler);
            //
            base.state      = state.HIDDEN
            //
            base.$el.bind('focusin', base.focusInHandler)
            base.$el.bind('jr:fip:show', base.showHandler)
            base.$el.bind('jr:fip:hide', base.hideHandler)
            //
            base.resetCounters()
            
        }
        
        base.docKDHandler = function (e) { 
            var kc = e.keyCode,
                km = e.ctrlKey || e.metaKey, // key meta character
                ks = e.shiftKey, // shift key
                $t  = $(e.target),
                $el = base.$el

            if (km && kc === 70) { // Ctrl+F or Command+F handling
                e.preventDefault()
                base.exposeUI()
            }else  if (base.state == state.EXPOSED) {
                if (kc == 27 ) { // ESC key handling
                    if ($t.closest($el).length + $el.closest($t).length > 0)
                        base.hideUI()
                } else if ( (km && kc == 71 ) || kc == 114 )
                    if (ks)
                        base.prevClkHandler (e) // left arrow for navigating found items Shift+(F3 or Command+G/Ctrl+G)
                    else
                        base.nextClkHandler (e) // right arrow for navigating found items F3 or Command+G/Ctrl+G
            }
        }
        
        base.exposeUI = function () {
            if (base.fipTargets.length > 0) {
                if (base.state != state.EXPOSED) {
                    base.$el.removeClass('hidden')
                    base.state = state.EXPOSED
                    base.term  = ''
                }
                base.$termF.focus().select()
            }
        }

        base.hideUI = function () {
            if (base.state == state.EXPOSED) {
                base.cleanMarks()
                base.$el.addClass('hidden')
                base.state = state.HIDDEN
                $.trackFocus.refocus()
            }
        }

        base.showHandler = function (e) {
            base.exposeUI()
        }
        
        base.hideHandler = function (e) {
            base.hideUI()
        }

        base.focusInHandler = function (e) {
            base.setFipTagetPoc()
        }

        base.setFipTagetPoc = function () {
            var $active = $.trackFip.active()

            if (base.fipMarkTotal > 0 && $active.get(0) != base.$active.get(0)) 
                base.cleanMarks()
            
            base.$poc       = null
            base.$fipTarget = null
            base.$active    = $active
            base.term       = ''
            
            $.each(base.fipTargets, function(i, v) {

                var $ft = $(v.fipTarget),
                    $poc = $(v.poc)

                if ( $ft.length == 1 && $poc.length == 1
                        && ($active.closest($ft).length > 0 || $ft.closest($active).length > 0) ) {
                        base.$poc = $poc
                        base.$fipTarget = $ft
                        return false
                }

                return true  
            })
        }
        
        base.doneClkHandler = function (e) {
            e.preventDefault()
            base.hideUI()
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
            with (base) {
                if (fipMarkTotal > 0) {
                    removeActiveMark()
                    fipMarkCurrent += step
                    var c = fipMarkCurrent, t = fipMarkTotal;
                    fipMarkCurrent = (c < 0 ? t - 1 : (c >= t ? 0 : c))
                    updateMatches()
                    setActiveMark()
                }
            }
        }
        //
        base.termKUHandler = function (e) {
            var kc = e.keyCode,
                ks = e.shiftKey // shift key
            
            with (base) {
                if (kc == 13 ) {
                    if (! findExec()) {
                        if (ks)
                            prevClkHandler (e)
                        else
                            nextClkHandler (e)
                    }
                }
            }
        }
        //
        base.mgClkHandler = function (e) {
                e.preventDefault()
                if (! base.findExec())
                    base.nextClkHandler (e)
        }
        //
        base.getTermVal = function () {
            return base.$termF.val().trim()
        }
        //
        base.findExec = function () { // returns true if the serach was performed and false otherwise
            base.$termF.select()
            var t = base.getTermVal()
            if (t.length > 0 && t != base.term) {
                base.cleanMarks()
                base.find(t)
                return true
            }
            return false
        }
        //
        base.find = function (term) {
            if ($u.touch)
                base.$termF.blur()
            if (base.$fipTarget instanceof jQuery) {
                if (! base.$fipTarget.is(':visible')) 
                    $.trackFocus.refocus()
                
                var _term  = base.term = term.toLowerCase(),
                    term_re = new RegExp('(' + $u.regexp.escape(_term) + ')','gi')
                    _found = base.$fipTarget.find(":not(iframe,script)")
                    .contents()
                    .filter( function() {return this.nodeType == 3 && this.nodeValue.match(/\S/)} )
                    .filter( function() {
                        var t = this,
                            $t = $(t)
    
                        if (t.nodeValue.toLowerCase().indexOf(_term) >= 0 && window.getComputedStyle($t.parent()[0]).opacity > 0)
                            $t.replaceWith(t.nodeValue.replace(term_re, '<span class="fip_mark">$1</span>'))
                        else 
                            return false
    
                        return true
                    } )
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
            }
        }
        //
        base.removeActiveMark = function () {
            $(base.fipMarks.get(base.fipMarkCurrent)).removeClass('fip_active')
        }
        //
        base.setActiveMark = function () {
            var _mark       = $(base.fipMarks.get(base.fipMarkCurrent)).addClass('fip_active'),
                _markPos    = base.positionInArticle(_mark),
                _pocEvent   = $.Event("jr:go:pos")

            base.$poc.trigger(_pocEvent, {'pos': _markPos})
        }
        //
        base.cleanMarks = function () {
            if (base.fipMarkTotal > 0)
                base.$fipTarget.find("span.fip_mark").each(function() {
                    with (this.parentNode) {
                        replaceChild(this.firstChild, this);
                        normalize();
                    }
                })
            base.resetCounters()
            base.updateMatches()
        }
        //
        base.positionInArticle = function ($el) {
            if ($el instanceof jQuery) {
                $el = $el.first()
                var elPos = $el.position(),
                    p = $el.parentsUntil('article')
                var cl = $el.attr("class")

                p.map (function() {
                    var $t = $(this), t = this
                    
                    if ($t.css("position") != 'static') {
                        var cl = $t.attr("class")
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
            with (base) {
                var t = fipMarkTotal
                $matchesP.text ( t == 0 ? 'no matches' : (fipMarkCurrent + 1) + ' of ' + t + ' match' + (t > 1 ? 'es' : '') )
            }
        }
        
        base.resetCounters = function () {
            with (base) {
                fipMarkCurrent = 0
                fipMarkTotal   = 0
                fipMarks       = []
            }
        }
        
        // Run initializer
        base.init();

    };
    
    //
    $.jr.Fip.defaultOptions = {
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