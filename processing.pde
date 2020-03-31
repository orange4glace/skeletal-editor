
final float FRAMERATE = 30;
final byte RELATIVE_POSITION = 1;
final byte RELATIVE_ANGLE = 2;
final byte AUTOMATIC = 4;
int HEIGHT = 600;
Bone[] bones;
Vector4 sightPoint;
int mouseType = 0;
int grabType = 0;
boolean isDrawing = false;
boolean drawingEnd = false;
Matrix4 mvMatrix;

int boneNameIndex = 0;

Bone mouseBoneStart;
Bone mouseBoneEnd;
Bone grabBone;
Bone currentBone;
Vector4 lengthVector;

AnimationInfo[] animationInfoes;

Vector4 pt1, pt2;
Bone pBone;

/**
 * RightButton Bone move
 */
Vector4 prevMouse;

boolean animate = false;
int frame = 0;
AnimationInfo currentAnim;

/* For test */
Bone superBone;

void setup() {
	size(900, 600);
	frameRate(FRAMERATE);
	background(255);
	smooth();
	strokeWeight(5);
	
	bones = {};
	animationInfoes = {};
	
	superBone = new Bone(200,300,200,45,RELATIVE_ANGLE | RELATIVE_POSITION,"SuperBone",null);
	sightPoint = new Vector4(0,0);
	superBone.isSuper = true;
	superBone.refresh();
	append(bones, superBone);
}

void draw() {

	if (animate) {
		setFrameTime(currentAnim.name, frame++);
		if (frame >= currentAnim.frameCount) frame = 0;
	}

	background(255);
	stroke(0,0,0,100);
	resetMatrix();
	translate(0,600);
	scale(1,-1);
	
	drawPencil();
	superBone.draw();
	superBone.drawPoint();
}

int setFrameRate(int i) {
	if (i < 1) return -1;
	if (i > 60) return -1;
	FRAMERATE = i;
	frameRate(i);
	return i;
}

void setSuperBone(Bone b) {
	jlog("Set Superbone " + b.name);
	superBone = b;
}

boolean startAnimation(String name) {
	frame = 0;
	currentAnim = AnimationInfo.getAnimationInfoByName(name);
	if (currentAnim == null) return false;
	animate = true;
	return true;
}

void stopAnimation() {
	frame = 0;
	currentAnim = null;
	animate = false;
}

Object[] jsplice(Object[] arr, int index, int del, Object[] arr2) {
	Object[] tmp1 = subset(arr, 0, index);
	Object[] tmp2 = subset(arr, index+del);
	Object[] tmp3;
	if (arr2 != null)
		tmp3 = concat(tmp1, arr2);
	else
		tmp3 = tmp1;
	Object[] res = concat(tmp3, tmp2);
	return res;
}

Object[] jspliceO(Object[] arr, int index, int del, Object b) {
	Object[] tmp1 = subset(arr, 0, index);
	Object[] tmp2 = subset(arr, index+del);
	Object[] tmp3;
	if (b != null)
		tmp3 = append(tmp1, b);
	else
		tmp3 = tmp1;
	arr = concat(tmp3, tmp2);
	return arr;
}

void setMouseType(int type) {
	mouseType = type;
}

void getCurrentBone() {
	return currentBone;
}

Bone setCurrentBone(Bone b) {
	currentBone = b;
	jupdate(b);
	return b;
}

Vector4 getMouse() {
	return new Vector4(mouseX, HEIGHT - mouseY);
}

void mousePressed() {
	Vector4 mouse = getMouse();
	Bone be = getBoneEnd(mouse);
	Bone bs = getBoneStart(mouse);
	if (mouseButton == LEFT && be != null) currentBone = be;
	else if (mouseButton == LEFT && bs != null && bs.isSuper) currentBone = bs;
	
	if (mouseType == 0 && mouseButton == LEFT) {
		Bone b = be;
		if (be == null) b = bs;
		if (b != null) {
			grabBone = b;
			grabType = 0;
		}
		if (bs != null && bs.parent == null) {
			grabBone = bs;
			grabType = 1;
		}
		else mouseBoneEnd = null;
	}
	
	else if (mouseType == 0 && mouseButton == RIGHT) {
		Bone b = be;
		if (b != null) {
			grabBone = b;
			grabType = 2;
			prevMouse = mouse;
		}
		else mouseBoneEnd = null;
	}
	
	else if (mouseType == 1 && mouseButton == LEFT) {
		if (!isDrawing) {
			Bone b = be;
			if (b == null) return;
			isDrawing = true;
			drawingEnd = true;
			pBone = b;
			pt1 = new Vector4(b.ax2, b.ay2);
			pt2 = new Vector4(b.ax2, b.ay2);
		}
		else {
			if (!drawingEnd) {
				abortDrawing();
				return;
			}
			float pr = Vector4.getDegree(new Vector4(1,0), new Vector4(pBone.ax2 - pBone.ax1, pBone.ay2 - pBone.ay1));
			float cr = Vector4.getDegree(new Vector4(1,0), new Vector4(pt2.x - pt1.x, pt2.y - pt1.y));
			float r = cr - pr;
			Bone b = new Bone(0, 0, (new Vector4(pt2.x - pt1.x , pt2.y - pt1.y)).len(), 180 / PI * r, (RELATIVE_POSITION | RELATIVE_ANGLE), "noname" + (boneNameIndex++), pBone);
			b.refresh();
			append(bones, b);
			isDrawing = false;
			pBone = null;
			pt1 = null;
			pt2 = null;
			reloadAnimation();
		}	
	}
	
	else if (mouseType == 1 && mouseButton == RIGHT) {
		if (!isDrawing) {
			Bone b = bs;
			if (b == null) return;
			if (b.parent != null) return;
			isDrawing = true;
			drawingEnd = false;
			pBone = b;
			pt1 = new Vector4(b.ax1, b.ay1);
			pt2 = new Vector4(b.ax1, b.ay1);
		}
		else {
			if (drawingEnd) {
				abortDrawing();
				return;
			}
			float cr = Vector4.getDegree(new Vector4(1,0), new Vector4(pt2.x - pt1.x, pt2.y - pt1.y));
			float r = cr;
			Bone b = new Bone(0, 0, (new Vector4(pt2.x - pt1.x , pt2.y - pt1.y)).len(), 180 / PI * r, (RELATIVE_POSITION), "noname" + (boneNameIndex++), pBone);
			b.refresh();
			append(bones, b);
			isDrawing = false;
			pBone = null;
			pt1 = null;
			pt2 = null;
			reloadAnimation();
		}	
	}
	
	else if (mouseType == 2) {
		if (be == null) return;
		grabBone = be;
		lengthVector = new Vector4(grabBone.ax2 - grabBone.ax1, grabBone.ay2 - grabBone.ay1);
	}
	
	else if (mouseType == 3) {
		if (be == null) return;
		if (be.isSuper) return;
		jeraseBone(be);
	}
	
	if (currentBone != null) {
		jupdate(currentBone);
		jcurrentBone = currentBone.name;
	}
	else jcurrentBone = null;
}

void mouseReleased() {
	grabBone = null;
	lengthVector = null;
}

void mouseMoved() {
	Vector4 mouse = getMouse();
	Bone be = getBoneEnd(mouse);
	if (be != null) mouseBoneEnd = be;
	else mouseBoneEnd = null;
	Bone bs = getBoneStart(mouse);
	if (bs != null) mouseBoneStart = bs;
	else mouseBoneStart = null;
	
	if (isDrawing) {
		pt2.set(mouse.x, mouse.y);
	}
}

void mouseDragged() {
	
	Vector4 mouse = getMouse();
		
	if (grabBone == null) return;
	
	if (mouseType == 0) { 
		if (grabType == 0) {
			
			Vector4 center = new Vector4(grabBone.ax1, grabBone.ay1);
			Vector4 finger = new Vector4(grabBone.ax2, grabBone.ay2);
			
			Vector4 ctf = Vector4.sub(finger, center);
			Vector4 ctm = Vector4.sub(mouse, center);
			float radian = Vector4.getDegree(ctf, ctm);
			if (radian > PI) radian = radian - 2 * PI;
			if (isNaN(radian)) radian = 0;
			
			grabBone.a += 180 / PI * radian;
			
		}
		
		else if (grabType == 1) {
		
			grabBone.x = mouse.x;
			grabBone.y = mouse.y;
			
		}
	
		else if (grabType == 2) {
			Vector4 pastMouse = getMouse();
			Vector4 target = Vector4.sub(pastMouse, prevMouse);
			prevMouse = pastMouse;
			Bone p = grabBone.parent;
			float d = 0;
			while (p != null) {
				d -= p.a;
				p = p.parent;
			}
			
			Matrix4 mat = new Matrix4();
			mat.rotate(d);
			
			target = target.multi(mat);
			grabBone.x += target.x;
			grabBone.y += target.y;
		}
	}
	
	else if (mouseType == 2) {
		
		Vector4 center = new Vector4(grabBone.ax1, grabBone.ay1);
		Vector4 ctm = Vector4.sub(mouse, center);
		
		Vector4 projection = Vector4.project(lengthVector, ctm);
		int c = 1;
		if (lengthVector.x / projection.x < 0) c = 0;
		
		grabBone.l = projection.len() * c;
		if (grabBone.l == 0) grabBone.l = 0.1;
	}
		
	
	grabBone.refresh();
	jupdate(currentBone);
}

void drawPencil() {
	if (pt1 == null || pt2 == null) return;
	line(pt1.x, pt1.y, pt2.x, pt2.y);
	arc(pt2.x, pt2.y, 20, 20, 0, PI * 2);
}

void abortDrawing() {
	isDrawing = false;
	pBone = null;
	pt1 = null;
	pt2 = null;
}

Bone getBoneEnd(Vector4 pos) {
	float x = pos.x;
	float y = pos.y;
	for (Bone b : bones) {
		if ((x - b.ax2) * (x - b.ax2) + (y - b.ay2) * (y - b.ay2) <= 10*10) return b;
	}
}

Bone getBoneStart(Vector4 pos) {
	float x = pos.x;
	float y = pos.y;
	for (Bone b : bones) {
		if ((x - b.ax1) * (x - b.ax1) + (y - b.ay1) * (y - b.ay1) <= 10*10) return b;
	}
}
		

Bone[] getBones() {
	return bones;
}

AnimationInfo[] getAnimationInfoes() {
	return animationInfoes;
}

void emptyBones() {
	bones = {};
}

void emptyAnimationInfoes() {
	animationInfoes = {};
}

AnimationInfo[] getAnimationInfoes() {
	return animationInfoes;
}


class Bone {
	boolean isSuper = false;
	float x, y, l, a;
	float ax1, ay1, ax2, ay2;
	int flag;
	String name;
	Bone[] children = {};
	Bone parent;
	String sParent;
	Animation[] animations = {};
	
	Bone (float x, float y, float l, float a, int flag, String name, Bone parent) {
		this.x = x;
		this.y = y;
		this.l = l;
		this.a = a;
		this.flag = flag;
		this.name = name;
		if (parent != null) {
			this.parent = parent;
			append(parent.children, this);
		}
		this.refresh();
	}
	
	static Bone newBone(float x, float y, float l, float a, int flag, String name, String parent) {
		Bone p = Bone.getBoneByName(parent);
		Bone b = new Bone(x, y, l, a, flag, name, null);
		b.sParent = parent;
		append(bones, b);
		return b;
	}
	
	static boolean eraseBone(Bone tb) {
		for (int i = 0; i < bones.length; i ++)
			if (tb == bones[i])
				bones = jspliceO(bones, i, 1, null);
		for (Bone b : tb.children)
			eraseBone(b);
		return true;
	}	
	
	static Bone getBoneByName(String name) {
		Bone b = null;
		for (Bone br : bones)
			if (br.name == name) {
				b = br;
				break;
			}
		return b;
	}
	
	void set(float x, float y, float l, float a) {
		this.x = x;
		this.y = y;
		this.l = l;
		this.a = a;
		this.refresh();
	}
	
	boolean isInArray() {
		for (Bone b : bones)
			if (b == this) return true;
		return false;
	}
	
	void draw() {
		if (!this.isInArray()) return;
		pushMatrix();
		translate(this.x, this.y);
		rotate(PI / 180 * this.a);
		if (currentBone == this) stroke(255,0,0,100);
		else if (mouseBoneEnd == this) stroke(255,100,100,100);
		else if (mouseBoneStart == this && this.isSuper) stroke(255,100,100,100);
		else if (currentBone != null) 
			for(Bone b : currentBone.children)
				if (b == this) stroke(0,0,255,100);
		line(0,0,this.l,0);
		pushMatrix();
		scale(1,-1);
		popMatrix();
		popMatrix();
		
		stroke(0,0,0,100);
		
		for (Bone b : this.children) {
			pushMatrix();
			if ((b.flag & RELATIVE_POSITION) == RELATIVE_POSITION)
				translate(this.x, this.y);
			if ((b.flag & RELATIVE_ANGLE) == RELATIVE_ANGLE) {
				rotate(PI / 180 * this.a);
				translate(this.l, 0);
			}
			b.draw();
			popMatrix();
		}
	}
	
	void drawPoint() {
		if (!this.isInArray()) return;
		pushMatrix();
		translate(this.x, this.y);
		rotate(PI / 180 * this.a);
		if (currentBone == this) stroke(255,0,0,100);
		else if (mouseBoneEnd == this) stroke(255,100,100,100);
		else if (mouseBoneStart == this && this.isSuper) stroke(255,100,100,100);
		else if (currentBone != null) 
			for(Bone b : currentBone.children)
				if (b == this) stroke(0,0,255,100);
		rect(this.l - 10, -10, 20, 20);
		if (this.parent == null) rect(0 - 10, -10, 20, 20);
		popMatrix();
		
		stroke(0,0,0,100);
		
		for (Bone b : this.children) {
			pushMatrix();
			if ((b.flag & RELATIVE_POSITION) == RELATIVE_POSITION)
				translate(this.x, this.y);
			if ((b.flag & RELATIVE_ANGLE) == RELATIVE_ANGLE) {
				rotate(PI / 180 * this.a);
				translate(this.l, 0);
			}
			b.drawPoint();
			popMatrix();
		}
	}
		
	
	void validate() {
		jlog("Validating " + this.name + " ....");
		Bone b = Bone.getBoneByName(this.sParent);
		if (b != null) {
			boolean contains = false;
			this.parent = b;
			for (Bone c : b.children)
				if (c == this) contains = true;
			if (!contains)
				b.addChild(this);
		}
		this.refresh();
	}
	
	void set(float x, float y, float l, float a) {
		this.x = x;
		this.y = y;
		this.l = l;
		this.a = a;
		this.refresh();
	}
	
	void addChild(Bone b) {
		append(this.children, b);
	}
	
	void refresh() {
		Vector4 v1 = new Vector4(0,0);
		Vector4 v2 = new Vector4(this.l,0);
		Matrix4 m = new Matrix4();
		
		Bone[] hier = {};
		Bone b = this;
		while (b != null) {
			append(hier, b);
			b = b.parent;
		}
		for (int i = 0; i < hier.length; i ++) {
			if (i == (hier.length - 1)) {
				Bone hc = hier[0];
				m.translate(hc.x, hc.y);
				m.rotate(hc.a);
			}
			else {
				Bone hp = hier[hier.length - 1 - i];
				Bone hc = hier[hier.length - 2 - i];
				if ((hc.flag & RELATIVE_POSITION) == RELATIVE_POSITION)
					m.translate(hp.x, hp.y);
				if ((hc.flag & RELATIVE_ANGLE) == RELATIVE_ANGLE) {
					m.rotate(hp.a);
					m.translate(hp.l, 0);
				}
			}
		}
		v1 = v1.multi(m);
		v2 = v2.multi(m);
		this.ax1 = v1.x;
		this.ay1 = v1.y;
		this.ax2 = v2.x;
		this.ay2 = v2.y;
		for (Bone z : this.children) z.refresh();
	}
	
	boolean setName(String name) {
		if (Bone.getBoneByName(name) != null) return false;
		this.name = name;
		return true;
	}
	
	Animation getAnimationByName(String name) {
		for (Animation anim : this.animations)
			if (anim.name == name) return anim;
	}
	
	Animation newAnimation(String name) {
		if (this.getAnimationByName(name) != null) return;
		Animation anim = new Animation(name);
		append(this.animations, anim);
		return anim;
	}
	
	Animation addAnimation(Animation anim) {
		if (this.getAnimationByName(anim.name) != null) return;
		append(this.animations, anim);
		return anim;
	}
		
}

class Animation {
	String name;
	Keyframe keyframes[];
	
	Animation (String name) {
		this.name = name;
		keyframes = {};
	}
	
	static Animation newAnimation(String name) {
		Animation anim = new Animation(name);
		return anim;
	}
	
	void addKeyframe(Keyframe keyframe) {
		int index = 0;
		
		if (this.keyframes.length == 0) { append(this.keyframes, keyframe); return; }
		
		for (int i = 0; i < this.keyframes.length; i ++) {
			if (this.keyframes[i].time == keyframe.time) {
				index = i;
				this.keyframes = jspliceO(this.keyframes, i, 1, null);
				break;
			}
			else if (this.keyframes[i].time > keyframe.time) {
				index = i;
				break;
			}
			index = this.keyframes.length;
		}
		
		this.keyframes = jspliceO(this.keyframes, index, 0, keyframe);
	}
	
	void removeKeyframe(int time) {
		int index = -1;
		for (int i = 0; i < this.keyframes.length; i ++)
			if (this.keyframes[i].time == time) index = i;
		if (index == -1) return;
		this.keyframes = jspliceO(this.keyframes, index, 1, null);
	}
	
	Keyframe getKeyframe(int time) {
		for (Keyframe kf : this.keyframes)
			if (kf.time == time) return kf;
	}
	
	Keyframe getNearestPreviousFrame(int time) {
		Keyframe keyf;
		for (Keyframe kf : this.keyframes) {
			if (kf.time < time) keyf = kf;
			else break;
		}
		return keyf;
	}
	
	Keyframe getNearestPastFrame(int time) {
		Keyframe keyf;
		for (int i = 0; i < this.keyframes.length; i ++) {
			if (this.keyframes[this.keyframes.length - 1 - i].time > time) keyf = this.keyframes[this.keyframes.length - 1 - i];
			else break;
		}
		return keyf;
	}
		
	Keyframe getKeyframeStatus(time) {
		Keyframe keyframe = this.getKeyframe(time);
		if (keyframe != null) {
			return keyframe;
		}
		else {
			Keyframe prevKey = this.getNearestPreviousFrame(time);
			Keyframe pastKey = this.getNearestPastFrame(time);
			if (prevKey == null && pastKey == null) return;
			if (prevKey == null) {
				return pastKey;
			}
			if (pastKey == null) {
				return prevKey;
			}
			float dt = pastKey.time - prevKey.time;
			return (new Keyframe(
					0,
					prevKey.x + (pastKey.x - prevKey.x) / dt * (time - prevKey.time),
					prevKey.y + (pastKey.y - prevKey.y) / dt * (time - prevKey.time),
					prevKey.l + (pastKey.l - prevKey.l) / dt * (time - prevKey.time),
					prevKey.a + (pastKey.a - prevKey.a) / dt * (time - prevKey.time)));
		}
	}
}

class Keyframe {
	float x, y, l, a, time;
	Keyframe (float time, float x, float y, float l, float a) {
		this.x = x;
		this.y = y;
		this.l = l;
		this.a = a;
		this.time = time;
	}
	
	static Keyframe newKeyframe(float time, float x, float y, float l, float a) {
		Keyframe kf = new Keyframe(time, x, y, l, a);
		return kf;
	}
	
	static Keyframe newKeyframe(float time, Bone b) {
		Keyframe kf = new Keyframe(time, b.x, b.y, b.l, b.a);
		return kf;
	}
}

class AnimationInfo {
	String name;
	int frameCount;
	int fps;
	
	AnimationInfo(String name, int framecount) {
		this.name = name;
		this.frameCount = framecount;
		this.fps = 30;
	}
	
	static AnimationInfo getAnimationInfoByName(String name) {
		for (AnimationInfo animInfo : animationInfoes) 
			if (animInfo.name == name) return animInfo;
	}
	
	static AnimationInfo newAnimationInfo(String name, int framecount) {
		if (AnimationInfo.getAnimationInfoByName(name) != null) return;
		AnimationInfo animInfo = new AnimationInfo(name, framecount);
		append(animationInfoes, animInfo);
		return animInfo;
	}
}

class Matrix4 {
	float[] mat;
	
	Matrix4 () {
		mat = { 1,0,0,0,
				0,1,0,0,
				0,0,1,0,
				0,0,0,1 };
	}
	
	Matrix4 (float[] mat) {
		this.mat = mat;
	}
	
	void multi(Matrix4 m) {
		Matrix4 res = new Matrix4();
		for (int i = 0; i < 4; i ++) {
			for (int j = 0; j < 4; j ++) {
				float sum = 0;
				for (int k = 0; k < 4; k ++)
					sum += this.mat[i*4 + k] * m.mat[j + k*4];
				res.mat[i*4 + j] = sum;
			}
		}
		this.mat = res.mat;
	}
	
	void translate(float x, float y) {
		float[] m = { 1,0,0,x,
					  0,1,0,y,
					  0,0,1,0,
					  0,0,0,1 };
		Matrix4 mx = new Matrix4(m);
		this.multi(mx);
	}
	
	void rotate(float r) {
		float d = PI / 180 * r;
		float[] m = { cos(d), -sin(d), 0, 0,
					  sin(d), +cos(d), 0, 0,
					       0,       0, 1, 0,
						   0,       0, 0, 1 };
	    Matrix4 mx = new Matrix4(m);
		this.multi(mx);
	}
}

class Vector4 {
	float x, y, z, w;
	
	Vector4(float x, float y) {
		this.x = x;
		this.y = y;
		this.z = 0;
		this.w = 1;
	}
	
	Vector4(float x, float y, float z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = 1;
	}
	
	Vector4 multi(Matrix4 m) {
		float x = m.mat[0] * this.x + m.mat[1] * this.y + m.mat[2] * this.z + m.mat[3] * this.w;
		float y = m.mat[4] * this.x + m.mat[5] * this.y + m.mat[6] * this.z + m.mat[7] * this.w;
		return new Vector4(x, y);
	}
	
	void set(float x, float y) {
		this.x = x;
		this.y = y;
	}
	
	float len() {
		return sqrt(this.x*this.x+this.y*this.y);
	}
	
	static Vector4 add(Vector4 v1, Vector4 v2) {
		return new Vector4(v1.x + v2.x, v1.y + v2.y);
	}
	
	static Vector4 sub(Vector4 v1, Vector4 v2) {
		return new Vector4(v1.x - v2.x, v1.y - v2.y);
	}
	
	static Vector4 scale(Vector4 v, float s) {
		return new Vector4(v.x * s, v.y * s);
	}
	
	static float dot(Vector4 v1, Vector4 v2) {
		return (v1.x * v2.x + v1.y * v2.y);
	}
	
	static Vector4 cross(Vector4 v1, Vector4 v2) {
		return new Vector4(0, 0, v1.x * v2.y - v1.y * v2.x);
	}
	
	static float getDegree(Vector4 v1, Vector4 v2) {
		Vector4 cross = Vector4.cross(v1, v2);
		float radian = acos(Vector4.dot(v1, v2) / v1.len() / v2.len());
		if (cross.z < 0) radian = PI * 2 - radian;
		if(isNaN(radian)) radian = 0;
		return radian;
	}
	
	static Vector4 normal(Vector4 v) {
		float len = v.len();
		return new Vector4(v.x / len, v.y / len);
	}
	
	static Vector4 project(Vector4 v1, Vector4 v2) {
		float r = Vector4.getDegree(v1, v2);
		return Vector4.scale(Vector4.normal(v1), v2.len() * cos(r));
	}
}
				