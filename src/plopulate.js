var ATTRS = {
	"shape": ["tall", "wide", "cheeks", "chin", "neck"],
	"skin": ["dark", "red"],
	"hair": ["dark", "red", "grey", "long", "bangs", "bald"],
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

function drawface(canvas, face) {
	var ctx = canvas.getContext("2d");
	canvas.width = canvas.width;
	ctx.strokeStyle = "#000";

	var r, g, b;
	r = g = b = Math.floor(lerp(200, 50, face.dark));
	r = Math.floor(lerp(r, 255, face.red * 2/3));
	b = Math.floor(b * 0.7);
	ctx.fillStyle = "rgb(" + r + "," + g + "," + b +")"; //"#a86";
	ctx.lineWidth = 2;

	var neck = lerp(4, 20, face.neck);
	var chin = neck + lerp(20, lerp(0, 100, face.wide), face.chin);
	var chiny = lerp(230, 200, face.tall)
	var cheeks = 60 + lerp(0, lerp(0, 60, face.wide), face.cheeks);
	var cheeksy = lerp(192, 80, face.tall);
	var top = lerp(90, 4, face.tall);
	var wide = lerp(50, 100, face.wide);

	ctx.beginPath();
	ctx.moveTo(128 - neck, 256);
	ctx.lineTo(128 - neck, 256-16); //neck
	ctx.quadraticCurveTo(128 - chin, 256-16, 128 - chin, chiny); //chin
	ctx.bezierCurveTo(128-chin, (chiny*2 + cheeksy) / 3,
					  128-cheeks, (chiny + cheeksy*2) / 3,
					  128-cheeks, cheeksy);//cheeks
	ctx.quadraticCurveTo(128 - wide, top, 128, top); //top
	ctx.quadraticCurveTo(128 + wide, top, 128+cheeks, cheeksy); //cheeks

	ctx.bezierCurveTo(128+cheeks, (chiny + cheeksy*2) / 3,
					  128+chin, (chiny*2 + cheeksy) / 3,
					  128+chin, chiny);//chin
	ctx.quadraticCurveTo(128 + chin, 256-16, 128 + neck, 256-16); //neck
	ctx.lineTo(128 + neck, 256);
	ctx.fill();
	ctx.stroke();
}

function drawui(cont) {
	var elm;
	Object.keys(ATTRS).every(function(key) {
		elm = document.createElement("h2");
		elm.appendChild(document.createTextNode(key));
		cont.appendChild(elm);
		ATTRS[key].every(function(item) {
			elm = document.createElement("label");
			elm.appendChild(document.createTextNode(item));
			cont.appendChild(elm);
			cont.appendChild(document.createTextNode(":"));
			elm = document.createElement("input");
			elm.className = item;
			elm.type = "range";
			elm.min = 0;
			elm.max = 100;
			elm.value = 50;
			cont.appendChild(elm);
			cont.appendChild(document.createElement("br"));
			return true;
		});
		return true;
	});
	
}

window.addEventListener("load", function() {
	drawui(document.querySelector("body"));

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