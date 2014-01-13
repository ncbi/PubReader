#!/bin/sh

# This script generates test HTML pages for PubReader.  Depends on Saxon 9.
# $Id: make-test-pages.sh 14143 2013-01-25 22:00:33Z maloneyc $

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

if [ "$SAXON9_HOME" = "" ] ; then
  if [ -f saxon9he.jar ] ; then
    SAXON9=saxon9he.jar
  else
    echo Looks like you need to download Saxon.  Please see the README.md file.
    exit
  fi
else
  if [ -f $SAXON9_HOME/saxon9he.jar ] ; then
    SAXON9=$SAXON9_HOME/saxon9he.jar
  else
    if [ -f $SAXON9_HOME/saxon9.jar ] ; then
      SAXON9=$SAXON9_HOME/saxon9.jar
    else
      echo Can\'t find Saxon jar file.  Please see the README.md file.
      exit
    fi
  fi
fi

for testfile in `ls test-*.xml`
do
  filename=${testfile%.*}
  echo "Converting $testfile to $filename.html"
  java -jar $SAXON9 -xsl:test-page.xsl -s:$testfile > $filename.html
done
