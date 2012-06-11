/*
var headerImage = $('.headerImage');
var parallax1 = $('#parallax1');
var parallax2 = $('#parallax2');
var parallax3 = $('#parallax3');
var banjoIndex = $('.banjoIndex');
var shopImage = $('img.shop');
var header = $(".headerBackground");
*/


$(document).ready(function() {

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
});	







			
			
			
			





