var ATTRS = {
	"shape": ["tall", "wide", "cheeks", "chin", "neck"],
	"skin": ["pigment", "red"],
	"hair": ["dark", "ginger", "grey", "long", "bangs"],
	"eyes": ["wide", "open", "slant", "apart"],
	"nose": ["wide", "tall", "round"],
	"mouth": ["wide", "thick"]
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
	canvas.width = canvas.width;
	var midx = canvas.width / 2;
	ctx.strokeStyle = "#000";
	ctx.lineWidth = 2;
	var r, g, b;

	var top = lerp(canvas.height * 0.4, canvas.height * 0.1, face.tall);
	var wide = lerp(canvas.width * 0.2, canvas.width * 0.4, face.wide);
	var bangs = lerp(top, lerp(top, canvas.height, 0.33), face.bangs);
	var hair = lerp(bangs, canvas.height, face["long"]);
	// hair(back)
	if(face.long > 0.01) {
		ctx.fillStyle = haircolor(face);
		ctx.beginPath();
		ctx.moveTo(midx - wide, hair);
		ctx.quadraticCurveTo(midx-wide, top / 2, midx, top / 2);
		ctx.quadraticCurveTo(midx+wide, top / 2, midx + wide, hair);
		ctx.lineTo(midx - wide, hair);
		ctx.fill();
		ctx.stroke();
	}

	// head
	r = g = b = Math.floor(lerp(200, 50, face.pigment));
	r = Math.floor(lerp(r, 255, face.red * 2/3));
	b = Math.floor(b * 0.7);
	var neck = lerp(canvas.width / 60, canvas.width / 12, face.neck);
	var chin = neck + lerp(canvas.width / 12, lerp(0, canvas.width / 2,
												   face.wide), face.chin);
	var chiny = lerp(canvas.height * 0.9, canvas.height * 0.8, face.tall)
	var cheeks = canvas.width / 5 + lerp(0, lerp(0, canvas.width / 4,
												 face.wide), face.cheeks);
	var cheeksy = lerp(canvas.height * 0.75, canvas.height * 0.3, face.tall);

	ctx.fillStyle = "rgb(" + r + "," + g + "," + b +")"; //"#a86";
	ctx.beginPath();
	ctx.moveTo(midx - neck, canvas.height); //asdf
	ctx.lineTo(midx - neck, canvas.height * 0.95); //neck
	ctx.quadraticCurveTo(midx - chin, canvas.height * 0.95,
						 midx - chin, chiny); //chin
	ctx.bezierCurveTo(midx-chin, (chiny*2 + cheeksy) / 3,
					  midx-cheeks, (chiny + cheeksy*2) / 3,
					  midx-cheeks, cheeksy);//cheeks
	ctx.quadraticCurveTo(midx - wide, top, midx, top); //top
	ctx.quadraticCurveTo(midx + wide, top, midx+cheeks, cheeksy); //cheeks
	ctx.bezierCurveTo(midx+cheeks, (chiny + cheeksy*2) / 3,
					  midx+chin, (chiny*2 + cheeksy) / 3,
					  midx+chin, chiny); //chin
	ctx.quadraticCurveTo(midx + chin, canvas.height * 0.95, //chin
						 midx + neck, canvas.height * 0.95);
	ctx.lineTo(midx + neck, canvas.height);//neck
	ctx.fill();
	ctx.stroke();

	// hair(bangs)
	if(face.bangs > 0.01) {
		ctx.fillStyle = haircolor(face);
		ctx.beginPath();
		ctx.moveTo(midx - (wide / 3), top-2);
		ctx.quadraticCurveTo(midx - (wide / 2), top-2, midx - (wide / 2), bangs);
		ctx.lineTo(midx + (wide / 2), bangs);
		ctx.quadraticCurveTo(midx + (wide / 2), top-2, midx + (wide / 3), top-2);
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