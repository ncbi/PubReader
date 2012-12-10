#PubReader dependencies

This is a summary of the dependencies for this library.

##jQuery 1.7.2

Files:
* lib/js/jquery-1.7.2.min.js
* lib/js/jquery-1.7.2.js

##normalize.css

Nicolas Gallagher, http://github.com/necolas/normalize.css,
from [this
zipball](https://github.com/necolas/normalize.css/zipball/03575299fc8cba752a51fece7c35343085d6ed09)
(latest commit to master as of 6/28/2012).

Files:
* lib/css/normalize.css

##figpopup

Originally from PMC at
[corehtml/pmc/css/figpopup.css](http://www.ncbi.nlm.nih.gov/corehtml/pmc/css/figpopup.css)
and
[corehtml/pmc/css/figpopup.js](http://www.ncbi.nlm.nih.gov/corehtml/pmc/js/figpopup.js),
but has evolved.  See [this thread](http://www.ncbi.nlm.nih.gov/mailman/pipermail/jats-reader-dev/2012-September/000008.html)
from jats-reader-dev list.
The PubReader changes may eventually be merged back into the PMC trunk.

Files:
* lib/css/figpopup.css
* lib/js/figpopup.js

##rangeinput.js

From GitHub [Klortho/jquerytools](https://github.com/Klortho/jquerytools),
forked from [Patrick64/jquerytools](https://github.com/Patrick64/jquerytools),
which was forked from
[jquerytools/jquerytools](https://github.com/jquerytools/jquerytools).

Files:
* lib/js/rangeinput.js

##Modernizr
A custom version of modernizr, built from http://modernizr.com/download/.
See the file's header to see exactly what is included.

Files:
* lib/js/modernizr.jr.min.js
* lib/js/modernizr.jr.js

##touchSwipe.js
From GitHub [Klortho/TouchSwipe-Jquery-Plugin](https://github.com/Klortho/TouchSwipe-Jquery-Plugin),
which is a fork of
[mattbryson/TouchSwipe-Jquery-Plugin](https://github.com/mattbryson/TouchSwipe-Jquery-Plugin).

The change was to allow multiple event handlers to be bound to swipe events.

Files:
* lib/js/jquery.touchSwipe.js

## hoverIntent.js
Version r5, 2007, from http://cherne.net/brian/resources/jquery.hoverIntent.html.

Files:
* lib/js/jquery.hoverIntent.js

##jQuery throttle / debounce

v1.1, 3/7/2010.  From http://benalman.com/projects/jquery-throttle-debounce-plugin/.

Files:
* lib/js/jquery.throttle.js

##MathJax

This is an external dependency, meaning the library is not included in this GitHub
repository.

Currently, the test files load MathJax version 2.1, from their CDN.  See
test/test-page.xsl.


