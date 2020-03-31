function BoneToFile(bone) {
	this.s = "";
	this.s += "<bone>";
	this.s += "<name>";
	this.s += bone.name;
	this.s += "</name>";
	this.s += "<super>";
	this.s += (bone.isSuper ? "true" : "false");
	this.s += "</super>";
	this.s += "<x>";
	this.s += bone.x;
	this.s += "</x>";
	this.s += "<y>";
	this.s += bone.y;
	this.s += "</y>";
	this.s += "<l>";
	this.s += bone.l;
	this.s += "</l>";
	this.s += "<a>";
	this.s += bone.a;
	this.s += "</a>";
	this.s += "<flag>";
	this.s += bone.flag;
	this.s += "</flag>";
	this.s += "<parent>";
	this.s += (bone.parent ? bone.parent.name : "");
	this.s += "</parent>";
	this.s += "<animations>";
	for (var i in bone.animations) {
		var anim = bone.animations[i];
		this.s += "<anim>";
		this.s += "<aname>";
		this.s += anim.name;
		this.s += "</aname>";
		this.s += "<keyframes>";
		for (var j in anim.keyframes) {
			var kf = anim.keyframes[j];
			this.s += "<keyframe>";
			this.s += "<time>";
			this.s += kf.time;
			this.s += "</time>";
			this.s += "<ax>";
			this.s += kf.x;
			this.s += "</ax>";
			this.s += "<ay>";
			this.s += kf.y;
			this.s += "</ay>";
			this.s += "<al>";
			this.s += kf.l;
			this.s += "</al>";
			this.s += "<aa>";
			this.s += kf.a;
			this.s += "</aa>";
			this.s += "</keyframe>";
		}
		this.s += "</keyframes>";
		this.s += "</anim>";
	}
	this.s += "</animations>";
	this.s += "</bone>";
	
	this.print = function() {
		alert(this.s);
	};
}