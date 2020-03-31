function AnimationInfo(name, frameCount, fps) {
	this.name = name;
	this.frameCount = frameCount;
	this.fps = fps;
	
	this.setFrameCount = function(c) {
		this.frameCount = c;
	};
	
	this.setFPS = function(fps) {
		this.fps = fps;
	};
}