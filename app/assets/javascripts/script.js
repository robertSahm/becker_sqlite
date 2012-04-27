
var headerImage = $('.headerImage');
var parallax1 = $('#parallax1');
var parallax2 = $('#parallax2');
var parallax3 = $('#parallax3');
var banjoIndex = $('.banjoIndex');
var shopImage = $('img.shop');
var header = $(".headerBackground")

$(document).ready(function() {
  //call image rotator
	$('.spinner').roundabout({
		//shape: 'tearDrop',
		//duration: 1000,
		minScale: .4, 
		maxScale: 1,
		focusBearing: 0,
		tilt: 3,
		minOpacity: .4,
		minZ: 279,
		maxZ: 280,
		easing: "swing",

	});

	//Call parallax scrolling ability on elements
	$('.headerImage').scrollingParallax({
	  reverseDirection : true,
	  staticSpeed: .2,
		staticScrollLimit : false
	});
	
	$('#parallax1').scrollingParallax({
		reverseDirection : false,
		staticSpeed: .06,
		staticScrollLimit : true
	});
		$('#parallax2').scrollingParallax({
		reverseDirection : false,
		staticSpeed: .05,
		staticScrollLimit : true
	});
		$('#parallax3').scrollingParallax({
		reverseDirection : false,
		staticSpeed: .04,
		staticScrollLimit : true
	});
		$('.banjoIndex').scrollingParallax({
		reverseDirection : false,
		staticSpeed: 0.6,
		staticScrollLimit : false

	});
	$(shopImage).scrollingParallax({
		reverseDirection : true,
		staticSpeed: 0.3,
		staticScrollLimit : false
	});

	//Store Animations
	$(".showcaseGuitar, .showcaseBass, .showcaseCustom, .showcaseTheme").hide();

	$('.guitarClick1 a').click(function() {
		$('li.bassClick1 a, li.customClick1 a, li.allClick1 a').toggle(500);
		$('.showcaseGuitar').delay(500).toggle(500);
		$('.guitarClick1 a').animate({
			fontSize: "1.7em",
			marginTop: "-30px"
		}, 500 );
		return false;
	});
	
});

$('.guitarClick1 a').click(function() {
	$('h2.chooseInstrument').replaceWith('<h2 class="chooseInstrument">Step 2: Choose a body style</h2>');
});

$('.roundabout-moveable-item a').click(function() {
	$('.showcaseGuitar h2').animate({
			fontSize: "1.7em",
			marginTop: "5px"
		}, 500 );
});
//


//Store



/*
 //End All


var scroller = new StickyScroller("#frame3 h3",
{
    start: 2530,
    end: 9700,
    interval: 900,
    range: 100,
    margin: 1
});


var scroller = new StickyScroller(".youtubeContainer",
{
	start: 3080,
    end: 7300,
    interval: 900,
    range: 900,
    margin: 153
});

*/















/*


	//call opacity animation 
  var fadeStart=1000 // XXpx scroll or less will equiv to 1 opacity
  ,fadeUntil=7000 // XXpx scroll or more will equiv to 0 opacity
  ,fading = $('#frame2');
		

	$(window).bind('scroll', function(){
			var offset = $(document).scrollTop()
					,opacity=0
			;
			if( offset<=fadeStart ){
					opacity=1;
			}else if( offset<=fadeUntil ){
					opacity=1-offset/fadeUntil;
			}
			fading.css('opacity',opacity).html(opacity);
	});

	//call opacity animation 
  var fadeStart=300 // 100px scroll or less will equiv to 1 opacity
  ,fadeUntil=1700 // 200px scroll or more will equiv to 0 opacity
  ,fading = $('');
		

	$(window).bind('scroll', function(){
			var offset = $(document).scrollTop()
					,opacity=0
			;
			if( offset<=fadeStart ){
					opacity=1;
			}else if( offset<=fadeUntil ){
					opacity=1-offset/fadeUntil;
			}
			fading.css('opacity',opacity).html(opacity);
	});












$(document).ready(function() {
	//Call Scrollorama
   var scrollorama = $.scrollorama({
       blocks:'.scrollblock',
			 
   });

		scrollorama.animate('#parallax1',{ 
			duration: 900, 
			property:'margin-left',
			start:10, 
			end: 300 
		})	
		scrollorama.animate('#parallax2',{ 

			duration: 900, 
			property:'top', 
			start:170, 
			end: 200 
		})
			scrollorama.animate('#parallax3',{ 
			duration: 700, 
			property:'top', 
			start:200, 
			end:700 
		})

		scrollorama.animate('#fade-in',{
    duration:400, 
		property:'opacity'
		end: 
		})
		
		

		


	
});

	*/

/*	
	//Animate the Nav Bar
	$('.navLi a').hover(
			function(){
			$(this).stop(true, true).animate({left: '-=50'}, 400);
      }, 
      function() {
       $(this).stop(true, true).animate({left: '+=50'}, 400);
      });
});

			
			
			*/
			
			
			
			
			





