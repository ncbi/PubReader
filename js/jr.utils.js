/* $Id: jr.utils.js 16755 2013-07-02 16:41:59Z kolotev $
    Module:

        JATS Reader's Utilities via extended jQuery

    Author:

        Andrey Kolotev

    Synopsis:

    Dependecies:
        jQuery, Modernizr

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

(function( $ ) {
    if(!$.jr){
        $.jr = new Object();
    };

    if(!$.jr.utils){
        $.jr.utils = new Object();
    };

    Modernizr.addTest('boxflex', Modernizr.testAllProps('boxFlex') || Modernizr.testAllProps('flex'))

    var transitionEndEventNames = {
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition'    : 'transitionend',
            'OTransition'      : 'oTransitionEnd',
            'msTransition'     : 'MSTransitionEnd',
            'transition'       : 'transitionend'
        },
    ls                      = window.localStorage


    $.extend( $.jr.utils, {
        touch:                  Modernizr != null ? Boolean(Modernizr.touch) : false,
        transitionEndEvName:    transitionEndEventNames[ Modernizr.prefixed('transition') ],
        transformCssPropName:   Modernizr.prefixed('transform'),
        columnGapCssPropName:   Modernizr.prefixed('columnGap'),
        columnWidthCssPropName: Modernizr.prefixed('columnWidth'),
        columnCountCssPropName: Modernizr.prefixed('columnCount'),
        transitionDuration:     Modernizr.prefixed('transitionDuration'),
        csstransitions:         Modernizr != null ? Boolean(Modernizr.csstransitions) : false,
        csscolumns:             Modernizr != null ? Boolean(Modernizr.csscolumns) : false,
        csstransforms3d:        Modernizr != null ? Boolean(Modernizr.csstransforms3d) : false,
        ls:                     !!ls // local storage flag
    })

    $.extend( $.jr.utils, {
        //translPattern:  'translate' + ($.jr.utils.csstransforms3d ? '3d' : 'X') + '(@px' + ($.jr.utils.csstransforms3d ? ',0,0)' : ')' ),

        transl2DPattern:  'translateX(@px)',

        transl3DPattern:  'translate3d(@px,0,0)',

        lsSet:                  function(key, val) {
            if (!!ls) {
                try { // console.info('ls: write key = %s val = %s', key, val)
                    ls.removeItem(key) // workaround for iOS devices (some versions)
                    ls.setItem(key, val)
                } catch(e) {console.error(e.message)}
            }
        },

        lsGet:                  function(key) {
            if (!!ls) {
                try { // console.info('ls: read key = %s val = %s', key, ls.getItem(key))
                    var val = ls.getItem(key)
                    return !!JSON
                        ? (/^(true|false|null)/.test(val)
                            ? JSON.parse(val)
                            : (val === "undefined" ? undefined : val))
                        : val
                } catch(e) {console.error(e.message)}
            }
            return undefined
        },

        jqSafeId:               function(id) {
            return typeof id === "string" ? id.replace(/(:|\.)/g, '\\$1') : id
        },
		regexp: {
			escape: function (s) {
				return s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			}
		}
    })

})( jQuery );
