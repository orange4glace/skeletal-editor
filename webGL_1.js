var ps;
var jcurrentFrame;
var currentAnimation;
var jcurrentBone;
var jframeGroup = [];
var jframeCopy = [];
var jframeCopyFrameCount;
var keys = [];
var jframeFlag = false;
var jcurrentTime;
var jstartFrame;
var isRunning = false;

var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

var jCOLOR_SELECTED = "#FC6C85";
var jCOLOR_SELECTED_HASFRAME = "#A74AC7";
var jCOLOR_HASFRAME = "#5CB3FF";

function initProcessing() {
	ps = Processing.getInstanceById("canvas");
	if (ps) jlog("Initialized!");
	else jlog("Fail to initialize..");
}

function jinit() {
	jcurrentFrame = undefined;
	currentAnimation = undefined;
	jcurrentBone = undefined;
	jframeGroup = [];
	jframeCopy = [];
	jframeCopyFrameCount = undefined;
	keys = [];
	jframeFlag = false;
	jcurrentTime = undefined;
	jstartFrame = undefined;
	isRunning = false;
}

$(window).ready(function() {

	if (!isChrome) alert("Chrome 브라우저에서만 지원합니다.");

	setTimeout("initProcessing()", 300);
	
	$("input[name='tool']").change(function() {
		ps.setMouseType($("input[name='tool']:checked").val());
	});
	
	/*
	 * property
	 */
	$("#b_n").change(function() {
		changeName();
	});
	
	$("#b_x").change(function() {
		jupdateBone();
	});
	
	$("#b_y").change(function() {
		jupdateBone();
	});
	
	$("#b_a").change(function() {
		jupdateBone();
	});
	
	$("#b_l").change(function() {
		jupdateBone();
	});
	
	/*
	 * Anim
	 */
	$("#inp_fps").change(function() {
		var res = ps.setFrameRate(parseInt($("#inp_fps").val() * 1));
		if (res == -1) jlog("Fail to change FPS !! (MAX : 60)");
		else jsetFPS($("#inp_fps").val()*1);
	});
	 
	$("#div_keyframes").scroll(function() {
		$("#div_keyframes_info").scrollLeft($(this).scrollLeft());
		$("#div_keyframes_name").scrollTop($(this).scrollTop());
	});
	$("#div_keyframes_info").scroll(function() {
		$("#div_keyframes").scrollLeft($(this).scrollLeft());
	});
	
	$("#inp_frameCount").change(function() {
		changeFrameCount($(this).val());
	});
	
	$("#btn_newAnim").click(function() {
		newAnimation($("#inp_anim").val(), 60);
	});
	$("#btn_newKeyframe").click(function() {
		addKeyframe();
	});
	$("#btn_removeKeyframe").click(function() {
		removeKeyframe();
	});
	$("#btn_toggleAnim").click(function() {
		if (!isRunning)
			jstartAnimation();
		else
			jstopAnimation();
	});
	
	$("#inp_frameCount").change(function() {
		jsetFrameCount($("#inp_frameCount").val() * 1);
	});
	
	$(document).mouseup(function() {
		if(jframeFlag)
			finishDrag();
	});
	
	$("#btn_copy").click(function() {
		copyKeyframes();
	});
	
	$("#btn_paste").click(function() {
		pasteKeyframes();
	});
	
	$(document).keydown(function(e) {
		for (var i in keys)
			if (keys[i] == e.which) return;
		keys.push(e.which);
		jkeyEvents();
	});
	
	$(document).keyup(function(e) {
		for (var i in keys)
			if (keys[i] == e.which) keys.splice(i, 1);
	});
	/*
	 * Save/Load
	 */
	$("#btn_save").click(function() {
		var s = "";
		s += "<data>";
		s += "<bones>";
		var bones = ps.getBones();
		for (var i in bones) {
			var bone = bones[i];
			var btf = new BoneToFile(bone);
			s += btf.s;
		}
		s += "</bones>";
		var aies  = ps.getAnimationInfoes();
		s += "<animationInfoes>";
		for (var i in aies) {
			var ai = aies[i];
			var aitf = new AnimationInfoToFile(ai);
			s += aitf.s;
		}
		s += "</animationInfoes>";
		s += "</data>";
		var blob = new Blob([s], {type: "text/xml"});
		saveAs(blob, $("#inp_save").val() + ".xml");
	});
	
	$("#btn_load").click(function() {
		load($("#text_load").val());
	});
	
	/*
	 * Examples
	 */
	$("#do2_1").click(function() {
		load(getExample1());
	});
	
	$("#do2_2").click(function() {
		load(getExample2());
	});
	
	$("#do2_3").click(function() {
		load(getExample3());
	});
	
	$(canvas).keypress(function(e) {
		if (e.which == 49) $("input:radio[name='tool'][value='0']").click();
		if (e.which == 50) $("input:radio[name='tool'][value='2']").click();
		if (e.which == 51) $("input:radio[name='tool'][value='1']").click();
		if (e.which == 52) $("input:radio[name='tool'][value='3']").click();
	});
	
	$(".help").click(function() {
		helpDisappear($(this));
	});
});

function jstartAnimation() {
	var res = ps.startAnimation(currentAnimation);
	if (!res) return;
	isRunning = true;
	$("#btn_toggleAnim").text("Stop Animation");
}

function jstopAnimation() {
	$("#btn_toggleAnim").text("Start Animation");
	ps.stopAnimation();
	isRunning = false;
}

function load(txt, noalert) {
	if (!noalert) if (!confirm("The current data will not be saved. \nAre you sure?")) return;
	jstopAnimation();
	clearAnimation();
	ps.emptyBones();
	ps.emptyAnimationInfoes();
	jinit();
	var bones = [];
	var xml = $(txt);
	$("#div_animations").html("");
	var xmlBones = $(xml).find("bones");
	var xmlAnimationInfoes = $(xml).find("animationInfoes");
	$(xmlBones).find("bone").each(function() {
		var bone;
		var name = $(this).find("name").text();
		var isSuper = (($(this).find("super").text() == "true") ? true : false);
		var x = $(this).find("x").text()*1;
		var y = $(this).find("y").text()*1;
		var l = $(this).find("l").text()*1;
		var a = $(this).find("a").text()*1;
		var flag = $(this).find("flag").text()*1;
		var parent = $(this).find("parent").text();
		bone = ps.Bone.newBone(x, y, l, a, flag, name, parent);
		if (isSuper) {
			jlog("FIND SUPERBONE");
			bone.isSuper = true;
			ps.setSuperBone(bone);
		}
		$(this).find("animations").find("anim").each(function() {
			var animation;
			var aname = $(this).find("aname").text();
			var framecount = $(this).find("framecount").text();
			jlog("LOAD ANIMATION " + aname + " WITH BONE " + bone.name + " ...");
			animation = ps.Animation.newAnimation(aname);
			$(this).find("keyframes").find("keyframe").each(function() {
				var keyframe;
				var time = $(this).find("time").text()*1;
				var kx = $(this).find("ax").text()*1;
				var ky = $(this).find("ay").text()*1;
				var kl = $(this).find("al").text()*1;
				var ka = $(this).find("aa").text()*1;
				keyframe = ps.Keyframe.newKeyframe(time, kx , ky, kl, ka);
				animation.addKeyframe(keyframe);
			});
			bone.addAnimation(animation);
		});	
		bones.push(bone);
	});
	
	for (var i in bones) {
		bones[i].validate();
	}
	
	$(xmlAnimationInfoes).find("animationInfo").each(function() {
		var ai;
		var ainame = $(this).find("ainame").text();
		var frameCount = $(this).find("framecount").text() * 1;
		newAnimation(ainame, frameCount);
	});
	jlog("DONE LOADING.");
}

function jkeyEvents() {
	if (jQuery.inArray(16, keys) != -1 && jQuery.inArray(67, keys) != -1)
		copyKeyframes();
	else if (jQuery.inArray(16, keys) != -1 && jQuery.inArray(86, keys) != -1)
		pasteKeyframes();
	else if (jQuery.inArray(16, keys) != -1 && jQuery.inArray(81, keys) != -1)
		addKeyframe();
	else if (jQuery.inArray(16, keys) != -1 && jQuery.inArray(68, keys) != -1)
		removeKeyframe();
}

function jupdate(bone) {
	$("#b_x").val(bone.x);
	$("#b_y").val(bone.y);
	$("#b_a").val(bone.a);
	$("#b_l").val(bone.l);
	$("#b_n").val(bone.name);
	$("#b_p").val((bone.parent ? bone.parent.name : ""));

}

function jupdateBone() {
	var b = ps.getCurrentBone();
	if (!b) return;
	b.set($("#b_x").val()*1, $("#b_y").val()*1,$("#b_l").val()*1,$("#b_a").val()*1);
}

function jeraseBone(b) {
	if (confirm("Children will also be removed.")) {
		var res = ps.Bone.eraseBone(b);
		if (res) jlog("Bone " + b.name + " has been removed.");
		reloadAnimation();
	}
}

function jlog(msg) {
	$("#div_log").html(msg);
}

function changeName() {
	var res = false;
	var b = ps.Bone.getBoneByName(jcurrentBone);
	if (b) res = b.setName($("#b_n").val());
	if (!res) alert("Fail!");
	else {
		reloadAnimation();
		jcurrentBone = $("#b_n").val();
	}
}	

function jsetFrameCount(count) {
	var ai = ps.AnimationInfo.getAnimationInfoByName(currentAnimation);
	if (!ai) alert("Select Animation first!");
	ai.frameCount = count;
	jlog("Framecount of " + ai.name + " Animation is changed to " + count);
	reloadAnimation();
}
	
function jsetFPS(f) {
	var ai = ps.AnimationInfo.getAnimationInfoByName(currentAnimation);
	if (!ai) alert("Select Animation first!");
	ai.fps = f;
	ps.setFrameRate(f);
	jlog("Frame Per Second is set to " + f + ".");
}
	
function newAnimation(name, framecount) {
	var animInfo = ps.AnimationInfo.newAnimationInfo(name, framecount);
	if (!animInfo) return;

	var p = document.createElement("p");
	$(p).attr("id", "p_animInfo_" + name);
	var t = document.createTextNode(name);
	$(p).append(t);
	$("#div_animations").append(p);
	
	$(p).bind("click", function() { getAnimation(animInfo.name); });
	jlog("New animation " + name + " is successfully added.");

}

function removeAnimation(name) {
	var p = $("#p_animInfo_" + name);
	if (!p) return;
	$(p).remove();
	clearAnimation();
}

function getAnimation(name) {

	currentAnimation = name;
	$("#div_keyframes").html("");
	$("#div_keyframes_name").html("");
	var animInfo = ps.AnimationInfo.getAnimationInfoByName(name);
	if (!animInfo) return;
	$("#inp_frameCount").val(animInfo.frameCount);

	setupAnimFrames(animInfo.name, animInfo.frameCount);
	ps.setFrameRate(animInfo.fps);
	$("#inp_fps").val(animInfo.fps);
	
	var bones = ps.getBones();
	
	var j = 0;
	for (var i in bones) {
		var bone = bones[i];
		var anim = bone.getAnimationByName(animInfo.name);
		var dw = document.createElement("p");
		$(dw).css("width", animInfo.frameCount * 25);
		var z = document.createElement("div");
		var zt = document.createTextNode(bone.name + "　");
		$(z).append(zt);
		$(z).css({
			"width" : 163,
			"margin-right" : 25,
			"height" : 25,
			"float" : "left",
			"border" : "1px gray dotted",
			"text-align":"right",
			"font-size":"9pt", 
			"padding-right":3 
		});
		$("#div_keyframes_name").append(z);
		for (var i = 0; i < animInfo.frameCount; i ++) {
			var d = document.createElement("div");
			$(d).css({
				"width" : 25,
				"height" : 25,
				"border" : "1px solid black",
				"float" : "left",
				"-webkit-transition" : "all 0.15s ease-in"
			});
			$(d).attr({
				"id" : "keyframe_" + bone.name + "_" + i,
				"index" : j,
				"name" : "keyframe_" + j,
				"anim" : animInfo.name,
				"bone" : bone.name,
				"time" : i
			});
			if (anim) if (anim.getKeyframe(i)) $(d).css("background-color", jCOLOR_HASFRAME);
			$(dw).append(d);
			$(d).bind("mousedown", retrieve_selectKeyframe(d));
			$(d).bind("mousemove", retrieve_dragKeyframe(d));
			j++;
		}
		$("#div_keyframes").append(dw);
	}
	selectKeyframe($("div[name='keyframe_0']"));
	finishDrag();
}

function reloadAnimation() {
	if (!currentAnimation) {
		clearAnimation();
		return;
	}
	var currentScroll = $("#div_keyframes").scrollLeft();
	getAnimation(currentAnimation);
	$("#div_keyframes").scrollLeft(currentScroll);
}

function clearAnimation() {
	$("#div_keyframes").html("");
	$("#div_keyframes_name").html("");
	var pdw = $("#p_frames");
	if (pdw) $(pdw).remove();
}	

function setupAnimFrames(name,num) {

	var pdw = $("#p_frames");
	if (pdw) $(pdw).remove();
	
	var dw = document.createElement("p");
	$(dw).attr("id", "p_frames");
	for (var i = 0; i < num; i ++) {
		var d = document.createElement("div");
		var t = document.createTextNode(i+1);
		$(d).css({
			"width" : 25,
			"height" : 25,
			"display" : "inline-block",
			"border" : "1px dashed gray",
			"font-size" : "8pt",
			"text-align" : "center"
		});
		$(d).attr("id", "div_frameInfo_" + i);
		$(d).append(t);
		$(dw).append(d);
	}
	$("#div_keyframes_info").prepend(dw);
	$("#div_keyframes_info_name").html(name);
}

function setCurrentFrame(d) {
	jcurrentFrame = d;
	setFrameTime($(d).attr("anim"), $(d).attr("time")*1);
	var b = ps.Bone.getBoneByName($(jcurrentFrame).attr("bone"));
	ps.setCurrentBone(b);
}

function retrieve_selectKeyframe (d) {
	return function() {
		selectKeyframe(d);
	};
}

function selectKeyframe(d) {
	jframeFlag = true;
	for (var i in jframeGroup)
		deselectKeyframe(jframeGroup[i]);
	jframeGroup = [];
	jframeGroup.push(d);
	setCurrentFrame(d);
	jstartFrame = d;
	var hasFrame = hasKeyframe(d);
	$(jcurrentFrame).css("background-color", (hasFrame ? jCOLOR_SELECTED_HASFRAME : jCOLOR_SELECTED));
}

function retrieve_dragKeyframe(d) {
	return function() {
		dragKeyframe(d);
	};
}

function dragKeyframe(d) {
	if (!jframeFlag) return;
	for (var i in jframeGroup)
		deselectKeyframe(jframeGroup[i]);
	jframeGroup = [];
	setCurrentFrame(d);
	var anim = ps.AnimationInfo.getAnimationInfoByName($(d).attr("anim"));
	var count = anim.frameCount;
	var start = $(jstartFrame).attr("index") * 1;
	var end = $(d).attr("index") * 1;
	var starti = Math.min(parseInt(start/count), parseInt(end/count));
	var endi = Math.max(parseInt(start/count), parseInt(end/count));
	var startj = Math.min(parseInt(start%count), parseInt(end%count));
	var endj = Math.max(parseInt(start%count), parseInt(end%count));
	for (var i = starti; i <= endi; i ++) {
		for (var j = startj; j <= endj; j ++) {
			var target = $("div[name='keyframe_" + (i*count+j) + "']");
			jframeGroup.push(target);
			var hasFrame = hasKeyframe(target);
			$(target).css("background-color", (hasFrame ? jCOLOR_SELECTED_HASFRAME : jCOLOR_SELECTED));
		}
	}
}

function copyKeyframes() {
	if (!currentAnimation) return;
	jframeCopy = [];
	for (var i in jframeGroup) {
		var d = document.createElement("div");
		jframeCopy.push(d);
		var d2 = jframeGroup[i];
		$(d).attr({
			"hasKeyframe" : "false",
			"index" : $(d2).attr("index")
		})
		var b = ps.Bone.getBoneByName($(d2).attr("bone"));
		var anim = b.getAnimationByName($(d2).attr("anim"));
		if (!anim) continue;
		var kf = anim.getKeyframe($(d2).attr("time") * 1);
		if (!kf) continue;
		$(d).attr({
			"hasKeyframe" : "true",
			"x" : kf.x,
			"y" : kf.y,
			"l" : kf.l,
			"a" : kf.a
		});
	}
	jframeCopyFrameCount = ps.AnimationInfo.getAnimationInfoByName(currentAnimation).frameCount;
	jlog("Keyframes are copied.");
}

function pasteKeyframes() {
	if (!jcurrentFrame) return;
	var animInfo = ps.AnimationInfo.getAnimationInfoByName($(jcurrentFrame).attr("anim"));
	if (!animInfo) return;
	var firstDiv, lastDiv;
	var start = $(jframeCopy[0]).attr("index") * 1;
	var end = $(jframeCopy[jframeCopy.length - 1]).attr("index") * 1;
	var startj = Math.min(parseInt(start%jframeCopyFrameCount), parseInt(end%jframeCopyFrameCount));
	var endj = Math.max(parseInt(start%jframeCopyFrameCount), parseInt(end%jframeCopyFrameCount));
	var countPerBone = endj - startj;
	var starti = Math.min(parseInt(start/jframeCopyFrameCount), parseInt(end/jframeCopyFrameCount));
	var endi = Math.max(parseInt(start/jframeCopyFrameCount), parseInt(end/jframeCopyFrameCount));
	var countBones = endi - starti;
	var startIndex = $(jcurrentFrame).attr("index") * 1;
	firstDiv = jcurrentFrame;
	var k = -1;
	for (var i = 0; i <= countBones; i ++) {
		var index = startIndex + animInfo.frameCount * i;
		for (var j = 0; j <= countPerBone; j ++) {
			k++;
			var d = $("div[name='keyframe_" + (index+j) + "']");
			if (!d) continue;
			if (!$(d).attr("id")) continue;
			lastDiv = d;
			var b = ps.Bone.getBoneByName($(d).attr("bone"));
			if (!b) continue;
			var anim = b.getAnimationByName($(d).attr("anim"));
			if (!anim) continue;
			anim.removeKeyframe($(d).attr("time") * 1);
			var d2 = jframeCopy[k];
			if ($(d2).attr("hasKeyframe") == "false") continue;
			var kf = ps.Keyframe.newKeyframe($(d).attr("time") * 1, $(d2).attr("x")*1, $(d2).attr("y")*1, $(d2).attr("l")*1, $(d2).attr("a")*1);
			anim.addKeyframe(kf);
		}
	}
	reloadAnimation();
	selectKeyframe(firstDiv);
	dragKeyframe(lastDiv);
	finishDrag();
	jlog("Keyframes are pasted.");
}

function finishDrag() {
	jframeFlag = false;
}

function deselectKeyframe(d) {
	var hasFrame = hasKeyframe(d);
	$(d).css("background-color", (hasFrame ? jCOLOR_HASFRAME : "white"));
}
	
function hasKeyframe(d) {
	var hasFrame = false;
	var bone = ps.Bone.getBoneByName($(d).attr("bone"));
	if (!bone) return false;
	var anim = bone.getAnimationByName($(d).attr("anim"));
	if (anim) {
		var frame = anim.getKeyframe($(d).attr("time") * 1);
		if (frame) hasFrame = true;
	}
	return hasFrame;
}
		
function setFrameTime(anim, time) {
	var f = $("#div_frameInfo_" + jcurrentTime);
	var f2 = $("#div_frameInfo_" + (time));
	$(f).css("background-color", "white");
	if (f2) $(f2).css("background-color", "#A1C935");
	jcurrentTime = time;
	var bones = ps.getBones();
	for (var i in bones) {
		var bone = bones[i];
		var anima = bone.getAnimationByName(anim);
		if (!anima) continue;
		var status = anima.getKeyframeStatus(time);
		if (!status) continue;
		bone.set(status.x, status.y, status.l, status.a);
	}
}

function refreshKeyframe(name, time) {
	var d = $("#keyframe_" + name + "_" + time);
	var hasFrame = false;
	var bone = ps.Bone.getBoneByName($(d).attr("bone"));
	var anim = bone.getAnimationByName($(d).attr("anim"));
	if (anim) {
		var frame = anim.getKeyframe($(d).attr("time") * 1);
		if (frame) hasFrame = true;
	}
	$(d).css("background-color", (hasFrame ? jCOLOR_HASFRAME : "white"));
}

function addKeyframe() {
/*
	var currentBone = ps.getCurrentBone();
	if (!jcurrentFrame) { alert("Select a keyframe first."); return; }
	if (!currentBone) { alert("Select a bone first."); return; }
	var anim = currentBone.getAnimationByName($(jcurrentFrame).attr("anim"));
	if (!anim) anim = currentBone.newAnimation($(jcurrentFrame).attr("anim"));
	var keyframe = ps.Keyframe.newKeyframe($(jcurrentFrame).attr("time") * 1, currentBone);
	anim.addKeyframe(keyframe);
*/
	if (jframeGroup.length == 0) { alert("Select keyframes first."); return; }
	var startDiv = jframeGroup[0];
	var endDiv = jframeGroup[jframeGroup.length - 1];
	for (var i in jframeGroup) {
		var d = jframeGroup[i];
		var b = ps.Bone.getBoneByName($(d).attr("bone"));
		var anim = b.getAnimationByName($(d).attr("anim"));
		if (!anim) anim = b.newAnimation($(d).attr("anim"));
		var kf;
		kf = ps.Keyframe.newKeyframe($(d).attr("time") * 1, b);
		anim.addKeyframe(kf);
	}
	selectKeyframe(startDiv);
	dragKeyframe(endDiv);
	finishDrag();
}

function removeKeyframe() {
	if (jframeGroup.length == 0) { alert("Select keyframes first."); return; }
	var startDiv = jframeGroup[0];
	var endDiv = jframeGroup[jframeGroup.length - 1];
	for (var i in jframeGroup) {
		var d = jframeGroup[i];
		var b = ps.Bone.getBoneByName($(d).attr("bone"));
		var anim = b.getAnimationByName($(d).attr("anim"));
		if (!anim) continue;
		anim.removeKeyframe($(d).attr("time") * 1);
	}
	selectKeyframe(startDiv);
	dragKeyframe(endDiv);
	finishDrag();
}
	

function changeFrameCount(count) {
	if (!currentAnimation) return;
	var animInfo = ps.AnimationInfo.getAnimationInfoByName(currentAnimation);
	animInfo.frameCount = count;
	getAnimation(currentAnimation);
}

function helpDisappear(help) {
	help.css("opacity", 0);
	
	setTimeout(function() { helpGone(help); }, 1000);
}

function helpGone(help) {
	help.css("display", "none");
}

setTimeout(() => {
	load(getExample2(), 1);
	getAnimation('test2');
}, 500);
