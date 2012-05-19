// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());


// place any jQuery/helper plugins in here, instead of separate, slower script files.

/**
 * jQuery Roundabout - v2.4
 * http://fredhq.com/projects/roundabout
 *
 * Moves list-items of enabled ordered and unordered lists long
 * a chosen path. Includes the default "lazySusan" path, that
 * moves items long a spinning turntable.
 *
 * Terms of Use // jQuery Roundabout
 *
 * Open source under the BSD license
 *
 * Copyright (c) 2011-2012, Fred LeBlanc
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above
 *     copyright notice, this list of conditions and the following
 *     disclaimer in the documentation and/or other materials provided
 *     with the distribution.
 *   - Neither the name of the author nor the names of its contributors
 *     may be used to endorse or promote products derived from this
 *     software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
(function($) {
	"use strict";
	var defaults, internalData, methods;

	// add default shape
	$.extend({
		roundaboutShapes: {
			def: "lazySusan",
			lazySusan: function (r, a, t) {
				return {
					x: Math.sin(r + a),
					y: (Math.sin(r + 3 * Math.PI / 2 + a) / 8) * t,
					z: (Math.cos(r + a) + 1) / 2,
					scale: (Math.sin(r + Math.PI / 2 + a) / 2) + 0.5
				};
			}
		}
	});

	defaults = {
		bearing: 0.0,
		tilt: 0.0,
		minZ: 100,
		maxZ: 280,
		minOpacity: 0.4,
		maxOpacity: 1.0,
		minScale: 0.4,
		maxScale: 1.0,
		duration: 600,
		btnNext: null,
		btnNextCallback: function() {},
		btnPrev: null,
		btnPrevCallback: function() {},
		btnToggleAutoplay: null,
		btnStartAutoplay: null,
		btnStopAutoplay: null,
		easing: "swing",
		clickToFocus: true,
		clickToFocusCallback: function() {},
		focusBearing: 0.0,
		shape: "lazySusan",
		debug: false,
		childSelector: "li",
		startingChild: null,
		reflect: false,
		floatComparisonThreshold: 0.001,
		autoplay: false,
		autoplayDuration: 1000,
		autoplayPauseOnHover: false,
		autoplayCallback: function() {},
		autoplayInitialDelay: 0,
		enableDrag: false,
		dropDuration: 600,
		dropEasing: "swing",
		dropAnimateTo: "nearest",
		dropCallback: function() {},
		dragAxis: "x",
		dragFactor: 4,
		triggerFocusEvents: true,
		triggerBlurEvents: true,
		responsive: false
	};

	internalData = {
		autoplayInterval: null,
		autoplayIsRunning: false,
		autoplayStartTimeout: null,
		animating: false,
		childInFocus: -1,
		touchMoveStartPosition: null,
		stopAnimation: false,
		lastAnimationStep: false
	};

	methods = {

		// starters
		// -----------------------------------------------------------------------

		// init
		// starts up roundabout
		init: function(options, callback, relayout) {
			var settings,
			    now = (new Date()).getTime();

			options   = (typeof options === "object") ? options : {};
			callback  = ($.isFunction(callback)) ? callback : function() {};
			callback  = ($.isFunction(options)) ? options : callback;
			settings  = $.extend({}, defaults, options, internalData);

			return this
				.each(function() {
					// make options
					var self = $(this),
					    childCount = self.children(settings.childSelector).length,
					    period = 360.0 / childCount,
					    startingChild = (settings.startingChild && settings.startingChild > (childCount - 1)) ? (childCount - 1) : settings.startingChild,
					    startBearing = (settings.startingChild === null) ? settings.bearing : 360 - (startingChild * period),
					    holderCSSPosition = (self.css("position") !== "static") ? self.css("position") : "relative";

					self
						.css({  // starting styles
							padding:   0,
							position:  holderCSSPosition
						})
						.addClass("roundabout-holder")
						.data(  // starting options
							"roundabout",
							$.extend(
								{},
								settings,
								{
									startingChild: startingChild,
									bearing: startBearing,
									oppositeOfFocusBearing: methods.normalize.apply(null, [settings.focusBearing - 180]),
									dragBearing: startBearing,
									period: period
								}
							)
						);

					// unbind any events that we set if we're relaying out
					if (relayout) {
						self
							.unbind(".roundabout")
							.children(settings.childSelector)
								.unbind(".roundabout");
					} else {
						// bind responsive action
						if (settings.responsive) {
							$(window).bind("resize", function() {
								methods.relayoutChildren.apply(self);
							});
						}
					}

					// bind click-to-focus
					if (settings.clickToFocus) {
						self
							.children(settings.childSelector)
							.each(function(i) {
								$(this)
									.bind("click.roundabout", function() {
										var degrees = methods.getPlacement.apply(self, [i]);

										if (!methods.isInFocus.apply(self, [degrees])) {
											methods.stopAnimation.apply($(this));
											if (!self.data("roundabout").animating) {
												methods.animateBearingToFocus.apply(self, [degrees, self.data("roundabout").clickToFocusCallback]);
											}
											return false;
										}
									});
							});
					}

					// bind next buttons
					if (settings.btnNext) {
						$(settings.btnNext)
							.bind("click.roundabout", function() {
								if (!self.data("roundabout").animating) {
									methods.animateToNextChild.apply(self, [self.data("roundabout").btnNextCallback]);
								}
								return false;
							});
					}

					// bind previous buttons
					if (settings.btnPrev) {
						$(settings.btnPrev)
							.bind("click.roundabout", function() {
								methods.animateToPreviousChild.apply(self, [self.data("roundabout").btnPrevCallback]);
								return false;
							});
					}

					// bind toggle autoplay buttons
					if (settings.btnToggleAutoplay) {
						$(settings.btnToggleAutoplay)
							.bind("click.roundabout", function() {
								methods.toggleAutoplay.apply(self);
								return false;
							});
					}

					// bind start autoplay buttons
					if (settings.btnStartAutoplay) {
						$(settings.btnStartAutoplay)
							.bind("click.roundabout", function() {
								methods.startAutoplay.apply(self);
								return false;
							});
					}

					// bind stop autoplay buttons
					if (settings.btnStopAutoplay) {
						$(settings.btnStopAutoplay)
							.bind("click.roundabout", function() {
								methods.stopAutoplay.apply(self);
								return false;
							});
					}

					// autoplay pause on hover
					if (settings.autoplayPauseOnHover) {
						self
							.bind("mouseenter.roundabout.autoplay", function() {
								methods.stopAutoplay.apply(self, [true]);
							})
							.bind("mouseleave.roundabout.autoplay", function() {
								methods.startAutoplay.apply(self);
							});
					}

					// drag and drop
					if (settings.enableDrag) {
						// on screen
						if (!$.isFunction(self.drag)) {
							if (settings.debug) {
								alert("You do not have the drag plugin loaded.");
							}
						} else if (!$.isFunction(self.drop)) {
							if (settings.debug) {
								alert("You do not have the drop plugin loaded.");
							}
						} else {
							self
								.drag(function(e, properties) {
									var data = self.data("roundabout"),
									    delta = (data.dragAxis.toLowerCase() === "x") ? "deltaX" : "deltaY";
									methods.stopAnimation.apply(self);
									methods.setBearing.apply(self, [data.dragBearing + properties[delta] / data.dragFactor]);
								})
								.drop(function(e) {
									var data = self.data("roundabout"),
									    method = methods.getAnimateToMethod(data.dropAnimateTo);
									methods.allowAnimation.apply(self);
									methods[method].apply(self, [data.dropDuration, data.dropEasing, data.dropCallback]);
									data.dragBearing = data.period * methods.getNearestChild.apply(self);
								});
						}

						// on mobile
						self
							.each(function() {
								var element = $(this).get(0),
								    data = $(this).data("roundabout"),
								    page = (data.dragAxis.toLowerCase() === "x") ? "pageX" : "pageY",
								    method = methods.getAnimateToMethod(data.dropAnimateTo);

								// some versions of IE don't like this
								if (element.addEventListener) {
									element.addEventListener("touchstart", function(e) {
										data.touchMoveStartPosition = e.touches[0][page];
									}, false);

									element.addEventListener("touchmove", function(e) {
										var delta = (e.touches[0][page] - data.touchMoveStartPosition) / data.dragFactor;
										e.preventDefault();
										methods.stopAnimation.apply($(this));
										methods.setBearing.apply($(this), [data.dragBearing + delta]);
									}, false);

									element.addEventListener("touchend", function(e) {
										e.preventDefault();
										methods.allowAnimation.apply($(this));
										method = methods.getAnimateToMethod(data.dropAnimateTo);
										methods[method].apply($(this), [data.dropDuration, data.dropEasing, data.dropCallback]);
										data.dragBearing = data.period * methods.getNearestChild.apply($(this));
									}, false);
								}
							});
					}

					// start children
					methods.initChildren.apply(self, [callback, relayout]);
				});
		},


		// initChildren
		// applys settings to child elements, starts roundabout
		initChildren: function(callback, relayout) {
			var self = $(this),
			    data = self.data("roundabout");

			callback = callback || function() {};
			
			self.children(data.childSelector).each(function(i) {
				var startWidth, startHeight, startFontSize,
				    degrees = methods.getPlacement.apply(self, [i]);

				// on relayout, grab these values from current data
				if (relayout && $(this).data("roundabout")) {
					startWidth = $(this).data("roundabout").startWidth;
					startHeight = $(this).data("roundabout").startHeight;
					startFontSize = $(this).data("roundabout").startFontSize;
				}

				// apply classes and css first
				$(this)
					.addClass("roundabout-moveable-item")
					.css("position", "absolute");

				// now measure
				$(this)
					.data(
						"roundabout",
						{
							startWidth: startWidth || $(this).width(),
							startHeight: startHeight || $(this).height(),
							startFontSize: startFontSize || parseInt($(this).css("font-size"), 10),
							degrees: degrees,
							backDegrees: methods.normalize.apply(null, [degrees - 180]),
							childNumber: i,
							currentScale: 1,
							parent: self
						}
					);
			});

			methods.updateChildren.apply(self);

			// start autoplay if necessary
			if (data.autoplay) {
				data.autoplayStartTimeout = setTimeout(function() {
					methods.startAutoplay.apply(self);
				}, data.autoplayInitialDelay);
			}

			self.trigger('ready');
			callback.apply(self);
			return self;
		},



		// positioning
		// -----------------------------------------------------------------------

		// updateChildren
		// move children elements into their proper locations
		updateChildren: function() {
			return this
				.each(function() {
					var self = $(this),
					    data = self.data("roundabout"),
					    inFocus = -1,
					    info = {
							bearing: data.bearing,
							tilt: data.tilt,
							stage: {
								width: Math.floor($(this).width() * 0.9),
								height: Math.floor($(this).height() * 0.9)
							},
							animating: data.animating,
							inFocus: data.childInFocus,
							focusBearingRadian: methods.degToRad.apply(null, [data.focusBearing]),
							shape: $.roundaboutShapes[data.shape] || $.roundaboutShapes[$.roundaboutShapes.def]
					    };

					// calculations
					info.midStage = {
						width: info.stage.width / 2,
						height: info.stage.height / 2
					};

					info.nudge = {
						width: info.midStage.width + (info.stage.width * 0.05),
						height: info.midStage.height + (info.stage.height * 0.05)
					};

					info.zValues = {
						min: data.minZ,
						max: data.maxZ,
						diff: data.maxZ - data.minZ
					};

					info.opacity = {
						min: data.minOpacity,
						max: data.maxOpacity,
						diff: data.maxOpacity - data.minOpacity
					};

					info.scale = {
						min: data.minScale,
						max: data.maxScale,
						diff: data.maxScale - data.minScale
					};

					// update child positions
					self.children(data.childSelector)
						.each(function(i) {
							if (methods.updateChild.apply(self, [$(this), info, i, function() { $(this).trigger('ready'); }]) && (!info.animating || data.lastAnimationStep)) {
								inFocus = i;
								$(this).addClass("roundabout-in-focus");
							} else {
								$(this).removeClass("roundabout-in-focus");
							}
						});

					if (inFocus !== info.inFocus) {
						// blur old child
						if (data.triggerBlurEvents) {
							self.children(data.childSelector)
								.eq(info.inFocus)
									.trigger("blur");
						}

						data.childInFocus = inFocus;

						if (data.triggerFocusEvents && inFocus !== -1) {
							// focus new child
							self.children(data.childSelector)
								.eq(inFocus)
									.trigger("focus");
						}
					}

					self.trigger("childrenUpdated");
				});
		},


		// updateChild
		// repositions a child element into its new position
		updateChild: function(childElement, info, childPos, callback) {
			var factors,
			    self = this,
			    child = $(childElement),
			    data = child.data("roundabout"),
			    out = [],
			    rad = methods.degToRad.apply(null, [(360.0 - data.degrees) + info.bearing]);

			callback = callback || function() {};

			// adjust radians to be between 0 and Math.PI * 2
			rad = methods.normalizeRad.apply(null, [rad]);

			// get factors from shape
			factors = info.shape(rad, info.focusBearingRadian, info.tilt);

			// correct
			factors.scale = (factors.scale > 1) ? 1 : factors.scale;
			factors.adjustedScale = (info.scale.min + (info.scale.diff * factors.scale)).toFixed(4);
			factors.width = (factors.adjustedScale * data.startWidth).toFixed(4);
			factors.height = (factors.adjustedScale * data.startHeight).toFixed(4);

			// update item
			child
				.css({
					left: ((factors.x * info.midStage.width + info.nudge.width) - factors.width / 2.0).toFixed(0) + "px",
					top: ((factors.y * info.midStage.height + info.nudge.height) - factors.height / 2.0).toFixed(0) + "px",
					width: factors.width + "px",
					height: factors.height + "px",
					opacity: (info.opacity.min + (info.opacity.diff * factors.scale)).toFixed(2),
					zIndex: Math.round(info.zValues.min + (info.zValues.diff * factors.z)),
					fontSize: (factors.adjustedScale * data.startFontSize).toFixed(1) + "px"
				});
			data.currentScale = factors.adjustedScale;

			// for debugging purposes
			if (self.data("roundabout").debug) {
				out.push("<div style=\"font-weight: normal; font-size: 10px; padding: 2px; width: " + child.css("width") + "; background-color: #ffc;\">");
				out.push("<strong style=\"font-size: 12px; white-space: nowrap;\">Child " + childPos + "</strong><br />");
				out.push("<strong>left:</strong> " + child.css("left") + "<br />");
				out.push("<strong>top:</strong> " + child.css("top") + "<br />");
				out.push("<strong>width:</strong> " + child.css("width") + "<br />");
				out.push("<strong>opacity:</strong> " + child.css("opacity") + "<br />");
				out.push("<strong>height:</strong> " + child.css("height") + "<br />");
				out.push("<strong>z-index:</strong> " + child.css("z-index") + "<br />");
				out.push("<strong>font-size:</strong> " + child.css("font-size") + "<br />");
				out.push("<strong>scale:</strong> " + child.data("roundabout").currentScale);
				out.push("</div>");

				child.html(out.join(""));
			}

			// trigger event
			child.trigger("reposition");
			
			// callback
			callback.apply(self);

			return methods.isInFocus.apply(self, [data.degrees]);
		},



		// manipulation
		// -----------------------------------------------------------------------

		// setBearing
		// changes the bearing of the roundabout
		setBearing: function(bearing, callback) {
			callback = callback || function() {};
			bearing = methods.normalize.apply(null, [bearing]);

			this
				.each(function() {
					var diff, lowerValue, higherValue,
					    self = $(this),
					    data = self.data("roundabout"),
					    oldBearing = data.bearing;

					// set bearing
					data.bearing = bearing;
					self.trigger("bearingSet");
					methods.updateChildren.apply(self);

					// not animating? we're done here
					diff = Math.abs(oldBearing - bearing);
					if (!data.animating || diff > 180) {
						return;
					}

					// check to see if any of the children went through the back
					diff = Math.abs(oldBearing - bearing);
					self.children(data.childSelector).each(function(i) {
						var eventType;

						if (methods.isChildBackDegreesBetween.apply($(this), [bearing, oldBearing])) {
							eventType = (oldBearing > bearing) ? "Clockwise" : "Counterclockwise";
							$(this).trigger("move" + eventType + "ThroughBack");
						}
					});
				});

			// call callback if one was given
			callback.apply(this);
			return this;
		},


		// adjustBearing
		// change the bearing of the roundabout by a given degree
		adjustBearing: function(delta, callback) {
			callback = callback || function() {};
			if (delta === 0) {
				return this;
			}

			this
				.each(function() {
					methods.setBearing.apply($(this), [$(this).data("roundabout").bearing + delta]);
				});

			callback.apply(this);
			return this;
		},


		// setTilt
		// changes the tilt of the roundabout
		setTilt: function(tilt, callback) {
			callback = callback || function() {};

			this
				.each(function() {
					$(this).data("roundabout").tilt = tilt;
					methods.updateChildren.apply($(this));
				});

			// call callback if one was given
			callback.apply(this);
			return this;
		},


		// adjustTilt
		// changes the tilt of the roundabout
		adjustTilt: function(delta, callback) {
			callback = callback || function() {};

			this
				.each(function() {
					methods.setTilt.apply($(this), [$(this).data("roundabout").tilt + delta]);
				});

			callback.apply(this);
			return this;
		},



		// animation
		// -----------------------------------------------------------------------

		// animateToBearing
		// animates the roundabout to a given bearing, all animations come through here
		animateToBearing: function(bearing, duration, easing, passedData, callback) {
			var now = (new Date()).getTime();

			callback = callback || function() {};

			// find callback function in arguments
			if ($.isFunction(passedData)) {
				callback = passedData;
				passedData = null;
			} else if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			this
				.each(function() {
					var timer, easingFn, newBearing,
					    self = $(this),
					    data = self.data("roundabout"),
					    thisDuration = (!duration) ? data.duration : duration,
					    thisEasingType = (easing) ? easing : data.easing || "swing";

					// is this your first time?
					if (!passedData) {
						passedData = {
							timerStart: now,
							start: data.bearing,
							totalTime: thisDuration
						};
					}

					// update the timer
					timer = now - passedData.timerStart;

					if (data.stopAnimation) {
						methods.allowAnimation.apply(self);
						data.animating = false;
						return;
					}

					// we need to animate more
					if (timer < thisDuration) {
						if (!data.animating) {
							self.trigger("animationStart");
						}

						data.animating = true;

						if (typeof $.easing.def === "string") {
							easingFn = $.easing[thisEasingType] || $.easing[$.easing.def];
							newBearing = easingFn(null, timer, passedData.start, bearing - passedData.start, passedData.totalTime);
						} else {
							newBearing = $.easing[thisEasingType]((timer / passedData.totalTime), timer, passedData.start, bearing - passedData.start, passedData.totalTime);
						}

						// fixes issue #24, animation changed as of jQuery 1.7.2
						if (methods.compareVersions.apply(null, [$().jquery, "1.7.2"]) >= 0) {
							newBearing = passedData.start + ((bearing - passedData.start) * newBearing);
						}

						newBearing = methods.normalize.apply(null, [newBearing]);
						data.dragBearing = newBearing;

						methods.setBearing.apply(self, [newBearing, function() {
							setTimeout(function() {  // done with a timeout so that each step is displayed
								methods.animateToBearing.apply(self, [bearing, thisDuration, thisEasingType, passedData, callback]);
							}, 0);
						}]);

					// we're done animating
					} else {
						data.lastAnimationStep = true;

						bearing = methods.normalize.apply(null, [bearing]);
						methods.setBearing.apply(self, [bearing, function() {
							self.trigger("animationEnd");
						}]);
						data.animating = false;
						data.lastAnimationStep = false;
						data.dragBearing = bearing;

						callback.apply(self);
					}
				});

			return this;
		},


		// animateToNearbyChild
		// animates roundabout to a nearby child
		animateToNearbyChild: function(passedArgs, which) {
			var duration = passedArgs[0],
			    easing = passedArgs[1],
			    callback = passedArgs[2] || function() {};

			// find callback
			if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			return this
				.each(function() {
					var j, range,
					    self = $(this),
					    data = self.data("roundabout"),
					    bearing = (!data.reflect) ? data.bearing % 360 : data.bearing,
					    length = self.children(data.childSelector).length;

					if (!data.animating) {
						// reflecting, not moving to previous || not reflecting, moving to next
						if ((data.reflect && which === "previous") || (!data.reflect && which === "next")) {
							// slightly adjust for rounding issues
							bearing = (Math.abs(bearing) < data.floatComparisonThreshold) ? 360 : bearing;

							// clockwise
							for (j = 0; j < length; j += 1) {
								range = {
									lower: (data.period * j),
									upper: (data.period * (j + 1))
								};
								range.upper = (j === length - 1) ? 360 : range.upper;

								if (bearing <= Math.ceil(range.upper) && bearing >= Math.floor(range.lower)) {
									if (length === 2 && bearing === 360) {
										methods.animateToDelta.apply(self, [-180, duration, easing, callback]);
									} else {
										methods.animateBearingToFocus.apply(self, [range.lower, duration, easing, callback]);
									}
									break;
								}
							}
						} else {
							// slightly adjust for rounding issues
							bearing = (Math.abs(bearing) < data.floatComparisonThreshold || 360 - Math.abs(bearing) < data.floatComparisonThreshold) ? 0 : bearing;

							// counterclockwise
							for (j = length - 1; j >= 0; j -= 1) {
								range = {
									lower: data.period * j,
									upper: data.period * (j + 1)
								};
								range.upper = (j === length - 1) ? 360 : range.upper;

								if (bearing >= Math.floor(range.lower) && bearing < Math.ceil(range.upper)) {
									if (length === 2 && bearing === 360) {
										methods.animateToDelta.apply(self, [180, duration, easing, callback]);
									} else {
										methods.animateBearingToFocus.apply(self, [range.upper, duration, easing, callback]);
									}
									break;
								}
							}
						}
					}
				});
		},


		// animateToNearestChild
		// animates roundabout to the nearest child
		animateToNearestChild: function(duration, easing, callback) {
			callback = callback || function() {};

			// find callback
			if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			return this
				.each(function() {
					var nearest = methods.getNearestChild.apply($(this));
					methods.animateToChild.apply($(this), [nearest, duration, easing, callback]);
				});
		},


		// animateToChild
		// animates roundabout to a given child position
		animateToChild: function(childPosition, duration, easing, callback) {
			callback = callback || function() {};

			// find callback
			if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			return this
				.each(function() {
					var child,
					    self = $(this),
					    data = self.data("roundabout");

					if (data.childInFocus !== childPosition && !data.animating) {
						child = self.children(data.childSelector).eq(childPosition);
						methods.animateBearingToFocus.apply(self, [child.data("roundabout").degrees, duration, easing, callback]);
					}
				});
		},


		// animateToNextChild
		// animates roundabout to the next child
		animateToNextChild: function(duration, easing, callback) {
			return methods.animateToNearbyChild.apply(this, [arguments, "next"]);
		},


		// animateToPreviousChild
		// animates roundabout to the preious child
		animateToPreviousChild: function(duration, easing, callback) {
			return methods.animateToNearbyChild.apply(this, [arguments, "previous"]);
		},


		// animateToDelta
		// animates roundabout to a given delta (in degrees)
		animateToDelta: function(degrees, duration, easing, callback) {
			callback = callback || function() {};

			// find callback
			if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			return this
				.each(function() {
					var delta = $(this).data("roundabout").bearing + degrees;
					methods.animateToBearing.apply($(this), [delta, duration, easing, callback]);
				});
		},


		// animateBearingToFocus
		// animates roundabout to bring a given angle into focus
		animateBearingToFocus: function(degrees, duration, easing, callback) {
			callback = callback || function() {};

			// find callback
			if ($.isFunction(easing)) {
				callback = easing;
				easing = null;
			} else if ($.isFunction(duration)) {
				callback = duration;
				duration = null;
			}

			return this
				.each(function() {
					var delta = $(this).data("roundabout").bearing - degrees;
					delta = (Math.abs(360 - delta) < Math.abs(delta)) ? 360 - delta : -delta;
					delta = (delta > 180) ? -(360 - delta) : delta;

					if (delta !== 0) {
						methods.animateToDelta.apply($(this), [delta, duration, easing, callback]);
					}
				});
		},


		// stopAnimation
		// if an animation is currently in progress, stop it
		stopAnimation: function() {
			return this
				.each(function() {
					$(this).data("roundabout").stopAnimation = true;
				});
		},


		// allowAnimation
		// clears the stop-animation hold placed by stopAnimation
		allowAnimation: function() {
			return this
				.each(function() {
					$(this).data("roundabout").stopAnimation = false;
				});
		},



		// autoplay
		// -----------------------------------------------------------------------

		// startAutoplay
		// starts autoplaying this roundabout
		startAutoplay: function(callback) {
			return this
				.each(function() {
					var self = $(this),
					    data = self.data("roundabout");

					callback = callback || data.autoplayCallback || function() {};

					clearInterval(data.autoplayInterval);
					data.autoplayInterval = setInterval(function() {
						methods.animateToNextChild.apply(self, [callback]);
					}, data.autoplayDuration);
					data.autoplayIsRunning = true;
					
					self.trigger("autoplayStart");
				});
		},


		// stopAutoplay
		// stops autoplaying this roundabout
		stopAutoplay: function(keepAutoplayBindings) {
			return this
				.each(function() {
					clearInterval($(this).data("roundabout").autoplayInterval);
					$(this).data("roundabout").autoplayInterval = null;
					$(this).data("roundabout").autoplayIsRunning = false;
					
					// this will prevent autoplayPauseOnHover from restarting autoplay
					if (!keepAutoplayBindings) {
						$(this).unbind(".autoplay");
					}
					
					$(this).trigger("autoplayStop");
				});
		},
		
		
		// toggleAutoplay
		// toggles autoplay pause/resume
		toggleAutoplay: function(callback) {
			return this
				.each(function() {
					var self = $(this),
					    data = self.data("roundabout");

					callback = callback || data.autoplayCallback || function() {};

					if (!methods.isAutoplaying.apply($(this))) {
						methods.startAutoplay.apply($(this), [callback]);
					} else {
						methods.stopAutoplay.apply($(this), [callback]);
					}
				});
		},


		// isAutoplaying
		// is this roundabout currently autoplaying?
		isAutoplaying: function() {
			return (this.data("roundabout").autoplayIsRunning);
		},


		// changeAutoplayDuration
		// stops the autoplay, changes the duration, restarts autoplay
		changeAutoplayDuration: function(duration) {
			return this
				.each(function() {
					var self = $(this),
					    data = self.data("roundabout");

					data.autoplayDuration = duration;

					if (methods.isAutoplaying.apply(self)) {
						methods.stopAutoplay.apply(self);
						setTimeout(function() {
							methods.startAutoplay.apply(self);
						}, 10);
					}
				});
		},



		// helpers
		// -----------------------------------------------------------------------

		// normalize
		// regulates degrees to be >= 0.0 and < 360
		normalize: function(degrees) {
			var inRange = degrees % 360.0;
			return (inRange < 0) ? 360 + inRange : inRange;
		},


		// normalizeRad
		// regulates radians to be >= 0 and < Math.PI * 2
		normalizeRad: function(radians) {
			while (radians < 0) {
				radians += (Math.PI * 2);
			}

			while (radians > (Math.PI * 2)) {
				radians -= (Math.PI * 2);
			}

			return radians;
		},


		// isChildBackDegreesBetween
		// checks that a given child's backDegrees is between two values
		isChildBackDegreesBetween: function(value1, value2) {
			var backDegrees = $(this).data("roundabout").backDegrees;

			if (value1 > value2) {
				return (backDegrees >= value2 && backDegrees < value1);
			} else {
				return (backDegrees < value2 && backDegrees >= value1);
			}
		},


		// getAnimateToMethod
		// takes a user-entered option and maps it to an animation method
		getAnimateToMethod: function(effect) {
			effect = effect.toLowerCase();

			if (effect === "next") {
				return "animateToNextChild";
			} else if (effect === "previous") {
				return "animateToPreviousChild";
			}

			// default selection
			return "animateToNearestChild";
		},
		
		
		// relayoutChildren
		// lays out children again with new contextual information
		relayoutChildren: function() {
			return this
				.each(function() {
					var self = $(this),
					    settings = $.extend({}, self.data("roundabout"));

					settings.startingChild = self.data("roundabout").childInFocus;
					methods.init.apply(self, [settings, null, true]);
				});
		},


		// getNearestChild
		// gets the nearest child from the current bearing
		getNearestChild: function() {
			var self = $(this),
			    data = self.data("roundabout"),
			    length = self.children(data.childSelector).length;

			if (!data.reflect) {
				return ((length) - (Math.round(data.bearing / data.period) % length)) % length;
			} else {
				return (Math.round(data.bearing / data.period) % length);
			}
		},


		// degToRad
		// converts degrees to radians
		degToRad: function(degrees) {
			return methods.normalize.apply(null, [degrees]) * Math.PI / 180.0;
		},


		// getPlacement
		// returns the starting degree for a given child
		getPlacement: function(child) {
			var data = this.data("roundabout");
			return (!data.reflect) ? 360.0 - (data.period * child) : data.period * child;
		},


		// isInFocus
		// is this roundabout currently in focus?
		isInFocus: function(degrees) {
			var diff,
			    self = this,
			    data = self.data("roundabout"),
			    bearing = methods.normalize.apply(null, [data.bearing]);

			degrees = methods.normalize.apply(null, [degrees]);
			diff = Math.abs(bearing - degrees);

			// this calculation gives a bit of room for javascript float rounding
			// errors, it looks on both 0deg and 360deg ends of the spectrum
			return (diff <= data.floatComparisonThreshold || diff >= 360 - data.floatComparisonThreshold);
		},
		
		
		// getChildInFocus
		// returns the current child in focus, or false if none are in focus
		getChildInFocus: function() {
			var data = $(this).data("roundabout");
			
			return (data.childInFocus > -1) ? data.childInFocus : false;
		},


		// compareVersions
		// compares a given version string with another
		compareVersions: function(baseVersion, compareVersion) {
			var i,
			    base = baseVersion.split(/\./i),
			    compare = compareVersion.split(/\./i),
			    maxVersionSegmentLength = (base.length > compare.length) ? base.length : compare.length;

			for (i = 0; i <= maxVersionSegmentLength; i++) {
				if (base[i] && !compare[i] && parseInt(base[i], 10) !== 0) {
					// base is higher
					return 1;
				} else if (compare[i] && !base[i] && parseInt(compare[i], 10) !== 0) {
					// compare is higher
					return -1;
				} else if (base[i] === compare[i]) {
					// these are the same, next
					continue;
				}

				if (base[i] && compare[i]) {
					if (parseInt(base[i], 10) > parseInt(compare[i], 10)) {
						// base is higher
						return 1;
					} else {
						// compare is higher
						return -1;
					}
				}
			}

			// nothing was triggered, versions are the same
			return 0;
		}
	};


	// start the plugin
	$.fn.roundabout = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === "object" || $.isFunction(method) || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("Method " + method + " does not exist for jQuery.roundabout.");
		}
	};
})(jQuery);




















/**
 * jQuery Roundabout Shapes v2
 * http://fredhq.com/projects/roundabout-shapes/
 * 
 * Provides additional paths along which items can move for the
 * jQuery Roundabout plugin (v1.0+).
 *
 * Terms of Use // jQuery Roundabout Shapes
 *
 * Open source under the BSD license
 *
 * Copyright (c) 2009-2011, Fred LeBlanc
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 * 
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above 
 *     copyright notice, this list of conditions and the following 
 *     disclaimer in the documentation and/or other materials provided 
 *     with the distribution.
 *   - Neither the name of the author nor the names of its contributors 
 *     may be used to endorse or promote products derived from this 
 *     software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 */
 
 
 
 
 
 
jQuery.extend(jQuery.roundaboutShapes,
{
	theJuggler: function(r, a, t) {	
		return {
			x: Math.sin(r + a), 
			y: Math.tan(Math.exp(Math.log(r)) + a) / (t - 1), 
			z: (Math.cos(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	figure8: function(r, a, t) {
		return {
			x: Math.sin(r * 2 + a), 
			y: (Math.sin(r + Math.PI/2 + a) / 8) * t, 
			z: (Math.cos(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	waterWheel: function(r, a, t) {
		return {
			x: (Math.sin(r + Math.PI/2 + a) / 8) * t, 
			y: Math.sin(r + a) / (Math.PI/2), 
			z: (Math.cos(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	square: function(r, a, t) {
		var sq_x, sq_y, sq_z;
		
		if (r <= Math.PI/2) {
			sq_x = (2/Math.PI) * r;
			sq_y = -(2/Math.PI) * r + 1;
			sq_z = -(1/Math.PI) * r + 1;
		} else if (r > Math.PI/2 && r <= Math.PI) {
			sq_x = -(2/Math.PI) * r + 2;
			sq_y = -(2/Math.PI) * r + 1;
			sq_z = -(1/Math.PI) * r + 1;
		} else if (r > Math.PI && r <= (3 * Math.PI) / 2) {
			sq_x = -(2/Math.PI) * r + 2;
			sq_y = (2/Math.PI) * r - 3;
			sq_z = (1/Math.PI) * r - 1;
		} else {
			sq_x = (2/Math.PI) * r - 4;
			sq_y = (2/Math.PI) * r - 3;
			sq_z = (1/Math.PI) * r - 1;
		}
		
		return {
			x: sq_x,
			y: sq_y * t, 
			z: sq_z,
			scale: sq_z
		};
	},
	conveyorBeltLeft: function(r, a, t) {
		return {
			x: -Math.cos(r + a), 
			y: (Math.cos(r + 3*Math.PI/2 + a) / 8) * t, 
			z: (Math.sin(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	conveyorBeltRight: function(r, a, t) {
		return {
			x: Math.cos(r + a), 
			y: (Math.cos(r + 3*Math.PI/2 + a) / 8) * t, 
			z: (Math.sin(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	goodbyeCruelWorld: function(r, a, t) {
		return {
			x: Math.sin(r + a), 
			y: (Math.tan(r + 3*Math.PI/2 + a) / 8) * (t + 0.5), 
			z: (Math.sin(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	diagonalRingLeft: function(r, a, t) {
		return {
			x: Math.sin(r + a), 
			y: -Math.cos(r + Math.tan(Math.cos(a))) / (t + 1.5), 
			z: (Math.cos(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	diagonalRingRight: function(r, a, t) {
		return {
			x: Math.sin(r + a), 
			y: Math.cos(r + Math.tan(Math.cos(a))) / (t + 1.5), 
			z: (Math.cos(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	rollerCoaster: function(r, a, t) {
		return {
			x: Math.sin(r + a), 
			y: Math.sin((2 + t) * r), 
			z: (Math.cos(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	tearDrop: function(r, a, t) {
		return {
			x: Math.sin(r + a), 
			y: -Math.sin(r/2 + t) + 0.35, 
			z: (Math.cos(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	tickingClock: function(r, a, t) {
		return {
			x: Math.cos(r + a - Math.PI/2),
			y: Math.sin(r + a - Math.PI/2),
			z: Math.cos(r),
			scale: Math.cos(r) + 0.5
		}
	},
	flurry: function(r, a, t) {
		return {
			x: Math.sin(r * 3 + a), 
			y: (Math.cos(r + Math.PI/2 + a) / 2) * t, 
			z: (Math.cos(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	nowSlide: function(r, a, t) {
		return {
			x: Math.tan(r * 2 + a) * 0.5, 
			y: Math.cos(r*2 + t) / 6, 
			z: (Math.cos(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	},
	risingEssence: function(r, a, t) {
		return {
			x: Math.sin(r + a), 
			y: Math.tan((2 + t) * r), 
			z: (Math.cos(r + a) + 1) / 2,
			scale: (Math.sin(r + Math.PI/2 + a) / 2) + 0.5
		};
	}
});






/**
 * jQuery Scrolling Parallax v0.1
 * http://jonraasch.com/blog/scrolling-parallax-jquery-plugin
 *
 * Copyright (c) 2009 Jon Raasch (http://jonraasch.com/)
 * Licensed under the FreeBSD License (See terms below)
 *
 * @author Jon Raasch
 *
 * @projectDescription    jQuery plugin to create a parallax effect when the page is scrolled.
 * 
 * @version 0.1.0
 * 
 * @requires jquery.js (v 1.3.2 minimum)
 *
 *
 * TERMS OF USE - jQuery Scrolling Parallax
 * Open source under the FreeBSD License.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 *    1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY JON RAASCH ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JON RAASCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the authors and should not be interpreted as representing official policies, either expressed or implied, of Jon Raasch, who is the man.
 * 
 *
 * FOR USAGE INSTRUCTIONS SEE THE DOCUMENATION AT: http://dev.jonraasch.com/scrolling-parallax/documentation
 * 
 *
 */


( function( $ ) {
    
    $.scrollingParallax = function ( box, options )
    {
        var options = options || {};
        
        // vertical options
        
        options.enableVertical = typeof( options.enableVertical ) != 'undefined' ? options.enableVertical : true;
        
        if ( options.enableVertical ) {
            options.staticSpeed = options.staticSpeed || false;
            options.staticScrollLimit = typeof(options.staticScrollLimit) != 'undefined' ? options.staticScrollLimit : true;
            
            options.loopIt = options.loopIt || false;
            
            options.reverseDirection = options.reverseDirection || false;
        }
        
        // horizontal options
        
        options.enableHorizontal = options.enableHorizontal || false;
        
        if ( options.enableHorizontal ) {
            options.staticSpeedX = options.staticSpeedX || false;
            options.staticScrollLimitX = typeof(options.staticScrollLimitX) != 'undefined' ? options.staticScrollLimitX : true;
            
            options.loopItX = options.loopItX || false;
            
            options.reverseDirectionX = options.reverseDirectionX || false;
        }
        
        // IE6 options
        
        options.disableIE6 = options.disableIE6 || false; // disables in IE6 altogether
        options.disableIE6Anim = typeof(options.disableIE6Anim) != 'undefined' ? options.disableIE6Anim : true; // disables IE6 animation, however background will still append
        
        // layout options
        
        options.bgWidth = options.bgWidth || (options.enableHorizontal ? '150%' : '100%' );
        options.bgHeight = options.bgHeight || '150%';
        
        options.bgRepeat = options.bgRepeat || false;
        
        options.appendInFront = options.appendInFront || false;
        
        options.parallaxHeight = options.parallaxHeight || false;
        options.parallaxWidth = options.parallaxWidth || false;
        
                
        var isIE6 = $.browser.msie && $.browser.version < 7 ? true : false;
        
        if ( options.disableIE6 && isIE6 ) return false;
        
        var $document = $(document);
        var $window   = $(window);
        var $box;

        var backgroundMode = false;

        if ( options.enableVertical ) {
            var boxHeight;
            var windowHeight;
            var docHeight;
            var parallaxRoom;
            var maxIE6Move = 0;
            var loopCount = 0;
            var startingPos = 0;
            var tooSmallMode = false;
            var oldMoveIt = null;
        }
        
        if ( options.enableHorizontal ) {
            var boxWidth;
            var windowWidth;
            var docWidth;
            var parallaxRoomX;
            var maxIE6MoveX = 0;
            var loopCountX = 0;
            var startingPosX = 0;
            var tooSmallModeX = false;
            var oldMoveItX = null;
        }
        
        init( box );
        
        
        
        // init( obj/string box )   :  sets up the parallax and associated events
        
        function init( box ) {
            // if string append image as background, otherwise define as jQuery object
            if ( typeof( box ) == 'string' ) $box = appendBackground( box );
            else {
                $box = $( box );
                
                $box.css('position', isIE6 ? 'absolute' : 'fixed');
                
                if ( options.enableVertical ) startingPos = parseInt( $box.css('top') );
                
                if ( options.enableHorizontal ) startingPosX = parseInt( $box.css('left') );
            }
            
            if ( options.disableIE6Anim && isIE6 ) return false;
            
            defineSizes();
            
            // if in background mode, and reverseDirection, then attch the background to the opposite end to maximize scrolling room
            if ( backgroundMode ) {
                if ( options.reverseDirection && options.enableVertical ) {
                    startingPos += -1 * parallaxRoom;
                    $box.css('top', startingPos);
                }
                
                if ( options.reverseDirectionX && options.enableHorizontal ) {
                    startingPosX += -1 * parallaxRoomX;
                    $box.css('left', startingPosX);
                }
            }
            
            // attach scroll and resize events
            
            $window.scroll( function() {
                ani();
            });
            
            $window.resize( function() {
                defineSizes();
            });
        }
        
        
        
        
        // appendBackground( string theSrc )  :   appends an image to the page as a stretched background
        
        function appendBackground( theSrc ) {
            var bgCss = {
                display:   'block',
                top:       0,
                left:      0,
                width:     options.bgWidth,
                height:    options.bgHeight,
                zIndex:    0
            };
            
            bgCss.position = isIE6 ? 'absolute' : 'fixed';
            
            if ( options.bgRepeat ) {
                var $obj = options.appendInFront ? $('<div></div>').appendTo( $('body') ) : $('<div></div>').prependTo( $('body') );
                bgCss.backgroundRepeat = 'repeat';
                bgCss.backgroundImage  = 'url("' + theSrc + '")';
            }
            else {
                var $obj = options.appendInFront ? $('<img />').appendTo( $('body') ) : $('<img />').prependTo( $('body') );
                $obj.attr('src', theSrc);
            }
            
            
            $obj.css( bgCss );
            
            backgroundMode = true;
            
            return $obj;
        }
        
        
        
        
        // defineSizes()  :  sets up various constants used by the app - must be set on page load and on screen resize
        
        function defineSizes() {
        
            // define vertical vars
            
            if ( options.enableVertical ) {
                boxHeight = $box.height();
                windowHeight = $window.height();
                docHeight = $document.height();
                
                parallaxRoom = ( options.parallaxHeight || boxHeight ) - windowHeight;
                
                // if parallax object is smaller than window size
                if ( parallaxRoom < 0 ) {
                    if ( options.staticSpeed ) parallaxRoom = windowHeight -  boxHeight;
                    else parallaxRoom = options.reverseDirection ? windowHeight - startingPos - boxHeight : startingPos;
                    
                    tooSmallMode = true;
                }
                
                if ( isIE6 && !maxIE6Move ) maxIE6Move =  -1 * ( docHeight - boxHeight );
                
                if ( options.loopIt ) loopCount = parseInt( $document.scrollTop() / ( tooSmallMode ? windowHeight : boxHeight ) );
            }
            
            // define horizontal vars

            if ( options.enableHorizontal ) {
                boxWidth = $box.width();
                windowWidth = $window.width();
                docWidth = $document.width();
                
                parallaxRoomX = ( options.parallaxWidth || boxWidth ) - windowWidth;
            
                // if parallax object is smaller than window size
                if ( parallaxRoomX < 0 ) {
                    parallaxRoomX = options.staticSpeedX ? windowWidth - boxWidth : options.reverseDirectionX ? windowWidth - startingPosX - boxWidth : startingPosX;
                    
                    tooSmallModeX = true;
                }
                
                if ( isIE6 && !maxIE6MoveX ) maxIE6MoveX =  -1 * ( docWidth - boxWidth );
                
                if ( options.loopItX ) loopCountX = parseInt( $document.scrollLeft() / ( tooSmallModeX ? windowWidth : boxWidth ) );
            }
            
            // make any changes
            ani();
        }
        
        
        
        // ani()  :  performs the animation of the object
        
        function ani() {
            
            // dont let multiple animations queue up
            $box.queue( [ ] );
            
            var theCss = {};
            
            
            // vertical
            if ( options.enableVertical ) {
            
                var moveIt = calculateMove(true);
                
                theCss.top = moveIt;
            }

            
            // horizontal
            if ( options.enableHorizontal ) {
                
                var moveItX = calculateMove(false);
                
                theCss.left = moveItX;
            }
            
            // if large move animate in FF, safari and opera for smoother transition
            if ( !$.browser.msie && ( Math.abs( oldMoveIt - moveIt ) > 100 || Math.abs( oldMoveItX - moveItX ) > 100 ) ) $box.animate(theCss, 30);
            else $box.css(theCss);
            
            oldMoveIt = moveIt;
            oldMoveItX = moveItX;

        }
        
        
        
        // calculateMove( boolean vertical ) : determines amount to move whether vertically or horizontally
        
        function calculateMove( vertical ) {
            // establish variables, this is basically a switch between vertical and horizontal modes
            if ( vertical ) {
                var offset =  $document.scrollTop();
                var docSize = docHeight;
                var windowSize = windowHeight;
                var boxSize = boxHeight;
                
                var parallaxRoom2 = parallaxRoom;
                
                var loopCount2 = loopCount;
                var startingPos2 = startingPos;
                var parallaxRoom2 = parallaxRoom;
                var tooSmallMode2 = tooSmallMode;
                var maxIE6Move2 = maxIE6Move;
                
                var opts = {
                    reverseDirection : options.reverseDirection,
                    staticSpeed : options.staticSpeed,
                    loopIt : options.loopIt,
                    staticScrollLimit : options.staticScrollLimit
                }
            }
            else {
                var offset = $document.scrollLeft();
                var docSize = docWidth;
                var windowSize = windowWidth;
                var boxSize = boxWidth;
                
                var loopCount2 = loopCountX;
                var startingPos2 = startingPosX;
                var parallaxRoom2 = parallaxRoomX;
                var tooSmallMode2 = tooSmallModeX;
                var maxIE6Move2 = maxIE6MoveX;
                
                var opts = {
                    reverseDirection : options.reverseDirectionX,
                    staticSpeed : options.staticSpeedX,
                    loopIt : options.loopItX,
                    staticScrollLimit : options.staticScrollLimitX
                }
            }
            
            /*** get move amount - static speed ***/
            
            if ( opts.staticSpeed ) {
                var move = offset * opts.staticSpeed;

                // account for number of loops
                move -= parallaxRoom2 * ( loopCount2 );
            }
            
            /*** get move amount - auto speed ***/
            
            else {
                // determine percentage of page that has been scrolled down
                var offsetPercent = offset / ( docSize - windowSize );
                
                /*
                var moveIt = ( $.browser.msie && $.browser.version < 7 ) 
                    ? -1 * ( offsetParent * parallaxRoom + offsetTop )
                    : -1 * offsetPercent * parallaxRoom;
                */
                
                var move = offsetPercent * parallaxRoom2;
            }
            
            // reverse direction
            if ( !opts.reverseDirection ) move *= -1;
            
            // incorporate starting position
            move += startingPos2;
            
            // if static speed set, make sure move is within bounds
            if ( opts.staticSpeed ) move = checkMove( move, vertical, opts, parallaxRoom2, tooSmallMode2 );
            
            
            // if in tooSmallMode and looping, add difference of window height and box height, since the box needs to be conceptualized as that much taller ( otherwise it would loop in place rather than over the screen )
            if ( tooSmallMode2 && opts.staticSpeed && opts.loopIt ) move += windowSize - boxSize;
            
            if ( isIE6 ) {
                // IE6 fix for fixed positioning
                move += offset;
                move = Math.max( parseInt(move), parseInt(maxIE6Move2) );
            }
            
            return move;
        }
        
        
        
        // checkMove( int moveIt )  :  checks to ensure that move amount does not exceed established bounds
        
        function checkMove( move, vertical, opts, parallaxRoom, tooSmallMode ) {

            // if overflow limited
            if ( !opts.loopIt ) {
                if ( opts.staticScrollLimit ){
                    if ( tooSmallMode ) {
                        if ( move < 0 ) move = 0;
                        if ( move > parallaxRoom ) move = parallaxRoom;
                    }
                    else {
                        if ( move > 0 ) move = 0;
                        if ( -1 * move > parallaxRoom ) move = -1 * parallaxRoom;
                    }
                }
            }
            
            // if overflow loops
            else {
                while ( move < parallaxRoom ) {
                    move += parallaxRoom;
                    
                    var loopCountChange = opts.reverseDirection ? -1 : 1;
                    
                    if ( vertical ) loopCount += loopCountChange;
                    else loopCountX += loopCountChange;
                }
                
                while ( move > ( opts.reverseDirection ? -1 : 0 ) ) {
                    move -= parallaxRoom;
                    
                    var loopCountChange = opts.reverseDirection ? -1 : 1;
                    
                    if ( vertical ) loopCount -= loopCountChange;
                    else loopCountX -= loopCountChange;
                }
            }
            
            return move;
        }
    };
    
    $.fn.scrollingParallax = function ( options )
    {
        
        this.each( function() 
            {
                new $.scrollingParallax( this, options );
            }
        );
        
        return this;
    };
})( jQuery );












/************************************************************/
//Class GetSet
//Purpose: Creates dynamic getters and setters
/************************************************************/

var GetSet = {};

//=========================================================//
//Public Method override
//Purpose: Override default values through iteration
//Parameters:
//  obj: The object whose default values will be overridden
//Postcondition: options Object is altered
//=========================================================//
GetSet.override = function(options, defaults)
{
    //Store this scope
    var $this = options;
    
    
    for (var i in defaults)
    {
        if(!($this[i]))
        {
            $this[i] = defaults[i];
        }        
    }
};

//=========================================================//
//Public getFunctions
//Purpose: Copies one objects functions to another
//Parameters:
//  template: The object whose method will be copied
//  recepient: The object receiving the template methods
//Postcondition: recepient object is altered
//=========================================================//
GetSet.getFunctions = function(template, recepient)
{    
    for (var i in template)
    {
        if(template[i].constructor == Function)
        {
            recepient[i] = template[i];
        }
    }
};


//=========================================================//
//Public Method gettters
//Purpose: Dynamically creates accessor methods(getters)
//Parameters: 
//  scope: The scope in which the accessor methods will be
//         applied
//  prefix: Goes before the property. i.e. (get)Name
//  camel: whether to induce camel case
//  obj: Accessors
//Postcondition: scope has been altered to include
//accessor methods
//=========================================================//
GetSet.getters = function(options)
{   
    //Over-ride default values
    var defaults =
    {
        prefix: "get",
        camel: true
    };
    
    //Override defaults values
    GetSet.override(options, defaults);
    
    //If prefix is set to 'none', force blank. A blank string as a parameter
    //evaluates to null for some reason.
    options.prefix = (options.prefix === "none") ? "" : options.prefix;
    
    //Iterate through the properties of the object
    var str;
    for ( var i in options.obj )
    {
        //If camel case is enabled and no blank prefix
        if(options.camel && options.prefix != "")
        {
            str = i.charAt(0).toUpperCase() + i.substr(1);
        }
        else
        {
            str = i;
        }
        (function(i)
        {
                // Dynamically create an accessor method
                options.scope[ options.prefix + str ] = function()
                {
                        return options.obj[i];
                };  
            })(i);
    }
};

//=========================================================//
//Public Method setters
//Purpose: Dynamically creates muator methods(setters)
//Parameters: 
//  scope: The scope in which the mutator methods will be
//         applied
//  prefix: Goes before the property. i.e. (set)Name
//  camel: whether to induce camel case
//  obj: The object that will have mutators
//Postcondition: scope has been altered to include mutator
//methods
//=========================================================//
GetSet.setters = function(options)
{
    //Over-ride default values
    var defaults =
    {
        prefix: "set",
        camel: true
    };
    
    //Override defaults values
    GetSet.override(options, defaults);
    
    //If prefix is set to 'none', force blank. A blank string as a parameter
    //evaluates to null for some reason.
    options.prefix = (options.prefix === "none") ? "" : options.prefix;    
    
    //Iterate through the properties of the object
    var str;
    for ( var i in options.obj )
    {
        //If camel case is enabled and no blank prefix
        if(options.camel && options.prefix != "")
        {
            str = i.charAt(0).toUpperCase() + i.substr(1);
        }
        else
        {
            str = i;
        }
        (function(i)
        {
                // Dynamically create an accessor method
                options.scope[ options.prefix + str ] = function(val)
                {
                       options.obj[i] = val;
                };  
            })(i);
    }
};



















/*****************************************************************************/
// Class Scroller
// Purpose: Create a fixed scroller
// Parameters:
//  obj: The object that will be scrolling
//  start: What distance from the top (in px) the effect starts
//  end: What distance from the top (in px) the effect ends
//  interval: What scroll distance triggers the callback
//  range: How many pixels after the
//  margin: Margin from the top of the browser
//  distance: How far the obj will move
// Dependencies:
//  GetSet class. Included in Vert Library @ http://vertstudios.com/vertlib.js
/******************************************************************************/

function StickyScroller(obj, options)
{        
    //Store function scope
    var $this = this;
    
    //Store initial top and left/right values
    var top = $(obj).css('top');
    var left = $(obj).css('left');
    var right = $(obj).css('right');
    
    var scroll = 0;
    var tempScroll = 0;
    
    //------------------------------------------------------------
    // Set default property values
    //------------------------------------------------------------
    var defaults = {
    start: 0,
    end: 1000,
    interval: 400,
    margin: parseInt(top, 10),
    range: 400
    },	settings = jQuery.extend(defaults,options);
    obj = $(obj);
    
    settings.index = 0;
    settings.oldIndex = 0;

    //Accessors for settings
    GetSet.getters({scope: $this, obj: settings});
    
    //------------------------------------------------------------//
    //                      Callback Functions                    //
    //------------------------------------------------------------//
    var Callback = {};
    
    Callback.newIndex = function(){};  //When the index changes
    Callback.limbo = function(){};     //When scroller not in range
    Callback.scroll = function(){};    //On window scroll
    
    //Get setters for Callback functions
    GetSet.setters({scope: this, prefix: "on", obj: Callback});   
    
    //=========================================================//
    //Public distanceFrom
    //Purpose: Determines the distance in pixels between
    //         the scroller and an index
    //Parameters:
    //  index: The index whose distance from scroller will be calculated
    //Postcondition: Returns an integer
    //=========================================================//
    this.distanceFrom = function(index)
    {        
        tempScroll = $(window).scrollTop();
        
        //Check for both references: "Top" of the range and "bottom"
        var top = index*settings.interval;
        var bottom = index*settings.interval + settings.range;
        
        var distanceFromTop = Math.abs(tempScroll-top);
        var distanceFromBottom = Math.abs(tempScroll-bottom);
        
        //Return the smallest distance
        if(distanceFromTop < distanceFromBottom)
        {
            return distanceFromTop;
        }
        else
        {
            return distanceFromBottom;
        }        
    };
    
    //=========================================================//
    //Public closestIndex
    //Purpose: Determines the closest index
    //Postcondition: Returns the closest index as an integer
    //=========================================================//
    this.closestIndex = function()
    {
        //If index is 0, automatically return 1
        if(settings.index === 0)
        {
            return 1;
        }        
        
        //Distance from next/previous index
        var dPrev = this.distanceFrom(settings.index-1);
        var dNext = this.distanceFrom(settings.index+1);
        
        //Return the index associated with the smallest distance
        if(dPrev <= dNext)
        {
            return settings.index-1;
        }
        else
        {
            return settings.index+1;
        }
    };
    
    //=========================================================//
    //Private getIndex
    //Purpose: returns index
    //=========================================================//
    var getIndex = function()
    {        
        tempScroll = $(window).scrollTop() + settings.margin;        
        
        //Make sure movement would be in the bounds
        if(tempScroll > settings.start && tempScroll < settings.end)
        {                                       
            //Possible new index
            tempIndex = Math.floor((tempScroll-settings.start)/settings.interval);
            
            //Make sure the index is different before reassigning
            //or executing the callback
            if(tempIndex !== settings.index)
            {
                //Store old index
                settings.oldIndex = settings.index;                
                
                //Assign new index
                settings.index = tempIndex;                
            }
        }
        //If tempScroll goes beyond end mark, set distance at end mark
        else if(tempScroll >= settings.end)
        {
            settings.oldIndex = settings.index;
            settings.index = Math.floor((settings.end-settings.start)/settings.interval);
        }
        //If tempScroll goes beyond beginning mark, set distance at start
        else
        {
            settings.oldIndex = settings.index;
            settings.index = 0;
        }        
    };
    
    //=========================================================//
    //Public firstIndex
    //Purpose: Returns first index
    //Postcondition: Returns an integer
    //=========================================================//
    this.firstIndex = function()
    {
        return 0;
    };
    
    //=========================================================//
    //Public lastIndex
    //Purpose: Returns last index
    //Postcondition: Returns an integer
    //=========================================================//
    this.lastIndex = function()
    {
        return Math.floor((settings.end-settings.start)/settings.interval);
    };
    
    //=========================================================//
    //Public inRange
    //Purpose: Determines if the scroller is in interval range
    //Postcondition: Returns boolean
    //=========================================================//
    this.inRange = function()
    {      
        var scroll = $(window).scrollTop() - settings.start + settings.margin;        
        
        var inRange = (scroll >= settings.index * settings.interval) &&
        (scroll <= (settings.index*settings.interval + settings.range));

        return inRange;
    };
    
    
    //------------------------------------------------------------//
    //                    On Browser Scroll                       //
    //------------------------------------------------------------//    
    var wrap = $('<div id="scrollcontainer">').css(
    {
        width: obj.width(),
        height: obj.height(),
        position: "absolute"
    });

    obj.wrap(wrap);
    
    $(window).scroll(function()
    {
        scroll = $(window).scrollTop() + settings.margin;
        
        //Get the current index
        getIndex();
                            
        //If scroll less than beginning, set back to beginning
        if(scroll < settings.start)
        {
           $(obj).css({
            position : 'absolute',
            top: 0,
            left: 0,
            right: 0});
           
           $("#scrollcontainer").css({
            position : 'absolute',
            top: settings.start,
            left: left,
            right: right});
        }
        
        //If scroll greater than ending position, set to end
        else if(scroll > settings.end) 
        {
           $(obj).css({
            position : 'absolute',
            top: 0,
            left: 0,
            right: 0});
           
           $("#scrollcontainer").css({
            position : 'absolute',
            top: settings.end,
            left: left,
            right: right});
           
        }
        
        //Make sure we stay in the specified boundaries
        else
        {
            //Put back to fixed
            $(obj).css({
            position : 'fixed',
            top: settings.margin,
            left: left,
            right: right});
        }        
                                    
        //If in the specified range and a new index, do the callback        
        if(settings.oldIndex !== settings.index)
        {
           Callback.newIndex(settings.index);
        }
        
        //Do the "limbo" call back, which is a callback that executes when
        //the scroller is not in the range, but still between start and end
        if( !$this.inRange() && scroll > settings.start && scroll < settings.end )
        {
           Callback.limbo(settings.index);
        }
        
        //Do the scroll callback regardless of what happens
        Callback.scroll(settings.index);
    });
}





(function (a) { a.widget("thomaskahn.smoothDivScroll", { options: { scrollingHotSpotLeftClass: "scrollingHotSpotLeft", scrollingHotSpotRightClass: "scrollingHotSpotRight", scrollableAreaClass: "scrollableArea", scrollWrapperClass: "scrollWrapper", hiddenOnStart: false, ajaxContentURL: "", countOnlyClass: "", startAtElementId: "", hotSpotScrolling: true, hotSpotScrollingStep: 15, hotSpotScrollingInterval: 10, hotSpotMouseDownSpeedBooster: 3, visibleHotSpotBackgrounds: "onstart", hotSpotsVisibleTime: 5000, easingAfterHotSpotScrolling: true, easingAfterHotSpotScrollingDistance: 10, easingAfterHotSpotScrollingDuration: 300, easingAfterHotSpotScrollingFunction: "easeOutQuart", mousewheelScrolling: false, mousewheelScrollingStep: 70, easingAfterMouseWheelScrolling: true, easingAfterMouseWheelScrollingDuration: 300, easingAfterMouseWheelScrollingFunction: "easeOutQuart", manualContinuousScrolling: false, autoScrollingMode: "", autoScrollingDirection: "endlessloopright", autoScrollingStep: 1, autoScrollingInterval: 10, scrollToAnimationDuration: 1000, scrollToEasingFunction: "easeOutQuart" }, _create: function () { var b = this, d = this.options, c = this.element; c.wrapInner("<div class='" + d.scrollableAreaClass + "'>").wrapInner("<div class='" + d.scrollWrapperClass + "'>"); c.prepend("<div class='" + d.scrollingHotSpotLeftClass + "'></div><div class='" + d.scrollingHotSpotRightClass + "'></div>"); c.data("scrollWrapper", c.find("." + d.scrollWrapperClass)); c.data("scrollingHotSpotRight", c.find("." + d.scrollingHotSpotRightClass)); c.data("scrollingHotSpotLeft", c.find("." + d.scrollingHotSpotLeftClass)); c.data("scrollableArea", c.find("." + d.scrollableAreaClass)); c.data("speedBooster", 1); c.data("scrollXPos", 0); c.data("hotSpotWidth", c.data("scrollingHotSpotLeft").innerWidth()); c.data("scrollableAreaWidth", 0); c.data("startingPosition", 0); c.data("rightScrollingInterval", null); c.data("leftScrollingInterval", null); c.data("autoScrollingInterval", null); c.data("hideHotSpotBackgroundsInterval", null); c.data("previousScrollLeft", 0); c.data("pingPongDirection", "right"); c.data("getNextElementWidth", true); c.data("swapAt", null); c.data("startAtElementHasNotPassed", true); c.data("swappedElement", null); c.data("originalElements", c.data("scrollableArea").children(d.countOnlyClass)); c.data("visible", true); c.data("enabled", true); c.data("scrollableAreaHeight", c.data("scrollableArea").height()); c.data("scrollerOffset", c.offset()); c.data("initialAjaxContentLoaded", false); c.data("scrollingHotSpotRight").bind("mousemove", function (g) { var f = g.pageX - (this.offsetLeft + c.data("scrollerOffset").left); c.data("scrollXPos", Math.round((f / c.data("hotSpotWidth")) * d.hotSpotScrollingStep)); if (c.data("scrollXPos") === Infinity) { c.data("scrollXPos", 0) } }); c.data("scrollingHotSpotRight").bind("mouseover", function () { c.data("scrollWrapper").stop(true, false); b.stopAutoScrolling(); c.data("rightScrollingInterval", setInterval(function () { if (c.data("scrollXPos") > 0 && c.data("enabled")) { c.data("scrollWrapper").scrollLeft(c.data("scrollWrapper").scrollLeft() + (c.data("scrollXPos") * c.data("speedBooster"))); if (d.manualContinuousScrolling) { b._checkContinuousSwapRight() } b._showHideHotSpots() } }, d.hotSpotScrollingInterval)); b._trigger("mouseOverRightHotSpot") }); c.data("scrollingHotSpotRight").bind("mouseout", function () { clearInterval(c.data("rightScrollingInterval")); c.data("scrollXPos", 0); if (d.easingAfterHotSpotScrolling && c.data("enabled")) { c.data("scrollWrapper").animate({ scrollLeft: c.data("scrollWrapper").scrollLeft() + d.easingAfterHotSpotScrollingDistance }, { duration: d.easingAfterHotSpotScrollingDuration, easing: d.easingAfterHotSpotScrollingFunction }) } }); c.data("scrollingHotSpotRight").bind("mousedown", function () { c.data("speedBooster", d.hotSpotMouseDownSpeedBooster) }); a("body").bind("mouseup", function () { c.data("speedBooster", 1) }); c.data("scrollingHotSpotLeft").bind("mousemove", function (g) { var f = ((this.offsetLeft + c.data("scrollerOffset").left + c.data("hotSpotWidth")) - g.pageX); c.data("scrollXPos", Math.round((f / c.data("hotSpotWidth")) * d.hotSpotScrollingStep)); if (c.data("scrollXPos") === Infinity) { c.data("scrollXPos", 0) } }); c.data("scrollingHotSpotLeft").bind("mouseover", function () { c.data("scrollWrapper").stop(true, false); b.stopAutoScrolling(); c.data("leftScrollingInterval", setInterval(function () { if (c.data("scrollXPos") > 0 && c.data("enabled")) { c.data("scrollWrapper").scrollLeft(c.data("scrollWrapper").scrollLeft() - (c.data("scrollXPos") * c.data("speedBooster"))); if (d.manualContinuousScrolling) { b._checkContinuousSwapLeft() } b._showHideHotSpots() } }, d.hotSpotScrollingInterval)); b._trigger("mouseOverLeftHotSpot") }); c.data("scrollingHotSpotLeft").bind("mouseout", function () { clearInterval(c.data("leftScrollingInterval")); c.data("scrollXPos", 0); if (d.easingAfterHotSpotScrolling && c.data("enabled")) { c.data("scrollWrapper").animate({ scrollLeft: c.data("scrollWrapper").scrollLeft() - d.easingAfterHotSpotScrollingDistance }, { duration: d.easingAfterHotSpotScrollingDuration, easing: d.easingAfterHotSpotScrollingFunction }) } }); c.data("scrollingHotSpotLeft").bind("mousedown", function () { c.data("speedBooster", d.hotSpotMouseDownSpeedBooster) }); c.data("scrollableArea").mousewheel(function (e, g) { if (c.data("enabled") && d.mousewheelScrolling) { e.preventDefault(); b.stopAutoScrolling(); var f = Math.round(d.mousewheelScrollingStep * g); b.move(f) } }); if (d.mousewheelScrolling) { c.data("scrollingHotSpotLeft").add(c.data("scrollingHotSpotRight")).mousewheel(function (e, f) { e.preventDefault() }) } a(window).bind("resize", function () { b._showHideHotSpots(); b._trigger("windowResized") }); if (d.ajaxContentURL.length > 0) { b.changeContent(d.ajaxContentURL, "", "html", "replace") } else { b.recalculateScrollableArea() } if (d.autoScrollingMode !== "always") { switch (d.visibleHotSpotBackgrounds) { case "always": b.showHotSpotBackgrounds(); break; case "onstart": b.showHotSpotBackgrounds(); c.data("hideHotSpotBackgroundsInterval", setTimeout(function () { b.hideHotSpotBackgrounds("slow") }, d.hotSpotsVisibleTime)); break; default: break } } if (d.hiddenOnStart) { b.hide() } a(window).load(function () { if (!(d.hiddenOnStart)) { b.recalculateScrollableArea() } if ((d.autoScrollingMode.length > 0) && !(d.hiddenOnStart)) { b.startAutoScrolling() } }) }, _setOption: function (c, e) { var b = this, f = this.options, d = this.element; f[c] = e; if (c === "hotSpotScrolling") { if (e === true) { b._showHideHotSpots() } else { d.data("scrollingHotSpotLeft").hide(); d.data("scrollingHotSpotRight").hide() } } else { if (c === "autoScrollingStep" || c === "easingAfterHotSpotScrollingDistance" || c === "easingAfterHotSpotScrollingDuration" || c === "easingAfterMouseWheelScrollingDuration") { f[c] = parseInt(e, 10) } else { if (c === "autoScrollingInterval") { f[c] = parseInt(e, 10); b.startAutoScrolling() } } } }, showHotSpotBackgrounds: function (c) { var b = this, d = this.element; if (c !== undefined) { d.data("scrollingHotSpotLeft").add(d.data("scrollingHotSpotRight")).css("opacity", "0.0"); d.data("scrollingHotSpotLeft").addClass("scrollingHotSpotLeftVisible"); d.data("scrollingHotSpotRight").addClass("scrollingHotSpotRightVisible"); d.data("scrollingHotSpotLeft").add(d.data("scrollingHotSpotRight")).fadeTo(c, 0.35) } else { d.data("scrollingHotSpotLeft").addClass("scrollingHotSpotLeftVisible"); d.data("scrollingHotSpotLeft").removeAttr("style"); d.data("scrollingHotSpotRight").addClass("scrollingHotSpotRightVisible"); d.data("scrollingHotSpotRight").removeAttr("style") } b._showHideHotSpots() }, hideHotSpotBackgrounds: function (b) { var c = this.element; if (b !== undefined) { c.data("scrollingHotSpotLeft").fadeTo(b, 0, function () { c.data("scrollingHotSpotLeft").removeClass("scrollingHotSpotLeftVisible") }); c.data("scrollingHotSpotRight").fadeTo(b, 0, function () { c.data("scrollingHotSpotRight").removeClass("scrollingHotSpotRightVisible") }) } else { c.data("scrollingHotSpotLeft").removeClass("scrollingHotSpotLeftVisible").removeAttr("style"); c.data("scrollingHotSpotRight").removeClass("scrollingHotSpotRightVisible").removeAttr("style") } }, _showHideHotSpots: function () { var b = this, c = this.element, d = this.options; if (d.manualContinuousScrolling && d.hotSpotScrolling) { c.data("scrollingHotSpotLeft").show(); c.data("scrollingHotSpotRight").show() } else { if (d.autoScrollingMode !== "always" && d.hotSpotScrolling) { if (c.data("scrollableAreaWidth") <= (c.data("scrollWrapper").innerWidth())) { c.data("scrollingHotSpotLeft").hide(); c.data("scrollingHotSpotRight").hide() } else { if (c.data("scrollWrapper").scrollLeft() === 0) { c.data("scrollingHotSpotLeft").hide(); c.data("scrollingHotSpotRight").show(); b._trigger("scrollerLeftLimitReached"); clearInterval(c.data("leftScrollingInterval")); c.data("leftScrollingInterval", null) } else { if (c.data("scrollableAreaWidth") <= (c.data("scrollWrapper").innerWidth() + c.data("scrollWrapper").scrollLeft())) { c.data("scrollingHotSpotLeft").show(); c.data("scrollingHotSpotRight").hide(); b._trigger("scrollerRightLimitReached"); clearInterval(c.data("rightScrollingInterval")); c.data("rightScrollingInterval", null) } else { c.data("scrollingHotSpotLeft").show(); c.data("scrollingHotSpotRight").show() } } } } else { c.data("scrollingHotSpotLeft").hide(); c.data("scrollingHotSpotRight").hide() } } }, _setElementScrollPosition: function (g, c) { var b = this, d = this.element, f = this.options, e = 0; switch (g) { case "first": d.data("scrollXPos", 0); return true; case "start": if (f.startAtElementId !== "") { if (d.data("scrollableArea").has("#" + f.startAtElementId)) { e = a("#" + f.startAtElementId).position().left; d.data("scrollXPos", e); return true } } return false; case "last": d.data("scrollXPos", (d.data("scrollableAreaWidth") - d.data("scrollWrapper").innerWidth())); return true; case "number": if (!(isNaN(c))) { e = d.data("scrollableArea").children(f.countOnlyClass).eq(c - 1).position().left; d.data("scrollXPos", e); return true } return false; case "id": if (c.length > 0) { if (d.data("scrollableArea").has("#" + c)) { e = a("#" + c).position().left; d.data("scrollXPos", e); return true } } return false; default: return false } }, jumpToElement: function (b, d) { var c = this, e = this.element; if (e.data("enabled")) { if (c._setElementScrollPosition(b, d)) { e.data("scrollWrapper").scrollLeft(e.data("scrollXPos")); c._showHideHotSpots(); switch (b) { case "first": c._trigger("jumpedToFirstElement"); break; case "start": c._trigger("jumpedToStartElement"); break; case "last": c._trigger("jumpedToLastElement"); break; case "number": c._trigger("jumpedToElementNumber", null, { elementNumber: d }); break; case "id": c._trigger("jumpedToElementId", null, { elementId: d }); break; default: break } } } }, scrollToElement: function (c, d) { var b = this, e = this.element, g = this.options, f = false; if (e.data("enabled")) { if (b._setElementScrollPosition(c, d)) { if (e.data("autoScrollingInterval") !== null) { b.stopAutoScrolling(); f = true } e.data("scrollWrapper").stop(true, false); e.data("scrollWrapper").animate({ scrollLeft: e.data("scrollXPos") }, { duration: g.scrollToAnimationDuration, easing: g.scrollToEasingFunction, complete: function () { if (f) { b.startAutoScrolling() } b._showHideHotSpots(); switch (c) { case "first": b._trigger("scrolledToFirstElement"); break; case "start": b._trigger("scrolledToStartElement"); break; case "last": b._trigger("scrolledToLastElement"); break; case "number": b._trigger("scrolledToElementNumber", null, { elementNumber: d }); break; case "id": b._trigger("scrolledToElementId", null, { elementId: d }); break; default: break } } }) } } }, move: function (e) { var b = this, c = this.element, d = this.options; c.data("scrollWrapper").stop(true, true); if ((e < 0 && c.data("scrollWrapper").scrollLeft() > 0) || (e > 0 && c.data("scrollableAreaWidth") > (c.data("scrollWrapper").innerWidth() + c.data("scrollWrapper").scrollLeft()))) { if (d.easingAfterMouseWheelScrolling) { c.data("scrollWrapper").animate({ scrollLeft: c.data("scrollWrapper").scrollLeft() + e }, { duration: d.easingAfterMouseWheelScrollingDuration, easing: d.easingAfterMouseWheelFunction, complete: function () { b._showHideHotSpots(); if (d.manualContinuousScrolling) { if (e > 0) { b._checkContinuousSwapRight() } else { b._checkContinuousSwapLeft() } } } }) } else { c.data("scrollWrapper").scrollLeft(c.data("scrollWrapper").scrollLeft() + e); b._showHideHotSpots(); if (d.manualContinuousScrolling) { if (e > 0) { b._checkContinuousSwapRight() } else { b._checkContinuousSwapLeft() } } } } }, changeContent: function (f, g, b, d) { var c = this, e = this.element; switch (g) { case "flickrFeed": a.getJSON(f, function (k) { var i = [{ size: "small square", pixels: 75, letter: "_s" }, { size: "thumbnail", pixels: 100, letter: "_t" }, { size: "small", pixels: 240, letter: "_m" }, { size: "medium", pixels: 500, letter: "" }, { size: "medium 640", pixels: 640, letter: "_z" }, { size: "large", pixels: 1024, letter: "_b"}]; var p = []; var l = []; var m = []; var h; var j = k.items.length; var n = 0; if (e.data("scrollableAreaHeight") <= 75) { h = 0 } else { if (e.data("scrollableAreaHeight") <= 100) { h = 1 } else { if (e.data("scrollableAreaHeight") <= 240) { h = 2 } else { if (e.data("scrollableAreaHeight") <= 500) { h = 3 } else { if (e.data("scrollableAreaHeight") <= 640) { h = 4 } else { h = 5 } } } } } a.each(k.items, function (r, s) { o(s, h) }); function o(u, s) { var v = u.media.m; var r = v.replace("_m", i[s].letter); var t = a("<img />").attr("src", r); t.load(function () { if (this.height < e.data("scrollableAreaHeight")) { if ((s + 1) < i.length) { o(u, s + 1) } else { q(this) } } else { q(this) } if (n === j) { switch (b) { case "add": if (d === "first") { e.data("scrollableArea").children(":first").before(p) } else { e.data("scrollableArea").children(":last").after(p) } break; default: e.data("scrollableArea").html(p); break } if (e.data("initialAjaxContentLoaded")) { c.recalculateScrollableArea() } else { e.data("initialAjaxContentLoaded", true) } c._showHideHotSpots(); c._trigger("addedFlickrContent", null, { addedElementIds: l }) } }) } function q(t) { var u = e.data("scrollableAreaHeight") / t.height; var r = Math.round(t.width * u); var s = a(t).attr("src").split("/"); var v = (s.length - 1); s = s[v].split("."); a(t).attr("id", s[0]); a(t).css({ height: e.data("scrollableAreaHeight"), width: r }); l.push(s[0]); p.push(t); n++ } }); break; default: a.get(f, function (h) { switch (b) { case "add": if (d === "first") { e.data("scrollableArea").children(":first").before(h) } else { e.data("scrollableArea").children(":last").after(h) } break; default: e.data("scrollableArea").html(h); break } if (e.data("initialAjaxContentLoaded")) { c.recalculateScrollableArea() } else { e.data("initialAjaxContentLoaded", true) } c._showHideHotSpots(); c._trigger("addedHtmlContent") }) } }, recalculateScrollableArea: function () { var b = 0, f = false, e = this.options, d = this.element, c = this; d.data("scrollableArea").children(e.countOnlyClass).each(function () { if ((e.startAtElementId.length > 0) && ((a(this).attr("id")) === e.startAtElementId)) { d.data("startingPosition", b); f = true } b = b + a(this).outerWidth(true) }); if (!(f)) { d.data("startAtElementId", "") } d.data("scrollableAreaWidth", b); d.data("scrollableArea").width(d.data("scrollableAreaWidth")); d.data("scrollWrapper").scrollLeft(d.data("startingPosition")); d.data("scrollXPos", d.data("startingPosition")) }, stopAutoScrolling: function () { var b = this, c = this.element; if (c.data("autoScrollingInterval") !== null) { clearInterval(c.data("autoScrollingInterval")); c.data("autoScrollingInterval", null); b._showHideHotSpots(); b._trigger("autoScrollingStopped") } }, startAutoScrolling: function () { var b = this, c = this.element, d = this.options; if (c.data("enabled")) { b._showHideHotSpots(); clearInterval(c.data("autoScrollingInterval")); c.data("autoScrollingInterval", null); b._trigger("autoScrollingStarted"); c.data("autoScrollingInterval", setInterval(function () { if (!(c.data("visible")) || (c.data("scrollableAreaWidth") <= (c.data("scrollWrapper").innerWidth()))) { clearInterval(c.data("autoScrollingInterval")); c.data("autoScrollingInterval", null) } else { c.data("previousScrollLeft", c.data("scrollWrapper").scrollLeft()); switch (d.autoScrollingDirection) { case "right": c.data("scrollWrapper").scrollLeft(c.data("scrollWrapper").scrollLeft() + d.autoScrollingStep); if (c.data("previousScrollLeft") === c.data("scrollWrapper").scrollLeft()) { b._trigger("autoScrollingRightLimitReached"); clearInterval(c.data("autoScrollingInterval")); c.data("autoScrollingInterval", null); b._trigger("autoScrollingIntervalStopped") } break; case "left": c.data("scrollWrapper").scrollLeft(c.data("scrollWrapper").scrollLeft() - d.autoScrollingStep); if (c.data("previousScrollLeft") === c.data("scrollWrapper").scrollLeft()) { b._trigger("autoScrollingLeftLimitReached"); clearInterval(c.data("autoScrollingInterval")); c.data("autoScrollingInterval", null); b._trigger("autoScrollingIntervalStopped") } break; case "backandforth": if (c.data("pingPongDirection") === "right") { c.data("scrollWrapper").scrollLeft(c.data("scrollWrapper").scrollLeft() + (d.autoScrollingStep)) } else { c.data("scrollWrapper").scrollLeft(c.data("scrollWrapper").scrollLeft() - (d.autoScrollingStep)) } if (c.data("previousScrollLeft") === c.data("scrollWrapper").scrollLeft()) { if (c.data("pingPongDirection") === "right") { c.data("pingPongDirection", "left"); b._trigger("autoScrollingRightLimitReached") } else { c.data("pingPongDirection", "right"); b._trigger("autoScrollingLeftLimitReached") } } break; case "endlessloopright": c.data("scrollWrapper").scrollLeft(c.data("scrollWrapper").scrollLeft() + d.autoScrollingStep); b._checkContinuousSwapRight(); break; case "endlessloopleft": c.data("scrollWrapper").scrollLeft(c.data("scrollWrapper").scrollLeft() - d.autoScrollingStep); b._checkContinuousSwapLeft(); break; default: break } } }, d.autoScrollingInterval)) } }, _checkContinuousSwapRight: function () { var b = this, c = this.element, d = this.options; if (c.data("getNextElementWidth")) { if ((d.startAtElementId.length > 0) && (c.data("startAtElementHasNotPassed"))) { c.data("swapAt", a("#" + d.startAtElementId).outerWidth(true)); c.data("startAtElementHasNotPassed", false) } else { c.data("swapAt", c.data("scrollableArea").children(":first").outerWidth(true)) } c.data("getNextElementWidth", false) } if (c.data("swapAt") <= c.data("scrollWrapper").scrollLeft()) { c.data("swappedElement", c.data("scrollableArea").children(":first").detach()); c.data("scrollableArea").append(c.data("swappedElement")); var e = c.data("scrollWrapper").scrollLeft(); c.data("scrollWrapper").scrollLeft(e - c.data("swappedElement").outerWidth(true)); c.data("getNextElementWidth", true) } }, _checkContinuousSwapLeft: function () { var b = this, c = this.element, d = this.options; if (c.data("getNextElementWidth")) { if ((d.startAtElementId.length > 0) && (c.data("startAtElementHasNotPassed"))) { c.data("swapAt", a("#" + d.startAtElementId).outerWidth(true)); c.data("startAtElementHasNotPassed", false) } else { c.data("swapAt", c.data("scrollableArea").children(":first").outerWidth(true)) } c.data("getNextElementWidth", false) } if (c.data("scrollWrapper").scrollLeft() === 0) { c.data("swappedElement", c.data("scrollableArea").children(":last").detach()); c.data("scrollableArea").prepend(c.data("swappedElement")); c.data("scrollWrapper").scrollLeft(c.data("scrollWrapper").scrollLeft() + c.data("swappedElement").outerWidth(true)); c.data("getNextElementWidth", true) } }, restoreOriginalElements: function () { var b = this, c = this.element; c.data("scrollableArea").html(c.data("originalElements")); b.recalculateScrollableArea(); b.jumpToElement("first") }, show: function () { var b = this.element; b.data("visible", true); b.show() }, hide: function () { var b = this.element; b.data("visible", false); b.hide() }, enable: function () { var b = this.element; b.data("enabled", true) }, disable: function () { var b = this, c = this.element; b.stopAutoScrolling(); clearInterval(c.data("rightScrollingInterval")); clearInterval(c.data("leftScrollingInterval")); clearInterval(c.data("hideHotSpotBackgroundsInterval")); c.data("enabled", false) }, destroy: function () { var b = this, c = this.element; b.stopAutoScrolling(); clearInterval(c.data("rightScrollingInterval")); clearInterval(c.data("leftScrollingInterval")); clearInterval(c.data("hideHotSpotBackgroundsInterval")); c.data("scrollingHotSpotRight").unbind("mouseover"); c.data("scrollingHotSpotRight").unbind("mouseout"); c.data("scrollingHotSpotRight").unbind("mousedown"); c.data("scrollingHotSpotLeft").unbind("mouseover"); c.data("scrollingHotSpotLeft").unbind("mouseout"); c.data("scrollingHotSpotLeft").unbind("mousedown"); c.data("scrollingHotSpotRight").remove(); c.data("scrollingHotSpotLeft").remove(); c.data("scrollableArea").remove(); c.data("scrollWrapper").remove(); c.html(c.data("originalElements")); a.Widget.prototype.destroy.apply(this, arguments) } }) })(jQuery);

/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 *
 * Requires: 1.2.2+
 */
(function(a){function d(b){var c=b||window.event,d=[].slice.call(arguments,1),e=0,f=!0,g=0,h=0;return b=a.event.fix(c),b.type="mousewheel",c.wheelDelta&&(e=c.wheelDelta/120),c.detail&&(e=-c.detail/3),h=e,c.axis!==undefined&&c.axis===c.HORIZONTAL_AXIS&&(h=0,g=-1*e),c.wheelDeltaY!==undefined&&(h=c.wheelDeltaY/120),c.wheelDeltaX!==undefined&&(g=-1*c.wheelDeltaX/120),d.unshift(b,e,g,h),(a.event.dispatch||a.event.handle).apply(this,d)}var b=["DOMMouseScroll","mousewheel"];if(a.event.fixHooks)for(var c=b.length;c;)a.event.fixHooks[b[--c]]=a.event.mouseHooks;a.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=b.length;a;)this.addEventListener(b[--a],d,!1);else this.onmousewheel=d},teardown:function(){if(this.removeEventListener)for(var a=b.length;a;)this.removeEventListener(b[--a],d,!1);else this.onmousewheel=null}},a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})})(jQuery)




/**
 * Galleria v 1.2.7 2012-04-04
 * http://galleria.io
 *
 * Licensed under the MIT license
 * https://raw.github.com/aino/galleria/master/LICENSE
 *
 */

(function( $ ) {

/*global jQuery, navigator, Galleria:true, Image */

// some references
var undef,
    window = this,
    doc    = window.document,
    $doc   = $( doc ),
    $win   = $( window ),

// native prototypes
    protoArray = Array.prototype,

// internal constants
    VERSION = 1.27,
    DEBUG = true,
    TIMEOUT = 30000,
    DUMMY = false,
    NAV = navigator.userAgent.toLowerCase(),
    HASH = window.location.hash.replace(/#\//, ''),
    F = function(){},
    FALSE = function() { return false; },
    IE = (function() {

        var v = 3,
            div = doc.createElement( 'div' ),
            all = div.getElementsByTagName( 'i' );

        do {
            div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
        } while ( all[0] );

        return v > 4 ? v : undef;

    }() ),
    DOM = function() {
        return {
            html:  doc.documentElement,
            body:  doc.body,
            head:  doc.getElementsByTagName('head')[0],
            title: doc.title
        };
    },

    // list of Galleria events
    _eventlist = 'data ready thumbnail loadstart loadfinish image play pause progress ' +
                 'fullscreen_enter fullscreen_exit idle_enter idle_exit rescale ' +
                 'lightbox_open lightbox_close lightbox_image',

    _events = (function() {

        var evs = [];

        $.each( _eventlist.split(' '), function( i, ev ) {
            evs.push( ev );

            // legacy events
            if ( /_/.test( ev ) ) {
                evs.push( ev.replace( /_/g, '' ) );
            }
        });

        return evs;

    }()),

    // legacy options
    // allows the old my_setting syntax and converts it to camel case

    _legacyOptions = function( options ) {

        var n;

        if ( typeof options !== 'object' ) {

            // return whatever it was...
            return options;
        }

        $.each( options, function( key, value ) {
            if ( /^[a-z]+_/.test( key ) ) {
                n = '';
                $.each( key.split('_'), function( i, k ) {
                    n += i > 0 ? k.substr( 0, 1 ).toUpperCase() + k.substr( 1 ) : k;
                });
                options[ n ] = value;
                delete options[ key ];
            }
        });

        return options;
    },

    _patchEvent = function( type ) {

        // allow 'image' instead of Galleria.IMAGE
        if ( $.inArray( type, _events ) > -1 ) {
            return Galleria[ type.toUpperCase() ];
        }

        return type;
    },

    // video providers
    _video = {
        youtube: {
            reg: /https?:\/\/(?:[a-zA_Z]{2,3}.)?(?:youtube\.com\/watch\?)((?:[\w\d\-\_\=]+&amp;(?:amp;)?)*v(?:&lt;[A-Z]+&gt;)?=([0-9a-zA-Z\-\_]+))/i,
            embed: function(id) {
                return 'http://www.youtube.com/embed/'+id;
            },
            getThumb: function( id, success, fail ) {
                fail = fail || F;
                $.getJSON('http://gdata.youtube.com/feeds/api/videos/' + id + '?v=2&alt=json-in-script&callback=?', function(data) {
                    try {
                        success( data.entry.media$group.media$thumbnail[0].url );
                    } catch(e) {
                        fail();
                    }
                }).error(fail);
            }
        },
        vimeo: {
            reg: /https?:\/\/(?:www\.)?(vimeo\.com)\/(?:hd#)?([0-9]+)/i,
            embed: function(id) {
                return 'http://player.vimeo.com/video/'+id;
            },
            getThumb: function( id, success, fail ) {
                fail = fail || F;
                $.getJSON('http://vimeo.com/api/v2/video/' + id + '.json?callback=?', function(data) {
                    try {
                        success( data[0].thumbnail_medium );
                    } catch(e) {
                        fail();
                    }
                }).error(fail);
            }
        },
        dailymotion: {
            reg: /https?:\/\/(?:www\.)?(dailymotion\.com)\/video\/([^_]+)/,
            embed: function(id) {
                return 'http://www.dailymotion.com/embed/video/'+id;
            },
            getThumb: function( id, success, fail ) {
                fail = fail || F;
                $.getJSON('https://api.dailymotion.com/video/'+id+'?fields=thumbnail_medium_url&callback=?', function(data) {
                    try {
                        success( data.thumbnail_medium_url );
                    } catch(e) {
                        fail();
                    }
                }).error(fail);
            }
        }
    },

    // utility for testing the video URL and getting the video ID
    _videoTest = function( url ) {
        var match;
        for ( var v in _video ) {
            match = url && url.match( _video[v].reg );
            if( match && match.length ) {
                return {
                    id: match[2],
                    provider: v
                };
            }
        }
        return false;
    },

    // the internal timeouts object
    // provides helper methods for controlling timeouts
    _timeouts = {

        trunk: {},

        add: function( id, fn, delay, loop ) {
            id = id || new Date().getTime();
            loop = loop || false;
            this.clear( id );
            if ( loop ) {
                var old = fn;
                fn = function() {
                    old();
                    _timeouts.add( id, fn, delay );
                };
            }
            this.trunk[ id ] = window.setTimeout( fn, delay );
        },

        clear: function( id ) {

            var del = function( i ) {
                window.clearTimeout( this.trunk[ i ] );
                delete this.trunk[ i ];
            }, i;

            if ( !!id && id in this.trunk ) {
                del.call( _timeouts, id );

            } else if ( typeof id === 'undefined' ) {
                for ( i in this.trunk ) {
                    if ( this.trunk.hasOwnProperty( i ) ) {
                        del.call( _timeouts, i );
                    }
                }
            }
        }
    },

    // the internal gallery holder
    _galleries = [],

    // the internal instance holder
    _instances = [],

    // flag for errors
    _hasError = false,

    // canvas holder
    _canvas = false,

    // instance pool, holds the galleries until themeLoad is triggered
    _pool = [],

    // themeLoad trigger
    _themeLoad = function( theme ) {
        Galleria.theme = theme;

        // run the instances we have in the pool
        $.each( _pool, function( i, instance ) {
            if ( !instance._initialized ) {
                instance._init.call( instance );
            }
        });
    },

    // the Utils singleton
    Utils = (function() {

        return {

            array : function( obj ) {
                return protoArray.slice.call(obj, 0);
            },

            create : function( className, nodeName ) {
                nodeName = nodeName || 'div';
                var elem = doc.createElement( nodeName );
                elem.className = className;
                return elem;
            },

            getScriptPath : function( src ) {

                // the currently executing script is always the last
                src = src || $('script:last').attr('src');
                var slices = src.split('/');

                if (slices.length == 1) {
                    return '';
                }

                slices.pop();

                return slices.join('/') + '/';
            },

            // CSS3 transitions, added in 1.2.4
            animate : (function() {

                // detect transition
                var transition = (function( style ) {
                    var props = 'transition WebkitTransition MozTransition OTransition'.split(' '),
                        i;

                    // disable css3 animations in opera until stable
                    if ( window.opera ) {
                        return false;
                    }

                    for ( i = 0; props[i]; i++ ) {
                        if ( typeof style[ props[ i ] ] !== 'undefined' ) {
                            return props[ i ];
                        }
                    }
                    return false;
                }(( doc.body || doc.documentElement).style ));

                // map transitionend event
                var endEvent = {
                    MozTransition: 'transitionend',
                    OTransition: 'oTransitionEnd',
                    WebkitTransition: 'webkitTransitionEnd',
                    transition: 'transitionend'
                }[ transition ];

                // map bezier easing conversions
                var easings = {
                    _default: [0.25, 0.1, 0.25, 1],
                    galleria: [0.645, 0.045, 0.355, 1],
                    galleriaIn: [0.55, 0.085, 0.68, 0.53],
                    galleriaOut: [0.25, 0.46, 0.45, 0.94],
                    ease: [0.25, 0, 0.25, 1],
                    linear: [0.25, 0.25, 0.75, 0.75],
                    'ease-in': [0.42, 0, 1, 1],
                    'ease-out': [0, 0, 0.58, 1],
                    'ease-in-out': [0.42, 0, 0.58, 1]
                };

                // function for setting transition css for all browsers
                var setStyle = function( elem, value, suffix ) {
                    var css = {};
                    suffix = suffix || 'transition';
                    $.each( 'webkit moz ms o'.split(' '), function() {
                        css[ '-' + this + '-' + suffix ] = value;
                    });
                    elem.css( css );
                };

                // clear styles
                var clearStyle = function( elem ) {
                    setStyle( elem, 'none', 'transition' );
                    if ( Galleria.WEBKIT && Galleria.TOUCH ) {
                        setStyle( elem, 'translate3d(0,0,0)', 'transform' );
                        if ( elem.data('revert') ) {
                            elem.css( elem.data('revert') );
                            elem.data('revert', null);
                        }
                    }
                };

                // various variables
                var change, strings, easing, syntax, revert, form, css;

                // the actual animation method
                return function( elem, to, options ) {

                    // extend defaults
                    options = $.extend({
                        duration: 400,
                        complete: F,
                        stop: false
                    }, options);

                    // cache jQuery instance
                    elem = $( elem );

                    if ( !options.duration ) {
                        elem.css( to );
                        options.complete.call( elem[0] );
                        return;
                    }

                    // fallback to jQuery's animate if transition is not supported
                    if ( !transition ) {
                        elem.animate(to, options);
                        return;
                    }

                    // stop
                    if ( options.stop ) {
                        // clear the animation
                        elem.unbind( endEvent );
                        clearStyle( elem );
                    }

                    // see if there is a change
                    change = false;
                    $.each( to, function( key, val ) {
                        css = elem.css( key );
                        if ( Utils.parseValue( css ) != Utils.parseValue( val ) ) {
                            change = true;
                        }
                        // also add computed styles for FF
                        elem.css( key, css );
                    });
                    if ( !change ) {
                        window.setTimeout( function() {
                            options.complete.call( elem[0] );
                        }, options.duration );
                        return;
                    }

                    // the css strings to be applied
                    strings = [];

                    // the easing bezier
                    easing = options.easing in easings ? easings[ options.easing ] : easings._default;

                    // the syntax
                    syntax = ' ' + options.duration + 'ms' + ' cubic-bezier('  + easing.join(',') + ')';

                    // add a tiny timeout so that the browsers catches any css changes before animating
                    window.setTimeout( (function(elem, endEvent, to, syntax) {
                        return function() {

                            // attach the end event
                            elem.one(endEvent, (function( elem ) {
                                return function() {
                                    // clear the animation
                                    clearStyle(elem);

                                    // run the complete method
                                    options.complete.call(elem[0]);
                                };
                            }( elem )));

                            // do the webkit translate3d for better performance on iOS
                            if( Galleria.WEBKIT && Galleria.TOUCH ) {

                                revert = {};
                                form = [0,0,0];

                                $.each( ['left', 'top'], function(i, m) {
                                    if ( m in to ) {
                                        form[ i ] = ( Utils.parseValue( to[ m ] ) - Utils.parseValue(elem.css( m )) ) + 'px';
                                        revert[ m ] = to[ m ];
                                        delete to[ m ];
                                    }
                                });

                                if ( form[0] || form[1]) {

                                    elem.data('revert', revert);

                                    strings.push('-webkit-transform' + syntax);

                                    // 3d animate
                                    setStyle( elem, 'translate3d(' + form.join(',') + ')', 'transform');
                                }
                            }

                            // push the animation props
                            $.each(to, function( p, val ) {
                                strings.push(p + syntax);
                            });

                            // set the animation styles
                            setStyle( elem, strings.join(',') );

                            // animate
                            elem.css( to );

                        };
                    }(elem, endEvent, to, syntax)), 2);
                };
            }()),

            removeAlpha : function( elem ) {
                if ( IE < 9 && elem ) {

                    var style = elem.style,
                        currentStyle = elem.currentStyle,
                        filter = currentStyle && currentStyle.filter || style.filter || "";

                    if ( /alpha/.test( filter ) ) {
                        style.filter = filter.replace( /alpha\([^)]*\)/i, '' );
                    }
                }
            },

            forceStyles : function( elem, styles ) {
                elem = $(elem);
                if ( elem.attr( 'style' ) ) {
                    elem.data( 'styles', elem.attr( 'style' ) ).removeAttr( 'style' );
                }
                elem.css( styles );
            },

            revertStyles : function() {
                $.each( Utils.array( arguments ), function( i, elem ) {

                    elem = $( elem );
                    elem.removeAttr( 'style' );

                    elem.attr('style',''); // "fixes" webkit bug

                    if ( elem.data( 'styles' ) ) {
                        elem.attr( 'style', elem.data('styles') ).data( 'styles', null );
                    }
                });
            },

            moveOut : function( elem ) {
                Utils.forceStyles( elem, {
                    position: 'absolute',
                    left: -10000
                });
            },

            moveIn : function() {
                Utils.revertStyles.apply( Utils, Utils.array( arguments ) );
            },

            elem : function( elem ) {
                if (elem instanceof $) {
                    return {
                        $: elem,
                        dom: elem[0]
                    };
                } else {
                    return {
                        $: $(elem),
                        dom: elem
                    };
                }
            },

            hide : function( elem, speed, callback ) {

                callback = callback || F;

                var el = Utils.elem( elem ),
                    $elem = el.$;

                elem = el.dom;

                // save the value if not exist
                if (! $elem.data('opacity') ) {
                    $elem.data('opacity', $elem.css('opacity') );
                }

                // always hide
                var style = { opacity: 0 };

                if (speed) {

                    var complete = IE < 9 && elem ? function() {
                        Utils.removeAlpha( elem );
                        elem.style.visibility = 'hidden';
                        callback.call( elem );
                    } : callback;

                    Utils.animate( elem, style, {
                        duration: speed,
                        complete: complete,
                        stop: true
                    });
                } else {
                    if ( IE < 9 && elem ) {
                        Utils.removeAlpha( elem );
                        elem.style.visibility = 'hidden';
                    } else {
                        $elem.css( style );
                    }
                }
            },

            show : function( elem, speed, callback ) {

                callback = callback || F;

                var el = Utils.elem( elem ),
                    $elem = el.$;

                elem = el.dom;

                // bring back saved opacity
                var saved = parseFloat( $elem.data('opacity') ) || 1,
                    style = { opacity: saved };

                // animate or toggle
                if (speed) {

                    if ( IE < 9 ) {
                        $elem.css('opacity', 0);
                        elem.style.visibility = 'visible';
                    }

                    var complete = IE < 9 && elem ? function() {
                        if ( style.opacity == 1 ) {
                            Utils.removeAlpha( elem );
                        }
                        callback.call( elem );
                    } : callback;

                    Utils.animate( elem, style, {
                        duration: speed,
                        complete: complete,
                        stop: true
                    });
                } else {
                    if ( IE < 9 && style.opacity == 1 && elem ) {
                        Utils.removeAlpha( elem );
                        elem.style.visibility = 'visible';
                    } else {
                        $elem.css( style );
                    }
                }
            },


            // enhanced click for mobile devices
            // we bind a touchend and hijack any click event in the bubble
            // then we execute the click directly and save it in a separate data object for later
            optimizeTouch: (function() {

                var node,
                    evs,
                    fakes,
                    travel,
                    evt = {},
                    handler = function( e ) {
                        e.preventDefault();
                        evt = $.extend({}, e, true);
                    },
                    attach = function() {
                        this.evt = evt;
                    },
                    fake = function() {
                        this.handler.call(node, this.evt);
                    };

                return function( elem ) {

                    $(elem).bind('touchend', function( e ) {

                        node = e.target;
                        travel = true;

                        while( node.parentNode && node != e.currentTarget && travel ) {

                            evs =   $(node).data('events');
                            fakes = $(node).data('fakes');

                            if (evs && 'click' in evs) {

                                travel = false;
                                e.preventDefault();

                                // fake the click and save the event object
                                $(node).click(handler).click();

                                // remove the faked click
                                evs.click.pop();

                                // attach the faked event
                                $.each( evs.click, attach);

                                // save the faked clicks in a new data object
                                $(node).data('fakes', evs.click);

                                // remove all clicks
                                delete evs.click;

                            } else if ( fakes ) {

                                travel = false;
                                e.preventDefault();

                                // fake all clicks
                                $.each( fakes, fake );
                            }

                            // bubble
                            node = node.parentNode;
                        }
                    });
                };
            }()),

            addTimer : function() {
                _timeouts.add.apply( _timeouts, Utils.array( arguments ) );
                return this;
            },

            clearTimer : function() {
                _timeouts.clear.apply( _timeouts, Utils.array( arguments ) );
                return this;
            },

            wait : function(options) {
                options = $.extend({
                    until : FALSE,
                    success : F,
                    error : function() { Galleria.raise('Could not complete wait function.'); },
                    timeout: 3000
                }, options);

                var start = Utils.timestamp(),
                    elapsed,
                    now,
                    fn = function() {
                        now = Utils.timestamp();
                        elapsed = now - start;
                        if ( options.until( elapsed ) ) {
                            options.success();
                            return false;
                        }

                        if (typeof options.timeout == 'number' && now >= start + options.timeout) {
                            options.error();
                            return false;
                        }
                        window.setTimeout(fn, 10);
                    };

                window.setTimeout(fn, 10);
            },

            toggleQuality : function( img, force ) {

                if ( ( IE !== 7 && IE !== 8 ) || !img || img.nodeName.toUpperCase() != 'IMG' ) {
                    return;
                }

                if ( typeof force === 'undefined' ) {
                    force = img.style.msInterpolationMode === 'nearest-neighbor';
                }

                img.style.msInterpolationMode = force ? 'bicubic' : 'nearest-neighbor';
            },

            insertStyleTag : function( styles ) {
                var style = doc.createElement( 'style' );
                DOM().head.appendChild( style );

                if ( style.styleSheet ) { // IE
                    style.styleSheet.cssText = styles;
                } else {
                    var cssText = doc.createTextNode( styles );
                    style.appendChild( cssText );
                }
            },

            // a loadscript method that works for local scripts
            loadScript: function( url, callback ) {

                var done = false,
                    script = $('<scr'+'ipt>').attr({
                        src: url,
                        async: true
                    }).get(0);

               // Attach handlers for all browsers
               script.onload = script.onreadystatechange = function() {
                   if ( !done && (!this.readyState ||
                       this.readyState === 'loaded' || this.readyState === 'complete') ) {

                       done = true;

                       // Handle memory leak in IE
                       script.onload = script.onreadystatechange = null;

                       if (typeof callback === 'function') {
                           callback.call( this, this );
                       }
                   }
               };

               DOM().head.appendChild( script );
            },

            // parse anything into a number
            parseValue: function( val ) {
                if (typeof val === 'number') {
                    return val;
                } else if (typeof val === 'string') {
                    var arr = val.match(/\-?\d|\./g);
                    return arr && arr.constructor === Array ? arr.join('')*1 : 0;
                } else {
                    return 0;
                }
            },

            // timestamp abstraction
            timestamp: function() {
                return new Date().getTime();
            },

            // this is pretty crap, but works for now
            // it will add a callback, but it can't guarantee that the styles can be fetched
            // using getComputedStyle further checking needed, possibly a dummy element
            loadCSS : function( href, id, callback ) {

                var link,
                    ready = false,
                    length,
                    lastChance = function() {
                        var fake = new Image();
                        fake.onload = fake.onerror = function(e) {
                            fake = null;
                            ready = true;
                        };
                        fake.src = href;
                    };

                // look for manual css
                $('link[rel=stylesheet]').each(function() {
                    if ( new RegExp( href ).test( this.href ) ) {
                        link = this;
                        return false;
                    }
                });

                if ( typeof id === 'function' ) {
                    callback = id;
                    id = undef;
                }

                callback = callback || F; // dirty

                // if already present, return
                if ( link ) {
                    callback.call( link, link );
                    return link;
                }

                // save the length of stylesheets to check against
                length = doc.styleSheets.length;

                // check for existing id
                if( $('#'+id).length ) {
                    $('#'+id).attr('href', href);
                    length--;
                    ready = true;
                } else {
                    link = $( '<link>' ).attr({
                        rel: 'stylesheet',
                        href: href,
                        id: id
                    }).get(0);

                    window.setTimeout(function() {
                        var styles = $('link[rel="stylesheet"], style');
                        if ( styles.length ) {
                            styles.get(0).parentNode.insertBefore( link, styles[0] );
                        } else {
                            DOM().head.appendChild( link );
                        }

                        if ( IE ) {

                            // IE has a limit of 31 stylesheets in one document
                            if( length >= 31 ) {
                                Galleria.raise( 'You have reached the browser stylesheet limit (31)', true );
                                return;
                            }

                            link.onreadystatechange = function(e) {
                                if ( !ready && (!this.readyState ||
                                    this.readyState === 'loaded' || this.readyState === 'complete') ) {
                                    ready = true;
                                }
                            };

                        } else {

                            // final test via ajax
                            var dum = doc.createElement('a'),
                                loc = window.location;

                            dum.href = href;

                            if ( !( /file/.test( loc.protocol ) ) &&
                                 loc.hostname == dum.hostname &&
                                 loc.port == dum.port &&
                                 loc.protocol == dum.protocol ) {

                                // Same origin policy should apply
                                $.ajax({
                                    url: href,
                                    success: function() {
                                        ready = true;
                                    },
                                    error: lastChance
                                });

                            } else {
                                lastChance();
                            }
                        }
                    }, 10);
                }

                if ( typeof callback === 'function' ) {

                    Utils.wait({
                        until: function() {
                            return ready && doc.styleSheets.length > length;
                        },
                        success: function() {
                            window.setTimeout( function() {
                                callback.call( link, link );
                            }, 100);
                        },
                        error: function() {
                            Galleria.raise( 'Theme CSS could not load', true );
                        },
                        timeout: 10000
                    });
                }
                return link;
            }
        };
    }()),

    // the transitions holder
    _transitions = (function() {

        var _slide = function(params, complete, fade, door) {

            var easing = this.getOptions('easing'),
                distance = this.getStageWidth(),
                from = { left: distance * ( params.rewind ? -1 : 1 ) },
                to = { left: 0 };

            if ( fade ) {
                from.opacity = 0;
                to.opacity = 1;
            } else {
                from.opacity = 1;
            }

            $(params.next).css(from);

            Utils.animate(params.next, to, {
                duration: params.speed,
                complete: (function( elems ) {
                    return function() {
                        complete();
                        elems.css({
                            left: 0
                        });
                    };
                }( $( params.next ).add( params.prev ) )),
                queue: false,
                easing: easing
            });

            if (door) {
                params.rewind = !params.rewind;
            }

            if (params.prev) {

                from = { left: 0 };
                to = { left: distance * ( params.rewind ? 1 : -1 ) };

                if ( fade ) {
                    from.opacity = 1;
                    to.opacity = 0;
                }

                $(params.prev).css(from);
                Utils.animate(params.prev, to, {
                    duration: params.speed,
                    queue: false,
                    easing: easing,
                    complete: function() {
                        $(this).css('opacity', 0);
                    }
                });
            }
        };

        return {

            fade: function(params, complete) {
                $(params.next).css({
                    opacity: 0,
                    left: 0
                }).show();
                Utils.animate(params.next, {
                    opacity: 1
                },{
                    duration: params.speed,
                    complete: complete
                });
                if (params.prev) {
                    $(params.prev).css('opacity',1).show();
                    Utils.animate(params.prev, {
                        opacity: 0
                    },{
                        duration: params.speed
                    });
                }
            },

            flash: function(params, complete) {
                $(params.next).css({
                    opacity: 0,
                    left: 0
                });
                if (params.prev) {
                    Utils.animate( params.prev, {
                        opacity: 0
                    },{
                        duration: params.speed/2,
                        complete: function() {
                            Utils.animate( params.next, {
                                opacity:1
                            },{
                                duration: params.speed,
                                complete: complete
                            });
                        }
                    });
                } else {
                    Utils.animate( params.next, {
                        opacity: 1
                    },{
                        duration: params.speed,
                        complete: complete
                    });
                }
            },

            pulse: function(params, complete) {
                if (params.prev) {
                    $(params.prev).hide();
                }
                $(params.next).css({
                    opacity: 0,
                    left: 0
                }).show();
                Utils.animate(params.next, {
                    opacity:1
                },{
                    duration: params.speed,
                    complete: complete
                });
            },

            slide: function(params, complete) {
                _slide.apply( this, Utils.array( arguments ) );
            },

            fadeslide: function(params, complete) {
                _slide.apply( this, Utils.array( arguments ).concat( [true] ) );
            },

            doorslide: function(params, complete) {
                _slide.apply( this, Utils.array( arguments ).concat( [false, true] ) );
            }
        };
    }());

/**
    The main Galleria class

    @class
    @constructor

    @example var gallery = new Galleria();

    @author http://aino.se

    @requires jQuery

*/

Galleria = function() {

    var self = this;

    // internal options
    this._options = {};

    // flag for controlling play/pause
    this._playing = false;

    // internal interval for slideshow
    this._playtime = 5000;

    // internal variable for the currently active image
    this._active = null;

    // the internal queue, arrayified
    this._queue = { length: 0 };

    // the internal data array
    this._data = [];

    // the internal dom collection
    this._dom = {};

    // the internal thumbnails array
    this._thumbnails = [];

    // the internal layers array
    this._layers = [];

    // internal init flag
    this._initialized = false;

    // internal firstrun flag
    this._firstrun = false;

    // global stagewidth/height
    this._stageWidth = 0;
    this._stageHeight = 0;

    // target holder
    this._target = undef;

    // instance id
    this._id = parseInt(Math.random()*10000, 10);

    // add some elements
    var divs =  'container stage images image-nav image-nav-left image-nav-right ' +
                'info info-text info-title info-description ' +
                'thumbnails thumbnails-list thumbnails-container thumb-nav-left thumb-nav-right ' +
                'loader counter tooltip',
        spans = 'current total';

    $.each( divs.split(' '), function( i, elemId ) {
        self._dom[ elemId ] = Utils.create( 'galleria-' + elemId );
    });

    $.each( spans.split(' '), function( i, elemId ) {
        self._dom[ elemId ] = Utils.create( 'galleria-' + elemId, 'span' );
    });

    // the internal keyboard object
    // keeps reference of the keybinds and provides helper methods for binding keys
    var keyboard = this._keyboard = {

        keys : {
            'UP': 38,
            'DOWN': 40,
            'LEFT': 37,
            'RIGHT': 39,
            'RETURN': 13,
            'ESCAPE': 27,
            'BACKSPACE': 8,
            'SPACE': 32
        },

        map : {},

        bound: false,

        press: function(e) {
            var key = e.keyCode || e.which;
            if ( key in keyboard.map && typeof keyboard.map[key] === 'function' ) {
                keyboard.map[key].call(self, e);
            }
        },

        attach: function(map) {

            var key, up;

            for( key in map ) {
                if ( map.hasOwnProperty( key ) ) {
                    up = key.toUpperCase();
                    if ( up in keyboard.keys ) {
                        keyboard.map[ keyboard.keys[up] ] = map[key];
                    } else {
                        keyboard.map[ up ] = map[key];
                    }
                }
            }
            if ( !keyboard.bound ) {
                keyboard.bound = true;
                $doc.bind('keydown', keyboard.press);
            }
        },

        detach: function() {
            keyboard.bound = false;
            keyboard.map = {};
            $doc.unbind('keydown', keyboard.press);
        }
    };

    // internal controls for keeping track of active / inactive images
    var controls = this._controls = {

        0: undef,

        1: undef,

        active : 0,

        swap : function() {
            controls.active = controls.active ? 0 : 1;
        },

        getActive : function() {
            return controls[ controls.active ];
        },

        getNext : function() {
            return controls[ 1 - controls.active ];
        }
    };

    // internal carousel object
    var carousel = this._carousel = {

        // shortcuts
        next: self.$('thumb-nav-right'),
        prev: self.$('thumb-nav-left'),

        // cache the width
        width: 0,

        // track the current position
        current: 0,

        // cache max value
        max: 0,

        // save all hooks for each width in an array
        hooks: [],

        // update the carousel
        // you can run this method anytime, f.ex on window.resize
        update: function() {
            var w = 0,
                h = 0,
                hooks = [0];

            $.each( self._thumbnails, function( i, thumb ) {
                if ( thumb.ready ) {
                    w += thumb.outerWidth || $( thumb.container ).outerWidth( true );
                    hooks[ i+1 ] = w;
                    h = Math.max( h, thumb.outerHeight || $( thumb.container).outerHeight( true ) );
                }
            });

            self.$( 'thumbnails' ).css({
                width: w,
                height: h
            });

            carousel.max = w;
            carousel.hooks = hooks;
            carousel.width = self.$( 'thumbnails-list' ).width();
            carousel.setClasses();

            self.$( 'thumbnails-container' ).toggleClass( 'galleria-carousel', w > carousel.width );

            // one extra calculation
            carousel.width = self.$( 'thumbnails-list' ).width();

            // todo: fix so the carousel moves to the left
        },

        bindControls: function() {

            var i;

            carousel.next.bind( 'click', function(e) {
                e.preventDefault();

                if ( self._options.carouselSteps === 'auto' ) {

                    for ( i = carousel.current; i < carousel.hooks.length; i++ ) {
                        if ( carousel.hooks[i] - carousel.hooks[ carousel.current ] > carousel.width ) {
                            carousel.set(i - 2);
                            break;
                        }
                    }

                } else {
                    carousel.set( carousel.current + self._options.carouselSteps);
                }
            });

            carousel.prev.bind( 'click', function(e) {
                e.preventDefault();

                if ( self._options.carouselSteps === 'auto' ) {

                    for ( i = carousel.current; i >= 0; i-- ) {
                        if ( carousel.hooks[ carousel.current ] - carousel.hooks[i] > carousel.width ) {
                            carousel.set( i + 2 );
                            break;
                        } else if ( i === 0 ) {
                            carousel.set( 0 );
                            break;
                        }
                    }
                } else {
                    carousel.set( carousel.current - self._options.carouselSteps );
                }
            });
        },

        // calculate and set positions
        set: function( i ) {
            i = Math.max( i, 0 );
            while ( carousel.hooks[i - 1] + carousel.width >= carousel.max && i >= 0 ) {
                i--;
            }
            carousel.current = i;
            carousel.animate();
        },

        // get the last position
        getLast: function(i) {
            return ( i || carousel.current ) - 1;
        },

        // follow the active image
        follow: function(i) {

            //don't follow if position fits
            if ( i === 0 || i === carousel.hooks.length - 2 ) {
                carousel.set( i );
                return;
            }

            // calculate last position
            var last = carousel.current;
            while( carousel.hooks[last] - carousel.hooks[ carousel.current ] <
                   carousel.width && last <= carousel.hooks.length ) {
                last ++;
            }

            // set position
            if ( i - 1 < carousel.current ) {
                carousel.set( i - 1 );
            } else if ( i + 2 > last) {
                carousel.set( i - last + carousel.current + 2 );
            }
        },

        // helper for setting disabled classes
        setClasses: function() {
            carousel.prev.toggleClass( 'disabled', !carousel.current );
            carousel.next.toggleClass( 'disabled', carousel.hooks[ carousel.current ] + carousel.width >= carousel.max );
        },

        // the animation method
        animate: function(to) {
            carousel.setClasses();
            var num = carousel.hooks[ carousel.current ] * -1;

            if ( isNaN( num ) ) {
                return;
            }

            Utils.animate(self.get( 'thumbnails' ), {
                left: num
            },{
                duration: self._options.carouselSpeed,
                easing: self._options.easing,
                queue: false
            });
        }
    };

    // tooltip control
    // added in 1.2
    var tooltip = this._tooltip = {

        initialized : false,

        open: false,

        timer: 'tooltip' + self._id,

        swapTimer: 'swap' + self._id,

        init: function() {

            tooltip.initialized = true;

            var css = '.galleria-tooltip{padding:3px 8px;max-width:50%;background:#ffe;color:#000;z-index:3;position:absolute;font-size:11px;line-height:1.3' +
                      'opacity:0;box-shadow:0 0 2px rgba(0,0,0,.4);-moz-box-shadow:0 0 2px rgba(0,0,0,.4);-webkit-box-shadow:0 0 2px rgba(0,0,0,.4);}';

            Utils.insertStyleTag(css);

            self.$( 'tooltip' ).css('opacity', 0.8);
            Utils.hide( self.get('tooltip') );

        },

        // move handler
        move: function( e ) {
            var mouseX = self.getMousePosition(e).x,
                mouseY = self.getMousePosition(e).y,
                $elem = self.$( 'tooltip' ),
                x = mouseX,
                y = mouseY,
                height = $elem.outerHeight( true ) + 1,
                width = $elem.outerWidth( true ),
                limitY = height + 15;

            var maxX = self.$( 'container').width() - width - 2,
                maxY = self.$( 'container').height() - height - 2;

            if ( !isNaN(x) && !isNaN(y) ) {

                x += 10;
                y -= 30;

                x = Math.max( 0, Math.min( maxX, x ) );
                y = Math.max( 0, Math.min( maxY, y ) );

                if( mouseY < limitY ) {
                    y = limitY;
                }

                $elem.css({ left: x, top: y });
            }
        },

        // bind elements to the tooltip
        // you can bind multiple elementIDs using { elemID : function } or { elemID : string }
        // you can also bind single DOM elements using bind(elem, string)
        bind: function( elem, value ) {

            // todo: revise if alternative tooltip is needed for mobile devices
            if (Galleria.TOUCH) {
                return;
            }

            if (! tooltip.initialized ) {
                tooltip.init();
            }

            var hover = function( elem, value) {

                tooltip.define( elem, value );

                $( elem ).hover(function() {

                    Utils.clearTimer( tooltip.swapTimer );
                    self.$('container').unbind( 'mousemove', tooltip.move ).bind( 'mousemove', tooltip.move ).trigger( 'mousemove' );
                    tooltip.show( elem );

                    Utils.addTimer( tooltip.timer, function() {
                        self.$( 'tooltip' ).stop().show().animate({
                            opacity:1
                        });
                        tooltip.open = true;

                    }, tooltip.open ? 0 : 500);

                }, function() {

                    self.$( 'container' ).unbind( 'mousemove', tooltip.move );
                    Utils.clearTimer( tooltip.timer );

                    self.$( 'tooltip' ).stop().animate({
                        opacity: 0
                    }, 200, function() {

                        self.$( 'tooltip' ).hide();

                        Utils.addTimer( tooltip.swapTimer, function() {
                            tooltip.open = false;
                        }, 1000);
                    });
                }).click(function() {
                    $( this ).trigger( 'mouseout' );
                });
            };

            if ( typeof value === 'string' ) {
                hover( ( elem in self._dom ? self.get( elem ) : elem ), value );
            } else {
                // asume elemID here
                $.each( elem, function( elemID, val ) {
                    hover( self.get(elemID), val );
                });
            }
        },

        show: function( elem ) {

            elem = $( elem in self._dom ? self.get(elem) : elem );

            var text = elem.data( 'tt' ),
                mouseup = function( e ) {

                    // attach a tiny settimeout to make sure the new tooltip is filled
                    window.setTimeout( (function( ev ) {
                        return function() {
                            tooltip.move( ev );
                        };
                    }( e )), 10);

                    elem.unbind( 'mouseup', mouseup );

                };

            text = typeof text === 'function' ? text() : text;

            if ( ! text ) {
                return;
            }

            self.$( 'tooltip' ).html( text.replace(/\s/, '&nbsp;') );

            // trigger mousemove on mouseup in case of click
            elem.bind( 'mouseup', mouseup );
        },

        define: function( elem, value ) {

            // we store functions, not strings
            if (typeof value !== 'function') {
                var s = value;
                value = function() {
                    return s;
                };
            }

            elem = $( elem in self._dom ? self.get(elem) : elem ).data('tt', value);

            tooltip.show( elem );

        }
    };

    // internal fullscreen control
    var fullscreen = this._fullscreen = {

        scrolled: 0,

        crop: undef,

        transition: undef,

        active: false,

        keymap: self._keyboard.map,

        // The native fullscreen handler
        os: {

            callback: F,

            support: (function() {
                var html = DOM().html;
                return html.requestFullscreen || html.mozRequestFullScreen || html.webkitRequestFullScreen;
            }()),

            enter: function( callback ) {
                fullscreen.os.callback = callback || F;
                var html = DOM().html;
                if ( html.requestFullscreen ) {
                    html.requestFullscreen();
                }
                else if ( html.mozRequestFullScreen ) {
                    html.mozRequestFullScreen();
                }
                else if ( html.webkitRequestFullScreen ) {
                    html.webkitRequestFullScreen();
                }
            },

            exit: function( callback ) {
                fullscreen.os.callback = callback || F;
                if ( doc.exitFullscreen ) {
                    doc.exitFullscreen();
                }
                else if ( doc.mozCancelFullScreen ) {
                    doc.mozCancelFullScreen();
                }
                else if ( doc.webkitCancelFullScreen ) {
                    doc.webkitCancelFullScreen();
                }
            },

            listen: function() {
                if ( !fullscreen.os.support ) {
                    return;
                }
                var handler = function() {
                    if ( doc.fullscreen || doc.mozFullScreen || doc.webkitIsFullScreen ) {
                        fullscreen._enter( fullscreen.os.callback );
                    } else {
                        fullscreen._exit( fullscreen.os.callback );
                    }
                };
                doc.addEventListener( 'fullscreenchange', handler, false );
                doc.addEventListener( 'mozfullscreenchange', handler, false );
                doc.addEventListener( 'webkitfullscreenchange', handler, false );
            }
        },

        enter: function( callback ) {
            if ( self._options.trueFullscreen && fullscreen.os.support ) {
                fullscreen.os.enter( callback );
            } else {
                fullscreen._enter( callback );
            }
        },

        _enter: function( callback ) {

            fullscreen.active = true;

            // hide the image until rescale is complete
            Utils.hide( self.getActiveImage() );

            self.$( 'container' ).addClass( 'fullscreen' );

            fullscreen.scrolled = $win.scrollTop();

            // begin styleforce
            Utils.forceStyles(self.get('container'), {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10000
            });

            var htmlbody = {
                    height: '100%',
                    overflow: 'hidden',
                    margin:0,
                    padding:0
                },

                data = self.getData(),

                options = self._options;

            Utils.forceStyles( DOM().html, htmlbody );
            Utils.forceStyles( DOM().body, htmlbody );

            // temporarily attach some keys
            // save the old ones first in a cloned object
            fullscreen.keymap = $.extend({}, self._keyboard.map);

            self.attachKeyboard({
                escape: self.exitFullscreen,
                right: self.next,
                left: self.prev
            });

            // temporarily save the crop
            fullscreen.crop = options.imageCrop;

            // set fullscreen options
            if ( options.fullscreenCrop != undef ) {
                options.imageCrop = options.fullscreenCrop;
            }

            // swap to big image if it's different from the display image
            if ( data && data.big && data.image !== data.big ) {
                var big    = new Galleria.Picture(),
                    cached = big.isCached( data.big ),
                    index  = self.getIndex(),
                    thumb  = self._thumbnails[ index ];

                self.trigger( {
                    type: Galleria.LOADSTART,
                    cached: cached,
                    rewind: false,
                    index: index,
                    imageTarget: self.getActiveImage(),
                    thumbTarget: thumb,
                    galleriaData: data
                });

                big.load( data.big, function( big ) {
                    self._scaleImage( big, {
                        complete: function( big ) {
                            self.trigger({
                                type: Galleria.LOADFINISH,
                                cached: cached,
                                index: index,
                                rewind: false,
                                imageTarget: big.image,
                                thumbTarget: thumb
                            });
                            var image = self._controls.getActive().image;
                            if ( image ) {
                                $( image ).width( big.image.width ).height( big.image.height )
                                    .attr( 'style', $( big.image ).attr('style') )
                                    .attr( 'src', big.image.src );
                            }
                        }
                    });
                });
            }

            // init the first rescale and attach callbacks
            self.rescale(function() {

                Utils.addTimer(false, function() {
                    // show the image after 50 ms
                    Utils.show( self.getActiveImage() );

                    if (typeof callback === 'function') {
                        callback.call( self );
                    }

                }, 100);

                self.trigger( Galleria.FULLSCREEN_ENTER );
            });

            // bind the scaling to the resize event
            $win.resize( function() {
                fullscreen.scale();
            } );
        },

        scale : function() {
            self.rescale();
        },

        exit: function( callback ) {
            if ( self._options.trueFullscreen && fullscreen.os.support ) {
                fullscreen.os.exit( callback );
            } else {
                fullscreen._exit( callback );
            }
        },

        _exit: function( callback ) {

            fullscreen.active = false;

            Utils.hide( self.getActiveImage() );

            self.$('container').removeClass( 'fullscreen' );

            // revert all styles
            Utils.revertStyles( self.get('container'), DOM().html, DOM().body );

            // scroll back
            window.scrollTo(0, fullscreen.scrolled);

            // detach all keyboard events and apply the old keymap
            self.detachKeyboard();
            self.attachKeyboard( fullscreen.keymap );

            // bring back cached options
            self._options.imageCrop = fullscreen.crop;
            //self._options.transition = fullscreen.transition;

            // return to original image
            var big = self.getData().big,
                image = self._controls.getActive().image;

            if ( !self.getData().iframe && image && big && big == image.src ) {

                window.setTimeout(function(src) {
                    return function() {
                        image.src = src;
                    };
                }( self.getData().image ), 1 );

            }

            self.rescale(function() {
                Utils.addTimer(false, function() {

                    // show the image after 50 ms
                    Utils.show( self.getActiveImage() );

                    if ( typeof callback === 'function' ) {
                        callback.call( self );
                    }

                    $win.trigger( 'resize' );

                }, 50);
                self.trigger( Galleria.FULLSCREEN_EXIT );
            });


            $win.unbind('resize', fullscreen.scale);
        }
    };

    // invoke the native listeners
    fullscreen.os.listen();

    // the internal idle object for controlling idle states
    var idle = this._idle = {

        timer: 'idle' + self._id,

        trunk: [],

        bound: false,

        add: function(elem, to) {
            if (!elem) {
                return;
            }
            if (!idle.bound) {
                idle.addEvent();
            }
            elem = $(elem);

            var from = {},
                style;

            for ( style in to ) {
                if ( to.hasOwnProperty( style ) ) {
                    from[ style ] = elem.css( style );
                }
            }
            elem.data('idle', {
                from: from,
                to: to,
                complete: true,
                busy: false
            });
            idle.addTimer();
            idle.trunk.push(elem);
        },

        remove: function(elem) {

            elem = jQuery(elem);

            $.each(idle.trunk, function(i, el) {
                if ( el && el.length && !el.not(elem).length ) {
                    self._idle.show(elem);
                    self._idle.trunk.splice(i, 1);
                }
            });

            if (!idle.trunk.length) {
                idle.removeEvent();
                Utils.clearTimer( idle.timer );
            }
        },

        addEvent : function() {
            idle.bound = true;
            self.$('container').bind('mousemove click', idle.showAll );
        },

        removeEvent : function() {
            idle.bound = false;
            self.$('container').unbind('mousemove click', idle.showAll );
        },

        addTimer : function() {
            Utils.addTimer( idle.timer, function() {
                idle.hide();
            }, self._options.idleTime );
        },

        hide : function() {

            if ( !self._options.idleMode || self.getIndex() === false || self.getData().iframe ) {
                return;
            }

            self.trigger( Galleria.IDLE_ENTER );

            $.each( idle.trunk, function(i, elem) {

                var data = elem.data('idle');

                if (! data) {
                    return;
                }

                elem.data('idle').complete = false;

                Utils.animate( elem, data.to, {
                    duration: self._options.idleSpeed
                });
            });
        },

        showAll : function() {

            Utils.clearTimer( idle.timer );

            $.each( idle.trunk, function( i, elem ) {
                idle.show( elem );
            });
        },

        show: function(elem) {

            var data = elem.data('idle');

            if (!data.busy && !data.complete) {

                data.busy = true;

                self.trigger( Galleria.IDLE_EXIT );

                Utils.clearTimer( idle.timer );

                Utils.animate( elem, data.from, {
                    duration: self._options.idleSpeed/2,
                    complete: function() {
                        $(this).data('idle').busy = false;
                        $(this).data('idle').complete = true;
                    }
                });

            }
            idle.addTimer();
        }
    };

    // internal lightbox object
    // creates a predesigned lightbox for simple popups of images in galleria
    var lightbox = this._lightbox = {

        width : 0,

        height : 0,

        initialized : false,

        active : null,

        image : null,

        elems : {},

        keymap: false,

        init : function() {

            // trigger the event
            self.trigger( Galleria.LIGHTBOX_OPEN );

            if ( lightbox.initialized ) {
                return;
            }
            lightbox.initialized = true;

            // create some elements to work with
            var elems = 'overlay box content shadow title info close prevholder prev nextholder next counter image',
                el = {},
                op = self._options,
                css = '',
                abs = 'position:absolute;',
                prefix = 'lightbox-',
                cssMap = {
                    overlay:    'position:fixed;display:none;opacity:'+op.overlayOpacity+';filter:alpha(opacity='+(op.overlayOpacity*100)+
                                ');top:0;left:0;width:100%;height:100%;background:'+op.overlayBackground+';z-index:99990',
                    box:        'position:fixed;display:none;width:400px;height:400px;top:50%;left:50%;margin-top:-200px;margin-left:-200px;z-index:99991',
                    shadow:     abs+'background:#000;width:100%;height:100%;',
                    content:    abs+'background-color:#fff;top:10px;left:10px;right:10px;bottom:10px;overflow:hidden',
                    info:       abs+'bottom:10px;left:10px;right:10px;color:#444;font:11px/13px arial,sans-serif;height:13px',
                    close:      abs+'top:10px;right:10px;height:20px;width:20px;background:#fff;text-align:center;cursor:pointer;color:#444;font:16px/22px arial,sans-serif;z-index:99999',
                    image:      abs+'top:10px;left:10px;right:10px;bottom:30px;overflow:hidden;display:block;',
                    prevholder: abs+'width:50%;top:0;bottom:40px;cursor:pointer;',
                    nextholder: abs+'width:50%;top:0;bottom:40px;right:-1px;cursor:pointer;',
                    prev:       abs+'top:50%;margin-top:-20px;height:40px;width:30px;background:#fff;left:20px;display:none;text-align:center;color:#000;font:bold 16px/36px arial,sans-serif',
                    next:       abs+'top:50%;margin-top:-20px;height:40px;width:30px;background:#fff;right:20px;left:auto;display:none;font:bold 16px/36px arial,sans-serif;text-align:center;color:#000',
                    title:      'float:left',
                    counter:    'float:right;margin-left:8px;'
                },
                hover = function(elem) {
                    return elem.hover(
                        function() { $(this).css( 'color', '#bbb' ); },
                        function() { $(this).css( 'color', '#444' ); }
                    );
                },
                appends = {};

            // IE8 fix for IE's transparent background event "feature"
            if ( IE && IE > 7 ) {
                cssMap.nextholder += 'background:#000;filter:alpha(opacity=0);';
                cssMap.prevholder += 'background:#000;filter:alpha(opacity=0);';
            }

            // create and insert CSS
            $.each(cssMap, function( key, value ) {
                css += '.galleria-'+prefix+key+'{'+value+'}';
            });

            css += '.galleria-'+prefix+'box.iframe .galleria-'+prefix+'prevholder,'+
                   '.galleria-'+prefix+'box.iframe .galleria-'+prefix+'nextholder{'+
                   'width:100px;height:100px;top:50%;margin-top:-70px}';

            Utils.insertStyleTag( css );

            // create the elements
            $.each(elems.split(' '), function( i, elemId ) {
                self.addElement( 'lightbox-' + elemId );
                el[ elemId ] = lightbox.elems[ elemId ] = self.get( 'lightbox-' + elemId );
            });

            // initiate the image
            lightbox.image = new Galleria.Picture();

            // append the elements
            $.each({
                    box: 'shadow content close prevholder nextholder',
                    info: 'title counter',
                    content: 'info image',
                    prevholder: 'prev',
                    nextholder: 'next'
                }, function( key, val ) {
                    var arr = [];
                    $.each( val.split(' '), function( i, prop ) {
                        arr.push( prefix + prop );
                    });
                    appends[ prefix+key ] = arr;
            });

            self.append( appends );

            $( el.image ).append( lightbox.image.container );

            $( DOM().body ).append( el.overlay, el.box );

            Utils.optimizeTouch( el.box );

            // add the prev/next nav and bind some controls

            hover( $( el.close ).bind( 'click', lightbox.hide ).html('&#215;') );

            $.each( ['Prev','Next'], function(i, dir) {

                var $d = $( el[ dir.toLowerCase() ] ).html( /v/.test( dir ) ? '&#8249;&nbsp;' : '&nbsp;&#8250;' ),
                    $e = $( el[ dir.toLowerCase()+'holder'] );

                $e.bind( 'click', function() {
                    lightbox[ 'show' + dir ]();
                });

                // IE7 and touch devices will simply show the nav
                if ( IE < 8 || Galleria.TOUCH ) {
                    $d.show();
                    return;
                }

                $e.hover( function() {
                    $d.show();
                }, function(e) {
                    $d.stop().fadeOut( 200 );
                });

            });
            $( el.overlay ).bind( 'click', lightbox.hide );

            // the lightbox animation is slow on ipad
            if ( Galleria.IPAD ) {
                self._options.lightboxTransitionSpeed = 0;
            }

        },

        rescale: function(event) {

            // calculate
             var width = Math.min( $win.width()-40, lightbox.width ),
                height = Math.min( $win.height()-60, lightbox.height ),
                ratio = Math.min( width / lightbox.width, height / lightbox.height ),
                destWidth = Math.round( lightbox.width * ratio ) + 40,
                destHeight = Math.round( lightbox.height * ratio ) + 60,
                to = {
                    width: destWidth,
                    height: destHeight,
                    'margin-top': Math.ceil( destHeight / 2 ) *- 1,
                    'margin-left': Math.ceil( destWidth / 2 ) *- 1
                };

            // if rescale event, don't animate
            if ( event ) {
                $( lightbox.elems.box ).css( to );
            } else {
                $( lightbox.elems.box ).animate( to, {
                    duration: self._options.lightboxTransitionSpeed,
                    easing: self._options.easing,
                    complete: function() {
                        var image = lightbox.image,
                            speed = self._options.lightboxFadeSpeed;

                        self.trigger({
                            type: Galleria.LIGHTBOX_IMAGE,
                            imageTarget: image.image
                        });

                        $( image.container ).show();

                        $( image.image ).animate({ opacity: 1 }, speed);
                        Utils.show( lightbox.elems.info, speed );
                    }
                });
            }
        },

        hide: function() {

            // remove the image
            lightbox.image.image = null;

            $win.unbind('resize', lightbox.rescale);

            $( lightbox.elems.box ).hide();

            Utils.hide( lightbox.elems.info );

            self.detachKeyboard();
            self.attachKeyboard( lightbox.keymap );

            lightbox.keymap = false;

            Utils.hide( lightbox.elems.overlay, 200, function() {
                $( this ).hide().css( 'opacity', self._options.overlayOpacity );
                self.trigger( Galleria.LIGHTBOX_CLOSE );
            });
        },

        showNext: function() {
            lightbox.show( self.getNext( lightbox.active ) );
        },

        showPrev: function() {
            lightbox.show( self.getPrev( lightbox.active ) );
        },

        show: function(index) {

            lightbox.active = index = typeof index === 'number' ? index : self.getIndex() || 0;

            if ( !lightbox.initialized ) {
                lightbox.init();
            }

            // temporarily attach some keys
            // save the old ones first in a cloned object
            if ( !lightbox.keymap ) {

                lightbox.keymap = $.extend({}, self._keyboard.map);

                self.attachKeyboard({
                    escape: lightbox.hide,
                    right: lightbox.showNext,
                    left: lightbox.showPrev
                });
            }

            $win.unbind('resize', lightbox.rescale );

            var data = self.getData(index),
                total = self.getDataLength(),
                n = self.getNext( index ),
                ndata, p, i;

            Utils.hide( lightbox.elems.info );

            try {
                for ( i = self._options.preload; i > 0; i-- ) {
                    p = new Galleria.Picture();
                    ndata = self.getData( n );
                    p.preload( 'big' in ndata ? ndata.big : ndata.image );
                    n = self.getNext( n );
                }
            } catch(e) {}

            lightbox.image.isIframe = !!data.iframe;

            $(lightbox.elems.box).toggleClass( 'iframe', !!data.iframe );

            lightbox.image.load( data.iframe || data.big || data.image, function( image ) {

                lightbox.width = image.isIframe ? $(window).width() : image.original.width;
                lightbox.height = image.isIframe ? $(window).height() : image.original.height;

                $( image.image ).css({
                    width: image.isIframe ? '100%' : '100.1%',
                    height: image.isIframe ? '100%' : '100.1%',
                    top: 0,
                    zIndex: 99998,
                    opacity: 0,
                    visibility: 'visible'
                });

                lightbox.elems.title.innerHTML = data.title || '';
                lightbox.elems.counter.innerHTML = (index + 1) + ' / ' + total;
                $win.resize( lightbox.rescale );
                lightbox.rescale();
            });

            $( lightbox.elems.overlay ).show().css( 'visibility', 'visible' );
            $( lightbox.elems.box ).show();
        }
    };

    return this;
};

// end Galleria constructor

Galleria.prototype = {

    // bring back the constructor reference

    constructor: Galleria,

    /**
        Use this function to initialize the gallery and start loading.
        Should only be called once per instance.

        @param {HTMLElement} target The target element
        @param {Object} options The gallery options

        @returns Instance
    */

    init: function( target, options ) {

        var self = this;

        options = _legacyOptions( options );

        // save the original ingredients
        this._original = {
            target: target,
            options: options,
            data: null
        };

        // save the target here
        this._target = this._dom.target = target.nodeName ? target : $( target ).get(0);

        // save the original content for destruction
        this._original.html = this._target.innerHTML;

        // push the instance
        _instances.push( this );

        // raise error if no target is detected
        if ( !this._target ) {
             Galleria.raise('Target not found', true);
             return;
        }

        // apply options
        this._options = {
            autoplay: false,
            carousel: true,
            carouselFollow: true,
            carouselSpeed: 400,
            carouselSteps: 'auto',
            clicknext: false,
            dailymotion: {
                foreground: '%23EEEEEE',
                highlight: '%235BCEC5',
                background: '%23222222',
                logo: 0,
                hideInfos: 1
            },
            dataConfig : function( elem ) { return {}; },
            dataSelector: 'img',
            dataSource: this._target,
            debug: undef,
            dummy: undef, // 1.2.5
            easing: 'galleria',
            extend: function(options) {},
            fullscreenCrop: undef, // 1.2.5
            fullscreenDoubleTap: true, // 1.2.4 toggles fullscreen on double-tap for touch devices
            fullscreenTransition: undef, // 1.2.6
            height: 0,
            idleMode: true, // 1.2.4 toggles idleMode
            idleTime: 3000,
            idleSpeed: 200,
            imageCrop: false,
            imageMargin: 0,
            imagePan: false,
            imagePanSmoothness: 12,
            imagePosition: '50%',
            imageTimeout: undef, // 1.2.5
            initialTransition: undef, // 1.2.4, replaces transitionInitial
            keepSource: false,
            layerFollow: true, // 1.2.5
            lightbox: false, // 1.2.3
            lightboxFadeSpeed: 200,
            lightboxTransitionSpeed: 200,
            linkSourceImages: true,
            maxScaleRatio: undef,
            minScaleRatio: undef,
            overlayOpacity: 0.85,
            overlayBackground: '#0b0b0b',
            pauseOnInteraction: true,
            popupLinks: false,
            preload: 2,
            queue: true,
            responsive: false,
            show: 0,
            showInfo: true,
            showCounter: true,
            showImagenav: true,
            swipe: true, // 1.2.4
            thumbCrop: true,
            thumbEventType: 'click',
            thumbFit: true,
            thumbMargin: 0,
            thumbQuality: 'auto',
            thumbnails: true,
            touchTransition: undef, // 1.2.6
            transition: 'fade',
            transitionInitial: undef, // legacy, deprecate in 1.3. Use initialTransition instead.
            transitionSpeed: 400,
            trueFullscreen: true, // 1.2.7
            useCanvas: false, // 1.2.4
            vimeo: {
                title: 0,
                byline: 0,
                portrait: 0,
                color: 'aaaaaa'
            },
            wait: 5000, // 1.2.7
            width: 'auto',
            youtube: {
                modestbranding: 1,
                autohide: 1,
                color: 'white',
                hd: 1,
                rel: 0,
                showinfo: 0
            }
        };

        // legacy support for transitionInitial
        this._options.initialTransition = this._options.initialTransition || this._options.transitionInitial;

        // turn off debug
        if ( options && options.debug === false ) {
            DEBUG = false;
        }

        // set timeout
        if ( options && typeof options.imageTimeout === 'number' ) {
            TIMEOUT = options.imageTimeout;
        }

        // set dummy
        if ( options && typeof options.dummy === 'string' ) {
            DUMMY = options.dummy;
        }

        // hide all content
        $( this._target ).children().hide();

        // now we just have to wait for the theme...
        if ( typeof Galleria.theme === 'object' ) {
            this._init();
        } else {
            // push the instance into the pool and run it when the theme is ready
            _pool.push( this );
        }

        return this;
    },

    // this method should only be called once per instance
    // for manipulation of data, use the .load method

    _init: function() {

        var self = this,
            options = this._options;

        if ( this._initialized ) {
            Galleria.raise( 'Init failed: Gallery instance already initialized.' );
            return this;
        }

        this._initialized = true;

        if ( !Galleria.theme ) {
            Galleria.raise( 'Init failed: No theme found.', true );
            return this;
        }

        // merge the theme & caller options
        $.extend( true, options, Galleria.theme.defaults, this._original.options, Galleria.configure.options );

        // check for canvas support
        (function( can ) {

            if ( !( 'getContext' in can ) ) {
                can = null;
                return;
            }

            _canvas = _canvas || {
                elem: can,
                context: can.getContext( '2d' ),
                cache: {},
                length: 0
            };

        }( doc.createElement( 'canvas' ) ) );

        // bind the gallery to run when data is ready
        this.bind( Galleria.DATA, function() {

            // Warn for quirks mode
            if ( Galleria.QUIRK ) {
                Galleria.raise('Your page is in Quirks mode, Galleria may not render correctly. Please validate your HTML.');
            }

            // save the new data
            this._original.data = this._data;

            // lets show the counter here
            this.get('total').innerHTML = this.getDataLength();

            // cache the container
            var $container = this.$( 'container' );

            // the gallery is ready, let's just wait for the css
            var num = { width: 0, height: 0 };
            var testHeight = function() {
                return self.$( 'stage' ).height();
            };

            // check container and thumbnail height
            Utils.wait({
                until: function() {

                    // keep trying to get the value
                    num = self._getWH();
                    $container.width( num.width ).height( num.height );
                    return testHeight() && num.width && num.height > 50;

                },
                success: function() {

                    self._width = num.width;
                    self._height = num.height;

                    // for some strange reason, webkit needs a single setTimeout to play ball
                    if ( Galleria.WEBKIT ) {
                        window.setTimeout( function() {
                            self._run();
                        }, 1);
                    } else {
                        self._run();
                    }
                },
                error: function() {

                    // Height was probably not set, raise hard errors

                    if ( testHeight() ) {
                        Galleria.raise('Could not extract sufficient width/height of the gallery container. Traced measures: width:' + num.width + 'px, height: ' + num.height + 'px.', true);
                    } else {
                        Galleria.raise('Could not extract a stage height from the CSS. Traced height: ' + testHeight() + 'px.', true);
                    }
                },
                timeout: typeof this._options.wait == 'number' ? this._options.wait : false
            });
        });

        // build the gallery frame
        this.append({
            'info-text' :
                ['info-title', 'info-description'],
            'info' :
                ['info-text'],
            'image-nav' :
                ['image-nav-right', 'image-nav-left'],
            'stage' :
                ['images', 'loader', 'counter', 'image-nav'],
            'thumbnails-list' :
                ['thumbnails'],
            'thumbnails-container' :
                ['thumb-nav-left', 'thumbnails-list', 'thumb-nav-right'],
            'container' :
                ['stage', 'thumbnails-container', 'info', 'tooltip']
        });

        Utils.hide( this.$( 'counter' ).append(
            this.get( 'current' ),
            doc.createTextNode(' / '),
            this.get( 'total' )
        ) );

        this.setCounter('&#8211;');

        Utils.hide( self.get('tooltip') );

        // add a notouch class on the container to prevent unwanted :hovers on touch devices
        this.$( 'container' ).addClass( Galleria.TOUCH ? 'touch' : 'notouch' );

        // add images to the controls
        $.each( new Array(2), function( i ) {

            // create a new Picture instance
            var image = new Galleria.Picture();

            // apply some styles, create & prepend overlay
            $( image.container ).css({
                position: 'absolute',
                top: 0,
                left: 0
            }).prepend( self._layers[i] = $( Utils.create('galleria-layer') ).css({
                position: 'absolute',
                top:0, left:0, right:0, bottom:0,
                zIndex:2
            })[0] );

            // append the image
            self.$( 'images' ).append( image.container );

            // reload the controls
            self._controls[i] = image;

        });

        // some forced generic styling
        this.$( 'images' ).css({
            position: 'relative',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
        });

        this.$( 'thumbnails, thumbnails-list' ).css({
            overflow: 'hidden',
            position: 'relative'
        });

        // bind image navigation arrows
        this.$( 'image-nav-right, image-nav-left' ).bind( 'click', function(e) {

            // tune the clicknext option
            if ( options.clicknext ) {
                e.stopPropagation();
            }

            // pause if options is set
            if ( options.pauseOnInteraction ) {
                self.pause();
            }

            // navigate
            var fn = /right/.test( this.className ) ? 'next' : 'prev';
            self[ fn ]();

        });

        // hide controls if chosen to
        $.each( ['info','counter','image-nav'], function( i, el ) {
            if ( options[ 'show' + el.substr(0,1).toUpperCase() + el.substr(1).replace(/-/,'') ] === false ) {
                Utils.moveOut( self.get( el.toLowerCase() ) );
            }
        });

        // load up target content
        this.load();

        // now it's usually safe to remove the content
        // IE will never stop loading if we remove it, so let's keep it hidden for IE (it's usually fast enough anyway)
        if ( !options.keepSource && !IE ) {
            this._target.innerHTML = '';
        }

        // re-append the errors, if they happened before clearing
        if ( this.get( 'errors' ) ) {
            this.appendChild( 'target', 'errors' );
        }

        // append the gallery frame
        this.appendChild( 'target', 'container' );

        // parse the carousel on each thumb load
        if ( options.carousel ) {
            var count = 0,
                show = options.show;
            this.bind( Galleria.THUMBNAIL, function() {
                this.updateCarousel();
                if ( ++count == this.getDataLength() && typeof show == 'number' && show > 0 ) {
                    this._carousel.follow( show );
                }
            });
        }

        // bind window resize for responsiveness
        if ( options.responsive ) {
            $win.bind( 'resize', function() {
                if ( !self.isFullscreen() ) {
                    self.resize();
                }
            });
        }

        // bind swipe gesture
        if ( options.swipe ) {

            (function( images ) {

                var swipeStart = [0,0],
                    swipeStop = [0,0],
                    limitX = 30,
                    limitY = 100,
                    multi = false,
                    tid = 0,
                    data,
                    ev = {
                        start: 'touchstart',
                        move: 'touchmove',
                        stop: 'touchend'
                    },
                    getData = function(e) {
                        return e.originalEvent.touches ? e.originalEvent.touches[0] : e;
                    },
                    moveHandler = function( e ) {

                        if ( e.originalEvent.touches && e.originalEvent.touches.length > 1 ) {
                            return;
                        }

                        data = getData( e );
                        swipeStop = [ data.pageX, data.pageY ];

                        if ( !swipeStart[0] ) {
                            swipeStart = swipeStop;
                        }

                        if ( Math.abs( swipeStart[0] - swipeStop[0] ) > 10 ) {
                            e.preventDefault();
                        }
                    },
                    upHandler = function( e ) {

                        images.unbind( ev.move, moveHandler );

                        // if multitouch (possibly zooming), abort
                        if ( ( e.originalEvent.touches && e.originalEvent.touches.length ) || multi ) {
                            multi = !multi;
                            return;
                        }

                        if ( Utils.timestamp() - tid < 1000 &&
                             Math.abs( swipeStart[0] - swipeStop[0] ) > limitX &&
                             Math.abs( swipeStart[1] - swipeStop[1] ) < limitY ) {

                            e.preventDefault();
                            self[ swipeStart[0] > swipeStop[0] ? 'next' : 'prev' ]();
                        }

                        swipeStart = swipeStop = [0,0];
                    };

                images.bind(ev.start, function(e) {

                    if ( e.originalEvent.touches && e.originalEvent.touches.length > 1 ) {
                        return;
                    }

                    data = getData(e);
                    tid = Utils.timestamp();
                    swipeStart = swipeStop = [ data.pageX, data.pageY ];
                    images.bind(ev.move, moveHandler ).one(ev.stop, upHandler);

                });

            }( self.$( 'images' ) ));

            // double-tap/click fullscreen toggle

            if ( options.fullscreenDoubleTap ) {

                this.$( 'stage' ).bind( 'touchstart', (function() {
                    var last, cx, cy, lx, ly, now,
                        getData = function(e) {
                            return e.originalEvent.touches ? e.originalEvent.touches[0] : e;
                        };
                    return function(e) {
                        now = Galleria.utils.timestamp();
                        cx = getData(e).pageX;
                        cy = getData(e).pageY;
                        if ( ( now - last < 500 ) && ( cx - lx < 20) && ( cy - ly < 20) ) {
                            self.toggleFullscreen();
                            e.preventDefault();
                            self.$( 'stage' ).unbind( 'touchend', arguments.callee );
                            return;
                        }
                        last = now;
                        lx = cx;
                        ly = cy;
                    };
                }()));
            }

        }

        // optimize touch for container
        Utils.optimizeTouch( this.get( 'container' ) );

        // bind the ons
        $.each( Galleria.on.binds, function(i, bind) {
            self.bind( bind.type, bind.callback );
        });

        return this;
    },

    // parse width & height from CSS or options

    _getWH : function() {

        var $container = this.$( 'container' ),
            $target = this.$( 'target' ),
            self = this,
            num = {},
            arr;

        $.each(['width', 'height'], function( i, m ) {

            // first check if options is set
            if ( self._options[ m ] && typeof self._options[ m ] === 'number') {
                num[ m ] = self._options[ m ];
            } else {

                arr = [
                    Utils.parseValue( $container.css( m ) ),         // the container css height
                    Utils.parseValue( $target.css( m ) ),            // the target css height
                    $container[ m ](),                               // the container jQuery method
                    $target[ m ]()                                   // the target jQuery method
                ];

                // if first time, include the min-width & min-height
                if ( !self[ '_'+m ] ) {
                    arr.splice(arr.length,
                        Utils.parseValue( $container.css( 'min-'+m ) ),
                        Utils.parseValue( $target.css( 'min-'+m ) )
                    );
                }

                // else extract the measures from different sources and grab the highest value
                num[ m ] = Math.max.apply( Math, arr );
            }
        });

        // allow setting a height ratio instead of exact value
        // useful when doing responsive galleries
        if ( self._options.height && self._options.height < 2 ) {
            num.height = num.width * self._options.height;
        }

        return num;
    },

    // Creates the thumbnails and carousel
    // can be used at any time, f.ex when the data object is manipulated

    _createThumbnails : function() {

        this.get( 'total' ).innerHTML = this.getDataLength();

        var i,
            src,
            thumb,
            data,
            special,

            $container,

            self = this,
            o = this._options,

            // get previously active thumbnail, if exists
            active = (function() {
                var a = self.$('thumbnails').find('.active');
                if ( !a.length ) {
                    return false;
                }
                return a.find('img').attr('src');
            }()),

            // cache the thumbnail option
            optval = typeof o.thumbnails === 'string' ? o.thumbnails.toLowerCase() : null,

            // move some data into the instance
            // for some reason, jQuery cant handle css(property) when zooming in FF, breaking the gallery
            // so we resort to getComputedStyle for browsers who support it
            getStyle = function( prop ) {
                return doc.defaultView && doc.defaultView.getComputedStyle ?
                    doc.defaultView.getComputedStyle( thumb.container, null )[ prop ] :
                    $container.css( prop );
            },

            fake = function(image, index, container) {
                return function() {
                    $( container ).append( image );
                    self.trigger({
                        type: Galleria.THUMBNAIL,
                        thumbTarget: image,
                        index: index,
                        galleriaData: self.getData( index )
                    });
                };
            },

            onThumbEvent = function( e ) {

                // pause if option is set
                if ( o.pauseOnInteraction ) {
                    self.pause();
                }

                // extract the index from the data
                var index = $( e.currentTarget ).data( 'index' );
                if ( self.getIndex() !== index ) {
                    self.show( index );
                }

                e.preventDefault();
            },

            onThumbLoad = function( thumb ) {

                // scale when ready
                thumb.scale({
                    width:    thumb.data.width,
                    height:   thumb.data.height,
                    crop:     o.thumbCrop,
                    margin:   o.thumbMargin,
                    canvas:   o.useCanvas,
                    complete: function( thumb ) {

                        // shrink thumbnails to fit
                        var top = ['left', 'top'],
                            arr = ['Width', 'Height'],
                            m,
                            css,
                            data = self.getData( thumb.index ),
                            special = data.thumb.split(':');

                        // calculate shrinked positions
                        $.each(arr, function( i, measure ) {
                            m = measure.toLowerCase();
                            if ( (o.thumbCrop !== true || o.thumbCrop === m ) && o.thumbFit ) {
                                css = {};
                                css[ m ] = thumb[ m ];
                                $( thumb.container ).css( css );
                                css = {};
                                css[ top[ i ] ] = 0;
                                $( thumb.image ).css( css );
                            }

                            // cache outer measures
                            thumb[ 'outer' + measure ] = $( thumb.container )[ 'outer' + measure ]( true );
                        });

                        // set high quality if downscale is moderate
                        Utils.toggleQuality( thumb.image,
                            o.thumbQuality === true ||
                            ( o.thumbQuality === 'auto' && thumb.original.width < thumb.width * 3 )
                        );

                        // get "special" thumbs from provider
                        if( data.iframe && special.length == 2 && special[0] in _video ) {
                            _video[ special[0] ].getThumb( special[1], (function(img) {
                                return function(src) {
                                    img.src = src;
                                };
                            }( thumb.image ) ));
                        }

                        // trigger the THUMBNAIL event
                        self.trigger({
                            type: Galleria.THUMBNAIL,
                            thumbTarget: thumb.image,
                            index: thumb.data.order,
                            galleriaData: self.getData( thumb.data.order )
                        });
                    }
                });
            };

        this._thumbnails = [];

        this.$( 'thumbnails' ).empty();

        // loop through data and create thumbnails
        for( i = 0; this._data[ i ]; i++ ) {

            data = this._data[ i ];

            if ( o.thumbnails === true && (data.thumb || data.image) ) {

                // add a new Picture instance
                thumb = new Galleria.Picture(i);

                // save the index
                thumb.index = i;

                // get source from thumb or image
                src = data.thumb || data.image;

                // append the thumbnail
                this.$( 'thumbnails' ).append( thumb.container );

                // cache the container
                $container = $( thumb.container );

                thumb.data = {
                    width  : Utils.parseValue( getStyle( 'width' ) ),
                    height : Utils.parseValue( getStyle( 'height' ) ),
                    order  : i
                };

                // grab & reset size for smoother thumbnail loads
                if ( o.thumbFit && o.thumbCrop !== true ) {
                    $container.css( { width: 'auto', height: 'auto' } );
                } else {
                    $container.css( { width: thumb.data.width, height: thumb.data.height } );
                }

                // load the thumbnail
                special = src.split(':');
                if ( special.length == 2 && special[0] in _video ) {
                    thumb.load('data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw%3D%3D', {
                        height: thumb.data.height,
                        width: thumb.data.height*1.25
                    }, onThumbLoad);
                } else {
                    thumb.load( src, onThumbLoad );
                }

                // preload all images here
                if ( o.preload === 'all' ) {
                    thumb.preload( data.image );
                }

            // create empty spans if thumbnails is set to 'empty'
            } else if ( data.iframe || optval === 'empty' || optval === 'numbers' ) {

                thumb = {
                    container:  Utils.create( 'galleria-image' ),
                    image: Utils.create( 'img', 'span' ),
                    ready: true
                };


                // create numbered thumbnails
                if ( optval === 'numbers' ) {
                    $( thumb.image ).text( i + 1 );
                }

                if( data.iframe ) {
                    $( thumb.image ).addClass('iframe');
                }

                this.$( 'thumbnails' ).append( thumb.container );

                // we need to "fake" a loading delay before we append and trigger
                // 50+ should be enough

                window.setTimeout( ( fake )( thumb.image, i, thumb.container ), 50 + ( i*20 ) );

            // create null object to silent errors
            } else {
                thumb = {
                    container: null,
                    image: null
                };
            }

            // add events for thumbnails
            // you can control the event type using thumb_event_type
            // we'll add the same event to the source if it's kept

            $( thumb.container ).add( o.keepSource && o.linkSourceImages ? data.original : null )
                .data('index', i).bind( o.thumbEventType, onThumbEvent );

            if (active === src) {
                $( thumb.container ).addClass( 'active' );
            }

            this._thumbnails.push( thumb );
        }
    },

    // the internal _run method should be called after loading data into galleria
    // makes sure the gallery has proper measurements before postrun & ready
    _run : function() {

        var self = this;

        self._createThumbnails();

        // make sure we have a stageHeight && stageWidth

        Utils.wait({

            timeout: 10000,

            until: function() {

                // Opera crap
                if ( Galleria.OPERA ) {
                    self.$( 'stage' ).css( 'display', 'inline-block' );
                }

                self._stageWidth  = self.$( 'stage' ).width();
                self._stageHeight = self.$( 'stage' ).height();

                return( self._stageWidth &&
                        self._stageHeight > 50 ); // what is an acceptable height?
            },

            success: function() {

                // save the instance
                _galleries.push( self );

                // postrun some stuff after the gallery is ready

                // show counter
                Utils.show( self.get('counter') );

                // bind carousel nav
                if ( self._options.carousel ) {
                    self._carousel.bindControls();
                }

                // start autoplay
                if ( self._options.autoplay ) {

                    self.pause();

                    if ( typeof self._options.autoplay === 'number' ) {
                        self._playtime = self._options.autoplay;
                    }

                    self.trigger( Galleria.PLAY );
                    self._playing = true;
                }
                // if second load, just do the show and return
                if ( self._firstrun ) {
                    if ( typeof self._options.show === 'number' ) {
                        self.show( self._options.show );
                    }
                    return;
                }

                self._firstrun = true;

                // initialize the History plugin
                if ( Galleria.History ) {

                    // bind the show method
                    Galleria.History.change(function( value ) {

                        // if ID is NaN, the user pressed back from the first image
                        // return to previous address
                        if ( isNaN( value ) ) {
                            window.history.go(-1);

                        // else show the image
                        } else {
                            self.show( value, undef, true );
                        }
                    });
                }

                self.trigger( Galleria.READY );

                // call the theme init method
                Galleria.theme.init.call( self, self._options );

                // Trigger Galleria.ready
                $.each( Galleria.ready.callbacks, function() {
                    this.call( self, self._options );
                });

                // call the extend option
                self._options.extend.call( self, self._options );

                // show the initial image
                // first test for permalinks in history
                if ( /^[0-9]{1,4}$/.test( HASH ) && Galleria.History ) {
                    self.show( HASH, undef, true );

                } else if( self._data[ self._options.show ] ) {
                    self.show( self._options.show );
                }
            },

            error: function() {
                Galleria.raise('Stage width or height is too small to show the gallery. Traced measures: width:' + self._stageWidth + 'px, height: ' + self._stageHeight + 'px.', true);
            }

        });
    },

    /**
        Loads data into the gallery.
        You can call this method on an existing gallery to reload the gallery with new data.

        @param {Array|string} [source] Optional JSON array of data or selector of where to find data in the document.
        Defaults to the Galleria target or dataSource option.

        @param {string} [selector] Optional element selector of what elements to parse.
        Defaults to 'img'.

        @param {Function} [config] Optional function to modify the data extraction proceedure from the selector.
        See the dataConfig option for more information.

        @returns Instance
    */

    load : function( source, selector, config ) {

        var self = this;

        // empty the data array
        this._data = [];

        // empty the thumbnails
        this._thumbnails = [];
        this.$('thumbnails').empty();

        // shorten the arguments
        if ( typeof selector === 'function' ) {
            config = selector;
            selector = null;
        }

        // use the source set by target
        source = source || this._options.dataSource;

        // use selector set by option
        selector = selector || this._options.dataSelector;

        // use the dataConfig set by option
        config = config || this._options.dataConfig;

        // if source is a true object, make it into an array
        if( /^function Object/.test( source.constructor ) ) {
            source = [source];
        }

        // check if the data is an array already
        if ( source.constructor === Array ) {
            if ( this.validate( source ) ) {

                this._data = source;
                this._parseData().trigger( Galleria.DATA );

            } else {
                Galleria.raise( 'Load failed: JSON Array not valid.' );
            }
            return this;
        }

        // add .video and .iframe to the selector (1.2.7)
        selector += ',.video,.iframe';

        // loop through images and set data
        $( source ).find( selector ).each( function( i, elem ) {

            elem = $( elem );
            var data = {},
                parent = elem.parent(),
                href = parent.attr( 'href' ),
                rel  = parent.attr( 'rel' );

            if( href && ( elem[0].nodeName == 'IMG' || elem.hasClass('video') ) && _videoTest( href ) ) {
                data.video = href;
            } else if( href && elem.hasClass('iframe') ) {
                data.iframe = href;
            } else {
                data.image = data.big = href;
            }

            if ( rel ) {
                data.big = rel;
            }

            // alternative extraction from HTML5 data attribute, added in 1.2.7
            $.each( 'big title description link layer'.split(' '), function( i, val ) {
                if ( elem.data(val) ) {
                    data[ val ] = elem.data(val);
                }
            });

            // mix default extractions with the hrefs and config
            // and push it into the data array
            self._data.push( $.extend({

                title:       elem.attr('title') || '',
                thumb:       elem.attr('src'),
                image:       elem.attr('src'),
                big:         elem.attr('src'),
                description: elem.attr('alt') || '',
                link:        elem.attr('longdesc'),
                original:    elem.get(0) // saved as a reference

            }, data, config( elem ) ) );

        });
        // trigger the DATA event and return
        if ( this.getDataLength() ) {
            this._parseData().trigger( Galleria.DATA );
        } else {
            Galleria.raise('Load failed: no data found.');
        }
        return this;

    },

    // make sure the data works properly
    _parseData : function() {

        var self = this,
            current;

        $.each( this._data, function( i, data ) {

            current = self._data[ i ];

            // copy image as thumb if no thumb exists
            if ( 'thumb' in data === false ) {
                current.thumb = data.image;
            }
            // copy image as big image if no biggie exists
            if ( !'big' in data ) {
                current.big = data.image;
            }
            // parse video
            if ( 'video' in data ) {
                var result = _videoTest( data.video );

                if ( result ) {
                    current.iframe = _video[ result.provider ].embed( result.id ) + (function() {

                        // add options
                        if ( typeof self._options[ result.provider ] == 'object' ) {
                            var str = '?', arr = [];
                            $.each( self._options[ result.provider ], function( key, val ) {
                                arr.push( key + '=' + val );
                            });

                            // small youtube specifics, perhaps move to _video later
                            if ( result.provider == 'youtube' ) {
                                arr = ['wmode=opaque'].concat(arr);
                            }
                            return str + arr.join('&');
                        }
                        return '';
                    }());
                    delete current.video;
                    if( !('thumb' in current) || !current.thumb ) {
                        current.thumb = result.provider+':'+result.id;
                    }
                }
            }
        });

        return this;
    },

    /**
        Destroy the Galleria instance and recover the original content

        @example this.destroy();

        @returns Instance
    */

    destroy: function() {
        this.get('target').innerHTML = this._original.html;
        return this;
    },

    /**
        Adds and/or removes images from the gallery
        Works just like Array.splice
        https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice

        @example this.splice( 2, 4 ); // removes 4 images after the second image

        @returns Instance
    */

    splice: function() {
        var self = this,
            args = Utils.array( arguments );
        window.setTimeout(function() {
            protoArray.splice.apply( self._data, args );
            self._parseData()._createThumbnails();
        },2);
        return self;
    },

    /**
        Append images to the gallery
        Works just like Array.push
        https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/push

        @example this.push({ image: 'image1.jpg' }); // appends the image to the gallery

        @returns Instance
    */

    push: function() {
        var self = this,
            args = Utils.array( arguments );
        window.setTimeout(function() {
            protoArray.push.apply( self._data, args );
            self._parseData()._createThumbnails();
        },2);
        return self;
    },

    _getActive: function() {
        return this._controls.getActive();
    },

    validate : function( data ) {
        // todo: validate a custom data array
        return true;
    },

    /**
        Bind any event to Galleria

        @param {string} type The Event type to listen for
        @param {Function} fn The function to execute when the event is triggered

        @example this.bind( 'image', function() { Galleria.log('image shown') });

        @returns Instance
    */

    bind : function(type, fn) {

        // allow 'image' instead of Galleria.IMAGE
        type = _patchEvent( type );

        this.$( 'container' ).bind( type, this.proxy(fn) );
        return this;
    },

    /**
        Unbind any event to Galleria

        @param {string} type The Event type to forget

        @returns Instance
    */

    unbind : function(type) {

        type = _patchEvent( type );

        this.$( 'container' ).unbind( type );
        return this;
    },

    /**
        Manually trigger a Galleria event

        @param {string} type The Event to trigger

        @returns Instance
    */

    trigger : function( type ) {

        type = typeof type === 'object' ?
            $.extend( type, { scope: this } ) :
            { type: _patchEvent( type ), scope: this };

        this.$( 'container' ).trigger( type );

        return this;
    },

    /**
        Assign an "idle state" to any element.
        The idle state will be applied after a certain amount of idle time
        Useful to hide f.ex navigation when the gallery is inactive

        @param {HTMLElement|string} elem The Dom node or selector to apply the idle state to
        @param {Object} styles the CSS styles to apply

        @example addIdleState( this.get('image-nav'), { opacity: 0 });
        @example addIdleState( '.galleria-image-nav', { top: -200 });

        @returns Instance
    */

    addIdleState: function( elem, styles ) {
        this._idle.add.apply( this._idle, Utils.array( arguments ) );
        return this;
    },

    /**
        Removes any idle state previously set using addIdleState()

        @param {HTMLElement|string} elem The Dom node or selector to remove the idle state from.

        @returns Instance
    */

    removeIdleState: function( elem ) {
        this._idle.remove.apply( this._idle, Utils.array( arguments ) );
        return this;
    },

    /**
        Force Galleria to enter idle mode.

        @returns Instance
    */

    enterIdleMode: function() {
        this._idle.hide();
        return this;
    },

    /**
        Force Galleria to exit idle mode.

        @returns Instance
    */

    exitIdleMode: function() {
        this._idle.showAll();
        return this;
    },

    /**
        Enter FullScreen mode

        @param {Function} callback the function to be executed when the fullscreen mode is fully applied.

        @returns Instance
    */

    enterFullscreen: function( callback ) {
        this._fullscreen.enter.apply( this, Utils.array( arguments ) );
        return this;
    },

    /**
        Exits FullScreen mode

        @param {Function} callback the function to be executed when the fullscreen mode is fully applied.

        @returns Instance
    */

    exitFullscreen: function( callback ) {
        this._fullscreen.exit.apply( this, Utils.array( arguments ) );
        return this;
    },

    /**
        Toggle FullScreen mode

        @param {Function} callback the function to be executed when the fullscreen mode is fully applied or removed.

        @returns Instance
    */

    toggleFullscreen: function( callback ) {
        this._fullscreen[ this.isFullscreen() ? 'exit' : 'enter'].apply( this, Utils.array( arguments ) );
        return this;
    },

    /**
        Adds a tooltip to any element.
        You can also call this method with an object as argument with elemID:value pairs to apply tooltips to (see examples)

        @param {HTMLElement} elem The DOM Node to attach the event to
        @param {string|Function} value The tooltip message. Can also be a function that returns a string.

        @example this.bindTooltip( this.get('thumbnails'), 'My thumbnails');
        @example this.bindTooltip( this.get('thumbnails'), function() { return 'My thumbs' });
        @example this.bindTooltip( { image_nav: 'Navigation' });

        @returns Instance
    */

    bindTooltip: function( elem, value ) {
        this._tooltip.bind.apply( this._tooltip, Utils.array(arguments) );
        return this;
    },

    /**
        Note: this method is deprecated. Use refreshTooltip() instead.

        Redefine a tooltip.
        Use this if you want to re-apply a tooltip value to an already bound tooltip element.

        @param {HTMLElement} elem The DOM Node to attach the event to
        @param {string|Function} value The tooltip message. Can also be a function that returns a string.

        @returns Instance
    */

    defineTooltip: function( elem, value ) {
        this._tooltip.define.apply( this._tooltip, Utils.array(arguments) );
        return this;
    },

    /**
        Refresh a tooltip value.
        Use this if you want to change the tooltip value at runtime, f.ex if you have a play/pause toggle.

        @param {HTMLElement} elem The DOM Node that has a tooltip that should be refreshed

        @returns Instance
    */

    refreshTooltip: function( elem ) {
        this._tooltip.show.apply( this._tooltip, Utils.array(arguments) );
        return this;
    },

    /**
        Open a pre-designed lightbox with the currently active image.
        You can control some visuals using gallery options.

        @returns Instance
    */

    openLightbox: function() {
        this._lightbox.show.apply( this._lightbox, Utils.array( arguments ) );
        return this;
    },

    /**
        Close the lightbox.

        @returns Instance
    */

    closeLightbox: function() {
        this._lightbox.hide.apply( this._lightbox, Utils.array( arguments ) );
        return this;
    },

    /**
        Get the currently active image element.

        @returns {HTMLElement} The image element
    */

    getActiveImage: function() {
        return this._getActive().image || undef;
    },

    /**
        Get the currently active thumbnail element.

        @returns {HTMLElement} The thumbnail element
    */

    getActiveThumb: function() {
        return this._thumbnails[ this._active ].image || undef;
    },

    /**
        Get the mouse position relative to the gallery container

        @param e The mouse event

        @example

var gallery = this;
$(document).mousemove(function(e) {
    console.log( gallery.getMousePosition(e).x );
});

        @returns {Object} Object with x & y of the relative mouse postion
    */

    getMousePosition : function(e) {
        return {
            x: e.pageX - this.$( 'container' ).offset().left,
            y: e.pageY - this.$( 'container' ).offset().top
        };
    },

    /**
        Adds a panning effect to the image

        @param [img] The optional image element. If not specified it takes the currently active image

        @returns Instance
    */

    addPan : function( img ) {

        if ( this._options.imageCrop === false ) {
            return;
        }

        img = $( img || this.getActiveImage() );

        // define some variables and methods
        var self   = this,
            x      = img.width() / 2,
            y      = img.height() / 2,
            destX  = parseInt( img.css( 'left' ), 10 ),
            destY  = parseInt( img.css( 'top' ), 10 ),
            curX   = destX || 0,
            curY   = destY || 0,
            distX  = 0,
            distY  = 0,
            active = false,
            ts     = Utils.timestamp(),
            cache  = 0,
            move   = 0,

            // positions the image
            position = function( dist, cur, pos ) {
                if ( dist > 0 ) {
                    move = Math.round( Math.max( dist * -1, Math.min( 0, cur ) ) );
                    if ( cache !== move ) {

                        cache = move;

                        if ( IE === 8 ) { // scroll is faster for IE
                            img.parent()[ 'scroll' + pos ]( move * -1 );
                        } else {
                            var css = {};
                            css[ pos.toLowerCase() ] = move;
                            img.css(css);
                        }
                    }
                }
            },

            // calculates mouse position after 50ms
            calculate = function(e) {
                if (Utils.timestamp() - ts < 50) {
                    return;
                }
                active = true;
                x = self.getMousePosition(e).x;
                y = self.getMousePosition(e).y;
            },

            // the main loop to check
            loop = function(e) {

                if (!active) {
                    return;
                }

                distX = img.width() - self._stageWidth;
                distY = img.height() - self._stageHeight;
                destX = x / self._stageWidth * distX * -1;
                destY = y / self._stageHeight * distY * -1;
                curX += ( destX - curX ) / self._options.imagePanSmoothness;
                curY += ( destY - curY ) / self._options.imagePanSmoothness;

                position( distY, curY, 'Top' );
                position( distX, curX, 'Left' );

            };

        // we need to use scroll in IE8 to speed things up
        if ( IE === 8 ) {

            img.parent().scrollTop( curY * -1 ).scrollLeft( curX * -1 );
            img.css({
                top: 0,
                left: 0
            });

        }

        // unbind and bind event
        this.$( 'stage' ).unbind( 'mousemove', calculate ).bind( 'mousemove', calculate );

        // loop the loop
        Utils.addTimer( 'pan' + self._id, loop, 50, true);

        return this;
    },

    /**
        Brings the scope into any callback

        @param fn The callback to bring the scope into
        @param [scope] Optional scope to bring

        @example $('#fullscreen').click( this.proxy(function() { this.enterFullscreen(); }) )

        @returns {Function} Return the callback with the gallery scope
    */

    proxy : function( fn, scope ) {
        if ( typeof fn !== 'function' ) {
            return F;
        }
        scope = scope || this;
        return function() {
            return fn.apply( scope, Utils.array( arguments ) );
        };
    },

    /**
        Removes the panning effect set by addPan()

        @returns Instance
    */

    removePan: function() {

        // todo: doublecheck IE8

        this.$( 'stage' ).unbind( 'mousemove' );

        Utils.clearTimer( 'pan' + this._id );

        return this;
    },

    /**
        Adds an element to the Galleria DOM array.
        When you add an element here, you can access it using element ID in many API calls

        @param {string} id The element ID you wish to use. You can add many elements by adding more arguments.

        @example addElement('mybutton');
        @example addElement('mybutton','mylink');

        @returns Instance
    */

    addElement : function( id ) {

        var dom = this._dom;

        $.each( Utils.array(arguments), function( i, blueprint ) {
           dom[ blueprint ] = Utils.create( 'galleria-' + blueprint );
        });

        return this;
    },

    /**
        Attach keyboard events to Galleria

        @param {Object} map The map object of events.
        Possible keys are 'UP', 'DOWN', 'LEFT', 'RIGHT', 'RETURN', 'ESCAPE', 'BACKSPACE', and 'SPACE'.

        @example

this.attachKeyboard({
    right: this.next,
    left: this.prev,
    up: function() {
        console.log( 'up key pressed' )
    }
});

        @returns Instance
    */

    attachKeyboard : function( map ) {
        this._keyboard.attach.apply( this._keyboard, Utils.array( arguments ) );
        return this;
    },

    /**
        Detach all keyboard events to Galleria

        @returns Instance
    */

    detachKeyboard : function() {
        this._keyboard.detach.apply( this._keyboard, Utils.array( arguments ) );
        return this;
    },

    /**
        Fast helper for appending galleria elements that you added using addElement()

        @param {string} parentID The parent element ID where the element will be appended
        @param {string} childID the element ID that should be appended

        @example this.addElement('myElement');
        this.appendChild( 'info', 'myElement' );

        @returns Instance
    */

    appendChild : function( parentID, childID ) {
        this.$( parentID ).append( this.get( childID ) || childID );
        return this;
    },

    /**
        Fast helper for prepending galleria elements that you added using addElement()

        @param {string} parentID The parent element ID where the element will be prepended
        @param {string} childID the element ID that should be prepended

        @example

this.addElement('myElement');
this.prependChild( 'info', 'myElement' );

        @returns Instance
    */

    prependChild : function( parentID, childID ) {
        this.$( parentID ).prepend( this.get( childID ) || childID );
        return this;
    },

    /**
        Remove an element by blueprint

        @param {string} elemID The element to be removed.
        You can remove multiple elements by adding arguments.

        @returns Instance
    */

    remove : function( elemID ) {
        this.$( Utils.array( arguments ).join(',') ).remove();
        return this;
    },

    // a fast helper for building dom structures
    // leave this out of the API for now

    append : function( data ) {
        var i, j;
        for( i in data ) {
            if ( data.hasOwnProperty( i ) ) {
                if ( data[i].constructor === Array ) {
                    for( j = 0; data[i][j]; j++ ) {
                        this.appendChild( i, data[i][j] );
                    }
                } else {
                    this.appendChild( i, data[i] );
                }
            }
        }
        return this;
    },

    // an internal helper for scaling according to options
    _scaleImage : function( image, options ) {

        image = image || this._controls.getActive();

        // janpub (JH) fix:
        // image might be unselected yet
        // e.g. when external logics rescales the gallery on window resize events
        if( !image ) {
            return;
        }

        var self = this,

            complete,

            scaleLayer = function( img ) {
                $( img.container ).children(':first').css({
                    top: Math.max(0, Utils.parseValue( img.image.style.top )),
                    left: Math.max(0, Utils.parseValue( img.image.style.left )),
                    width: Utils.parseValue( img.image.width ),
                    height: Utils.parseValue( img.image.height )
                });
            };

        options = $.extend({
            width:    this._stageWidth,
            height:   this._stageHeight,
            crop:     this._options.imageCrop,
            max:      this._options.maxScaleRatio,
            min:      this._options.minScaleRatio,
            margin:   this._options.imageMargin,
            position: this._options.imagePosition
        }, options );

        if ( this._options.layerFollow && this._options.imageCrop !== true ) {

            if ( typeof options.complete == 'function' ) {
                complete = options.complete;
                options.complete = function() {
                    complete.call( image, image );
                    scaleLayer( image );
                };
            } else {
                options.complete = scaleLayer;
            }

        } else {
            $( image.container ).children(':first').css({ top: 0, left: 0 });
        }

        image.scale( options );
        return this;
    },

    /**
        Updates the carousel,
        useful if you resize the gallery and want to re-check if the carousel nav is needed.

        @returns Instance
    */

    updateCarousel : function() {
        this._carousel.update();
        return this;
    },

    /**
        Resize the entire gallery container

        @param {Object} [measures] Optional object with width/height specified
        @param {Function} [complete] The callback to be called when the scaling is complete

        @returns Instance
    */

    resize : function( measures, complete ) {

        if ( typeof measures == 'function' ) {
            complete = measures;
            measures = undef;
        }

        measures = $.extend( { width:0, height:0 }, measures );

        var self = this,
            $container = this.$( 'container' ),
            aspect = this._options.responsive == 'aspect' && ( !measures.width || !measures.height ),
            ratio;

        $.each( measures, function( m, val ) {
            if ( !val ) {
                $container[ m ]( 'auto' );
                measures[ m ] = self._getWH()[ m ];
            }
        });

        // experimental aspect option, not documented yet. Use ratio-based height instead!
        if ( aspect ) {
            ratio = Math.min( measures.width/this._width, measures.height/this._height );
        }

        $.each( measures, function( m, val ) {
            $container[ m ]( ratio ? ratio * self[ '_' + m ] : val );
        });

        return this.rescale( complete );

    },

    /**
        Rescales the gallery

        @param {number} width The target width
        @param {number} height The target height
        @param {Function} complete The callback to be called when the scaling is complete

        @returns Instance
    */

    rescale : function( width, height, complete ) {

        var self = this;

        // allow rescale(fn)
        if ( typeof width === 'function' ) {
            complete = width;
            width = undef;
        }

        var scale = function() {

            // set stagewidth
            self._stageWidth = width || self.$( 'stage' ).width();
            self._stageHeight = height || self.$( 'stage' ).height();

            // scale the active image
            self._scaleImage();

            if ( self._options.carousel ) {
                self.updateCarousel();
            }

            self.trigger( Galleria.RESCALE );

            if ( typeof complete === 'function' ) {
                complete.call( self );
            }
        };


        if ( Galleria.WEBKIT && !Galleria.TOUCH && !width && !height ) {
            Utils.addTimer( false, scale, 10 );// webkit is too fast
        } else {
            scale.call( self );
        }

        return this;
    },

    /**
        Refreshes the gallery.
        Useful if you change image options at runtime and want to apply the changes to the active image.

        @returns Instance
    */

    refreshImage : function() {
        this._scaleImage();
        if ( this._options.imagePan ) {
            this.addPan();
        }
        return this;
    },

    /**
        Shows an image by index

        @param {number|boolean} index The index to show
        @param {Boolean} rewind A boolean that should be true if you want the transition to go back

        @returns Instance
    */

    show : function( index, rewind, _history ) {

        // do nothing if index is false or queue is false and transition is in progress
        if ( index === false || ( !this._options.queue && this._queue.stalled ) ) {
            return;
        }

        index = Math.max( 0, Math.min( parseInt( index, 10 ), this.getDataLength() - 1 ) );

        rewind = typeof rewind !== 'undefined' ? !!rewind : index < this.getIndex();

        _history = _history || false;

        // do the history thing and return
        if ( !_history && Galleria.History ) {
            Galleria.History.set( index.toString() );
            return;
        }

        this._active = index;

        protoArray.push.call( this._queue, {
            index : index,
            rewind : rewind
        });
        if ( !this._queue.stalled ) {
            this._show();
        }

        return this;
    },

    // the internal _show method does the actual showing
    _show : function() {

        // shortcuts
        var self = this,
            queue = this._queue[ 0 ],
            data = this.getData( queue.index );

        if ( !data ) {
            return;
        }

        var src = data.iframe || ( this.isFullscreen() && 'big' in data ? data.big : data.image ), // use big image if fullscreen mode
            active = this._controls.getActive(),
            next = this._controls.getNext(),
            cached = next.isCached( src ),
            thumb = this._thumbnails[ queue.index ],
            mousetrigger = function() {
                $( next.image ).trigger( 'mouseup' );
            };

        // to be fired when loading & transition is complete:
        var complete = (function( data, next, active, queue, thumb ) {

            return function() {

                var win;

                // remove stalled
                self._queue.stalled = false;

                // optimize quality
                Utils.toggleQuality( next.image, self._options.imageQuality );

                // remove old layer
                self._layers[ self._controls.active ].innerHTML = '';

                // swap
                $( active.container ).css({
                    zIndex: 0,
                    opacity: 0
                }).show();

                if( active.isIframe ) {
                    $( active.container ).find( 'iframe' ).remove();
                }

                self.$('container').toggleClass('iframe', !!data.iframe);

                $( next.container ).css({
                    zIndex: 1,
                    left: 0,
                    top: 0
                }).show();

                self._controls.swap();

                // add pan according to option
                if ( self._options.imagePan ) {
                    self.addPan( next.image );
                }

                // make the image link or add lightbox
                // link takes precedence over lightbox if both are detected
                if ( data.link || self._options.lightbox || self._options.clicknext ) {

                    $( next.image ).css({
                        cursor: 'pointer'
                    }).bind( 'mouseup', function() {

                        // clicknext
                        if ( self._options.clicknext && !Galleria.TOUCH ) {
                            if ( self._options.pauseOnInteraction ) {
                                self.pause();
                            }
                            self.next();
                            return;
                        }

                        // popup link
                        if ( data.link ) {
                            if ( self._options.popupLinks ) {
                                win = window.open( data.link, '_blank' );
                            } else {
                                window.location.href = data.link;
                            }
                            return;
                        }

                        if ( self._options.lightbox ) {
                            self.openLightbox();
                        }

                    });
                }

                // remove the queued image
                protoArray.shift.call( self._queue );

                // if we still have images in the queue, show it
                if ( self._queue.length ) {
                    self._show();
                }

                // check if we are playing
                self._playCheck();

                // trigger IMAGE event
                self.trigger({
                    type: Galleria.IMAGE,
                    index: queue.index,
                    imageTarget: next.image,
                    thumbTarget: thumb.image,
                    galleriaData: data
                });
            };
        }( data, next, active, queue, thumb ));

        // let the carousel follow
        if ( this._options.carousel && this._options.carouselFollow ) {
            this._carousel.follow( queue.index );
        }

        // preload images
        if ( this._options.preload ) {

            var p, i,
                n = this.getNext(),
                ndata;

            try {
                for ( i = this._options.preload; i > 0; i-- ) {
                    p = new Galleria.Picture();
                    ndata = self.getData( n );
                    p.preload( this.isFullscreen() && 'big' in ndata ? ndata.big : ndata.image );
                    n = self.getNext( n );
                }
            } catch(e) {}
        }

        // show the next image, just in case
        Utils.show( next.container );

        next.isIframe = !!data.iframe;

        // add active classes
        $( self._thumbnails[ queue.index ].container )
            .addClass( 'active' )
            .siblings( '.active' )
            .removeClass( 'active' );

        // trigger the LOADSTART event
        self.trigger( {
            type: Galleria.LOADSTART,
            cached: cached,
            index: queue.index,
            rewind: queue.rewind,
            imageTarget: next.image,
            thumbTarget: thumb.image,
            galleriaData: data
        });

        // begin loading the next image
        next.load( src, function( next ) {

            // add layer HTML
            var layer = $( self._layers[ 1-self._controls.active ] ).html( data.layer || '' ).hide();

            self._scaleImage( next, {

                complete: function( next ) {

                    // toggle low quality for IE
                    if ( 'image' in active ) {
                        Utils.toggleQuality( active.image, false );
                    }
                    Utils.toggleQuality( next.image, false );

                    // stall the queue
                    self._queue.stalled = true;

                    // remove the image panning, if applied
                    // TODO: rethink if this is necessary
                    self.removePan();

                    // set the captions and counter
                    self.setInfo( queue.index );
                    self.setCounter( queue.index );

                    // show the layer now
                    if ( data.layer ) {
                        layer.show();
                        // inherit click events set on image
                        if ( data.link || self._options.lightbox || self._options.clicknext ) {
                            layer.css( 'cursor', 'pointer' ).unbind( 'mouseup' ).mouseup( mousetrigger );
                        }
                    }

                    // trigger the LOADFINISH event
                    self.trigger({
                        type: Galleria.LOADFINISH,
                        cached: cached,
                        index: queue.index,
                        rewind: queue.rewind,
                        imageTarget: next.image,
                        thumbTarget: self._thumbnails[ queue.index ].image,
                        galleriaData: self.getData( queue.index )
                    });

                    var transition = self._options.transition;

                    // can JavaScript loop through objects in order? yes.
                    $.each({
                        initial: active.image === null,
                        touch: Galleria.TOUCH,
                        fullscreen: self.isFullscreen()
                    }, function( type, arg ) {
                        if ( arg && self._options[ type + 'Transition' ] !== undef ) {
                            transition = self._options[ type + 'Transition' ];
                            return false;
                        }
                    });

                    // validate the transition
                    if ( transition in _transitions === false ) {
                        complete();
                    } else {
                        var params = {
                            prev: active.container,
                            next: next.container,
                            rewind: queue.rewind,
                            speed: self._options.transitionSpeed || 400
                        };

                        // call the transition function and send some stuff
                        _transitions[ transition ].call(self, params, complete );

                    }
                }
            });
        });
    },

    /**
        Gets the next index

        @param {number} [base] Optional starting point

        @returns {number} the next index, or the first if you are at the first (looping)
    */

    getNext : function( base ) {
        base = typeof base === 'number' ? base : this.getIndex();
        return base === this.getDataLength() - 1 ? 0 : base + 1;
    },

    /**
        Gets the previous index

        @param {number} [base] Optional starting point

        @returns {number} the previous index, or the last if you are at the first (looping)
    */

    getPrev : function( base ) {
        base = typeof base === 'number' ? base : this.getIndex();
        return base === 0 ? this.getDataLength() - 1 : base - 1;
    },

    /**
        Shows the next image in line

        @returns Instance
    */

    next : function() {
        if ( this.getDataLength() > 1 ) {
            this.show( this.getNext(), false );
        }
        return this;
    },

    /**
        Shows the previous image in line

        @returns Instance
    */

    prev : function() {
        if ( this.getDataLength() > 1 ) {
            this.show( this.getPrev(), true );
        }
        return this;
    },

    /**
        Retrieve a DOM element by element ID

        @param {string} elemId The delement ID to fetch

        @returns {HTMLElement} The elements DOM node or null if not found.
    */

    get : function( elemId ) {
        return elemId in this._dom ? this._dom[ elemId ] : null;
    },

    /**
        Retrieve a data object

        @param {number} index The data index to retrieve.
        If no index specified it will take the currently active image

        @returns {Object} The data object
    */

    getData : function( index ) {
        return index in this._data ?
            this._data[ index ] : this._data[ this._active ];
    },

    /**
        Retrieve the number of data items

        @returns {number} The data length
    */
    getDataLength : function() {
        return this._data.length;
    },

    /**
        Retrieve the currently active index

        @returns {number|boolean} The active index or false if none found
    */

    getIndex : function() {
        return typeof this._active === 'number' ? this._active : false;
    },

    /**
        Retrieve the stage height

        @returns {number} The stage height
    */

    getStageHeight : function() {
        return this._stageHeight;
    },

    /**
        Retrieve the stage width

        @returns {number} The stage width
    */

    getStageWidth : function() {
        return this._stageWidth;
    },

    /**
        Retrieve the option

        @param {string} key The option key to retrieve. If no key specified it will return all options in an object.

        @returns option or options
    */

    getOptions : function( key ) {
        return typeof key === 'undefined' ? this._options : this._options[ key ];
    },

    /**
        Set options to the instance.
        You can set options using a key & value argument or a single object argument (see examples)

        @param {string} key The option key
        @param {string} value the the options value

        @example setOptions( 'autoplay', true )
        @example setOptions({ autoplay: true });

        @returns Instance
    */

    setOptions : function( key, value ) {
        if ( typeof key === 'object' ) {
            $.extend( this._options, key );
        } else {
            this._options[ key ] = value;
        }
        return this;
    },

    /**
        Starts playing the slideshow

        @param {number} delay Sets the slideshow interval in milliseconds.
        If you set it once, you can just call play() and get the same interval the next time.

        @returns Instance
    */

    play : function( delay ) {

        this._playing = true;

        this._playtime = delay || this._playtime;

        this._playCheck();

        this.trigger( Galleria.PLAY );

        return this;
    },

    /**
        Stops the slideshow if currently playing

        @returns Instance
    */

    pause : function() {

        this._playing = false;

        this.trigger( Galleria.PAUSE );

        return this;
    },

    /**
        Toggle between play and pause events.

        @param {number} delay Sets the slideshow interval in milliseconds.

        @returns Instance
    */

    playToggle : function( delay ) {
        return ( this._playing ) ? this.pause() : this.play( delay );
    },

    /**
        Checks if the gallery is currently playing

        @returns {Boolean}
    */

    isPlaying : function() {
        return this._playing;
    },

    /**
        Checks if the gallery is currently in fullscreen mode

        @returns {Boolean}
    */

    isFullscreen : function() {
        return this._fullscreen.active;
    },

    _playCheck : function() {
        var self = this,
            played = 0,
            interval = 20,
            now = Utils.timestamp(),
            timer_id = 'play' + this._id;

        if ( this._playing ) {

            Utils.clearTimer( timer_id );

            var fn = function() {

                played = Utils.timestamp() - now;
                if ( played >= self._playtime && self._playing ) {
                    Utils.clearTimer( timer_id );
                    self.next();
                    return;
                }
                if ( self._playing ) {

                    // trigger the PROGRESS event
                    self.trigger({
                        type:         Galleria.PROGRESS,
                        percent:      Math.ceil( played / self._playtime * 100 ),
                        seconds:      Math.floor( played / 1000 ),
                        milliseconds: played
                    });

                    Utils.addTimer( timer_id, fn, interval );
                }
            };
            Utils.addTimer( timer_id, fn, interval );
        }
    },

    /**
        Modify the slideshow delay

        @param {number} delay the number of milliseconds between slides,

        @returns Instance
    */

    setPlaytime: function( delay ) {
        this._playtime = delay;
        return this;
    },

    setIndex: function( val ) {
        this._active = val;
        return this;
    },

    /**
        Manually modify the counter

        @param {number} [index] Optional data index to fectch,
        if no index found it assumes the currently active index

        @returns Instance
    */

    setCounter: function( index ) {

        if ( typeof index === 'number' ) {
            index++;
        } else if ( typeof index === 'undefined' ) {
            index = this.getIndex()+1;
        }

        this.get( 'current' ).innerHTML = index;

        if ( IE ) { // weird IE bug

            var count = this.$( 'counter' ),
                opacity = count.css( 'opacity' );

            if ( parseInt( opacity, 10 ) === 1) {
                Utils.removeAlpha( count[0] );
            } else {
                this.$( 'counter' ).css( 'opacity', opacity );
            }

        }

        return this;
    },

    /**
        Manually set captions

        @param {number} [index] Optional data index to fectch and apply as caption,
        if no index found it assumes the currently active index

        @returns Instance
    */

    setInfo : function( index ) {

        var self = this,
            data = this.getData( index );

        $.each( ['title','description'], function( i, type ) {

            var elem = self.$( 'info-' + type );

            if ( !!data[type] ) {
                elem[ data[ type ].length ? 'show' : 'hide' ]().html( data[ type ] );
            } else {
               elem.empty().hide();
            }
        });

        return this;
    },

    /**
        Checks if the data contains any captions

        @param {number} [index] Optional data index to fectch,
        if no index found it assumes the currently active index.

        @returns {boolean}
    */

    hasInfo : function( index ) {

        var check = 'title description'.split(' '),
            i;

        for ( i = 0; check[i]; i++ ) {
            if ( !!this.getData( index )[ check[i] ] ) {
                return true;
            }
        }
        return false;

    },

    jQuery : function( str ) {

        var self = this,
            ret = [];

        $.each( str.split(','), function( i, elemId ) {
            elemId = $.trim( elemId );

            if ( self.get( elemId ) ) {
                ret.push( elemId );
            }
        });

        var jQ = $( self.get( ret.shift() ) );

        $.each( ret, function( i, elemId ) {
            jQ = jQ.add( self.get( elemId ) );
        });

        return jQ;

    },

    /**
        Converts element IDs into a jQuery collection
        You can call for multiple IDs separated with commas.

        @param {string} str One or more element IDs (comma-separated)

        @returns jQuery

        @example this.$('info,container').hide();
    */

    $ : function( str ) {
        return this.jQuery.apply( this, Utils.array( arguments ) );
    }

};

// End of Galleria prototype

// Add events as static variables
$.each( _events, function( i, ev ) {

    // legacy events
    var type = /_/.test( ev ) ? ev.replace( /_/g, '' ) : ev;

    Galleria[ ev.toUpperCase() ] = 'galleria.'+type;

} );

$.extend( Galleria, {

    // Browser helpers
    IE9:     IE === 9,
    IE8:     IE === 8,
    IE7:     IE === 7,
    IE6:     IE === 6,
    IE:      IE,
    WEBKIT:  /webkit/.test( NAV ),
    CHROME:  /chrome/.test( NAV ),
    SAFARI:  /safari/.test( NAV ) && !(/chrome/.test( NAV )),
    QUIRK:   ( IE && doc.compatMode && doc.compatMode === "BackCompat" ),
    MAC:     /mac/.test( navigator.platform.toLowerCase() ),
    OPERA:   !!window.opera,
    IPHONE:  /iphone/.test( NAV ),
    IPAD:    /ipad/.test( NAV ),
    ANDROID: /android/.test( NAV ),
    TOUCH:   ('ontouchstart' in doc)

});

// Galleria static methods

/**
    Adds a theme that you can use for your Gallery

    @param {Object} theme Object that should contain all your theme settings.
    <ul>
        <li>name - name of the theme</li>
        <li>author - name of the author</li>
        <li>css - css file name (not path)</li>
        <li>defaults - default options to apply, including theme-specific options</li>
        <li>init - the init function</li>
    </ul>

    @returns {Object} theme
*/

Galleria.addTheme = function( theme ) {

    // make sure we have a name
    if ( !theme.name ) {
        Galleria.raise('No theme name specified');
    }

    if ( typeof theme.defaults !== 'object' ) {
        theme.defaults = {};
    } else {
        theme.defaults = _legacyOptions( theme.defaults );
    }

    var css = false,
        reg;

    if ( typeof theme.css === 'string' ) {

        // look for manually added CSS
        $('link').each(function( i, link ) {
            reg = new RegExp( theme.css );
            if ( reg.test( link.href ) ) {

                // we found the css
                css = true;

                // the themeload trigger
                _themeLoad( theme );

                return false;
            }
        });

        // else look for the absolute path and load the CSS dynamic
        if ( !css ) {

            $('script').each(function( i, script ) {

                // look for the theme script
                reg = new RegExp( 'galleria\\.' + theme.name.toLowerCase() + '\\.' );
                if( reg.test( script.src )) {

                    // we have a match
                    css = script.src.replace(/[^\/]*$/, '') + theme.css;

                    Utils.addTimer( "css", function() {
                        Utils.loadCSS( css, 'galleria-theme', function() {

                            // the themeload trigger
                            _themeLoad( theme );

                        });
                    }, 1);

                }
            });
        }

        if ( !css ) {
            Galleria.raise('No theme CSS loaded');
        }
    } else {

        // pass
        _themeLoad( theme );
    }
    return theme;
};

/**
    loadTheme loads a theme js file and attaches a load event to Galleria

    @param {string} src The relative path to the theme source file

    @param {Object} [options] Optional options you want to apply

    @returns Galleria
*/

Galleria.loadTheme = function( src, options ) {

    var loaded = false,
        length = _galleries.length,
        err = window.setTimeout( function() {
            Galleria.raise( "Theme at " + src + " could not load, check theme path.", true );
        }, 5000 );

    // first clear the current theme, if exists
    Galleria.theme = undef;

    // load the theme
    Utils.loadScript( src, function() {

        window.clearTimeout( err );

        // check for existing galleries and reload them with the new theme
        if ( length ) {

            // temporary save the new galleries
            var refreshed = [];

            // refresh all instances
            // when adding a new theme to an existing gallery, all options will be resetted but the data will be kept
            // you can apply new options as a second argument
            $.each( Galleria.get(), function(i, instance) {

                // mix the old data and options into the new instance
                var op = $.extend( instance._original.options, {
                    data_source: instance._data
                }, options);

                // remove the old container
                instance.$('container').remove();

                // create a new instance
                var g = new Galleria();

                // move the id
                g._id = instance._id;

                // initialize the new instance
                g.init( instance._original.target, op );

                // push the new instance
                refreshed.push( g );
            });

            // now overwrite the old holder with the new instances
            _galleries = refreshed;
        }

    });

    return Galleria;
};

/**
    Retrieves a Galleria instance.

    @param {number} [index] Optional index to retrieve.
    If no index is supplied, the method will return all instances in an array.

    @returns Instance or Array of instances
*/

Galleria.get = function( index ) {
    if ( !!_instances[ index ] ) {
        return _instances[ index ];
    } else if ( typeof index !== 'number' ) {
        return _instances;
    } else {
        Galleria.raise('Gallery index ' + index + ' not found');
    }
};

/**

    Configure Galleria options via a static function.
    The options will be applied to all instances

    @param {string|object} key The options to apply or a key

    @param [value] If key is a string, this is the value

    @returns Galleria

*/

Galleria.configure = function( key, value ) {

    var opts = {};

    if( typeof key == 'string' && value ) {
        opts[key] = value;
        key = opts;
    } else {
        $.extend( opts, key );
    }

    Galleria.configure.options = opts;

    $.each( Galleria.get(), function(i, instance) {
        instance.setOptions( opts );
    });

    return Galleria;
};

Galleria.configure.options = {};

/**

    Bind a Galleria event to the gallery

    @param {string} type A string representing the galleria event

    @param {function} callback The function that should run when the event is triggered

    @returns Galleria

*/

Galleria.on = function( type, callback ) {
    if ( !type ) {
        return;
    }
    Galleria.on.binds.push({
        type: type,
        callback: callback || F
    });
    $.each( Galleria.get(), function(i, instance) {
        instance.bind( type, callback );
    });
    return Galleria;
};

Galleria.on.binds = [];

/**

    Run Galleria
    Alias for $(selector).galleria(options)

    @param {string} selector A selector of element(s) to intialize galleria to

    @param {object} options The options to apply

    @returns Galleria

*/

Galleria.run = function( selector, options ) {
    $( selector || '#galleria' ).galleria( options );
    return Galleria;
};

/**
    Creates a transition to be used in your gallery

    @param {string} name The name of the transition that you will use as an option

    @param {Function} fn The function to be executed in the transition.
    The function contains two arguments, params and complete.
    Use the params Object to integrate the transition, and then call complete when you are done.

    @returns Galleria

*/

Galleria.addTransition = function( name, fn ) {
    _transitions[name] = fn;
    return Galleria;
};

/**
    The Galleria utilites
*/

Galleria.utils = Utils;

/**
    A helper metod for cross-browser logging.
    It uses the console log if available otherwise it falls back to alert

    @example Galleria.log("hello", document.body, [1,2,3]);
*/

Galleria.log = (function() {
    if( 'console' in window && 'log' in window.console ) {
        return window.console.log;
    } else {
        return function() {
            window.alert( Utils.array( arguments ).join(', ') );
        };
    }
}());

/**
    A ready method for adding callbacks when a gallery is ready
    Each method is call before the extend option for every instance

    @param {function} callback The function to call

    @returns Galleria
*/

Galleria.ready = function( fn ) {
    $.each( _galleries, function( i, gallery ) {
        fn.call( gallery, gallery._options );
    });
    Galleria.ready.callbacks.push( fn );
    return Galleria;
};

Galleria.ready.callbacks = [];

/**
    Method for raising errors

    @param {string} msg The message to throw

    @param {boolean} [fatal] Set this to true to override debug settings and display a fatal error
*/

Galleria.raise = function( msg, fatal ) {

    var type = fatal ? 'Fatal error' : 'Error',

        self = this,

        css = {
            color: '#fff',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 100000
        },

        echo = function( msg ) {

            var html = '<div style="padding:4px;margin:0 0 2px;background:#' +
                ( fatal ? '811' : '222' ) + '";>' +
                ( fatal ? '<strong>' + type + ': </strong>' : '' ) +
                msg + '</div>';

            $.each( _instances, function() {

                var cont = this.$( 'errors' ),
                    target = this.$( 'target' );

                if ( !cont.length ) {

                    target.css( 'position', 'relative' );

                    cont = this.addElement( 'errors' ).appendChild( 'target', 'errors' ).$( 'errors' ).css(css);
                }
                cont.append( html );

            });

            if ( !_instances.length ) {
                $('<div>').css( $.extend( css, { position: 'fixed' } ) ).append( html ).appendTo( DOM().body );
            }
        };

    // if debug is on, display errors and throw exception if fatal
    if ( DEBUG ) {
        echo( msg );
        if ( fatal ) {
            throw new Error(type + ': ' + msg);
        }

    // else just echo a silent generic error if fatal
    } else if ( fatal ) {
        if ( _hasError ) {
            return;
        }
        _hasError = true;
        fatal = false;
        echo( 'Gallery could not load.' );
    }
};

// Add the version
Galleria.version = VERSION;

/**
    A method for checking what version of Galleria the user has installed and throws a readable error if the user needs to upgrade.
    Useful when building plugins that requires a certain version to function.

    @param {number} version The minimum version required

    @param {string} [msg] Optional message to display. If not specified, Galleria will throw a generic error.

    @returns Galleria
*/

Galleria.requires = function( version, msg ) {
    msg = msg || 'You need to upgrade Galleria to version ' + version + ' to use one or more components.';
    if ( Galleria.version < version ) {
        Galleria.raise(msg, true);
    }
    return Galleria;
};

/**
    Adds preload, cache, scale and crop functionality

    @constructor

    @requires jQuery

    @param {number} [id] Optional id to keep track of instances
*/

Galleria.Picture = function( id ) {

    // save the id
    this.id = id || null;

    // the image should be null until loaded
    this.image = null;

    // Create a new container
    this.container = Utils.create('galleria-image');

    // add container styles
    $( this.container ).css({
        overflow: 'hidden',
        position: 'relative' // for IE Standards mode
    });

    // saves the original measurements
    this.original = {
        width: 0,
        height: 0
    };

    // flag when the image is ready
    this.ready = false;

    // flag for iframe Picture
    this.isIframe = false;

};

Galleria.Picture.prototype = {

    // the inherited cache object
    cache: {},

    // show the image on stage
    show: function() {
        Utils.show( this.image );
    },

    // hide the image
    hide: function() {
        Utils.moveOut( this.image );
    },

    clear: function() {
        this.image = null;
    },

    /**
        Checks if an image is in cache

        @param {string} src The image source path, ex '/path/to/img.jpg'

        @returns {boolean}
    */

    isCached: function( src ) {
        return !!this.cache[src];
    },

    /**
        Preloads an image into the cache

        @param {string} src The image source path, ex '/path/to/img.jpg'

        @returns Galleria.Picture
    */

    preload: function( src ) {
        $( new Image() ).load((function(src, cache) {
            return function() {
                cache[ src ] = src;
            };
        }( src, this.cache ))).attr( 'src', src );
    },

    /**
        Loads an image and call the callback when ready.
        Will also add the image to cache.

        @param {string} src The image source path, ex '/path/to/img.jpg'
        @param {Object} [size] The forced size of the image, defined as an object { width: xx, height:xx }
        @param {Function} callback The function to be executed when the image is loaded & scaled

        @returns The image container (jQuery object)
    */

    load: function(src, size, callback) {

        if ( typeof size == 'function' ) {
            callback = size;
            size = null;
        }

        if( this.isIframe ) {
            var id = 'if'+new Date().getTime();

            this.image = $('<iframe>', {
                src: src,
                frameborder: 0,
                id: id,
                allowfullscreen: true,
                css: { visibility: 'hidden' }
            })[0];

            $( this.container ).find( 'iframe,img' ).remove();

            this.container.appendChild( this.image );

            $('#'+id).load( (function( self, callback ) {
                return function() {
                    window.setTimeout(function() {
                        $( self.image ).css( 'visibility', 'visible' );
                        if( typeof callback == 'function' ) {
                            callback.call( self, self );
                        }
                    }, 10);
                };
            }( this, callback )));

            return this.container;
        }

        this.image = new Image();

        var i = 0,
            reload = false,
            resort = false,

            // some jquery cache
            $container = $( this.container ),
            $image = $( this.image ),

            // the onload method
            onload = (function( self, callback, src ) {

                return function() {

                    var complete = function() {

                        $( this ).unbind( 'load' );

                        // save the original size
                        self.original = size || {
                            height: this.height,
                            width: this.width
                        };

                        self.container.appendChild( this );

                        self.cache[ src ] = src; // will override old cache

                        if (typeof callback == 'function' ) {
                            window.setTimeout(function() {
                                callback.call( self, self );
                            },1);
                        }
                    };

                    // Delay the callback to "fix" the Adblock Bug
                    // http://code.google.com/p/adblockforchrome/issues/detail?id=3701
                    if ( ( !this.width || !this.height ) ) {
                        window.setTimeout( (function( img ) {
                            return function() {
                                if ( img.width && img.height ) {
                                    complete.call( img );
                                } else {
                                    // last resort, this should never happen but just in case it does...
                                    if ( !resort ) {
                                        $(new Image()).load( onload ).attr( 'src', img.src );
                                        resort = true;
                                    } else {
                                        Galleria.raise('Could not extract width/height from image: ' + img.src +
                                            '. Traced measures: width:' + img.width + 'px, height: ' + img.height + 'px.');
                                    }
                                }
                            };
                        }( this )), 2);
                    } else {
                        complete.call( this );
                    }
                };
            }( this, callback, src ));

        // remove any previous images
        $container.find( 'iframe,img' ).remove();

        // append the image
        $image.css( 'display', 'block');

        // hide it for now
        Utils.hide( this.image );

        // remove any max/min scaling
        $.each('minWidth minHeight maxWidth maxHeight'.split(' '), function(i, prop) {
            $image.css(prop, (/min/.test(prop) ? '0' : 'none'));
        });

        if ( this.cache[ src ] ) {

            // quick load on cache
            $image.load( onload ).attr( 'src', src );

            return this.container;
        }

        // begin load and insert in cache when done
        $image.load( onload ).error( function() {
            if ( !reload ) {
                reload = true;
                // reload the image with a timestamp
                window.setTimeout((function(image, src) {
                    return function() {
                        image.attr('src', src + '?' + Utils.timestamp() );
                    };
                }( $(this), src )), 50);
            } else {
                // apply the dummy image if it exists
                if ( DUMMY ) {
                    $( this ).attr( 'src', DUMMY );
                } else {
                    Galleria.raise('Image not found: ' + src);
                }
            }
        }).attr( 'src', src );

        // return the container
        return this.container;
    },

    /**
        Scales and crops the image

        @param {Object} options The method takes an object with a number of options:

        <ul>
            <li>width - width of the container</li>
            <li>height - height of the container</li>
            <li>min - minimum scale ratio</li>
            <li>max - maximum scale ratio</li>
            <li>margin - distance in pixels from the image border to the container</li>
            <li>complete - a callback that fires when scaling is complete</li>
            <li>position - positions the image, works like the css background-image property.</li>
            <li>crop - defines how to crop. Can be true, false, 'width' or 'height'</li>
            <li>canvas - set to true to try a canvas-based rescale</li>
        </ul>

        @returns The image container object (jQuery)
    */

    scale: function( options ) {

        var self = this;

        // extend some defaults
        options = $.extend({
            width: 0,
            height: 0,
            min: undef,
            max: undef,
            margin: 0,
            complete: F,
            position: 'center',
            crop: false,
            canvas: false
        }, options);

        if( this.isIframe ) {
            $( this.image ).width( options.width ).height( options.height ).removeAttr( 'width' ).removeAttr( 'height' );
            $( this.container ).width( options.width ).height( options.height) ;
            options.complete.call(self, self);
            try {
                if( this.image.contentWindow ) {
                    $( this.image.contentWindow ).trigger('resize');
                }
            } catch(e) {}
            return this.container;
        }

        // return the element if no image found
        if (!this.image) {
            return this.container;
        }

        // store locale variables
        var width,
            height,
            $container = $( self.container ),
            data;

        // wait for the width/height
        Utils.wait({
            until: function() {
                width  = options.width ||
                         $container.width() ||
                         Utils.parseValue( $container.css('width') );

                height = options.height ||
                         $container.height() ||
                         Utils.parseValue( $container.css('height') );

                return width && height;
            },
            success: function() {

                // calculate some cropping
                var newWidth = ( width - options.margin * 2 ) / self.original.width,
                    newHeight = ( height - options.margin * 2 ) / self.original.height,
                    min = Math.min( newWidth, newHeight ),
                    max = Math.max( newWidth, newHeight ),
                    cropMap = {
                        'true'  : max,
                        'width' : newWidth,
                        'height': newHeight,
                        'false' : min,
                        'landscape': self.original.width > self.original.height ? max : min,
                        'portrait': self.original.width < self.original.height ? max : min
                    },
                    ratio = cropMap[ options.crop.toString() ],
                    canvasKey = '';

                // allow max_scale_ratio
                if ( options.max ) {
                    ratio = Math.min( options.max, ratio );
                }

                // allow min_scale_ratio
                if ( options.min ) {
                    ratio = Math.max( options.min, ratio );
                }

                $.each( ['width','height'], function( i, m ) {
                    $( self.image )[ m ]( self[ m ] = self.image[ m ] = Math.round( self.original[ m ] * ratio ) );
                });

                $( self.container ).width( width ).height( height );

                if ( options.canvas && _canvas ) {

                    _canvas.elem.width = self.width;
                    _canvas.elem.height = self.height;

                    canvasKey = self.image.src + ':' + self.width + 'x' + self.height;

                    self.image.src = _canvas.cache[ canvasKey ] || (function( key ) {

                        _canvas.context.drawImage(self.image, 0, 0, self.original.width*ratio, self.original.height*ratio);

                        try {

                            data = _canvas.elem.toDataURL();
                            _canvas.length += data.length;
                            _canvas.cache[ key ] = data;
                            return data;

                        } catch( e ) {
                            return self.image.src;
                        }

                    }( canvasKey ) );

                }

                // calculate image_position
                var pos = {},
                    mix = {},
                    getPosition = function(value, measure, margin) {
                        var result = 0;
                        if (/\%/.test(value)) {
                            var flt = parseInt( value, 10 ) / 100,
                                m = self.image[ measure ] || $( self.image )[ measure ]();

                            result = Math.ceil( m * -1 * flt + margin * flt );
                        } else {
                            result = Utils.parseValue( value );
                        }
                        return result;
                    },
                    positionMap = {
                        'top': { top: 0 },
                        'left': { left: 0 },
                        'right': { left: '100%' },
                        'bottom': { top: '100%' }
                    };

                $.each( options.position.toLowerCase().split(' '), function( i, value ) {
                    if ( value === 'center' ) {
                        value = '50%';
                    }
                    pos[i ? 'top' : 'left'] = value;
                });

                $.each( pos, function( i, value ) {
                    if ( positionMap.hasOwnProperty( value ) ) {
                        $.extend( mix, positionMap[ value ] );
                    }
                });

                pos = pos.top ? $.extend( pos, mix ) : mix;

                pos = $.extend({
                    top: '50%',
                    left: '50%'
                }, pos);

                // apply position
                $( self.image ).css({
                    position : 'absolute',
                    top :  getPosition(pos.top, 'height', height),
                    left : getPosition(pos.left, 'width', width)
                });

                // show the image
                self.show();

                // flag ready and call the callback
                self.ready = true;
                options.complete.call( self, self );

            },
            error: function() {
                Galleria.raise('Could not scale image: '+self.image.src);
            },
            timeout: 1000
        });
        return this;
    }
};

// our own easings
$.extend( $.easing, {

    galleria: function (_, t, b, c, d) {
        if ((t/=d/2) < 1) {
            return c/2*t*t*t + b;
        }
        return c/2*((t-=2)*t*t + 2) + b;
    },

    galleriaIn: function (_, t, b, c, d) {
        return c*(t/=d)*t + b;
    },

    galleriaOut: function (_, t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    }

});

// the plugin initializer
$.fn.galleria = function( options ) {

    var selector = this.selector;

    // try domReady if element not found
    if ( !$(this).length ) {

        $(function() {
            if ( $( selector ).length ) {

                // if found on domReady, go ahead
                $( selector ).galleria( options );

            } else {

                // if not, try fetching the element for 5 secs, then raise a warning.
                Galleria.utils.wait({
                    until: function() {
                        return $( selector ).length;
                    },
                    success: function() {
                        $( selector ).galleria( options );
                    },
                    error: function() {
                        Galleria.raise('Init failed: Galleria could not find the element "'+selector+'".');
                    },
                    timeout: 5000
                });

            }
        });
        return this;
    }

    return this.each(function() {

        // fail silent if already run
        if ( !$.data(this, 'galleria') ) {
            $.data( this, 'galleria', new Galleria().init( this, options ) );
        }
    });

};

// phew

}( jQuery ) );









