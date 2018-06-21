/*
  $Id: touch.js 13271 2012-11-20 15:24:43Z maloneyc $
  Adds swipe events that work with mobile browsers and desktop browsers [with
  mouse dragging].

  This module was written for PubReader, but ended up not being used.

  A swipe event is triggered when a user places a finger (or a mouse click for
  desktop browsers) and drags it in any direction on the screen over a determined
  minimum distance.

  ==Events==

  Event Name      Description
  ----------      -----------
  swipe           Fires when the user swipes in any direction. The second argument sent
                  to the callback contains an object with the direction. The values are
                  up, down, left, right, leftup, leftdown, rightup, and rightdown.
  swipeup         Fires when the user swipes with a upward motion.
  swipedown       Fires when the user swipes with a downward motion.
  swipeleft       Fires when the user swipes with a motion to the left.
  swiperight      Fires when the user swipes with a motion to the right.
  swipeleftup     Fires when the user swipes with a diagonal motion to the upper left.
  swipeleftdown   Fires when the user swipes with a diagonal motion to the bottom left.
  swiperightup    Fires when the user swipes with a diagonal motion to the upper right.
  swiperightdown  Fires when the user swipes with a diagonal motion to the bottom right.

  ==Settings==

  Name                                             Default  Description
  ----                                             -------  -----------
  jQuery.event.special.swipe.angleThreshold             22  Angle [degrees] the user may drift
                                                            from axis for the direction to
                                                            count.
  jQuery.event.special.swipe.durationThreshold        1000  The maximum number of milliseconds
                                                            the swipe action can take. Longer
                                                            than this threshold, it will not
                                                            be considered a swipe.
  jQuery.event.special.swipe.movementThreshold          20  Number of pixels user must drag for
                                                            the event to fire.
  jQuery.event.special.swipe.supportBrowserMouseSwipe true  Determines if we should let a mouse
                                                            act like a finger when swiping.

  ==Usage==

  Settings

    // Call this before you attach the swipe events
    jQuery.event.special.swipe.supportBrowserMouseSwipe = false; // turns off browser support for click-drag swipe

  Bind swipe events

    jQuery(".YourSelector").on("swipe", function(event, data) {
        // ... your callback function
        // event is the jQuery event,
        // data is an object which contains the swipe direction
        console.log(data.direction);  // left, right, up, down, leftdown, leftup, rightdown, rightup
    });

  swipeleft, swiperight, swipeup, etc

    jQuery(".YourSelector").on("swipeleft",function(event){
        console.log("You swiped left");
    }
    jQuery(".YourSelector").on("swiperight",function(event){
        console.log("You swiped right");

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

(function () {
    //Holds the start and end points for the swipe event
    var down = {
            x: null,
            y: null,
            time: null
        },
        up = {
            x: null,
            y: null
        },
        //Holds all elements that have swipe attached
        _swipeElems = jQuery([]),
        //Holds references to DOM elements so we know where we are using it and in what direction
        _swipeDirectionElems = {
            left: jQuery([]),
            right: jQuery([]),
            up: jQuery([]),
            down: jQuery([]),
            leftdown: jQuery([]),
            leftup: jQuery([]),
            rightdown: jQuery([]),
            rightup: jQuery([])
        },
        //Called when finger is released, determines what event should be fired
        checkGesture = function (dElem) {
            var x = null,
                elem = jQuery(dElem),
                action1 = null,
                action2 = null,
                diff_x = down.x - up.x,
                diff_y = down.y - up.y,
                diff_time = new Date() - down.time,
                //see if the user's swipe was within an acceptable time span
                isValidTime = diff_time < jQuery.event.special.swipe.durationThreshold,
                //determine if user moved in positive or negative direction and store that string for triggers
                triggerX = diff_x > 0 ? "left" : "right",
                triggerY = diff_y > 0 ? "up" : "down",
                //make sure we moved the correct distance
                minSwipeDist = jQuery.event.special.swipe.movementThreshold,
                validX = Math.abs(diff_x) >= minSwipeDist,
                validY = Math.abs(diff_y) >= minSwipeDist,
                swipeDirection = null,
                isSwipeAction = false;
                //calculate the angle between start and end point
                calcAngle = Math.abs(Math.atan2(down.x - up.x, down.y - up.y) * (180 / Math.PI)),
                minOff45 = 45 - jQuery.event.special.swipe.angleThreshold,
                maxOff45 = 45 + jQuery.event.special.swipe.angleThreshold;

            //make sure the action happened within the defined time limit
            if (isValidTime) {
                //Determine what direction the user dragged and trigger the correct event
                if (calcAngle > 90) {
                    calcAngle = 180 - calcAngle;
                }
                if (validX && calcAngle > maxOff45 && calcAngle <= 90) {  //Left-Right check
                    swipeDirection = triggerX;
                }
                // The diagonal Direction checks
                else if (validX && validY && calcAngle > minOff45 && calcAngle <= maxOff45) {
                    swipeDirection = triggerX + triggerY;
                }
                //Up-Down check
                else if (validY && calcAngle <= minOff45) {
                    swipeDirection = triggerY;
                }
                //If we have a swipe direction, trigger the event
                if (swipeDirection) {
                    isSwipeAction = true;  //set that the user perfromed a swipe action
                    elem.trigger("swipe", {
                        direction: swipeDirection
                    }).trigger("swipe" + swipeDirection);
                }
            }
            //return if user perfromed a sucessful swipe motion
            return isSwipeAction;
        },
        //Helper function for the building of special swipe events, this is called when the event
        //is unbound from the element
        removeElementEvent = function (dElem, swipeDirection) {
            //Determine if the swipe event is attached for any other direction
            var usedElsewhere = false;
            for (var dir in _swipeDirectionElems) {
                //check to see if the swipe event is attached to another direction
                //make sure we exclude the current direction from this check
                if (dir !== swipeDirection && _swipeDirectionElems[dir].is(dElem)) {
                    usedElsewhere = true;
                    break;
                }
            }
            //if it is not used anywhere else, kill the swipe event since it is not needed anymore
            if (!usedElsewhere) {
                jQuery(dElem).off("swipe");
            }
            //remove the reference to the element since the event was destroyed
            _swipeDirectionElems[swipeDirection] = _swipeDirectionElems[swipeDirection].not(dElem);
        },
        //Helper function for the building of special swipe events, this is called when the event
        //is bound to the element
        addElementEvent = function (dElem, swipeDirection) {
            //Add that this element is attached in the defined direction
            _swipeDirectionElems[swipeDirection].add(dElem);
            //see if we need to bind swipe event
            //swipe event takes care of triggering all of the correct directions [one code based
            //covers multiple events]
            if (!_swipeElems.is(dElem)) {
                jQuery(dElem).on("swipe", function () {});
            }
        };

    //This is the general swipe event, used by all of the specific directional swipe events
    //If swipe is attached to, it returns direction.
    jQuery.event.special.swipe = {
        movementThreshold : 20, //number of pixels user must drag for the event to fire
        angleThreshold : 22,    //Angle [degrees] the user may drift from axis for the direction to count
        supportBrowserMouseSwipe : true,   //Enable/Disable support for adding click/drag to act like swipe
        durationThreshold : 1000,
        setup: function () {
            _swipeElems = _swipeElems.add(this);
            var elem = jQuery(this);
            if (jQuery.event.special.swipe.supportBrowserMouseSwipe) {
                elem.on("mousedown",  //handles browser mouse
                        function (e) {
                            e.preventDefault();
                            down.x = e.pageX;
                            down.y = e.pageY;
                            down.time = new Date();
                        }
                    )
                    .on("mouseup", //handles browser mouse
                        function (e) {
                            up.x = e.pageX;
                            up.y = e.pageY;
                            checkGesture(this);
                        }
                    );
            }
            elem.on('touchstart', //handles mobile touch
                    function (e) {
                        var touch = e.originalEvent.touches[0];
                        down.x = touch.pageX;
                        down.y = touch.pageY;
                        down.time = new Date();
                    }
                )
                .on('touchmove', //handles mobile touch
                    function (e) {
                        e.preventDefault();
                        var touch = e.originalEvent.touches[0];
                        up.x = touch.pageX;
                        up.y = touch.pageY;
                    }
                )
                .on('touchend', //handles mobile touch
                    function (e) {
                        var isSwipeAction = checkGesture(this);
                        if (isSwipeAction) {  //cancel the default action if user made a sucessful swipe motion.
                            e.preventDefault();
                        }
                    }
                );
        },
        teardown: function () {
            _swipeElems = _swipeElems.not(this);
            var elem = jQuery(this);
            if (jQuery.event.special.swipe.supportBrowserMouseSwipe) {
                elem.off("mousedown")
                    .off("mouseup");
            }
            elem.off('touchstart')
                .off('touchmove')
                .off('touchend');
        }
    };

    //Dynamically build the swipe events for every direction so they can be bound to seperately
    //Code is basically the same so instead of copy and paste we loop through and add a special
    //event for each direction.
    for (var dir in _swipeDirectionElems) {
        (function (swipeDirection) {
            jQuery.event.special["swipe" + swipeDirection] = {
                setup: function () {
                    addElementEvent(this, swipeDirection);
                },
                teardown: function () {
                    removeElementEvent(this, swipeDirection);
                }
            }
        })(dir);
    }
})();