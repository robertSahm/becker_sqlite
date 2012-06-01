$(function() {
	var body_type_price = parseInt($('#base_price').attr("value"));
	var base_price = body_type_price;
	calcCartPrice(base_price);
	
	$('div input').change(function() {
	  	var options = $(this).parent().parent().children(":not(h3)");
		var text_to_cart = $(this).parent().text();
	  	var feature_to_cart = $(this).parent().siblings("h3").text();
	  	var indi_price = parseInt($(this).attr("price"));
		calculateDelta(options, indi_price);
		price_to_cart(feature_to_cart, text_to_cart);
	});
});

function calcCartPrice(base_price) {
	$('#cart_price').html("<span>$ " + base_price + "</span>");
};

function price_to_cart(feature_to_cart, text_to_cart) {
	var total_price = 0;
  	$("div input:checked").each(function() {
        	total_price += parseInt($(this).attr("price"));
   });
	total_price += parseInt($('#base_price').attr("value"));
	$("#cart_price span").empty();
  	$("#cart_price").append("<span>$ " + total_price + "</span>");
	$('#submit_price').empty();
	$('#submit_price').append("<input  type='hidden' name='price' value=" + total_price + " />");
	$("#feature_adds").append('<fieldset>' + feature_to_cart + " - " + text_to_cart + "</fieldset>");
}

function calculateDelta(options, indi_price) {
	var tally = 0;
	options.each(function() {
		tally = parseInt($(this).children().attr("price"));
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


