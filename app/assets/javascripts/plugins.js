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













