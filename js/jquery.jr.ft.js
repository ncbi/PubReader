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
                
                $t.bind("show", function (e) {
                    it.active = true
                }).bind("hide", function (e) {
                    it.active = false
                }).bind("focusin", function (e) {
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
        var fcsStore = []
        
        $.fn.trackFocus = function(options) {
            
            var settings = $.extend({}, $.trackFocus.defaults, options);
            
            this.each(function() {
                var $t = $(this),
                    it = $.extend({}, settings, {'$el': $t})
                
                if (! $.isNumeric($t.attr('tabindex'))) 
                    $t.attr('tabindex', 0)
                
                fcsStore.push(it)
                
                $t.bind("focusin", function(e) {
                    for (var i = 0; i < fcsStore.length; i++)
                        fcsStore[i].focused = false
                    it.focused = true
                })
                
                
            })
            
            return this;
        }
        
        $.trackFocus = {
            defaults: {
                'default': false,
                focused: false,
                $el: null
            },
            focused: function() {
                return getActiveItemFromStore(fcsStore, 'focused')
            },
            refocus: function() {
                var $f = $.trackFocus.focused()
                $f == null ? null : $f.focus()
            }
        }
    })(jQuery);

}