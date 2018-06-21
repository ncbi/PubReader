/* $Id: jquery.jr.panel.typo.js 13234 2012-11-19 15:26:39Z maloneyc $

    Module:

        JATS Reader's Typography Configurator

    Author:

        Andrey Kolotev

    Synopsis:

        Typography Configurator panel provides user with ability to configure
        different aspects of typesettings in the Reader.


    Usage:

        $('panel-selector').jr_PanelTypo()

    This module is incomplete. Te functionality is not implemented yet.s

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
        fontSizeClassNameMap  = ['jr-fs-7', 'jr-fs-8', 'jr-fs-9', 'jr-fs-10', 'jr-fs-11', 'jr-fs-12', 'jr-fs-13', 'jr-fs-14', 'jr-fs-15', 'jr-fs-18', 'jr-fs-21', 'jr-fs-24'],
        colCountClassNameMap  = ['jr-col-auto', 'jr-col-1', 'jr-col-2'],
        animateClassNameMap   = ['animate', 'no-animate']

    var colCountMap = {
            "jr-col-auto":      '$colAuto',
            "jr-col-1":         '$col1',
            "jr-col-2":         '$col2'
        },
        animateMap  = {
            "animate":       '$animYes',
            "no-animate":    '$animNo'
        }

    // ========================================================================= $.jr.PanelTypo

    $.jr.PanelTypo = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el        = $(el);
        base.el         = el;

        // Add a reverse reference to the DOM object
        base.$el.data("jr.PanelTypo", base);
        base.clickEvName = $u.touch ? 'touchend' : 'click'

        //
        base.init = function(){
            base.options = $.extend({},$.jr.PanelTypo.defaultOptions, options);
            base.$fontSmaller       = base.$el.find('.sf')
            base.$fontLarger        = base.$el.find('.lf')
            base.$colAuto           = base.$el.find('.bcol-auto')
            base.$col1              = base.$el.find('.bcol-1')
            base.$col2              = base.$el.find('.bcol-2')
            base.$animYes           = base.$el.find('.anim-yes')
            base.$animNo            = base.$el.find('.anim-no')

            // read configuration
            base.initProp(fontSizeClassNameMap, 'fontSizeClassName')
            base.initProp(colCountClassNameMap, 'colCountClassName')
            base.initProp(animateClassNameMap, 'animateClassName')

            // read Modernizir class names

            // set one of the column buttons to "on" state
            // to correspond to colCountClassName
            base.setupButtons(colCountMap, 'colCountClassName', true)
            base.setupButtons(animateMap, 'animateClassName', true)

            base.$fontSmaller.bind(base.clickEvName, base.handleFontSmaller)
            base.$fontLarger.bind(base.clickEvName, base.handleFontLarger)
            base.$colAuto.bind(base.clickEvName, base.handleColAuto)
            base.$col1.bind(base.clickEvName, base.handleCol1)
            base.$col2.bind(base.clickEvName, base.handleCol2)
            base.$animYes.bind(base.clickEvName, base.handleAnimYes)
            base.$animNo.bind(base.clickEvName, base.handleAnimNo)
        }

        // get index in array based on value
        base.value2Idx = function (arr, value) {
            var i, idx = null
            if ( typeof value === "string" && $.isArray(arr))
                for (i = 0; i < arr.length; i++)
                    value.localeCompare(arr[i]) === 0 ? idx = i : 0

            return idx
        }

        //
        base.initProp       = function (arr, propName) {
            // read property from local storage
            var value =  $u.lsGet(propName)

            // get property from supplied options
            if (base.value2Idx(arr, value) == null) {
                if (base.value2Idx(arr, base.options[propName]) != null)
                    value = base.options[propName]
                // or use default
                else if ($.jr.PanelTypo.defaultOptions[propName] != null)
                    value = $.jr.PanelTypo.defaultOptions[propName]
            }

            return base[propName] = value
        }

        //
        base.prevFontSizeClassName = function(cn) {
            var idx = base.value2Idx(fontSizeClassNameMap, cn)
            return idx != null ? fontSizeClassNameMap[idx-1] : null
        }

        //
        base.nextFontSizeClassName = function(cn) {
            var idx = base.value2Idx(fontSizeClassNameMap, cn)
            return idx != null ? fontSizeClassNameMap[idx+1] : null
        }

        //
        base.handleFontSmaller  = function (e) {
            var ccn = base.fontSizeClassName,           // current font size class name
                pcn = base.prevFontSizeClassName(ccn)   // previous font size class name

            if (pcn != null) {
                $u.lsSet('fontSizeClassName', base.fontSizeClassName=pcn)
                $('html').removeClass(ccn).addClass(pcn)
            }
        }

        //
        base.handleFontLarger   = function (e) {
            var ccn = base.fontSizeClassName,           // current font size class name
                ncn = base.nextFontSizeClassName(ccn)   // next font size class name

            if (ncn != null) {
                $u.lsSet('fontSizeClassName', base.fontSizeClassName=ncn)
                $('html').removeClass(ccn).addClass(ncn)
            }
        }
        // map - map of class names and property name the script
        // cn  - className of the activated button
        // state - turn state of the button on or off with true and false values
        base.setupButtons = function (map, propName, state) {
            var cn = base[propName]

            state === true
                ?   (base[map[cn]].addClass("on"),
                     $('html').addClass(cn),
                     $u.lsSet(propName, cn)
                    )
                :   (base[map[cn]].removeClass("on"),
                     $('html').removeClass(cn)
                    )
        }

        //
        base.activateButton = function (map, propName, cn) {
            base.setupButtons(map, propName, false)
            base[propName] = cn
            base.setupButtons(map, propName, true)
        }

        //
        base.handleColAuto      = function (e) {
            base.activateButton(colCountMap, 'colCountClassName', 'jr-col-auto')
        }
        //
        base.handleCol1      = function (e) {
            base.activateButton(colCountMap, 'colCountClassName', 'jr-col-1')
        }
        //
        base.handleCol2      = function (e) {
            base.activateButton(colCountMap, 'colCountClassName', 'jr-col-2')
        }
        //
        base.handleAnimYes    = function (e) {
            base.activateButton(animateMap, 'animateClassName', 'animate')
        }
        //
        base.handleAnimNo    = function (e) {
            base.activateButton(animateMap, 'animateClassName', 'no-animate')
        }

        // Run initializer
        base.init();
    };

    $.jr.PanelTypo.defaultOptions = {
        fontSizeClassName: 'jr-fs-13',
        colCountClassName: 'jr-col-auto',
        animateClassName: 'no-animate'
    };

    $.fn.jr_PanelTypo = function(options){
        return this.each(function(){
            (new $.jr.PanelTypo(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the jr.PanelTypo if it has been attached to the object.
    $.fn.getjr_PanelTypo = function(){
        return this.data("jr.PanelTypo");
    };


})(jQuery);
