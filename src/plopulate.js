var ATTRS = {
	"shape": ["tall", "fat", "cheeks", "chin", "neck"],
	"skin": ["pigment", "red"],
	"hair": ["dark", "ginger", "grey", "long", "bangs"],
	"eyes": ["wide", "open", "slant", "apart", "pupil"],
	"nose": ["schinoz", "round"],
	"mouth": ["big", "high"]
};
var FACEATTRS = [];
Object.keys(ATTRS).every(function(key) {
	ATTRS[key].every(function(item) {
		FACEATTRS.push(item);
		return true;
	});
	return true;
});

var lerp = function lerp(from, to, prog) {
	return (1 - prog) * from + prog * to;
};

function initface(face) {
	face = face || {};
	for(attr in FACEATTRS) {
		face[FACEATTRS[attr]] = 0.5;
	}
	return face;
}

function randomface(face) {
	face = face || {};
	for(attr in FACEATTRS) {
		face[FACEATTRS[attr]] = Math.random();
	}
	return face;
}

function readface(face, inputs) {
	initface(face);
	var cls;
	for(var i = 0; i < inputs.length; ++i) {
		cls = inputs.item(i).className;
		if(FACEATTRS.indexOf(cls) >= 0) {
			face[cls] = inputs.item(i).value / 100;
		}
	}
}

function writeface(face, inputs) {
	var elm = null;
	for(var i = 0; i < inputs.length; ++i) {
		cls = inputs.item(i).className;
		if(FACEATTRS.indexOf(cls) >= 0) {
			inputs.item(i).value = face[cls] * 100;
		}
	}
}

function skincolor(face) {
	var r, g, b;
	r = g = b = lerp(200, 50, face.pigment);
	r = lerp(r, 255, face.red * 2/3);
	b = b * 0.7;
	return [
		"rgb(", Math.floor(r), ",", Math.floor(g), ",", Math.floor(b), ")"
	].join("");
}
function haircolor(face) {
	var r, g, b;
	var lightest;
	var grey;
	r = g = b = lerp(255, 0, face.dark);
	r = lerp(r, 255, face.ginger * 2/3);
	g = g * 0.7;
	b = b * 0.5;
	lightest = Math.max(r, g, b);
	r = lerp(r, lightest, face.grey);
	g = lerp(g, lightest, face.grey);
	b = lerp(b, lightest, face.grey);
	return [
		"rgb(", Math.floor(r), ",", Math.floor(g), ",", Math.floor(b), ")"
	].join("");
}

function drawface(canvas, face) {
	var ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	canvas.width = canvas.width;
	var midx = canvas.width / 2;
	ctx.strokeStyle = "#000";
	ctx.lineWidth = Math.floor(canvas.width / 100) || 1;

	var top = lerp(canvas.height * 0.4, canvas.height * 0.1, face.tall);
	var fat = lerp(canvas.width * 0.2, canvas.width * 0.4, face.fat);
	var bangs = lerp(top, lerp(top, canvas.height, 0.33), face.bangs);
	var hair = lerp(bangs, canvas.height, face["long"]);
	// hair(back)
	if(face.long > 0.01) {
		ctx.fillStyle = haircolor(face);
		ctx.beginPath();
		ctx.moveTo(midx - fat, hair);
		ctx.quadraticCurveTo(midx-fat, top / 2, midx, top / 2);
		ctx.quadraticCurveTo(midx+fat, top / 2, midx + fat, hair);
		ctx.lineTo(midx - fat, hair);
		ctx.fill();
		ctx.stroke();
	}

	// head
	var neck = lerp(canvas.width / 60, canvas.width / 12, face.neck);
	var chin = neck + lerp(canvas.width / 12, lerp(0, canvas.width / 2,
												   face.fat), face.chin);
	var chiny = lerp(canvas.height * 0.9, canvas.height * 0.8, face.tall)
	var cheeks = canvas.width / 5 + lerp(0, lerp(0, canvas.width / 4,
												 face.fat), face.cheeks);
	var cheeksy = lerp(canvas.height * 0.75, canvas.height * 0.3, face.tall);

	ctx.fillStyle = skincolor(face);
	ctx.beginPath();
	ctx.moveTo(midx - neck, canvas.height); //asdf
	ctx.lineTo(midx - neck, canvas.height * 0.95); //neck
	ctx.quadraticCurveTo(midx - chin, canvas.height * 0.95,
						 midx - chin, chiny); //chin
	ctx.bezierCurveTo(midx-chin, (chiny*2 + cheeksy) / 3,
					  midx-cheeks, (chiny + cheeksy*2) / 3,
					  midx-cheeks, cheeksy);//cheeks
	ctx.quadraticCurveTo(midx - fat, top, midx, top); //top
	ctx.quadraticCurveTo(midx + fat, top, midx+cheeks, cheeksy); //cheeks
	ctx.bezierCurveTo(midx+cheeks, (chiny + cheeksy*2) / 3,
					  midx+chin, (chiny*2 + cheeksy) / 3,
					  midx+chin, chiny); //chin
	ctx.quadraticCurveTo(midx + chin, canvas.height * 0.95, //chin
						 midx + neck, canvas.height * 0.95);
	ctx.lineTo(midx + neck, canvas.height);//neck
	ctx.fill();
	ctx.stroke();

	// eyes
	ctx.fillStyle = "rgb(255, 255, 255)";
	var wide = lerp(canvas.width / 10, canvas.width / 5, face.wide);
	var open = lerp(canvas.height / 20, canvas.height / 8, face.open);
	var slant = lerp(-10, 10, face.slant);
	var apart = lerp(canvas.width * 0.01, fat/2, face.apart);
	apart /= wide/20;
	var eyey = lerp(top, canvas.height, 0.4);
	var eyeboty = eyey + canvas.height / 8;
	var flipx = [1, -1];
	flipx.every(function(flip) {
		ctx.save();
		ctx.translate(midx, eyey);
		ctx.scale(flip, 1);
		ctx.translate(0-apart, 0);
		ctx.rotate(slant * Math.PI/180);
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.bezierCurveTo(lerp(0, 0-wide, 0.2), open,
						  lerp(0, 0-wide, 0.8), open,
						  0-wide, 0);
		ctx.bezierCurveTo(lerp(0-wide, 0, 0.2), 0-open,
						  lerp(0-wide, 0, 0.8), 0-open,
						  0, 0);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.beginPath();
		ctx.arc(wide/-2, 0, lerp(ctx.lineWidth, Math.min(wide,open)/2,
								 face.pupil), 0, Math.PI*2);
		ctx.fill();
		ctx.restore();
		return true;
	});

	// mouth
	var mouth = lerp(canvas.width * 0.01, chin * 0.8, face.big);
	var mouthy = lerp(canvas.height * 0.9, lerp(top, canvas.height, 0.6),
					  face.high);
	ctx.beginPath();
	ctx.moveTo(midx-mouth, mouthy);
	ctx.lineTo(midx+mouth, mouthy);
	ctx.stroke();

	// nose
	var nose = lerp(canvas.width * 0.01, canvas.width * 0.1, face.round);
	var nosey = lerp(top, canvas.height, 0.5);
	var noselong = lerp(canvas.height * 0.1, canvas.height * 0.2, face.schinoz);
	var nosepuff = lerp(0, canvas.height * 0.2, face.round);
	ctx.fillStyle = skincolor(face);
	ctx.beginPath();
	ctx.moveTo(midx-nose, nosey);
	ctx.bezierCurveTo(midx-nose-nosepuff, nosey+noselong,
					  midx+nose+nosepuff, nosey+noselong,
					  midx+nose, nosey);
	ctx.fill();
	ctx.stroke();

	// hair(bangs)
	if(face.bangs > 0.1) {
		ctx.fillStyle = haircolor(face);
		ctx.beginPath();
		ctx.moveTo(midx - (fat / 3), top-2);
		ctx.quadraticCurveTo(midx - (fat / 2), top-2, midx - (fat / 2), bangs);
		ctx.lineTo(midx + (fat / 2), bangs);
		ctx.quadraticCurveTo(midx + (fat / 2), top-2, midx + (fat / 3), top-2);
		ctx.fill();
		ctx.stroke();
	}
}

function buildui(cont) {
	var elm;
	var section;
	Object.keys(ATTRS).every(function(key) {
		elm = document.createElement("h2");
		section = document.createElement("div");
		elm.appendChild(document.createTextNode(key));
		cont.appendChild(elm);
		cont.appendChild(section);
		elm.addEventListener("click", function() {
			var sect = this.nextSibling;
			sect.classList.toggle("hidden");
		});
		ATTRS[key].every(function(item) {
			elm = document.createElement("label");
			elm.appendChild(document.createTextNode(item));
			section.appendChild(elm);
			section.appendChild(document.createTextNode(":"));
			elm = document.createElement("input");
			elm.className = item;
			elm.type = "range";
			elm.min = 0;
			elm.max = 100;
			elm.value = 50;
			section.appendChild(elm);
			section.appendChild(document.createElement("br"));
			return true;
		});
		return true;
	});
}

window.addEventListener("load", function() {
	buildui(document.querySelector("body"));

	var face = {};
	var inputs = document.querySelectorAll("input");
	readface(face, inputs);
	for(var i = 0; i < inputs.length; ++i) {
		inputs.item(i).addEventListener("change", function() {
			readface(face, inputs);
			drawface(document.querySelector("canvas.face"), face);
		});
	}
	var rand = document.querySelector("button.randomize")
	if(rand) {
		rand.addEventListener("click", function() {
			randomface(face);
			writeface(face, document.querySelectorAll("input"));
			drawface(document.querySelector("canvas.face"), face);
		});
	}
	drawface(document.querySelector("canvas.face"), face);
});