This directory contains some test files for PubReader.
The HTML files in this directory are created from XML files with the same
basename, that are in a a simplified format.  They are pre-built and included
in the repository.  So to try out PubReader on your own servers, you should be able
to just point your browser to any of those HTML files.

If you want to change the source, or create your own, then you'll have to re-generate
the HTML from the XML.  There is a very simple script here to do that.
By default, it uses the XSLT transformer that comes with Saxon 9 Home Edition,
which you can download from
[here](http://sourceforge.net/projects/saxon/files/Saxon-HE/9.4/SaxonHE9-4-0-6J.zip/download).
(See the [Saxon site](http://www.saxonica.com/welcome/welcome.xml) if that link
doesn't work for you, and download an evaluation copy.)

After downloading the zip file, unzip it here in the test directory, and you
should see the file saxon9he.jar.

Then, make the XHTML versions of the PubReader test files with the bash script:

    ./make-test-pages.sh

If you are on a Windows platform, you'll have to make your own .bat file,
adapted from the above, or just run the transformation manually, like this:

    java -jar saxon9he.jar -xsl:test-page.xsl -s:test-article1.xml > test-article1.html

--------------------------------------------------------------------------------

This work is in the public domain and may be reproduced, published or
otherwise used without the permission of the National Library of Medicine (NLM).

We request only that the NLM is cited as the source of the work.

Although all reasonable efforts have been taken to ensure the accuracy and
reliability of the software and data, the NLM and the U.S. Government  do
not and cannot warrant the performance or results that may be obtained  by
using this software or data. The NLM and the U.S. Government disclaim all
warranties, express or implied, including warranties of performance,
merchantability or fitness for any particular purpose.

--------------------------------------------------------------------------------
