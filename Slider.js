/* 
	Javascript&Jquery Slider
	Created by BMyu
*/

function Slider(id, width, height) {
	this.id = id;
	this.width = width;
	this.height = height;
	this.input;
	this.coeff;
	this.change = function(){};
	this.flag = false;
	this.valWidth = width / 2;
	this.val = 0.5;
	this.object = document.getElementById(id);
	this.colorSlider = document.createElement("div");
	$(this.colorSlider).css({
		"width" : this.valWidth,
		"height" : this.height,
		"background-color" : "red",
		"position" : "absolute"
	});
	$(this.object).css({
		"width" : width,
		"height" : this.height,
		"border" : "1px solid black",
		"display" : "inline-block",
		"position" : "relative"
	});
	$(this.object).append(this.colorSlider);
	
	$(this.object).mousedown($.proxy(function (e) {
		this.flag = true;
		this.changeValue(e);
	}, this));
	
	$(document).mousemove($.proxy(function(e) {
		this.changeValue(e);
	}, this));
	
	$(document).mouseup($.proxy(function() {
		this.flag = false;
	}, this));
	
	this.changeValue = function(e) {
		if (this.flag) {
			var parentOffset = $(this.object).parent().offset(); 
			var relX = e.pageX - parentOffset.left;
			var relY = e.pageY - parentOffset.top;
			if (relX >= this.width) relX = this.width;
			$(this.colorSlider).css("width", relX);
			this.val = relX / width;
			if (this.val < 0) this.val = 0;

			if (this.input) $(this.input).val(this.val * this.coeff);
			this.change();
		}
	}
	
	this.changeValueByValue = function(val) {
		if (val > 1 || val < 0) return;
		$(this.colorSlider).css("width", val * this.width);
		this.val = val;

		if (this.input) $(this.input).val(this.val * this.coeff);
			this.change();
	}
	
	this.bind = function(inpObj, coeff) {
		var input = document.getElementById(inpObj);
		this.input = input;
		this.coeff = coeff;
		$(input).change($.proxy(function() {
			this.changeValueByValue($(input).val() / this.coeff);
		}, this));
	}
}