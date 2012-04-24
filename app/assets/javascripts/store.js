$(function() {
	$('div input').change(function() {
	  	var options = $(this).parent().parent().children(":not(h3)");
		var text_to_cart = $(this).parent().text();
	  	var feature_to_cart = $(this).parent().siblings("h3").text();
	  	var indi_price = parseInt($(this).attr("value"));
		calculateDelta(options, indi_price);
		price_to_cart(feature_to_cart, text_to_cart);
	});	
});

function price_to_cart(feature_to_cart, text_to_cart) {
	var total_price = 0;
  	$("div input:checked").each(function() {
        	total_price += parseInt($(this).attr("value"));
   });
  	$("#custom_build").append('<fieldset> **  Clicked-> ' + feature_to_cart + " - " + text_to_cart + '  * Cart Price -> ' + total_price + " ** </fieldset>");	
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
			$(this).append("[Add $" + data + "]")
		} else if (data < 0) {
			$(this).append("[Subtract $" + Math.abs(data) + "]")
		} else {}
	})
}



