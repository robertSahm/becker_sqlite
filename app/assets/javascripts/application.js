// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
//= require jquery
//= require jquery-ui
//= require jquery_ujs
//= require jquery.purr
//= require best_in_place




$(function() {
	var adminDropDown = $('.adminDropDown');
	var codeDropDown = $('.codeDropDown');
  $(codeDropDown).hide();
  $(adminDropDown).hide();
  $('.codeLink').click(function() {
    $(this).siblings(".codeDropDown").toggle('slow');
	 return false;
  })
  $('li.tcell a:not(.addOption)').click(function() {
    $(this).siblings("div").fadeToggle(600);
	 return false;
  });
});



