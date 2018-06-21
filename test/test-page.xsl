<?xml version="1.0" encoding="UTF-8"?>
<!--
  This work is in the public domain and may be reproduced, published or
  otherwise used without the permission of the National Library of Medicine (NLM).

  We request only that the NLM is cited as the source of the work.

  Although all reasonable efforts have been taken to ensure the accuracy and
  reliability of the software and data, the NLM and the U.S. Government  do
  not and cannot warrant the performance or results that may be obtained  by
  using this software or data. The NLM and the U.S. Government disclaim all
  warranties, express or implied, including warranties of performance,
  merchantability or fitness for any particular purpose.
-->

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="http://www.w3.org/1999/xhtml"
  xmlns:t="http://www.ncbi.nlm.nih.gov/ns/test" exclude-result-prefixes="xs t" version="2.0">

  <xsl:output byte-order-mark="yes" method="xhtml" doctype-system="about:legacy-compat"/>

  <xsl:variable name="title" select="//t:title/node()"/>
  <xsl:variable name="citation" select="//t:citation/node()"/>
  <xsl:variable name="links" select="//t:links/node()"/>
  <xsl:variable name="alt-formats" select="//t:alt-formats/node()"/>
  <xsl:variable name="content" select="//t:content/node()"/>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" class="no-js no-jr">
      <head>
        <script type="text/javascript" src="../js/jr.boots.js"> </script>

        <title>
          <xsl:copy-of select="$title"/>
        </title>
        <meta charset="utf-8"/>
        <meta name="apple-mobile-web-app-capable" content="no"/>
        <meta name="viewport"
          content="initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"/>
        <link
          href="http://fonts.googleapis.com/css?family=Archivo+Narrow:400,700,400italic,700italic&amp;subset=latin"
          rel="stylesheet" type="text/css"/>
        <link rel="stylesheet" href="../lib/css/normalize.css"/>
        <link rel="stylesheet" href="../lib/css/figpopup.css"/>
        <link rel="stylesheet" href="../css/jr.ui.css"/>
        <link rel="stylesheet" href="../css/jr.pagemanager.css"/>
        <link rel="stylesheet" href="../css/jr.pageturnsensor.css"/>
        <link rel="stylesheet" href="../css/jr.pageprogressbar.css"/>
        <link rel="stylesheet" href="../css/jr.objectbox.css"/>
        <link rel="stylesheet" href="../css/jr.panel.css"/>
	<link rel="stylesheet" href="../css/jr.panel.typo.css"/>
        <link rel="stylesheet" href="../css/jr.panel.cmap.css"/>
        <link rel="stylesheet" href="../css/jr.panel.istrip.css"/>
        <link rel="stylesheet" href="../css/jr.fip.css"/>
        <link rel="stylesheet" href="../css/jr.small.screen.css"/>
        <link rel="stylesheet" href="../css/jr.content.css"/>
        <link rel="stylesheet" href="../lib/css/citationexporter.css"/>
      </head>

      <body>
        <div id="jr" data-jr-path="../">
          <div class="jr-unsupported">
            <table class="modal">
              <tr>
                <td><span class="attn inline-block"/><br/>Your browser does not support the NLM
                  PubReader view.<br/>Go to <a
                    href="https://www.ncbi.nlm.nih.gov/pmc/about/pr-browsers/">this page</a> to see a
                  list of supporting browsers.</td>
              </tr>
            </table>
          </div>
          <div id="jr-ui" class="hidden" >
            <nav id="jr-head" >
              <div class="flexh tb" >
                <div id="jr-tb1" >
                  <a id="jr-links-sw" class="btn wsprkl hidden" title="Links" >
                    <img src="../img/pmc.logo.svg" alt="pmc logo" class="svg" />
                  </a >
                  <a id="jr-alt-sw" class="btn wsprkl hidden" title="Alternative formats of the Article" >Alt</a >
                  <a id="jr-pdf-sw" href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13901/pdf/BCR-3-1-061.pdf" class="btn wsprkl" >PDF</a >
                </div >
                <div class="jr-rhead f1" >
                  <div class="t" >BRCA1 and BRCA2 protein expressions in an ovotestis of a 46, XX true hermaphrodite</div >
                  <div class="j" >
                    Breast Cancer Res. 2001; 3(1): 61&#x02013;65.
                  </div >
                </div >
                <div id="jr-tb2" >
                  <a id="jr-help-sw" class="btn wsprkl hidden" title="Settings, typography and Help with NLM PubReader" >
                    <img src="../img/pmc.gear.svg" alt="settings &amp; help" class="svg" />
                  </a >
                  <a id="jr-fip-sw" class="btn wsprkl hidden" title="Find" >
                    <img src="../img/pmc.mg.svg" alt="Search on this page" class="svg" />
                  </a >
                  <a id="jr-cmap-sw" class="btn wsprkl hidden" title="Article Navigation" >
                    <img src="../img/pmc.cmap.svg" alt="Table of Content" class="svg" />
                  </a >
                </div >
              </div >
            </nav >
            <nav id="jr-dash" class="noselect" >
              <div id="jr-pi" class="hidden" >
                <a id="jr-pi-prev" class="hidden" title="Previous page" >
                  <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 100" preserveaspectratio="none" >
                    <path d="M75,30 c-80,60 -80,0 0,60 c-30,-60 -30,0 0,-60" />
                    <text x="20" y="28" textlength="60" style="font-size:25px" >Prev</text >
                  </svg >
                </a >
                <div class="pginfo" >Page <i class="jr-pg-pn" >0</i > of <i class="jr-pg-lp" >0</i ></div >
                <a id="jr-pi-next" class="hidden" title="Next page" >
                  <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 100" preserveaspectratio="none" >
                    <path d="M25,30c80,60 80,0 0,60 c30,-60 30,0 0,-60" />
                    <text x="20" y="28" textlength="60" style="font-size:25px" >Next</text >
                  </svg >
                </a >
              </div >
              <div id="jr-is-tb" >
                <a id="jr-is-sw" class="btn wsprkl hidden" title="Switch between Figures/Tables strip and Progress bar" >
                  <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 100" preserveaspectratio="none" >
                    <rect x="10" y="40" width="20" height="20" />
                    <rect x="40" y="40" width="20" height="20" />
                    <rect x="70" y="40" width="20" height="20" />
                  </svg >
                </a >
              </div >
              <nav id="jr-istrip" class="istrip hidden" >
                <a id="jr-is-prev" href="#" class="hidden" title="Previous" >
                  <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 100" preserveaspectratio="none" >
                    <path d="M80,40 60,65 80,90 70,90 50,65 70,40z M50,40 30,65 50,90 40,90 20,65 40,40z" />
                    <text x="35" y="25" textlength="60" style="font-size:25px" >Prev</text >
                  </svg >
                </a >
                <a id="jr-is-next" href="#" class="hidden" title="Next" >
                  <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 100" preserveaspectratio="none" >
                    <path d="M20,40 40,65 20,90 30,90 50,65 30,40z M50,40 70,65 50,90 60,90 80,65 60,40z" />
                    <text x="15" y="25" textlength="60" style="font-size:25px" >Next</text >
                  </svg >
                </a >
              </nav >
              <nav id="jr-progress" /></nav >
            <aside id="jr-links-p" class="hidden flexv" >
              <div class="tb sk-htbar flexh" >
                <div >
                  <a class="jr-p-close btn wsprkl" >Done</a >
                </div >
                <div class="title-text f1" >Links</div >
              </div >
              <div class="cnt lol f1" >
                <xsl:copy-of select="$links"/>
                <a class="btn share" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.ncbi.nlm.nih.gov%2Fpmc%2Farticles%2FPMC13901%2F" >
                  <img src="../img/pmc.fb.svg" alt="Facebook's f logo" class="svg" /> Share on Facebook
                </a >
                <a class="btn share" target="_blank" href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.ncbi.nlm.nih.gov%2Fpmc%2FFarticles%2FPMC13901%2F&amp;text=BRCA1%20and%20BRCA2%20protein%20expressions%20in%20an%20ovotestis%20of%20a%2046%2C%20XX%20true%20hermaphrodite" >
                  <img src="../img/pmc.twitter.svg" alt="Twitter t logo" class="svg" /> Share on Twitter
                </a >
                <a class="btn share" target="_blank" href="https://plus.google.com/share?url=https%3A%2F%2Fwww.ncbi.nlm.nih.gov%2Fpmc%2Farticles%2FPMC13901%2F" >
                  <img src="../img/pmc.gplus.svg" alt="Google Plus logo" class="svg" /> Share on Google+
                </a >
              </div >
            </aside >
            <aside id="jr-alt-p" class="hidden flexv" >
              <div class="tb sk-htbar flexh" >
                <div >
                  <a class="jr-p-close btn wsprkl" >Done</a >
                </div >
                <div class="title-text f1" >Alternative formats</div >
              </div >
              <div class="cnt lol f1" >
                <xsl:copy-of select="$alt-formats"/>
                <a class="citationexporter ctxp" href="#" data-citationid="PMC13901" >Citation</a >
              </div >
            </aside >
            <aside id="jr-cmap-p" class="hidden flexv" >
              <div class="tb sk-htbar flexh" >
                <div >
                  <a class="jr-p-close btn wsprkl" >Done</a >
                </div >
                <div class="title-text f1" >Article navigation</div >
              </div >
              <div class="cnt lol f1" />
            </aside >
            <aside id="jr-help-p" class="hidden flexv" >
              <div class="tb sk-htbar flexh" >
                <div >
                  <a class="jr-p-close btn wsprkl" >Done</a >
                </div >
                <div class="title-text f1" >Settings &amp; Help</div >
              </div >
              <div class="cnt f1" >
                <div id="jr-typo-p" class="typo" >
                  <div >
                    <a class="sf btn wsprkl" >A-</a >
                    <a class="lf btn wsprkl" >A+</a >
                  </div >
                  <div >
                    <a class="bcol-auto btn wsprkl" >
                      <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 200 100" preserveaspectratio="none" >
                        <text x="10" y="70" style="font-size:60px;font-family: Trebuchet MS, ArialMT, Arial, sans-serif" textlength="180" >AUTO</text >
                      </svg >
                    </a >
                    <a class="bcol-1 btn wsprkl" >
                      <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 100" preserveaspectratio="none" >
                        <path d="M15,25 85,25zM15,40 85,40zM15,55 85,55zM15,70 85,70z" />
                      </svg >
                    </a >
                    <a class="bcol-2 btn wsprkl" >
                      <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 100" preserveaspectratio="none" >
                        <path d="M5,25 45,25z M55,25 95,25zM5,40 45,40z M55,40 95,40zM5,55 45,55z M55,55 95,55zM5,70 45,70z M55,70 95,70z" />
                      </svg >
                    </a >
                  </div >
                </div >
                <div class="lol" >
                  <a id="jr-helpobj-sw" data-path="../" data-href="../img/help.xml" href="" >Help with PubReader</a >
                  <a href="mailto:your_name@your_domain?subject=PubReader%20feedback%20/%20PMC13901%20/%20sid:5D1947B4B2C0C061_0014SID%20/%20phid:5D1947B4B2B2250100000000000E000C.2" >Feedback / suggestions</a >
                  <a id="jr-about-sw" data-path="../" data-href="../img/about.xml" href="" >About PubReader</a >
                </div >
              </div >
            </aside >
            <aside id="jr-objectbox" class="thidden hidden" >
              <div class="jr-objectbox-close wsprkl" >&#x02718;</div >
              <div class="jr-objectbox-inner cnt" >
                <div class="jr-objectbox-drawer" /></div >
            </aside >
            <nav id="jr-pm-left" class="hidden" >
              <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 1000" preserveaspectratio="none" >
                <text x="850" y="-20" transform="rotate(90)" textlength="150" font-size="23" >Previous Page</text >
              </svg >
            </nav >
            <nav id="jr-pm-right" class="hidden" >
              <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 1000" preserveaspectratio="none" >
                <text x="850" y="-70" transform="rotate(90)" textlength="150" font-size="23" >Next Page</text >
              </svg >
            </nav >
            <nav id="jr-fip" class="hidden" >
              <nav id="jr-fip-term-p" >
                <input type="search" placeholder="search this page" id="jr-fip-term" autocorrect="off" autocomplete="off" />
                <a id="jr-fip-mg" class="wsprkl btn" title="Find" >
                  <img src="../img/pmc.mg.svg" alt="Find" class="svg" />
                </a >
                <a id="jr-fip-done" class="wsprkl btn" title="Dismiss find" >&#x02718;</a >
              </nav >
              <nav id="jr-fip-info-p" >
                <a id="jr-fip-prev" class="wsprkl btn" title="Jump to previuos match" >&#x025c0;</a >
                <button id="jr-fip-matches" >no matches yet</button >
                <a id="jr-fip-next" class="wsprkl btn" title="Jump to next match" >&#x025b6;</a >
              </nav >
            </nav >
          </div >
          <div id="jr-epub-interstitial" class="hidden" >
            <h2 role="dialog" >Making articles easier to read in PMC</h2 >
            <div class="contentpane" >
              <p > We are experimenting with display styles that make it easier to read articles in PMC. The ePub format uses eBook readers, which have several "ease of reading" features already built in. </p >
              <p > The ePub format is best viewed in the iBooks reader. You may notice problems with the display of certain parts of an article in other eReaders. </p >
              <p > Generating an ePub file may take a long time, please be patient. </p >
            </div >
            <div class="buttonpane lol" >
              <a id="cancelEpub" style="float: right" >Cancel</a >
              <a id="downloadEpub" style="float: left" >Download article</a >
            </div >
          </div >
          <a id="jr-welcome-trigger" class="hidden" >t</a >
          <div id="jr-welcome" class="hidden" >
            <h2 role="dialog" >Welcome to PubReader!</h2 >
            <div class="contentpane" >
              <p > Click on <a class="btn" >
                  <img src="../img/pmc.gear.svg" alt="settings &amp; help" class="svg" />
                </a > above to: 
              </p >
              <ul >
                <li >Get help with PubReader, or </li >
                <li >Switch to the classic article view.</li >
              </ul >
            </div >
            <div class="buttonpane lol" >
              <a id="okayWelcome" class="btn centerbutton" >Okay</a >
            </div >
          </div >

          <div id="jr-content">
            <xsl:copy-of select="$content"/>
          </div>

          <div id="jr-scripts">
              <script src="../lib/js/hand-1.3.8.js"><xsl:text> </xsl:text></script>
              <script src="../lib/js/modernizr.jr.js"><xsl:text> </xsl:text></script>
              <script src="../lib/js/jquery-2.2.3.js"><xsl:text> </xsl:text></script>
              <script src="../lib/js/jquery-migrate-1.4.1.js"><xsl:text> </xsl:text></script>
              <script src="../lib/js/jquery.throttle.js"><xsl:text> </xsl:text></script>
              <script src="../lib/js/jquery.mousewheel.js"><xsl:text> </xsl:text></script> 
              <script src="../lib/js/rangeinput.js"><xsl:text> </xsl:text></script>
              <script src="../lib/js/jquery.touchSwipe.js"><xsl:text> </xsl:text></script> 
              <script src="../lib/js/jquery.hoverIntent.js"><xsl:text> </xsl:text></script>
              <script src="../lib/js/figpopup.js"><xsl:text> </xsl:text></script>
              <script src="../js/jr.utils.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.ft.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.pagemanager.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.paginationstatus.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.pageturnsensor.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.pageprogressbar.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.links.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.historykeeper.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.objectbox.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.switcher.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.panel.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.panel.typo.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.panel.cmap.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.panel.istrip.js"><xsl:text> </xsl:text></script>
              <script src="../js/jquery.jr.fip.js"><xsl:text> </xsl:text></script>
              <script src="../lib/js/jquery.citationexporter.js"></script>
              <script src="../js/jats.reader.js"><xsl:text> </xsl:text></script>
              <script type="text/x-mathjax-config">  
              MathJax.Hub.Config({ 
                SVG: { 
                  scale: 90, 
                  linebreaks: {
                    automatic: true, 
                    width: "container" 
                  } 
                }, 
                showProcessingMessages: false, 
                messageStyle: "none"
              }); 
              </script>
              <script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG"> </script>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

</xsl:stylesheet>
