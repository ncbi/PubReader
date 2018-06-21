// $Id: figpopup.js 12950 2012-10-31 20:28:09Z kolotev $
// Author: Andrei Kolotev (kolotev@ncbi)
//

// ****************************************************************************
//  implementation of figure's popup using jQuery and jQuery.fn.hoverIntent lib
//  it set appropriate handlers for all "a" elements with "figpopup" class name.
// ****************************************************************************

if (typeof jQuery !== "undefined" &&
    typeof jQuery.fn !== "undefined" &&
    typeof jQuery.fn.hoverIntent !== "undefined")
{
(function($j) {
    var JQ_MOUSEENTER_EVT 	= "mouseenter"
    var JQ_MOUSELEAVE_EVT 	= "mouseleave"
    
    var SENSOR_EVT_TS     	= "evtTS.sensor" // TS - TimeStamp

    var SENSOR_MIN_EVT  	= "mouse.in.sensor"
    var SENSOR_MOUT_EVT 	= "mouse.out.sensor"
    
    var CANVAS_MIN_EVT  	= "mouse.in.canvas"
    var CANVAS_MOUT_EVT 	= "mouse.out.canvas"
    var CANVAS_SHOW_EVT   	= "show.canvas"
    var CANVAS_HIDE_EVT   	= "hide.canvas"
    //var CANVAS_MIN_EVT   	= "mouse.in.canvas"
    //var CANVAS_MOUT_EVT   	= "mouse.out.canvas"
    var CANVAS_SHOWN_EVT   	= "shown.canvas"
    var CANVAS_GONE_EVT   	= "gone.canvas"
    
    var LEFT 		  	= "left"
    var RIGHT 		  	= "right"
    var TOP 		  	= "top"
    var BOTTOM 		  	= "bottom"
    var MAX_ITER          	= 15
    var STAT_IF_LONGER    	= 500 // msec
    var JSEVENT_NAME      	= "hover"
    var MIN_LEGEND_WIDTH  	= 270 // px
    var DELAYIN           	= 200 // msec
    var DELAYOUT          	= 250 // msec
    var MIN_IMG_WIDTH           = 100 // px    
    
    // ==========================  popupSensor ================================
    // <a 	@class		="figpopup" // or may be callout
    //		@co-content	="text of the callout" // url like escaped content to hide html there
    //    	@co-class	="co-fancy" // is set to inner box
    //		@co-style	="css stlyes" // is set to inner box
    //		@co-rid		="CO1" // use the cloned box with @id="CO1"
    //		@co-legend      = "text of the legend for images the source of image, usually citaion"
    //                                     ^^^ url like escaped content to hide html there
    //
    //          @canvas-rid     ="..." added dynamically when popup canvas generated
    //
    //	also supporting figure popups tagged within parent <a> as next
    //         <img @src-large="" @src=""/>
    //         <img @hires="" @src=""/>
    {
	$j.fn.popupSensor = function  (opts) {
	    /*__logContext({
		n: 'popupSensor',
		t: this,
		o: opts
	    })*/
    
	    var cfgDefaults = {
		statIfLonger 	: STAT_IF_LONGER,
		delayIn 	: DELAYIN,
		delayOut 	: DELAYOUT,
		touchable	: false
	    }
	    
	    var cfg = $j.fn.extend({}, cfgDefaults)
	    $j.fn.extend(cfg, opts)
	    
	    return this.each(function(i){  
		    var elm = $j(this)
		    elm.bind(SENSOR_MIN_EVT, 	__sensorMouseIn)  // hoverIntent 	-> SENSOR
		    elm.bind(SENSOR_MOUT_EVT,	__sensorMouseOut) // hoverIntent	-> SENSOR
		    elm.bind(CANVAS_MIN_EVT, 	__canvasMouseIn)  // CANVAS  		-> SENSOR
		    elm.bind(CANVAS_MOUT_EVT, 	__canvasMouseOut) // CANVAS  		-> SENSOR
		    elm.bind(CANVAS_GONE_EVT, 	__canvasGone)     // CANVAS     	-> SENSOR
		    elm.bind(CANVAS_SHOWN_EVT, 	__canvasShown)    // CANVAS     	-> SENSOR

		    if (cfg.touchable) {
			elm.bind('click', 	__sensorClick)	  // handle clicks on touch devices by ignoring them
			elm.bind('touchend', 	__sensorTouchEnd) // handle clicks on touch devices
		    }
		    
		    elm.data('popupSensor.cfg', $j.extend({}, cfg))
		})
	}
	//
	function __sensorClick (e) {//__loginfo('trace: sensor.__sensorClick()')
	    e.preventDefault()
	    e.stopPropagation()
	    return false
	}
	//
	function __sensorTouchEnd (e) {//__loginfo('trace: sensor.__sensorTouchEnd()')
	    e.preventDefault()
	    e.stopPropagation()
	    var elm = $j(this)

	    if (Boolean (elm.data('__sensor.mouseIn'))) 
		elm.trigger(SENSOR_MOUT_EVT)
	    else 
		elm.trigger(SENSOR_MIN_EVT)
	    
	    return false
	}

	//
	function __sensorMouseIn (event) {//__loginfo('trace: sensor.__sensorMouseIn()')
	    var elm = $j(this),
		cfg = __getCfg(elm)

	    if (cfg.touchable) 
		$(document).trigger('touchend') // to hide other open canvas(es)
	    else
		elm.bind(JQ_MOUSEENTER_EVT, __sensorInstantMouseIn)
	    
	    elm.data('__sensor.mouseIn', true) // set the state

	    // save timestamp when mouse entered over sensor
	    // and trigger canvas to show itself
	    if (typeof elm.data(SENSOR_EVT_TS) === "undefined"
		|| elm.data(SENSOR_EVT_TS) === null)
	    {
		elm.data(SENSOR_EVT_TS, event.timeStamp)
		var canvas = __getCanvas(elm)

		if (typeof canvas !== "undefined") {
		    canvas.setEl(elm)
		    canvas.getCanvasElm().trigger(CANVAS_SHOW_EVT)
		}
	    }
	}
    
	//
	function __sensorMouseOut (event) {//__loginfo('trace: sensor.__sensorMouseOut()')
	    var elm 	= $j(this)
	    elm.data('__sensor.mouseIn', false)
	    __evaluateSensorCanvasStates.apply(this, [event])
	}

	//
	function __sensorInstantMouseIn (event) {//__loginfo('trace: sensor.__sensorInstantMouseIn()')
	    var elm = $j(this)
	    elm.data('__sensor.instantMouseIn', true) // set the state
	    elm.bind(JQ_MOUSELEAVE_EVT, __sensorInstantMouseOut)
	}
	//
	function __sensorInstantMouseOut (event) {//__loginfo('trace: sensor.__sensorInstantMouseOut()')
	    var elm = $j(this)
	    var cfg = __getCfg(elm)
	    var self= this
	    
	    elm.unbind(JQ_MOUSELEAVE_EVT, __sensorInstantMouseOut)
	    elm.data('__sensor.instantMouseIn', false)
	    
	    setTimeout(function(){
		    //__loginfo('trace: sensor.__sensorInstantMouseOut() delayed evaluation')
		     __evaluateSensorCanvasStates.apply(self, [event])
	    }, cfg.delayOut )
	    
	}

    	//
	function __canvasMouseIn (event) {//__loginfo('trace: sensor.__canvasMouseIn()')
	    var elm = $j(this)
	    elm.data('__canvas.mouseIn', true)
	}
    	//
	function __canvasMouseOut (event) {//__loginfo('trace: sensor.__canvasMouseOut()')
	    var elm = $j(this)
	    elm.data('__canvas.mouseIn', false)
	    __evaluateSensorCanvasStates.apply(this, [event])
	}
	
	function __evaluateSensorCanvasStates (event) {//__loginfo('trace: sensor.__evaluateSensorCanvasStates()')
	    var elm 	= $j(this)
	    var canvas 	= __getCanvas(elm)

	    //__loginfo('sensor.__evaluateSensorCanvasStates() __canvas.mouseIn=%s __sensor.mouseIn=%s __sensor.instantMouseIn=%s', elm.data('__canvas.mouseIn'), elm.data('__sensor.mouseIn'), elm.data('__sensor.instantMouseIn'))
	    // notify canvas, to hide
	    if (typeof canvas 					!== "undefined"
		    && elm.data('__canvas.mouseIn') 		!== true
		    && elm.data('__sensor.mouseIn') 		!== true
		    && elm.data('__sensor.instantMouseIn') 	!== true
		    && elm.data('__canvas.shown') 		=== true) 
		canvas.getCanvasElm().trigger(CANVAS_HIDE_EVT)
	}
	//
	function __canvasShown (event) {//__loginfo('trace: sensor.__canvasShown()')
	    var elm = $j(this),
		cfg = __getCfg(elm)
	    
	    if (cfg.touchable) {
		// $(document).trigger('touchend') // to hide other open canvas(es)
		$(document).one('touchend', function(e) {elm.trigger(SENSOR_MOUT_EVT)})
	    }
	    elm.data('__canvas.shown', true)
	}
	//
	function __canvasGone (event) {//__loginfo('trace: sensor.__canvasGone()')
	    var elm = $j(this),
		cfg = __getCfg(elm)
	    
	    elm.data('__canvas.shown', false)
	    
	    if (! cfg.touchable)
		elm.unbind(JQ_MOUSEENTER_EVT, __sensorInstantMouseIn)
	    
	    // ping applog	    
	    if (typeof ncbi 			!== "undefined"
		    && typeof ncbi.sg 		!== "undefined"
		    && typeof ncbi.sg.ping 	!== "undefined"
		    && typeof elm.data(SENSOR_EVT_TS) !== "undefined")
	    {
		var lifeSpan = event.timeStamp - elm.data(SENSOR_EVT_TS)
		
		// applog pinger
		if (cfg.statIfLonger < lifeSpan )
		    ncbi.sg.ping(this, event, JSEVENT_NAME, ["lifespan=" +  lifeSpan])
		
	    }
	    // reset timestamp
	    if (typeof elm.data(SENSOR_EVT_TS) !== "undefined")
		elm.data(SENSOR_EVT_TS, null)
	}

	//
	function __getCfg (elm) {return elm.data('popupSensor.cfg')}
	//
	function __getCanvas (elm) {

	    var rid 	= elm.attr('rid-figpopup') || elm.attr('co-rid') || elm.attr('rid') || elm.closest('[id]'), 
		fig 	= $('#' + (rid.replace(/(:|\.)/g, '\\$1').split(' ').join(',#'))).first(),
		canvas 	= fig.data('popupCanvas_' + rid),
		cfg 	= __getCfg(elm)

	    if (typeof canvas === "undefined")
	    {

		if (fig != null) 
		    $j.each(['co-class', 'co-style'], function(i, itm) {
			if (elm.attr(itm) != null)
			    fig.attr(itm, elm.attr(itm))
		    }) // each

		canvas = new popupCanvas( {
		    'sensorEl'  :	elm,
		    'el'	: 	fig,
		    'delayOut'	:	Math.max(cfg.delayOut, cfg.delayIn),    // maxing to let sensor to sense mouse
										// over when mouse moved from pop canvas to
										// sensor 
		    'delayIn'	: 	cfg.delayIn,
		    'touchable' :	cfg.touchable
		} )


		if (typeof canvas !== "undefined")
		{
		    elm.attr('canvas-rid', canvas.getCanvasElm().attr('id'))
		    fig.data('popupCanvas_' + rid, canvas)
		    
		}
	    } // if (typeof canvas === "undefined")
	    
	    return canvas
	}
	//
    }
    
    //
    /*function __logContext(opts) {
	console.group(typeof opts.n != null ? opts.n : this)
	__loginfo('opts: %o', opts)
	console.groupEnd()
    }*/
    //
    //
    //function __loginfo() {
    	//console.info.apply(console, arguments)
	//console.dir(arguments)
	// arguments properties
	/*
	 console.log(arguments.length);
	console.log(arguments.callee);
	console.log(arguments[1]);
	// Function properties
	console.log(__loginfo.length);
	console.log(__loginfo.caller);
	console.log(arguments.callee.caller);
	console.log(arguments.callee.caller.caller);
	console.log(__loginfo.name);
	console.log(__loginfo.constructor);
	*/
    //}
    // ==========================  end of popupSensor =========================

    // ==========================  popupCanvas ================================
    {
	//
	// @param opts.id
	//		id of the image popup image
	//
	// @param opts.rid
	// 		rid of other existing canvas (element with id)
	//
	var popupCanvas = function (opts) {
	    this.__name 	= 'popupCanvas'
	    this.__cfgDefaults 	= {'delayIn': DELAYIN,  'delayOut': DELAYOUT, 'touchable': false}
	    this.__cfg 	 	= {}
	    this.__canvas 	= undefined
	    this.__imToLoad     = 0
	    this.__imagesBox    = undefined
	    this.__legendBox    = undefined

	    return (this.__init(opts) === true ? this : undefined)
	}
	
	$j.fn.extend(popupCanvas.prototype,  {
	    //
	    __init: function(opts) {
		/*__logContext({
		    n: 'canvas.__init()',
		    t: this,
		    o: opts
		})*/
		
		$j.fn.extend(this.__cfg, this.__cfgDefaults)
		$j.fn.extend(this.__cfg, opts)
		
		var __canvasCreated = this.__newCanvas()
		
		if (__canvasCreated)
		{
		    var self = this
		    this.bind(JQ_MOUSEENTER_EVT, function (event) {self.__in(event)})
		    this.bind(JQ_MOUSELEAVE_EVT, function (event) {self.__out(event)})
		    this.bind(CANVAS_SHOW_EVT, function (event) {self.show(event)})
		    this.bind(CANVAS_HIDE_EVT, function (event) {self.hide(event)})
		}
		
		return __canvasCreated
		
	    },
	    
	    setEl: function(el) {
		this.__cfg.el = el
	    },

	    //
	    __in: function (event) {//__loginfo('trace: canvas.__in()')
    		var cfg 	= this.__cfg
		var elm  	= cfg.el
		elm.trigger(CANVAS_MIN_EVT)
	    },
	    //
	    __out: function (event) {//__loginfo('trace: canvas.__out()')
		var cfg 	= this.__cfg
		var elm  	= cfg.el
		
		setTimeout(function(){elm.trigger(CANVAS_MOUT_EVT)}, cfg.delayOut )
		
	    },
	    
	    //
	    __newCanvas: function () {
		var cfg = this.__cfg,
		    el  = cfg.el,
		    sensorEl  = cfg.sensorEl,
		    cid,
		    self = this

		/*__logContext({
		    n: 'canvas.__newCanvas()',
		    t: this
		})*/
		// create canvas
		this.__canvas = $j('<div class="co co-default"><div class="co-inner"></div></div>')
		
		if (cfg.touchable)
		    this.__canvas.bind('touchend', function(e){
			e.preventDefault();
			e.stopPropagation();
		    })
		
		// if sensor element was passwed process supported attributes on that element
		if (typeof el !== "undefined")
		{
		    // handle @rid-figpopup [refers to other thumbnail with info about large images]
		    if (typeof el.attr('rid-figpopup') !== "undefined")
		    {
			cid = this.__collectHiresImgs($j($j('#' + el.attr('rid-figpopup').replace(/(:|\.)/g,'\\$1'))[0]))
		    }
		    // handle @co-rid  [refers to existing callout block with callout content]
		    else if (typeof sensorEl.attr('co-rid') !== "undefined")
		    {   //console.info('co-rid is not empty #### %s', sensorEl.attr('co-rid'))
			var coRidClone = $j('#' + sensorEl.attr('co-rid').replace(/(:|\.)/g,'\\$1').split(' ').join(",#")).clone(true,true)
			coRidClone.find('.ref').filter(':not(.pubmed)').remove();
			
			coRidClone.each(function (i) {
			    var $t = $(this)
			    $t.append(' [<a class="nowrap ref" href="#' + $t.attr('id') + '">Ref list</a>]')
			})
			    .removeAttr('id')
			    .appendTo(this.__getCanvasInner())
			    .show()
			//
			{
			    var a = coRidClone.find('a')
			    //
			    if (cfg.touchable) {
				a.bind('touchend', function(e) {
				    e.stopPropagation()
				    $(this).trigger('click')
				}).bind('click', function(e) {
				    e.stopPropagation()
				    self.hide() 		// canvas hide
				    window.location = $(this).attr('href')
				    return true
				})
			    } else {
				a.bind('click', function(e) {
				    self.hide() 
				    return true
				})
			    }
			}
			//
			cid = sensorEl.attr('co-rid')
		    }
		    // handle @co-content [URL escaped HTML content of the callout]
		    else if (typeof el.attr('co-content') !== "undefined")
		    {
			cid = '' + Math.floor(Math.random()*1000000)
			this.addContent(el.attr('co-content'))
		    }
		    // search for <img> with @hires or @src-large
		    else
			cid = this.__collectHiresImgs(el)
		}
		// if we were able to generate canvas' id then proceed with adding canvas into body
		if (typeof cid !== "undefined")
		{
		    var cnvs = this.getCanvasElm()
		    
    		    if (typeof el.attr('co-legend') == "string")
			this.addLegend(el.attr('co-legend') )

    		    if (typeof el.attr('co-legend-rid') == "string")
			this.addLegendRid(el.attr('co-legend-rid') )
		    
		    if (typeof el.attr('co-class') == "string")
			this.addClass(el.attr('co-class') )
		    
		    if (typeof el.attr('co-style') == "string")
			this.addStyle(el.attr('co-style') )

		    // append canvas to body
		    cnvs.appendTo( $j(document.body) )
		    cnvs.attr('id', String( '_cid_' + cid ).replace(/\W+/g, "_"))
		    sensorEl.attr('canvas-rid', cnvs.attr('id'))
		    
	    	    if (typeof ncbi 			!== "undefined"
	    		    && typeof ncbi.sg 		!== "undefined"
	    		    && typeof ncbi.sg.ping 	!== "undefined")
			ncbi.sg.scanLinks(cnvs.find("a").tmpfixPMCLinks().get())
			//tmpfixPMCLinks is a temporary fix for pmc links		    
		}
		
		return typeof cid !== "undefined" ? true : false
	    },
	    //
	    __collectHiresImgs: function (el) {
		var cid  = undefined
		var self = this
		
		/*__logContext({
		    n: 'canvas.__collectHiresImgs()',
		    t: this,
		    el: el
		})*/
		
		if (typeof el !== "undefined")
		{
		    el.find('img[src-large], img[hires]').each (
			function ()
			{
			    var im = $j(this);
			    
			    if (typeof im.attr('src-large') === "undefined")
				im.attr('src-large', im.attr('hires'))
			    
			    if (typeof cid === "undefined") cid = ''
			    
			    cid += '_' + im.attr('src-large') + '_'
			    self.addImage(im)
			}
		    )
		}
		return cid
	    },
	    //
	    bind: function(evntName, cb) {
		/*__logContext({
		    n: 'canvas.bind()',
		    t: this,
		    en: evntName,
		    cb: cb
		})*/
		this.__canvas.bind(evntName, cb)
	    },
	    //
	    __getResizeHandler: function () {
		var self = this
		this.__resizer == null
		    ? this.__resizer = $.debounce(500, function(e){self.__canvasArrangeLocation()})
		    : 0
		
		return this.__resizer
	    },
	    //
	    show: function (event) {//__loginfo('trace: canvas.show()')
    		var cfg 	= this.__cfg,
		    elm  	= cfg.el,
		    self 	= this

		this.__canvas.show()
		this.__canvasArrangeLocation()
		if (typeof $.debounce == "function")
		    $(window).bind("resize", this.__getResizeHandler())
		elm.trigger(CANVAS_SHOWN_EVT)

	    },
	    //
	    hide: function (event) {//__loginfo('trace: canvas.hide()')
		var cfg 	= this.__cfg,
		    elm 	= this.__cfg.el,
		    self	= this
		
		if (typeof $.debounce == "function")
		    $(window).unbind("resize", this.__getResizeHandler())

		this.__canvas.hide()
		this.__canvas.removeAttr('style')
		elm.trigger(CANVAS_GONE_EVT)
		if (cfg.touchable)
		    $(document).trigger('touchend')
	    },
	    //
	    addImage: function (imThmb) {
		var cfg 	= this.__cfg,
		    elm 	= cfg.el,
		    self 	= this
		
		/*__logContext({
		    n: 'canvas.addImage()',
		    t: this,
		    imT: imThmb
		})*/
		
		if (typeof imThmb.attr('src-large') !== "undefined")
		{
		    this.__imToLoad += 1
			if (this.__imToLoad === 1)
			{
				this.__imagesBox = $j('<div class="images-box inline-block"></div>')
				this.__imagesBox.appendTo(this.__getCanvasInner())
			}
			
		    // check if the parent of image has an achnor element
		    // if so reproduce the link around popup image
		    var a,
		        aClosest 	= elm.closest('a'),
		        aFirst 		= elm.find('a').first(),
		        imAlt           = imThmb.attr('alt')
		    
		    if (imAlt === undefined)
			imAlt = ''
		    //
		    if (aClosest.length == 0 && aFirst.length > 0)
			aClosest = aFirst
		    //
		    var im 		= $j('<img class="large-thumb"' + ' alt="' + imAlt + '"' + ' src="' + imThmb.attr('src-large') + '" />')

		    
		    if (typeof aClosest !== "undefined")
			a = $j('<a></a>')
			
		    if (typeof a !== "undefined")
		    {
			$j.each(['href', 'ref', 'target'], function(i, item) {
			    if ( aClosest.attr(item) !== "" )
				a.attr(item, aClosest.attr(item))
			}) // each
			
			//
			if (cfg.touchable){
			    a.bind('touchend', function(event) {
				aClosest.trigger('open')
				self.hide()
			    })
			//
			} else {
			    a.bind('click', function(event) {
				    event.preventDefault()
				    self.hide()
				    aClosest.trigger('open')
			    })
			}
			//
			im.appendTo(a.appendTo($j('<div class="inline-block"></div>').appendTo( this.__imagesBox)))
		    }
		    else
			im.appendTo($j('<div class="inline-block"></div>').appendTo( this.__imagesBox))
		    
		    // setup in-progress class and onload callbacks 
		    var __self = this
		
		    if (im.data('loaded') !== true)
		    {
			im.parent().addClass('in-progress')
			im.load(function () {
				    /*__logContext({
					n: 'canvas.addImage() onload.handler img ' + im.attr('src') + 'loaded'
				    })*/
//__loginfo('canvas.addImage() onload.handler img ' + im.attr('src') + ' was loaded')
				    var __im = $j(this)

				    __im.data('loaded', true)
				    __im.show()
				    __im.parent().removeClass('in-progress')
				    __self.__imToLoad -= 1
				    __self.__canvasArrangeLocation()
			})
		    }
		}
	    },
	    //
	    addLegend: function (legend) {
		var $a  = this.__imagesBox.find('a').first().clone(true).empty().removeAttr('class'),
		    $l  = $j(decodeURIComponent(legend)),
		    $la

		$l.find('a').replaceWith(function(){ return $(this).contents() })
		$la = ($a.length > 0 ? $a.append($l) : $l) 
		this.__legendBox = $j('<div class="legend"/>').append($la).css({'text-align': 'left'})
		this.__legendBox.appendTo( this.__getCanvasInner().css({'text-align': 'center'}) )
		
	    },
	    //
	    addLegendRid: function (lrid) {
		var __legend = $j('#' + lrid.replace(/(:|\.)/g, '\\$1')).clone().removeAttr('id')
		__legend != null ? this.addLegend(encodeURIComponent(__legend.html())) : 0
		/*if (typeof __legend !== "undefined")
		{
		    this.__legendBox = $j('<div class="legend"></div>').css({'text-align': 'left'})
		    __legend.appendTo(this.__legendBox)
		    this.cleanAnchorsInLegendBox()
		    this.__legendBox.appendTo( this.__getCanvasInner().css({'text-align': 'center'}) )
		}*/
	    },
	    //
	    addContent: function (content) {
		$j('<div class="content">' + decodeURIComponent(content) + '</div>').appendTo( this.__getCanvasInner() )
	    },
	    //
	    addClass: function (clss) {
		//this.__getCanvasInner().addClass(clss)
		this.getCanvasElm().addClass(clss)
	    },
	    //
	    removeClass: function (clss) {
		//this.__getCanvasInner().removeClass(clss)
		this.getCanvasElm().removeClass(clss)
	    },
	    //
	    addStyle: function (style) {
		//this.__getCanvasInner().attr('style', this.__getCanvasInner().attr('style') + ';' + style)
		this.getCanvasElm().attr('style', this.getCanvasElm().attr('style') + ';' + style)
	    },
	    //
	    __getCanvasInner: function () {
		return  this.__canvas.children(".co-inner").size() > 0 ? this.__canvas.children(".co-inner") : this.__canvas
	    },
	    //
	    getCanvasElm: function () {
		var cfg = this.__cfg
		
		/*__logContext({
		    n: 'canvas.getCanvasElm()',
		    t: this
		})*/
		
		return this.__canvas
	    },
	    //
	    __canvasReCalcLocation: function (elm) {
		
		var cnvs 	= this.__canvas
		var ibox        = this.__imagesBox
		var lbox	= this.__legendBox
		var g           = {win: undefined, 'elm': undefined, cnvs: undefined, ibox: undefined, lbox: undefined}
		
		g.win  = {
		    size: 	{w: $j(window).width(), 	h: $j(window).height()},
		    ltc: 	{left: $j(window).scrollLeft(),	top: $j(window).scrollTop()}
		}
		    
		g.elm  = {
		    size: 	{w: elm.outerWidth(true),	h: elm.outerHeight(true)},
		    ltc:	elm.offset()
		}
		
		g.cnvs  = {
		    size: 	{w: cnvs.outerWidth(true),	h: cnvs.outerHeight(true)}
		}
		
		
		if (typeof ibox !== "undefined")
		    g.ibox  = {
			size:	{w: ibox.outerWidth(true),	h: ibox.outerHeight(true)}
		    }

		
		if (typeof lbox !== "undefined")
		{
		    g.lbox  = {
		        size:	{w: lbox.outerWidth(true),	h: lbox.outerHeight(true)}
		    }
		}
		
		var spaceVertical = [
		    {n: TOP, 	v: (g.elm.ltc.top 	- g.win.ltc.top) /** g.win.size.w}*/},
		    {n: BOTTOM,	v: ((g.win.ltc.top 	+ g.win.size.h) - (g.elm.ltc.top 	+ g.elm.size.h))
			/* * g.win.size.w*/}
		]
		var spaceHorizontal = [
		    {n: LEFT, 	v: (g.elm.ltc.left 	- g.win.ltc.left) /* * g.win.size.h*/},
		    {n: RIGHT, 	v: ((g.win.ltc.left 	+ g.win.size.w) - (g.elm.ltc.left 	+ g.elm.size.w))
			/* * g.win.size.h*/},
		]
		g.spH = spaceHorizontal.sort(function(a,b){return b.v - a.v})[0]
		g.spV = spaceVertical.sort(function(a,b){return b.v - a.v})[0]

		// search the bigest area to place popup
		if (g.cnvs.size.w / g.cnvs.size.h < 1
			|| g.win.size.w / g.win.size.h > g.cnvs.size.w / g.cnvs.size.h
			|| (g.spH.v > g.cnvs.size.w )
		    )
		    g.spName = g.spH.n
		else
		    g.spName = g.spV.n
		
		
		// now switch according to found place
		switch (g.spName) {
		    case LEFT:
			g.cnvs.ltc = {top: g.elm.ltc.top + g.elm.size.h/2 - g.cnvs.size.h/2, 	left: g.elm.ltc.left - g.cnvs.size.w}
			break
		    case RIGHT:
			g.cnvs.ltc = {top: g.elm.ltc.top + g.elm.size.h/2 - g.cnvs.size.h/2, 	left: g.elm.ltc.left + g.elm.size.w }
			break
		    case TOP:
			g.cnvs.ltc = {top: g.elm.ltc.top - g.cnvs.size.h, 	left: g.elm.ltc.left + g.elm.size.w/2 - g.cnvs.size.w/2 }
			break
		    case BOTTOM:
			g.cnvs.ltc = {top: g.elm.ltc.top + g.elm.size.h, 	left: g.elm.ltc.left + g.elm.size.w/2 - g.cnvs.size.w/2 }
			break
		    default:
			g.cnvs.ltc = g.elm.ltc
		}
		
		// correction for getting out of the viewport
		// bottom
		if ((g.cnvs.ltc.top + g.cnvs.size.h) > (g.win.ltc.top + g.win.size.h))
		    g.cnvs.ltc.top -= (g.cnvs.ltc.top + g.cnvs.size.h)  - (g.win.ltc.top + g.win.size.h)
		// right
		if ((g.cnvs.ltc.left + g.cnvs.size.w) > (g.win.ltc.left + g.win.size.w))
		    g.cnvs.ltc.left -= (g.cnvs.ltc.left + g.cnvs.size.w)  - (g.win.ltc.left + g.win.size.w)
		//top
		if (g.cnvs.ltc.top < g.win.ltc.top)   g.cnvs.ltc.top = g.win.ltc.top
		//left
		if (g.cnvs.ltc.left < g.win.ltc.left) g.cnvs.ltc.left = g.win.ltc.left

		    
		/*__logContext({
		    n: 'canvas.__canvasReCalcLocation(): gmtr',
		    'g': g,
		    spH: spaceHorizontal,
		    spV: spaceVertical,
		})*/

		return g
	    },
	    //
	    __canvasArrangeLocation: function (iteration) {
		var __iter = typeof iteration === "number" ? iteration : 0,
		    cfg 	= this.__cfg,
		    cnvs 	= this.__canvas,
		    __self 	= this,
		    elm 	= cfg.el,
		    lbox        = this.__legendBox,
		    ibox        = this.__imagesBox;
		
		
		/*__logContext({
		    n: 'canvas.__canvasArrangeLocation()',
		    iter: __iter,
		    t: this
		})*/
	
		// reset height to auto to make next calculations.
		var __imgs = cnvs.find('img')
		__imgs.each(function(){
		    var __im = $j(this)
		    /*__logContext({
			n: '__imgs.each()',
			src: __im.attr('src'),
			loaded: __im.data("loaded")
		    })*/
		    if (__im.data("loaded") === true)
		    {
			__im.css({height:'auto', 'max-width': 'initial', 'max-height': 'initial'})
			if (__iter === 0)
			    __im.css({width:'auto'})
		    }
		})
		
		// reset lbox if it exists
		if (typeof lbox !== "undefined")
		    lbox.width('auto')
		
		// make calculations of geometry of key objects (window, elm, canvas)
		var g = this.__canvasReCalcLocation(elm)

		// balance images box and legend box
		if (typeof g.ibox !== "undefined" && typeof g.lbox !== "undefined" && g.lbox.size.w >= g.ibox.size.w)
		{
		    lbox.css({'width': Math.max(g.ibox.size.w, MIN_LEGEND_WIDTH)})
		    g = this.__canvasReCalcLocation(elm)
		}

//__loginfo('-----------------------------------------------------------')
//__loginfo('canvas.__canvasArrangeLocation() win: top=%spx left=%spx w=%s h=%s', g.win.ltc.top, g.win.ltc.left, g.win.size.w, g.win.size.h)
//__loginfo('canvas.__canvasArrangeLocation() cnvs: top=%spx left=%spx w=%s h=%s', g.cnvs.ltc.top, g.cnvs.ltc.left, g.cnvs.size.w, g.cnvs.size.h)
//__loginfo('canvas.__canvasArrangeLocation() elm (%o): top=%spx left=%spx w=%s h=%s', elm, g.elm.ltc.top, g.elm.ltc.left, g.elm.size.w, g.elm.size.h)
//__imgs.each(function(){
//    var im = $j(this)
//    __loginfo('canvas.__canvasArrangeLocation() img (%s): loaded=%s w=%s h=%s', im.attr('src'), im.data('loaded'), im.width(), im.height())
//})

		// set canvas location
		cnvs.css({
		    'top':	g.cnvs.ltc.top + 'px',
		    'left': 	g.cnvs.ltc.left + 'px'})


		// adjust geometry if all images are loaded and number of iterations is less then
		// predefined number
		if (this.__imToLoad === 0 && __iter < MAX_ITER)
		{
		    // downscale if necessary
		    {
			var __scale = {w: g.cnvs.size.w/(g.win.size.w * 0.95), h: g.cnvs.size.h/(g.win.size.h * 0.975)},
			    __scl = Math.max(__scale.w, __scale.h)

			if (Math.max(__scale.w, __scale.h) > 1)
			{
			    var __imgDownscaleAccum = 0
			    __imgs.each(function(){
				var __im = $j(this)
				
				if (__im.data("loaded") === true)
				{
				    var __downscaleWidthTo = 0;
				    if (__im.width()/__scl > MIN_IMG_WIDTH)
					__downscaleWidthTo = __im.width()/__scl
				    else {
					__downscaleWidthTo = MIN_IMG_WIDTH
				    }
				    
				    if (__downscaleWidthTo > 0)
				    {
					//__loginfo('@downscale@%s@ %sx%s to width %s', __iter, __im.width(), __im.height(),    __downscaleWidthTo)
					__imgDownscaleAccum += __im.width() - __downscaleWidthTo
					__im.width(__downscaleWidthTo)
				    }
				}
			    })
			    
			    //__loginfo('@downscale@%s@ Accum = %s', __iter, __imgDownscaleAccum)
			    if (__imgDownscaleAccum > 1) {
				__self.__canvasArrangeLocation(__iter+1)
				return
			    }else {
				if (__scale.w > 1)
				    cnvs.css({'width': (g.win.size.w *.9) + 'px', 'overflow-x': 'auto', 'overflow-y': 'hidden'})
				if (__scale.h > 1)
				    cnvs.css({'height': (g.win.size.h *.9) + 'px', 'overflow-y': 'auto', 'overflow-x': 'hidden'})
			    }
			}
		    }
		    // upscale if necessary
		    {
			var __scale = {w: (g.win.size.w * 0.95)/g.cnvs.size.w, h: (g.win.size.h * 0.975)/g.cnvs.size.h}

			if (Math.min(__scale.w, __scale.h) > 1)
			{
			    var __imgUpscaleAccum = 0
			    __imgs.each(function(i){
				var __im          = $j(this)
				var __savedWidth  = __im.width()
				var __savedHeight = __im.height()
				
				__im.width('auto')

				if (__im.data("loaded") === true && __savedWidth < __im.width())
				{
				    var __scl = (1 + (Math.min(__scale.w, __scale.h)-1)*.5)
				    //__loginfo('@upscale@%s@ %sx%s by %s img %o', __iter, __savedWidth, __savedHeight, __scl, __im)
				    __im.width(__savedWidth * __scl > __im.width() ? 'auto': __savedWidth * __scl )
				    __imgUpscaleAccum += __im.width() - __savedWidth
				}else {
				    __im.width(__savedWidth)
				}
				
			    })
			    
			    //__loginfo('@upscale@%s@ Accum = %s', __iter, __imgUpscaleAccum)
			    if (__imgUpscaleAccum > 1)
				__self.__canvasArrangeLocation(__iter+1)
			}
		    }
		}else if (__iter < MAX_ITER)
		{
		    var __imgPreDownscaled = false
		    var __nImgs = __imgs.size()
		
		    // calculate border sizes of canvas
		    var bw = g.cnvs.size.w - cnvs.innerWidth()  + parseFloat(cnvs.css('padding-left'))
			    + parseFloat(cnvs.css('padding-right'))
		    var bh = g.cnvs.size.h - cnvs.innerHeight() + parseFloat(cnvs.css('padding-top'))
			    + parseFloat(cnvs.css('padding-bottom'))

		    __imgs.each(function(){ 
			var __im = $j(this)
			if (__im.data("loaded") === true)
			{
			    //__loginfo('@loading-in-progress-downscale@ %sx%s to fit into %sx%s', __im.width(), __im.height(), g.win.size.w, g.win.size.h)
			    if (__im.width() > (g.win.size.w - bw)/__nImgs && __im.width() > MIN_IMG_WIDTH)
			    {__im.width((g.win.size.w - bw)/__nImgs); __imgPreDownscaled = true}
			    
			    if (__im.height() > (g.win.size.h - bh)/__nImgs && __im.width() > MIN_IMG_WIDTH)
			    {__im.width( __im.width() / (__im.height()/((g.win.size.h - bh)/__nImgs)) ); __imgPreDownscaled = true}
			    if (__imgPreDownscaled && __im.width() < MIN_IMG_WIDTH)
				 __im.width(MIN_IMG_WIDTH) 
			    
			    //__loginfo('#loading-in-progress-downscale# %sx%s complete', __im.width(), __im.height())
			}
			
			if (__imgPreDownscaled) __self.__canvasReCalcLocation(elm)
		    })
		}
	    }
	})
    }
     // ==========================  popupCanvas ================================
    

     // ==========================  $j.fn.figPopup =============================
    
    $j.fn.figPopup = function(opts){
        var config = {};
	$j.extend ( config, {
            interval:      		200, 	  // not really a pre popup delay, but used that way 
	    delayIn:      		DELAYIN,  // not implemented yet
	    delayOut:                   DELAYOUT, // not implemented yet, but actually it could be an alias to timeout.
            timeout:       		200,
            over:          		function(event){ $j(this).trigger(SENSOR_MIN_EVT) }, // handler onMouseOver
            out:           		function(event){ $j(this).trigger(SENSOR_MOUT_EVT) } // handler  onMouseOut
        } )
        $j.extend(config, opts)
        return  config
    }
    // a temporary fix for missing slash in pmc accession id links
    $j.fn.extend ({
	tmpfixPMCLinks: function () {
	    return this.map(function(){
		var a = $j(this)
		var h = a.attr('href')
		if (typeof h === "string") {
		    var __h = h.replace(/(\/+pmc\/+)(PMC\d+)$/, "$1articles/$2")
				.replace(/(\/+pmc\/+articles\/+PMC\d+)$/, "$1/")
				
		    if (__h !== h) a.attr('href', __h)
		}
		return this
	    })
	}
    })
    
    // ==========================  end of $j.fn.figPopup ========================

}) (jQuery) // end of extention of jQuery with figPopup


// ==========================  init handlers on a.figpopup =====================
jQuery(document).ready( function () {

});
// ==========================  end of init handlers on a.figpopup ==============
}

// end of hoverIntent routines for figures' popups
// ****************************************************************************

