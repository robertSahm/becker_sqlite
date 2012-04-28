$(function() {
	var body_type_price = parseInt($('#body_type').attr("value"));
	var theme_price = parseInt($('#theme').attr("value"));
	var base_price = theme_price + body_type_price;
	calcCartPrice(base_price);
	
	$('div input').change(function() {
	  	var options = $(this).parent().parent().children(":not(h3)");
		var text_to_cart = $(this).parent().text();
	  	var feature_to_cart = $(this).parent().siblings("h3").text();
	  	var indi_price = parseInt($(this).attr("value"));
		calculateDelta(options, indi_price);
		price_to_cart(feature_to_cart, text_to_cart);
	});
	$('.tabClick1 a').click(function() {
		$('h2.chooseInstrument').fadeToggle();
		$(this).parent().siblings().fadeToggle(500,'linear');
		if ($('.choice').length > 0) {
			textEnlarge();			
		} else {
			$(this).parent().addClass('chosenLink');
			textShrink();			
		}
		messageFade();
		return false;
	})	
});

function messageFade() {
	$('h2.chooseBodyType').fadeToggle();
}

function textShrink() {
	$('.chosenLink').animate({
		fontSize: ".8em",
		marginTop: "-40px"
	}, 500 );
	$('.chosenLink').removeClass('chosenLink').addClass('choice');	
}

function textEnlarge() {
	$('.choice').animate({
		fontSize: "1em",
		marginTop: "0px"
	}, 500 );
	$('.choice').removeClass('choice');
}
  

function calcCartPrice(base_price) {
	$('#cart_price').html("<span> JS Value: $ " + base_price + "</span>");
};

function price_to_cart(feature_to_cart, text_to_cart) {
	var total_price = 0;
  	$("div input:checked").each(function() {
        	total_price += parseInt($(this).attr("value"));
   });
	total_price += parseInt($('#body_type').attr("value")) + parseInt($('#theme').attr("value"));
	$("#cart_price span").empty();
  	$("#cart_price").append("<span> JS Price: $ " + total_price + "</span>");
	$("#feature_adds").append('<fieldset>' + feature_to_cart + " - " + text_to_cart + "</fieldset>");
}

function calculateDelta(options, indi_price) {
	var tally = 0;
	options.each(function() {
		tally = parseInt($(this).children().attr("value"));
		new_price = tally - indi_price;
		$(this).data("new_price", new_price);
		insertDom(this);
	});
}

function insertDom(obj) {
	var data = $(obj).data("new_price");
	$(obj).children(".price-delta").each(function() {
		$(this).empty();
		if (data > 0) {
			$(this).append("[Add $" + data + "]");
		} else if (data < 0) {
			$(this).append("[Subtract $" + Math.abs(data) + "]");
		} else {}
	})
}

// take the type tabs and make single function process
// forward
// when you click on one type guitar, bass,etc
// hide the <h2 id="chooseInstrument">
//  hide the other type choices
// animate the chosen type to the same DOM location with CSS changes
// reverse
// when you click the type
// animate the type to its list position in the DOM
// show the remaining list items
// show the <h2 id="chooseInstrument">




