function AnimationInfoToFile(animationInfo) {
	this.s = "";
	this.s += "<animationInfo>";
	this.s += "<ainame>";
	this.s += animationInfo.name;
	this.s += "</ainame>";
	this.s += "<framecount>";
	this.s += animationInfo.frameCount;
	this.s += "</framecount>";
	this.s += "<fps>";
	this.s += animationInfo.fps;
	this.s += "</fps>";
	this.s += "</animationInfo>";
}