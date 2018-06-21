/* $Id$

    Module:
        Main JATS Reader's application

    Author:
        Andrey Kolotev

    Synopsis:

    Usage:
        .... include jquery and all dependent modules ....
        <script src="js/jats.reader.js"></script>

    Assumptions:


    Dependencies:
    js/jquery.jr.pagemanager.js
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

/* stubs for console */
!function(w) {
    if (!w.console) {
        var c = w.console = {};
        c.log = c.error = c.info = c.debug = c.warn = c.trace = c.dir
              = c.dirxml = c.group = c.groupEnd = c.time = c.timeEnd
              = c.assert = c.profile = c.profileEnd = function() {};
    }
}(window);


/* Main application */

jQuery(document).ready(function () {
    var $u = $.jr.utils,
        h  = window.location.href,
        $jrContent = $('#jr-content'),
        logEx = function (e) { console.error ("%s [stack: %s]", e.message, e.stack) } // log exception

    try {
        if (! ($u.csscolumns) ) {
            console.error("Your browser is not supported. HTML5/CSS3 and ECMAScript, " +
                          "5th Edition, CSS Multicolumn layout features are required.")
            /* Fire an event for unsupported browser, it relies on
                csscolumns properties detected by Modernizr */
            $jrContent.trigger('jr:util:unsupported-browser')
        } else {
            /* for cases when pixel offsets are not integers next
             * function adjust those properties on resize and the domReady time
             */
            {
                // reveal UI
                $('#jr-ui').removeClass('hidden')
                //
                var $jrc = $('#jr-content'),
                    resizeTimer
                //
                function adjustContentOffsets ($elm) {
                    if ($elm != null && $elm.each != null) {
                        $elm.each (function () {
                            var el = this,
                                $el = $(this)
                            $.each(['top', 'bottom'], function (i, p) {
                                el.style[p] = ''
                                $el.css(p, Math.floor(parseFloat($el.css(p))))
                            })
                        })
                    }
                }
                //
                adjustContentOffsets($jrc)
                $(window).resize($.throttle(500, function (e) {adjustContentOffsets($jrc) }))

            } // end of adjustemnts


            //
			try { $('body').trackFocus()}
            catch (e) { logEx(e) }

			// Instantiate Page Turn Sensors
            // This is a temporary component for use in development:
            try { $('#jr-pi').jr_PaginationStatus({poc: '#jr-content'}).removeClass('hidden') }
            catch (e) { logEx(e) }

            // Instantiate Page Turn Sensors
            try {
                // show page turn sensors for non touch devices on the left and right margins of the page
                if (! $u.touch) {
                    $('#jr-pm-left').jr_PageTurnSensor({
                        action: 'prev', actionEv: 'jr:pm:go:prev:page', piEv: 'jr:pm:pages:changed', poc: '#jr-content', iUnit: true
                    });
                    $('#jr-pm-right').jr_PageTurnSensor({
                        action: 'next', actionEv: 'jr:pm:go:next:page', piEv: 'jr:pm:pages:changed', poc: '#jr-content', iUnit: true
                    });
                }
                // show page turn sensors next to page numbers.
                {
                    $('#jr-pi-prev').jr_PageTurnSensor({
                        action: 'prev', actionEv: 'jr:pm:go:prev:page', piEv: 'jr:pm:pages:changed', poc: '#jr-content', iUnit: true
                    });
                    $('#jr-pi-next').jr_PageTurnSensor({
                        action: 'next', actionEv: 'jr:pm:go:next:page', piEv: 'jr:pm:pages:changed', poc: '#jr-content', iUnit: true
                    });
                }
            } catch (e) { logEx(e) }

            // Instantiate Page Progress Bar
            try {
                $('#jr-progress').jr_PageProgressBar({poc: '#jr-content'})
                                 .jr_Panel({'poc': '#jr-is-sw', inverted: true, propogateClick: true})
            } catch (e) { logEx(e) }

            // Instantiate Image strip
            try {
                $('#jr-istrip').jr_Panel({'poc': '#jr-is-sw', propogateClick: true});
                $('#jr-is-sw').jr_Switcher({'poc': '#jr-dash', 'state': true, 'autoOff': false, 'stateless': false})
                $('#jr-is-prev').jr_PageTurnSensor({
                    action: 'prev', actionEv: 'jr:is:go:prev:page', piEv: 'jr:is:pages:changed', poc: '#jr-istrip'
                });
                $('#jr-is-next').jr_PageTurnSensor({
                    action: 'next', actionEv: 'jr:is:go:next:page', piEv: 'jr:is:pages:changed', poc: '#jr-istrip'
                });
                $('#jr-istrip').jr_PanelIstrip();
            } catch (e) { logEx(e) }

            // Instantiate content links handling
            try {
                var uriPrefix = '/' + $('meta[name=ncbi_db]').attr('content') + '/'
                $('article a').jr_Links({poc: '#jr-content', uri_prefix:  uriPrefix })
            } catch (e) { logEx(e) }

            // Links panel
            try {
                $('#jr-links-p').trackFocus().jr_Panel({'poc': '#jr-links-sw', hideOnEscape: true})
                $('#jr-links-sw').jr_Switcher({'poc': '#jr-head'})
            } catch (e) { logEx(e) }

            // Alternative views of the article panel
            try {
                $('#jr-alt-p').trackFocus().jr_Panel({'poc': '#jr-alt-sw', hideOnEscape: true})
                $('#jr-alt-sw').jr_Switcher({'poc': '#jr-head'})
            } catch (e) { logEx(e) }

            // contentMap panel
            try {
                if ('jr_PanelCmap' in $.fn) {
                    $('#jr-cmap-p').trackFocus().jr_Panel({'poc': '#jr-cmap-sw', hideOnEscape: true})
                    $('#jr-cmap-p').jr_PanelCmap({'poc': '#jr-content'})
                    $('#jr-cmap-sw').jr_Switcher({'poc': '#jr-head'})
                }
            } catch (e) { logEx(e) }
            
            // remoteToc panel
            try {
                if ('jr_PanelRtoc' in $.fn) {
                    $('#jr-rtoc-p').trackFocus().jr_Panel({'poc': '#jr-rtoc-sw', hideOnEscape: true})
                    $('#jr-rtoc-p').jr_PanelRtoc({'poc': '#jr-content'})
                    $('#jr-rtoc-sw').jr_Switcher({'poc': '#jr-head'})
                }
            } catch (e) { logEx(e) }


            // Typography panel
            try {
                $('#jr-typo-p').trackFocus().jr_Panel({'poc': '#jr-typo-sw', hideOnEscape: true})
                $('#jr-typo-p').jr_PanelTypo()
                $('#jr-typo-sw').jr_Switcher({'poc': '#jr-head'})
            } catch (e) { logEx(e) }

            // Instantiate page manager
            try { $('#jr-content').trackFocus().trackFip({'default': true}).jr_PageManager() }
            catch (e) { logEx(e) }


            // Instantiate history keeper
            try { $('#jr-content').jr_HistoryKeeper() }
            catch (e) { logEx(e) }

            // Instantiate "find in page" (fip) module
			try { $('#jr-fip').trackFocus().jr_Fip({'poc': '#jr-fip-sw',
				'fipTargets': [
								{'fipTarget': '#jr-content article[data-type=main]', 'poc': '#jr-content'},
								{'fipTarget': '#jr-objectbox article', 'poc': '#jr-objectbox'}
							]
				})
                $('#jr-fip-sw').jr_Switcher({'poc': '#jr-fip', 'autoOff': false})
			}
            catch (e) { logEx(e) }

			// Instantiate ObjectBox links
            try {
				$('#jr-objectbox').trackFocus().trackFip()
                $('article[data-type=main] a.figpopup' 
                    + ', article[data-type=main] a:not(.figpopup)[rid-ob]')
                                .jr_ObjectBox({
                                    contentLocal: true,
                                    contentLocalAttr: 'rid-ob'
                                });
            }
            catch (e) { logEx(e)}

            // Instantiate help content
            try {
                $('#jr-help-p').trackFocus().jr_Panel({'poc': '#jr-help-sw', hideOnEscape: true})
                $('#jr-help-sw').jr_Switcher({'poc': '#jr-head'});
                $('#jr-about-sw').jr_ObjectBox({'objectBoxClass': 'about'})
                $('#jr-helpobj-sw').jr_ObjectBox({'objectBoxClass': 'help'})
				$('#jr-about-sw,#jr-helpobj-sw').on('click', function() {$('#jr-help-p').trigger("jr:panel:hide")})
                // book reader related
                $('#jr-bkhelp-p').trackFocus().jr_Panel({'poc': '#jr-bkhelp-sw', hideOnEscape: true})
                $('#jr-bkhelp-sw').jr_Switcher({'poc': '#jr-head'});
            }
            catch (e) { logEx(e) }


            /* figure popup/ callouts for bib references */
            try {
                var fp_cfg = new $.fn.figPopup(),
                    fp = $('article[data-type=main] a.figpopup'),
                    bibr = $('article[data-type=main] a.bibr')
                
                // add co-class to figure popups
                fp.each (function () {
                    $(this).attr('co-class', 'co-fig')
                })

                // add co-class and co-rid attributes
                bibr.each (function () {
                    var $t = $(this)
                    $t.attr('co-class', 'co-refbox')
                      .attr('co-rid', $t.attr('rid'))
                })

                fp.popupSensor({statIfLonger: 500, delayIn: fp_cfg.delayIn, delayOut: fp_cfg.delayOut})
                bibr.popupSensor({statIfLonger: 500, delayIn: fp_cfg.delayIn, delayOut: fp_cfg.delayOut})

                if ($.fn.hoverIntent) {
                    fp.hoverIntent(fp_cfg)
                    bibr.hoverIntent(fp_cfg)
                }

            } catch (e) {logEx(e)}

            // PMC-20941 citation exporter
            try {
                var renderHandler = function (event) {
                        $t = $(this)
                        $t.citationexporter('render', $('meta[name="pmcaccid"]').attr("content"));
                    },
                    $ac = $('a.ctxp'),
                    $ma = $('article[data-type=main]')

                if ($ac.length > 0 && $ma.length > 0) {
                    $ma.after('<article data-type="cite" id="jr-cite-0"><h3 class="loading">Loading ...</h3></article>')
                    $ac.attr("rid-ob", "jr-cite-0")

                    $ac.on('citationexporterrendered', function(e, r) { // e - event; r - result
                        $('#jr-cite-0').html(r.content).find('a').jr_Links({poc: '#jr-content'})
                        $ac.trigger('refresh')
                    })
                    .on('citationexporterfailed', function(e, r) { // e - event; r - result
                        $('#jr-cite-0').html('<p class="align_center"><strong>Sorry! An error occurred while rendering the citation. Please try again later.</strong></p>')
				//+ ('responseText' in r ? '<p class="align_center"><small>' + r.responseText + '</small></p>' : ''))
                        $ac.trigger('refresh')
                        $ac.one("pointerup", renderHandler)
                    })
                    .one("pointerup", renderHandler)
                    .jr_ObjectBox({
                        contentLocal: true,
                        contentLocalAttr: 'rid-ob',
                        objectBoxClass: 'cite'
                    })
                }
            } catch (e) {logEx(e)}
            // Share content on social sites
            try {
                // FIXME
                $('a.btn.share')
                    .on("click", function () { return false })
                    .on("pointerup",  
                    function () {     
                        var href = this.href,
                            target = this.target

                        setTimeout(function(){
                            window.open(href, target ? target : '_blank', 
                                'width=600,height=300,left=20,top=20,toolbar=0,resizable=0')
                        }, 10)
                        // dismiss parent panel $('#jr-links-p')
                        $(this).closest('aside').trigger("jr:panel:hide")
                    })

            } catch (e) {logEx(e)}
        }
    } catch (e) {logEx(e)}
});

// PMC-16594 MULTI-LANGUAGE RENDERING selector
jQuery(document).ready( function () {
    var $ = jQuery,
        $u = $.jr.utils,
        clkEvName = "pointerup"

    $('a.lang-sw').on(clkEvName, function (e) {

        var $t      = $(this),
            div     = $('article[data-type=main]'),
            lang    = $t.attr('lang')

        if (div.size() == 1 && lang != null) {
            var old_lang = $t.parent().find('.selected').toggleClass('selected').attr('lang')
            div.toggleClass("slang-" + old_lang).toggleClass("slang-" + lang)
            $t.toggleClass('selected')
        }

        $(document).trigger(clkEvName) // added to make drop down panel to disapear.

        return false
    })

});

// BK-9285
jQuery(document).ready( function () {
    var $ = jQuery,
        clkEvName = "pointerup"

    $(document).on(clkEvName, "a.oemail", function(e) {

        var $t = $(this),
            em = $t.attr('data-email'),
            fixed = $t.data('fixed')

        if (fixed == null && em != null) {
            $t.data('fixed', true)
            $t.attr('href', 'mailto:' + em.reverse())
        }   

        return true
    })
})

// PMC-29317
// replace svg images with their inline version
jQuery(document).ready( function () {
    var $ = jQuery

    $('img.svg').each(function(){
            var $img        = $(this),
                imgID       = $img.attr('id'),
                imgClass    = $img.attr('class'),
                imgStyle    = $img.attr('style'),
                imgSrc      = $img.attr('src')


            $.get(imgSrc, function(data) {
                // Get the SVG tag, ignore the rest
                var $svg = $(data).find('svg')

                // Add replaced image's ID to the new SVG
                if(typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID)
                }
            
                // Add replaced image's classes to the new SVG
                if(typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass+' -svg')
                }
                
                // Add replaced image's style attribute to the new SVG
                if(typeof imgStyle !== 'undefined') {
                    $svg = $svg.attr('style', imgStyle)
                }

                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a')

                // Replace image with new SVG
                $img.replaceWith($svg)

            }, 'xml')

        })
})

// PMC-27757
// figures do not have copyright `or reuse links
jQuery(document).ready( function () {
    var $ = jQuery,
        $u = $.jr.utils,
        clkEvName = "pointerup"

    $('a.pmctoggle').on(clkEvName, function (e) {
        var $t = jQuery(this)

        $t.closest('dl').find('dd').fadeToggle(200, function(){
            $t.toggleClass('toggled')
            if ($t.hasClass('toggled'))
                $t.find('span:contains(' + decodeURIComponent("%E2%96%BA") + ')').replaceWith('<span>&#x25bc;</span>')
            else
                $t.find('span:contains(' + decodeURIComponent("%E2%96%BC") + ')').replaceWith('<span>&#x25ba;</span>')
        })

        return false
    })
});