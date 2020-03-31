function Bone(x, y, l, a, flag, name, parent) {
	this.x = x;
	this.y = y;
	this.l = l;
	this.a = a;
	this.flag = flag;
	this.name = name;
	this.child = [];
	this.parent = parent;
	this.anims = [];
	
	this.draw = function() {
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix,[0,600,0]);
		mat4.multiply(mvMatrix, [1,0,0,0,0,-1,0,0,0,0,1,0,0,0,0,1]);
		this.setMVMat();
		vec3.set([1,1,1],color);
		if (currentBone)
			if (this.name == currentBone.name) vec3.set([1,0,0],color);
		for (var i in currentParent)
			if (this.name == currentParent[i].name) vec3.set([0,1,0], color);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.boneVertexBuffer);
		var vertices = [
			0.0, 0.0, 0.0,
			this.l, 0.0, 0.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.boneVertexBuffer.itemSize = 3;
		this.boneVertexBuffer.numItems = 2;
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.boneVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
		setMatrixUniforms();
		gl.drawArrays(gl.LINES, 0, this.boneVertexBuffer.numItems);
	};
	
	this.setMVMat = function() {
		var mvMat = mat4.create();
		mat4.identity(mvMat);
		var parents = [];
		var p = this.parent;
		parents.push(this);
		while (p) {
			parents.push(p);
			p = p.parent;
		}
		for (var i in parents) {
			if (parents.length - i - 2 < 0) break;
			var child = parents[parents.length - i - 2];
			var target = parents[parents.length - i - 1];
			if ((child.flag & 1) == 1) mat4.translate(mvMat, [target.x, target.y, 0]);
			if ((child.flag & 2) == 2) {
				mat4.rotate(mvMat, Math.PI / 180 * target.a, [0,0,1]);
				mat4.translate(mvMat, [target.l, 0, 0]);
			}
		}
		mat4.translate(mvMat, [this.x, this.y, 0]);
		mat4.rotate(mvMat, Math.PI / 180 * this.a, [0,0,1]);
		return mvMat;
	};
	
	this.set = function(x, y, l, a) {
		this.x = x;
		this.y = y;
		this.l = l;
		this.a = a;
	};
	
	this.addAnimation = function(name) {
		var anim = new Animation(name);
		this.anims.push(anim);
		return anim;
	};
	
	this.addAnimationObject = function(anim) {
		this.anims.push(anim);
		return anim;
	};
	
	this.getAnimationByName = function(name) {
		for (var i in this.anims)
			if (this.anims[i].name == name) return this.anims[i];
	};
}