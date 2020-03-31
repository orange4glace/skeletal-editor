function BoneManager() {
	this.bones = [];
	
	this.addBone = function(x, y, l, a, flag, name, parent) {
		var bone = new Bone(x, y, l, a, flag, name, parent);
		this.bones.push(bone);
	}
	
	this.addBoneObject = function(bone) {
		this.bones.push(bone);
	}
}