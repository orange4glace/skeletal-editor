function Animation(name) {
	this.name = name;
	this.frameCount = 60;
	this.keyframes = [];
	
	this.addKeyframe = function(keyframe) {
		var index = 0;
		
		if (this.keyframes.length == 0) { this.keyframes.push(keyframe); return; }
		
		for (var i in this.keyframes) {
			if (this.keyframes[i].time == keyframe.time) {
				index = i;
				this.keyframes.splice(i, 1);
				break;
			}
			else if (this.keyframes[i].time > keyframe.time) {
				index = i;
				break;
			}
			index = this.keyframes.length;
		}
		
		this.keyframes.splice(index, 0, keyframe);
	};
	
	this.getKeyframe = function(time) {
		for (var i in this.keyframes)
			if (this.keyframes[i].time == time) return this.keyframes[i];
	};
	
	this.getNearestPreviousFrame = function(time) {
		var keyf;
		for (var i in this.keyframes) {
			if (this.keyframes[i].time < time) keyf = this.keyframes[i];
			else break;
		}
		return keyf;
	};
	
	this.getNearestPastFrame = function(time) {
		var keyf;
		for (var i in this.keyframes) {
			if (this.keyframes[this.keyframes.length - 1 - i].time > time) keyf = this.keyframes[this.keyframes.length - 1 - i];
			else break;
		}
		return keyf;
	};
	
	this.test = function() {
		var s = "";
		for(var i in this.keyframes) {
			s += (this.keyframes[i].time + " ");
		}
		
		alert(s);
	}
	
	this.getKeyframeStatus = function(time) {
		var keyframe = this.getKeyframe(time);
		if (keyframe) {
			return {
					x : keyframe.x,
					y : keyframe.y,
					l : keyframe.l,
					a : keyframe.a
			};
		}
		else {
			var prevKey = this.getNearestPreviousFrame(time);
			var pastKey = this.getNearestPastFrame(time);
			if (!prevKey && !pastKey) return;
			if (!prevKey) {
				return {
						x : pastKey.x,
						y : pastKey.y,
						l : pastKey.l,
						a : pastKey.a
				};
			}
			if (!pastKey) {
				return {
						x : prevKey.x,
						y : prevKey.y,
						l : prevKey.l,
						a : prevKey.a
				};
			}
			var dt = pastKey.time - prevKey.time;
			return {
					x : prevKey.x + (pastKey.x - prevKey.x) / dt * (time - prevKey.time),
					y : prevKey.y + (pastKey.y - prevKey.y) / dt * (time - prevKey.time),
					l : prevKey.l + (pastKey.l - prevKey.l) / dt * (time - prevKey.time),
					a : prevKey.a + (pastKey.a - prevKey.a) / dt * (time - prevKey.time)
			};
		}
	};
}