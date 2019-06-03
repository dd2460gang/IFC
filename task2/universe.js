function Universe() {}

Universe.prototype = {  
distances : function(obj1, obj2) {
  	var a = obj2.x - obj1.x;
  	var b = obj2.y - obj1.y;
  	var c = Math.sqrt( Math.pow(a,2) + Math.pow(b,2));
  	return declassify([a,b,c]);
  },
  angleCalc : function(obj1, obj2) {
  	var d = lbl(this.distances(obj1,obj2));
  	var a = d[0]; var b = d[1]; var c = d[2];
  	if ( a >= 0 && b >= 0 ) return declassify(Math.abs(Math.asin( d[1] / d[2] )));
  	else if ( a <= 0 && b >= 0 ) return declassify((Math.PI) - Math.abs(Math.asin( d[1] / d[2])));
  	else if ( a <= 0 && b <= 0 ) return declassify((Math.PI) +  Math.abs(Math.asin( d[1] / d[2])));
  	else if ( a >= 0 && b <= 0 ) return declassify((Math.PI*2) - Math.abs(Math.asin( d[1] / d[2])));
  }
}

function returnThing(){
	return {
		x: 100,
		y: 200
	}
}

let a = lbl(returnThing()); 
let b = lbl(returnThing()); 
let c = lbl(returnThing()); 

let u = new Universe(); 
lprint(u.distances(a,b));
//lprint(u.angleCalc(c,b));
