/**
 *
 * Creates a slideshow gallery with light box
 *
 * @dependencies
 *  https://github.com/jquery/jquery
 *
 * @author bonin.c.m@gmail
*
*/

'use strict';

(function() {
	$.fn.krillGallery = function(options) {
		var settings = $.extend({
					breakPoint: 767,
					slidePadding: 9,
					buttonWidth: 45,
					slideWidth: 110,
					centerMode: true,
					buttonWidth: 45
				}, options ),
				slideClass = 'krill-slide',
				activatedClass = 'krill-activated',
				activeSlideClass = 'active-slide',
				timelineId,
				$gallery = $(this),
				$slider = $gallery.find('.krill-slider'),
				$image = $gallery.find('.krill-image-view'),
				$slides = $slider.find('>'),
				slideCount = $slides.length,
				animationTime = 200;

		var methods = {
			init: function() {
				var middleIndex,
						carouselRequired = methods.carouselRequired.call(this),
						slideToShow;

				// reorder slides for carousel effect
	 		 	if (!settings.centerMode) {
	 		 		// if left aligned just do one - no animation
				  methods.pushSlide.call(this, 1, true);
				  slideToShow = 1;
				} else {
					middleIndex = methods.getMiddleIndex();
					// for center, push #1 to the middle - no animation
			  	methods.pushSlide.call(this, middleIndex, true);
				  slideToShow = 0;
				}

				methods.applyClassesAndStyles.call(this);
				methods.applyEvents.call(this);
    		methods.slideSelect.call(this, slideToShow);
      	methods.alignSlider.call();

				if(!carouselRequired) {
	 		 		methods.hideCarousel.call(this);
				}
			},

			/**
			 * Set up the events
			 * @return {[type]} [description]
			 */
			applyEvents: function() {
				var self = this,
						origOnResize = window.onresize;

				//resizer listener
				window.onresize = function() {
					if (origOnResize) {
						origOnResize();
					}
					methods.resized.call(self)
				}

 			  // button for sliding right
 			  $gallery.find('.btn-next').click(function(){
	 		 		methods.pushSlide.call();
        });

 			  // button for sliding right
 			  $gallery.find('.btn-prev').click(function(){
	 		 		methods.pullSlide.call();
 			  });

 			  // individual slide click
 			  $slides.click(function() {
 			  	if(!$(this).hasClass('active-slide')) {
	 			  	var index = $(this).attr('data-slide-index');
	 			  	methods.slideSelect.call(self, index);
	 			  }
 			  });

 			},

	 		/**
	 		 * Add the plugin's classes & styles
	 		 * @return void
	 		 */
 		 	applyClassesAndStyles: function() {

	 		 	$slides.each(function(i) {
	 		 		$(this)
	 		 			.addClass(slideClass)
	 		 			.css({
	 		 				width: settings.slideWidth,
	 		 				'margin-left': settings.slidePadding/2,
	 		 				'margin-right': settings.slidePadding/2
	 		 			})
	 		 			.attr('data-slide-index', i);
	 		 	});

	 		 	$gallery.find('.krill-gallery-btn').css({
	 		 		width: settings.buttonWidth + 'px'
	 		 	});
 		 	},

	 		 /**
	 		  * Manages window resize
	 		  * @return void
	 		  */
	 		 resized: function() {

	 		 	methods.alignSlider.call(this);

	 		 	if(!methods.carouselRequired.call(this)) {
	 		 		methods.hideCarousel.call(this);
	 		 	} else {
					methods.showCarousel.call(this);
	 		 	}
	 		 },

	 		 /**
	 		  * Hide/remove carousel application
	 		  * @return void
	 		  */
	 		 hideCarousel: function() {
	 		 		// hide the slide btns
	 		 		$gallery.find('.krill-gallery-btn').each(function() {
	 		 			$(this).hide();
	 		 		});
	 		 		// align left
	 		 		$slider.css({left: 0});
	 		 },

	 		 /**
	 		  * Show/apply carousel
	 		  * @return void
	 		  */
	 		 showCarousel: function() {
	 		 		// show the slide btns
	 		 		$gallery.find('.krill-gallery-btn').each(function() {
	 		 			$(this).show();
	 		 		});
	 		 		// relaign
	 		 		methods.alignSlider.call();
	 		 },

	 		 /**
	 		  * Checks if carousel is required for current width
	 		  * Responsive functioanlity
	 		  * @return void
	 		  */
	 		 carouselRequired: function() {
	 		 	var galleryWidth = $gallery.width(),
	 		 			sliderWidth = slideCount * (settings.slideWidth + settings.slidePadding);

	 		 	if(sliderWidth < galleryWidth) {
	 		 		return false;
	 		 	} else {
	 		 		return true;
	 		 	}
	 		 },

	 		 /**
	 		  * Select a specific slide
	 		  * @param  Number i Slide index
	 		  * @return void
	 		  */
	 		 slideSelect: function(i) {
	 		 	if(i === undefined) return false;

 		 		var newIndex = parseFloat(i),
 		 				newSlidePositionIndex = (settings.centerMode) ? methods.getMiddleIndex() : 1,
 		 				currentPositonIndex = methods.getPositionIndex(i),
 		 				slideDiff,
	 		 			method = 'pullSlide';

 		 			if (newSlidePositionIndex < currentPositonIndex){
 		 				slideDiff = currentPositonIndex - newSlidePositionIndex;
 		 			} else {
 		 				method = 'pushSlide';
 		 				slideDiff = newSlidePositionIndex - currentPositonIndex;
 		 			}

 		 			// move slide to position
 		 			if(slideDiff) {
      			methods[method].call(this, slideDiff);
 		 			}

      		methods.setActiveSlide.call(this, i);
      		methods.loadGalleryImage.call(this, i);

		    },

	 		 /**
	 		  * Show the slide image in gallery
	 		  * @param  Number i Slide index
	 		  * @return void
	 		  */
		    loadGalleryImage: function(i) {
	 		 		if(i === undefined) return false;
	 		 		var self = this,
	 		 				$slide,
	 		 				$poster,
	 		 				imagePath,
	 		 				$img;

	 		 		$slides.filter(function(){
	 					var $this = $(this);
	           if (parseFloat($this.attr('data-slide-index')) === parseFloat(i)) {
	           	$slide = $this;
	           }
	        });

	 		 		if($slide) {
	 		 			imagePath = $slide.attr('data-image');

	 		 			$poster = $gallery.find('.krill-image');

		 		 		if(imagePath) {
		 		 			$img = $('<img/>', {src: imagePath});
		 		 			$poster.html($img);
		 		 			$img
		 		 				.fadeIn()
		 		 				.click(function() {
		 		 					methods.loadLightBox.call(self, i);
		 		 				});
		 		 		} else {
		 		 			$poster.html('');
		 		 		}
	 		 		}
		    },

		    /**
		     * [loadLightBox description]
	 		   * @return void
		     */
		    loadLightBox:function(i) {
 		 			if(i === undefined || isNaN(i)) return false;
 		 			var $body = $('body'),
 		 					lightboxHtml = methods.getLightboxHtml.call(this, i);

					$body.append(lightboxHtml);
		    },

		    getLightboxHtml: function(i) {
		    	var self,
		    			$slide = $slider.find( '[data-slide-index="' + i + '"]' ),
		    			imagePath = $slide.attr('data-image'),
		    			altData = $slide.attr('data-alt')||'',
		    			captionData = $slide.attr('data-caption')||'',
		    			$lightbox = $('<div/>', {class: 'krill-lightbox'}),
		    			$closeBtn = $('<div/>', {class: 'krill-lightbox-close'}),
		    			$content = $('<div/>', {class: 'krill-lightbox-content'}),
		    			$img = $('<div/>', {class: 'krill-lightbox-img'}),
		    			$alt = $('<span/>', {class: 'krill-lightbox-alt'}),
		    			$caption = $('<span/>', {class: 'krill-lightbox-caption'}),
		    			$btnNext = $('<div/>', {class: 'krill-lightbox-btn-next krill-lightbox-btn'}),
		    			$btnPrev = $('<div/>', {class: 'krill-lightbox-btn-prev krill-lightbox-btn'}),
		    			currentIndex = i;

		    	$lightbox
		    		.append($closeBtn)
		    		.append($content
			    		.append(
			    			$img.html($('<img/>', {src: imagePath})))
			    		.append(
			    			$caption.html(captionData))
			    		.append(
			    			$alt.html(altData))
		    		.append($btnPrev)
		    		.append($btnNext));

		    	$closeBtn.click(function(){
		    		methods.lightBoxDestroy();
		    	});

		    	$btnNext.click(function(){
		    		currentIndex++;
		    		if(currentIndex >= slideCount) {
		    			currentIndex = 0;
		    		}
		    		methods.changeLightbox.call(self, currentIndex, $lightbox);
		    	});

		    	$btnPrev.click(function(){
		    		currentIndex--;
		    		if(currentIndex < 0) {
		    			currentIndex = slideCount -1;
		    		}
		    		methods.changeLightbox.call(self, currentIndex, $lightbox);
		    	});

		    	return $lightbox;
		    },

		    /**
		     * Removes the light box
	 		   * @return void
		     */
		    lightBoxDestroy: function() {
		    	$('.krill-lightbox').remove();
		    },

		    /**
		     * Change image in lightbox
		     * @param Number i   Slide index
		     * @param [] $img jQuery img element
	 		   * @return void
		     */
		    changeLightbox: function(i, $lightbox) {
		    	var $slide = $slider.find( '[data-slide-index="' + i + '"]'),
		    			newImage = $slide.attr('data-image')||'No image',
		    			newAlt = $slide.attr('data-alt')||'',
		    			newCaption = $slide.attr('data-caption')||'';

		    	$lightbox.find('.krill-lightbox-img').html($('<img/>', {src: newImage}))
		    	$lightbox.find('.krill-lightbox-alt').html(newAlt);
		    	$lightbox.find('.krill-lightbox-caption').html(newCaption);

		    },

	 		 /**
	 		  * Push slides left
	 		  * @param  Number count Slides to move
	 		  * @param  Boolean noAnimation Use animation
	 		  * @return void
	 		  */
	 		 pushSlide: function(count, noAnimation) {
 		 		var moveCount = (count) ? count : 1,
 		 				leftIndent = parseInt($slider.css('left')) + settings.slideWidth * moveCount,
 		 				moveItems = function() {
 		 					// move our slides
				    	for (var i = 0; i < moveCount; i++) {
					 			$slider.find('>:first').before($slider.find('>:last').fadeIn());
					 		}
		 		 			methods.alignSlider.call(this);
 		 				};

 		 		if(noAnimation && noAnimation === true) {
					moveItems();
 		 		} else {
		 		  $slider.not(':animated').animate({'left' : leftIndent}, animationTime,function() {
						moveItems();
	        });
 		 		}
	 		 },


	 		 /**
	 		  * Pull slides right
	 		  * @param  Number count Slides to move
	 		  * @param  Boolean noAnimation Use animation
	 		  * @return void
	 		  */
	 		 pullSlide: function(count, noAnimation) {
 		 		var moveCount = (count) ? count : 1,
 		 				leftIndent = parseInt($slider.css('left')) - (settings.slideWidth + settings.slidePadding) * moveCount,
 		 				moveItems = function() {
 		 					// move our slides
				    	for (var i = 0; i < moveCount; i++) {
		        		$slider.find('>:last').after($slider.find('>:first'));
		        	}
			 		 		methods.alignSlider.call(this);
 		 				};

 		 		if(noAnimation && noAnimation === true) {
					moveItems();
 		 		} else {
	        $slider.not(':animated').animate({'left' : leftIndent}, animationTime,function() {
	        	moveItems();
	        });
 		 		}
	 		 },

	 		 /**
	 		  * Activates active slide in carousel
	 		  * @return void
	 		  */
	 		 setActiveSlide: function(i) {
 		 		if(i === undefined || isNaN(i)) return false;

	 		 	$slides.each(function() {
	 				var $this = $(this);
           if (parseFloat($this.attr('data-slide-index')) === parseFloat(i)) {
           	$this.addClass(activeSlideClass);
           } else {
						$this.removeClass(activeSlideClass);
           }
	 			});
	 		 },

	 		 /**
	 		  * Align the slider
	 		  * Typlically aplied after slide change
	 		  * @return void
	 		  */
	 		 alignSlider: function() {
	 		 	var alignTo = 0,
	 		 			slideFullWidth = settings.slideWidth + settings.slidePadding,
 		 				carouselApplied = methods.carouselRequired.call(this);

	 		 	// only change alignment if carousel applied
	 		 	if(carouselApplied) {
	 		 		if (!settings.centerMode) {
		 		 		// var alignTo = -settings.slidePadding * 1.5 + settings.buttonWidth;
		 		 		alignTo = -slideFullWidth + settings.buttonWidth + settings.slidePadding/2 ;
		 		 	} else {
		 		 		var galleryMiddle = $gallery.width()/2 - slideFullWidth/2,
		 		 				middleSlideIndex = methods.getMiddleIndex();

		 				alignTo = - middleSlideIndex * slideFullWidth + galleryMiddle;

		 		 	}
	 		 	}
 		 		$slider.css({'left' : alignTo});
	 		 },

	 		 /**
	 		  * Return the middle index of slides
	 		  * @return Number
	 		  */
	 		 getMiddleIndex: function() {
	 		 	var middleIndex = Math.floor(slideCount/2) - 1;
				if(slideCount%2 !==0) {
 					middleIndex++;
 				}

	 		 	return middleIndex;
	 		 },

	 		 /**
	 		  * Return the current position index of the slide
	 		  * eg. In third position = 4
	 		  * @param  Number i Slide index
	 		  * @return Number
	 		  */
	 		 getPositionIndex: function(i) {
 		 		if(i === undefined || isNaN(i)) return false;

	 		 	var $orderedSlides = $slider.find('.' + slideClass),
	 		 			currentPositionIndex;


 				$orderedSlides.filter(function(slideIndex){
 					var $this = $(this);
           if (parseFloat($this.attr('data-slide-index')) === parseFloat(i)) {
           	currentPositionIndex = slideIndex;
           	return;
           }
        });

        return currentPositionIndex;
	 		 },

	 		 destroy: function() {

	 		 }
	 		}

	 		return this.each(function() {
	 			methods.init.call(this);
	 		});
	 	}
	 }(jQuery));


