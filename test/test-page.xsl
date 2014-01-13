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
        <link rel="stylesheet" href="../lib/css/normalize.css" type="text/css" />
        <link rel="stylesheet" href="../lib/css/figpopup.css" type="text/css" />
        <link rel="stylesheet" href="../css/jr.ui.css" type="text/css" />
        <link rel="stylesheet" href="../css/jr.pagemanager.css" type="text/css" />
        <link rel="stylesheet" href="../css/jr.pageturnsensor.css" type="text/css" />
        <link rel="stylesheet" href="../css/jr.pageprogressbar.css" type="text/css" />
        <link rel="stylesheet" href="../css/jr.objectbox.css" type="text/css" />
        <link rel="stylesheet" href="../css/jr.panel.css" type="text/css" />
        <link rel="stylesheet" href="../css/jr.panel.typo.css" type="text/css" />
        <link rel="stylesheet" href="../css/jr.panel.cmap.css" type="text/css" />
        <link rel="stylesheet" href="../css/jr.panel.istrip.css" type="text/css" />
        <link rel="stylesheet" href="../css/jr.fip.css" type="text/css" />
        <link rel="stylesheet" href="../css/jr.content.css" type="text/css" />
      </head>

      <body>
        <div id="jr" data-jr-path="../">
          <div class="jr-unsupported">
            <table class="modal">
              <tr>
                <td><br/>Your browser does not support the NLM PubReader view.<br/>Go to <a
                    href="http://www.ncbi.nlm.nih.gov/pmc/about/pr-browsers/">this page</a> to see
                  a list of supporting browsers.</td>
              </tr>
            </table>
          </div>
          <div id="jr-ui" class="hidden">
            <nav id="jr-head">
              <div class="flexh tb">
                <div id="jr-tb1">
                  <a id="jr-pmc-sw" href="http://www.ncbi.nlm.nih.gov/pmc/" class="btn link wsprkl"
                    title="PMC Home Page">
                    <img src="../img/pmc.logo.svg" alt="pmc logo" />
                  </a>
                  <a id="jr-links-sw" class="btn wsprkl hidden " title="Links">
                    <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 100"
                      preserveaspectratio="none">
                      <path fill="#999"
                        d="M30,20l-20,0l0,60l80,0l0,-30l-5,5l0,20l-70,0l0,-50l10,0zM90,40l-30,-25l0,10c0,10 -70,5 -20,40c20,0 -40,-15, 20,-20 l0,10z"
                        > </path>
                    </svg>
                  </a>
                  <a id="jr-alt-sw" class="btn wsprkl hidden"
                    title="Alternative formats of the Article">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="250 150 300 300"
                      preserveAspectRatio="none">
                      <g transform="scale(0.80) skewY(25) skewX(-5) translate(240,-205)">
                        <path style="fill:none" stroke-width="20"
                          d="M417,334c0,17-10,31-22,31h-90c-12,0-22-14-22-31V209c0-17,10-31,22-31h90c12,0,22,14,22,31V334z"/>
                        <g stroke-width="7">
                          <line x1="302" y1="224" x2="396" y2="224"/>
                          <line x1="302" y1="248" x2="396" y2="248"/>
                          <line x1="302" y1="272" x2="396" y2="272"/>
                        </g>
                      </g>
                      <g transform="scale(0.80) skewY(-25) skewX(5) translate(20,260)">
                        <path style="fill:none" stroke-width="20"
                          d="M417,334c0,17-10,31-22,31h-90c-12,0-22-14-22-31V209c0-17,10-31,22-31h90c12,0,22,14,22,31V334z"/>
                        <g stroke-width="7">
                          <line x1="302" y1="224" x2="396" y2="224"/>
                          <line x1="302" y1="248" x2="396" y2="248"/>
                          <line x1="302" y1="272" x2="396" y2="272"/>
                          <line x1="302" y1="296" x2="396" y2="296"/>
                          <line x1="302" y1="319" x2="396" y2="319"/>
                        </g>
                      </g>
                      <g transform="translate(50,40)">
                        <path style="fill:#FFF;" stroke-width="20"
                          d="M417,334c0,17-10,31-22,31h-90c-12,0-22-14-22-31V209c0-17,10-31,22-31h90c12,0,22,14,22,31V334z"/>
                        <g transform="translate(302,205) scale(0.27) ">
                          <path style="fill:#F00" stroke="#F00" fill="#F91D0A"
                            d="M115,262c11-21,23-46,34-71l0,0l4-9C140,130,132,90,139,64l0,0c1-6,9-10,18-10l0,0l5,0h0c11-0,17,14,17,20l0,0c1,9-3,25-3,25l0,0c0-6,0-17-3-26l0,0c-4-10-9-16-13-17l0,0c-2,1-4,4-4,9l0,0c-1,7-1,17-1,22l0,0c0,17,3,41,10,65l0,0c1-3,2-7,3-10l0,0c1-5,10-40,10-40l0,0c0,0-2,46-5,61l0,0c-0,3-1,5-2,9l0,0c11,31,29,60,51,80l0,0c8,8,19,14,29,20l0,0c22-3,43-4,60-4l0,0c22,0,39,3,46,10l0,0c3,3,4,7,5,11l0,0c0,1-0,5-0,6l0,0c0-1,0-7-18-13l0,0c-14-4-41-4-74-1l0,0c37,18,74,27,85,22l0,0c2-1,6-6,6-6l0,0c0,0-2,9-3,11l0,0c-1,2-5,5-9,6l0,0c-18,4-66-6-107-30l0,0c-46,6-97,19-138,32l0,0C64,389,34,422,9,409l0,0l-9-4c-3-2-4-7-3-11l0,0c2-14,20-35,55-56l0,0c3-2,20-11,20-11l0,0c0,0-12,12-15,14l0,0c-28,23-49,52-48,63l0,0l0,0C33,401,69,353,115,262 M130,270c-7,14-15,27-22,40l0,0c38-16,79-26,119-33l0,0c-5-3-10-7-15-11l0,0c-21-18-38-41-50-65l0,0C154,220,145,242,130,270"
                          />
                        </g>
                      </g>
                    </svg>
                  </a>
                </div>
                <div class="jr-rhead f1">
                  <div class="t">
                    <xsl:copy-of select='$title'/>
                  </div>
                  <div class="j">
                    <xsl:copy-of select='$citation'/>
                  </div>
                </div>
                <div id="jr-tb2">
                  <a id="jr-help-sw" class="btn wsprkl hidden"
                    title="Settings, typography and Help with NLM PubReader">
                    <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 512 512"
                      preserveaspectratio="none">
                      <path d="M462,283.742v-55.485l-29.981-10.662c-11.431-4.065-20.628-12.794-25.274-24.001 c-0.002-0.004-0.004-0.009-0.006-0.013c-4.659-11.235-4.333-23.918,0.889-34.903l13.653-28.724l-39.234-39.234l-28.72,13.652 c-10.979,5.219-23.68,5.546-34.908,0.889c-0.005-0.002-0.01-0.003-0.014-0.005c-11.215-4.65-19.933-13.834-24-25.273L283.741,50 h-55.484l-10.662,29.981c-4.065,11.431-12.794,20.627-24.001,25.274c-0.005,0.002-0.009,0.004-0.014,0.005 c-11.235,4.66-23.919,4.333-34.905-0.889l-28.723-13.653l-39.234,39.234l13.653,28.721c5.219,10.979,5.545,23.681,0.889,34.91 c-0.002,0.004-0.004,0.009-0.006,0.013c-4.649,11.214-13.834,19.931-25.271,23.998L50,228.257v55.485l29.98,10.661 c11.431,4.065,20.627,12.794,25.274,24c0.002,0.005,0.003,0.01,0.005,0.014c4.66,11.236,4.334,23.921-0.888,34.906l-13.654,28.723 l39.234,39.234l28.721-13.652c10.979-5.219,23.681-5.546,34.909-0.889c0.005,0.002,0.01,0.004,0.014,0.006 c11.214,4.649,19.93,13.833,23.998,25.271L228.257,462h55.484l10.595-29.79c4.103-11.538,12.908-20.824,24.216-25.525 c0.005-0.002,0.009-0.004,0.014-0.006c11.127-4.628,23.694-4.311,34.578,0.863l28.902,13.738l39.234-39.234l-13.66-28.737 c-5.214-10.969-5.539-23.659-0.886-34.877c0.002-0.005,0.004-0.009,0.006-0.014c4.654-11.225,13.848-19.949,25.297-24.021 L462,283.742z M256,331.546c-41.724,0-75.548-33.823-75.548-75.546s33.824-75.547,75.548-75.547 c41.723,0,75.546,33.824,75.546,75.547S297.723,331.546,256,331.546z">
                      </path>
                    </svg>
                  </a>
                  <a id="jr-fip-sw" class="btn wsprkl " title="Find">
                    <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 550 600"
                      preserveaspectratio="none">
                      <path fill="none" stroke="#000" stroke-width="36" stroke-linecap="round"
                        style="fill:#FFF"
                        d="m320,350a153,153 0 1,0-2,2l170,170m-91-117 110,110-26,26-110-110"> </path>
                    </svg>
                  </a>
                  <a id="jr-cmap-sw" class="btn wsprkl hidden" title="Article Navigation">
                    <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 100 100"
                      preserveaspectratio="none">
                      <path
                        d="M20,20h10v8H20V20zM36,20h44v8H36V20zM20,37.33h10v8H20V37.33zM36,37.33h44v8H36V37.33zM20,54.66h10v8H20V54.66zM36,54.66h44v8H36V54.66zM20,72h10v8 H20V72zM36,72h44v8H36V72z"
                        > </path>
                    </svg>
                  </a>
                </div>
              </div>
            </nav>
            <nav id="jr-dash" class="noselect">
              <div id="jr-pi" class="hidden">
                <a id="jr-pi-prev" class="hidden" title="Previous page">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
                    preserveAspectRatio="none">
                    <path d="M75,30 c-80,60 -80,0 0,60 c-30,-60 -30,0 0,-60"/>
                    <text x="20" y="28" textLength="60" style="font-size:25px">Prev</text>
                  </svg>
                </a>
                <div class="pginfo"> Page <i class="jr-pg-pn">0</i> of <i class="jr-pg-lp">0</i>
                </div>
                <a id="jr-pi-next" class="hidden" title="Next page">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
                    preserveAspectRatio="none">
                    <path d="M25,30c80,60 80,0 0,60 c30,-60 30,0 0,-60"/>
                    <text x="20" y="28" textLength="60" style="font-size:25px">Next</text>
                  </svg>
                </a>
              </div>
              <div id="jr-is-tb">
                <a id="jr-is-sw" class="btn wsprkl hidden"
                  title="Switch between Figures/Tables strip and Progress bar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
                    preserveAspectRatio="none">
                    <rect x="10" y="40" width="20" height="20"/>
                    <rect x="40" y="40" width="20" height="20"/>
                    <rect x="70" y="40" width="20" height="20"/>
                  </svg>
                </a>
              </div>
              <nav id="jr-istrip" class="istrip hidden">
                <a id="jr-is-prev" href="#" class="hidden" title="Previous">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
                    preserveAspectRatio="none">
                    <path d="M80,40 60,65 80,90 70,90 50,65 70,40z M50,40 30,65 50,90 40,90 20,65 40,40z"/>
                    <text x="35" y="25" textLength="60" style="font-size:25px">Prev</text>
                  </svg>
                </a>
                <a id="jr-is-next" href="#" class="hidden" title="Next">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
                    preserveAspectRatio="none">
                    <path d="M20,40 40,65 20,90 30,90 50,65 30,40z M50,40 70,65 50,90 60,90 80,65 60,40z"/>
                    <text x="15" y="25" textLength="60" style="font-size:25px">Next</text>
                  </svg>
                </a>
              </nav>
              <nav id="jr-progress"> </nav>
            </nav>
            <aside id="jr-links-p" class="hidden flexv">
              <div class="tb sk-htbar flexh">
                <div>
                  <a class="jr-p-close btn wsprkl">Done</a>
                </div>
                <div class="title-text f1"> Links </div>
              </div>
              <div class="cnt lol f1">
                <xsl:copy-of select="$links"/>
              </div>
            </aside>
            <aside id="jr-alt-p" class="hidden flexv">
              <div class="tb sk-htbar flexh">
                <div>
                  <a class="jr-p-close btn wsprkl">Done</a>
                </div>
                <div class="title-text f1"> Alternative formats </div>
              </div>
              <div class="cnt lol f1">
                <xsl:copy-of select="$alt-formats"/>
              </div>
            </aside>
            <aside id="jr-cmap-p" class="hidden flexv">
              <div class="tb sk-htbar flexh">
                <div>
                  <a class="jr-p-close btn wsprkl">Done</a>
                </div>
                <div class="title-text f1">Article navigation </div>
              </div>
              <div class="cnt lol f1"> </div>
            </aside>
            <aside id="jr-help-p" class="hidden flexv">
              <div class="tb sk-htbar flexh">
                <div>
                  <a class="jr-p-close btn wsprkl">Done</a>
                </div>
                <div class="title-text f1"> Settings &amp; Help </div>
              </div>
              <div class="cnt f1">
                <div id="jr-typo-p" class="typo">
                  <div>
                    <a class="sf btn wsprkl">A-</a>
                    <a class="lf btn wsprkl">A+</a>
                  </div>
                  <div>
                    <a class="bcol-auto btn wsprkl">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"
                        preserveAspectRatio="none">
                        <text x="10" y="70"
                          style="font-size:60px;font-family: Trebuchet MS, ArialMT, Arial, sans-serif"
                          textLength="180">AUTO</text>
                      </svg>
                    </a>
                    <a class="bcol-1 btn wsprkl">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
                        preserveAspectRatio="none">
                        <path d="M15,25 85,25zM15,40 85,40zM15,55 85,55zM15,70 85,70z"/>
                      </svg>
                    </a>
                    <a class="bcol-2 btn wsprkl">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
                        preserveAspectRatio="none">
                        <path d="M5,25 45,25z M55,25 95,25zM5,40 45,40z M55,40 95,40zM5,55 45,55z M55,55 95,55zM5,70 45,70z M55,70 95,70z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                <div class="lol">
                  <a id="jr-helpobj-sw" data-path="../" data-href="../img/help.xml" href="">Help with
                    PubReader</a><a href="http://www.ncbi.nlm.nih.gov/pmc/articles/PMC14900/?report=classic" class="">Switch to
                      classic view</a><a
                        href="mailto:pubmedcentral@ncbi.nlm.nih.gov?subject=PubReader%20feedback">Feedback /
                        suggestions</a><a id="jr-about-sw" data-path="../" data-href="../img/about.xml"
                          href="">About PubReader</a>
                </div>
              </div>
            </aside>
            <aside id="jr-objectbox" class="thidden hidden">
              <div class="jr-objectbox-close wsprkl"> &#10008; </div>
              <div class="jr-objectbox-inner cnt">
                <div class="jr-objectbox-drawer"> </div>
              </div>
            </aside>
            <nav id="jr-pm-left" class="hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 1000"
                preserveAspectRatio="none">
                <text x="850" y="-20" transform="rotate(90)" textLength="150" font-size="23"
                  >Previous Page</text>
              </svg>
            </nav>
            <nav id="jr-pm-right" class="hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 1000"
                preserveAspectRatio="none">
                <text x="850" y="-70" transform="rotate(90)" textLength="150" font-size="23">Next
                  Page</text>
              </svg>
            </nav>
            <nav id="jr-fip" class="hidden">
              <nav id="jr-fip-term-p"><input type="search" placeholder="search within article"
                id="jr-fip-term" autocorrect="off" autocomplete="off" /><button id="jr-fip-mg"
                  class="wsprkl" title="Find">
                  <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 550 600"
                    preserveaspectratio="none">
                    <path fill="none" stroke="#000" stroke-width="36" stroke-linecap="round"
                      style="fill:#FFF"
                      d="m320,350a153,153 0 1,0-2,2l170,170m-91-117 110,110-26,26-110-110"></path>
                  </svg></button><button id="jr-fip-done" class="wsprkl" title="Dismiss find"
                    >&#10008;</button></nav>
              <nav id="jr-fip-info-p"><button id="jr-fip-prev" class="wsprkl"
                title="Jump to previuos match">&#9668;</button><span id="jr-fip-matches">no matches
                  yet</span><button id="jr-fip-next" class="wsprkl" title="Jump to next match"
                    >&#9658;</button></nav>
            </nav>
          </div>
          <div id="jr-content">
            <xsl:copy-of select="$content"/>
          </div>
          <div id="jr-scripts">
            <script src="../lib/js/jquery-1.7.2.js" type="text/javascript"> </script>
            <script src="../lib/js/modernizr.jr.js" type="text/javascript"> </script>
            <script src="../lib/js/jquery.throttle.js" type="text/javascript"> </script>
            <script src="../lib/js/jquery.mousewheel.js?x=1" type="text/javascript"></script>
            <script src="../lib/js/rangeinput.js" type="text/javascript"> </script>
            <script src="../lib/js/jquery.touchSwipe.js" type="text/javascript"> </script>
            <script src="../lib/js/jquery.hoverIntent.js" type="text/javascript"> </script>
            <script src="../lib/js/figpopup.js" type="text/javascript"> </script>
            <script src="../js/jr.utils.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.ft.js" type="text/javascript"></script>
            <script src="../js/jquery.jr.pagemanager.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.paginationstatus.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.pageturnsensor.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.pageprogressbar.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.links.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.historykeeper.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.objectbox.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.switcher.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.panel.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.panel.typo.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.panel.cmap.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.panel.istrip.js" type="text/javascript"> </script>
            <script src="../js/jquery.jr.fip.js" type="text/javascript"></script>
            <script src="../js/jats.reader.js" type="text/javascript"> </script>
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
