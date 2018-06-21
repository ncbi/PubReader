/* $Id: jr.boots.js 13234 2012-11-19 15:26:39Z maloneyc $
    Module:

        JATS Reader's Bootstrap module

    Author:

        Andrey Kolotev

    Synopsis:
        This modules handles the class names on <html> element at the very begining
        of the loading process of the Jats Reader. It picks font size and other
        typography properties to prevent reflow of the content due to the
        class name assignment to the above element at the time of loading
        all other script, after the whole html and css code was loaded
        and basically already rendered.

    Dependecies:
        Should be none.
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

/* fighting-the-font-face-fout - credit to Paul Irish http://paulirish.com/2009/fighting-the-font-face-fout/ */
(function ()  {
    {
        (function(){
            var d = document, e = d.documentElement, s = d.createElement('style');
            //if (e.style.MozTransform === ''){ // gecko 1.9.1 inference
                s.textContent = 'body{visibility:hidden}';
                var r = document.getElementsByTagName('script')[0];
                r.parentNode.insertBefore(s, r);
                function f(){ s.parentNode && s.parentNode.removeChild(s); }
                addEventListener('load',f,false);
                setTimeout(f,3000);
            //}
        })();
    }


    {
        var d = document, e = d.documentElement,

        // leaner copy  of addClass from jQuery
        addClass = function ( elm, value ) {
            var classNames, setClass, c, cl;

            if ( value && typeof value === "string" ) {
                classNames = value.split( /\s+/ );

                if ( elm.nodeType === 1 ) {
                    if ( !elm.className && classNames.length === 1 ) {
                        elm.className = value;

                    } else {
                        setClass = " " + elm.className + " ";

                        for ( c = 0, cl = classNames.length; c < cl; c++ ) {
                            if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
                                setClass += classNames[ c ] + " ";
                            }
                        }
                        setClass.trim ? elm.className = setClass.trim() : 0
                    }
                }
            }
        },
        // leaner copy  of removeClass from jQuery
        removeClass = function (elm, value ) {
            var classNames, i, l, className = "", c, cl;

            if ( (value && typeof value === "string")) {
                classNames = value.split( /\s+/ );

                if ( elm.nodeType === 1 && elm.className ) {
                    className = (" " + elm.className + " ").replace( /\s+/, " " );
                    for ( c = 0, cl = classNames.length; c < cl; c++ ) {
                        className = className.replace(" " + classNames[ c ] + " ", " ");
                    }
                }

                elm.className = className.trim ? className.trim() : className;
            }
        }

        // =============================================================
        {
            var ls = window.localStorage
            if (!!ls) {
                var htmlAttrClassVals = ""

                //restore font size from local storage config
                try {
                    var fontSizeClassName = ls.getItem('fontSizeClassName'),
                        colCountClassName = ls.getItem('colCountClassName')

                    if (fontSizeClassName != null)
                        htmlAttrClassVals += ' ' + fontSizeClassName

                    if (colCountClassName != null)
                        htmlAttrClassVals += ' ' + colCountClassName

                    htmlAttrClassVals.replace(/["']/g, '')
                } catch (e) { console.error(e.message) }

                if (htmlAttrClassVals.length > 0)
                    addClass(e, htmlAttrClassVals)
            }
        }

        // handle classes on <html>
        {
            var classToBeRemoved = "no-js", classToBeAdded = "js", s = e.style
            if (s.webkitColumnCount === "" || s.MozColumnCount === "" || s.columnCount === "") {
                classToBeRemoved        += " no-jr"
                classToBeAdded  += " jr"
            }
            removeClass(e, classToBeRemoved)
            addClass(e, classToBeAdded)
        }
    }
}) ()