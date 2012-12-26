# This script generates test HTML pages for PubReader.  Depends on Saxon 9.
# $Id: make-test-pages.sh 13234 2012-11-19 15:26:39Z maloneyc $

# This work is in the public domain and may be reproduced, published or
# otherwise used without the permission of the National Library of Medicine (NLM).
#
# We request only that the NLM is cited as the source of the work.
#
# Although all reasonable efforts have been taken to ensure the accuracy and
# reliability of the software and data, the NLM and the U.S. Government  do
# not and cannot warrant the performance or results that may be obtained  by
# using this software or data. The NLM and the U.S. Government disclaim all
# warranties, express or implied, including warranties of performance,
# merchantability or fitness for any particular purpose.


for testfile in `ls test-*.xml`
do
  filename=${testfile%.*}
  echo "Converting $testfile to $filename.html"
  java -jar saxon9he.jar -xsl:test-page.xsl -s:$testfile > $filename.html
done
