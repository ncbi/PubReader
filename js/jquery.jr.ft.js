/* JATS Reader Find in page focus tracker and Focus Tracker for other elements */

/* trackFip() tracks the active content related element,
 * where the search may be conducted.
 * currently it is #jr-content and #jr-objectbox elements.
 *
 * trackFocus() tracks focus of registered elements and sets @tabindex attribute
 * to make the programatically focusable.
*/

/* Example of use
 *
 * $(selector).trackFocus()
 * $(selector).trackFip()
 * 
*/

{
    var getActiveItemFromStore = function (store, type) {
         var l   = store.length,
            $el = null;
        
        [type, 'default'].map (function (t) {
            for (var i = 0; i < l && $el == null; i++)
                if (store[i][t]) 
                    $el = store[i].$el
        })

        return $el
   };


    (function($) {
        
        var fipStore    = []
        
        $.fn.trackFip = function(options) {
            
            var settings = $.extend({}, $.trackFip.defaults, options);
            
            this.each(function() {
                var $t = $(this),
                    it = $.extend({}, settings, {'$el': $t})
                
                fipStore.push(it)
                
                $t.on("show:after", function (e) {
                    it.active = true
                }).on("hide:after", function (e) {
                    it.active = false
                }).on("focusin", function (e) {
                    for (var i = 0; i < fipStore.length; i++)
                        fipStore[i].active = false
                    it.active = true
                })
            })
            
            return this;
        }
        
        $.trackFip = {
            defaults: {
                'default': false, // search in item with this value set to true
                'active': false,
                $el: null
            },
            active: function() {
                return getActiveItemFromStore(fipStore, 'active')
            }
        }
    })(jQuery);
    
    (function($) {
        var fcsStore = [],
            index = 0
        
        $.fn.trackFocus = function(options) {
            
            var settings = $.extend({}, $.trackFocus.defaults, options);
            
            this.each(function() {
                var $t = $(this),
                    it = $.extend({}, settings, {'$el': $t, 'el': this})
                
                if (! $.isNumeric($t.attr('tabindex'))) 
                    $t.attr('tabindex', 0)
                
                fcsStore.push(it)

                $t.on("show:after", function(e) {
                    //console.info('trackFocus: show:after = %s', this)
                    e.stopPropagation()
                    if ($(this).is(":visible"))
                        $(this).focus()
                }).on("hide:after", function(e) {
                    //console.info('trackFocus: hide:after = %s', this)
                    e.stopPropagation()
                    if (this != document.body)
                        $(this).blur()
                }).on("focusin", function(e) {
                    // console.warn('trackFocus: et = %s $t = %s this = %s focused = %s document.activeElement = %s e.target = %s', 
                    //                 e.type, $t.get(0), this, $.trackFocus.focused().get(0), document.activeElement, e.target)
                    e.stopPropagation()
                    for (var i = 0; i < fcsStore.length; i++)
                        fcsStore[i].focused = false
                    it.focused = true
                }).on("focusout", function(e) {
                    e.stopPropagation()
                    it.focused = false

                    for (var i = 0; i < fcsStore.length; i++) {
                        if ($.contains(it.el, e.target)) {
                            it.focused = true
                            // console.info('e.target = %s descendant of it.el = %s', e.target, it.el)
                        }
                    }
                    // console.warn('trackFocus: et = %s $t = %s this = %s focused = %s document.activeElement = %s e.target = %s', 
                    //                e.type, $t.get(0), this, $.trackFocus.focused().get(0), document.activeElement, e.target)
                    // if (it.focused == false)
                    //     console.error('trackFocus: focusout: notify %s to hide', it.el)
                })
            })
            
            return this;
        }
        
        $.trackFocus = {
            defaults: {
                'default': false,
                focused: false,
                $el: null,
                el: null
            },
            focused: function() {
                return $(getActiveItemFromStore(fcsStore, 'focused'))
            },
            refocus: function() {
                var $f = $.trackFocus.focused()
                $f === null ? null : document.activeElement.blur()
            }
        }

    })(jQuery);

}
