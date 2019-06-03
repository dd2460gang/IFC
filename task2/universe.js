try {
  var Planet = require('./planet');
  var Rocket = require('./rocket');
} catch(err){

}

function scale(k,v){
  return [k*v[0],k*v[1]];
}

function add(v1,v2){
  return [v1[0]+v2[0],v1[1]+v2[1]];
}

class Universe {
  constructor(x,y){
    this.planetId = 0;
    this.sockets = new Map();
    this.planets = new Map();
    this.keymap = [];
    this.g = 1;
    this.freq = 50;
    this.updateInterval;
    this.playersOnline = 0;
    this.timescale = 0.5*(this.freq/25)  ; //0.3
  }
  setSocket(p){
    this.sockets.set(p.socket, p.id);
  }
  getFreePlanetId(){
    console.log("Give id: "+this.planetId);
    this.planetId++;
    return(this.planetId-1);
  }
  randomColor(){
    var r = parseInt(50+Math.random()*200);
    var g = parseInt(50+Math.random()*200);
    var b = parseInt(50+Math.random()*200);
    var rgb = b | (g &lt;&lt; 8) | (r &lt;&lt; 16);
    var hex =  "#"+ ((0x1000000 | rgb).toString(16).substring(1));
    return hex;
  }
  updateRocket(id,ang,throttle,shoot){
    var r1 = this.planets.get(id);
    r1.ang=ang;
    let t = new Date().getMilliseconds() % 500;
    if(shoot &amp;&amp; (t&lt;25  || t &gt; 480)) {
      let p = this.addPlanet(r1.x+40*Math.cos(r1.ang),r1.y+40*Math.sin(r1.ang),10,r1.color);
      p.instable = 1000;
      try { p.speed = [r1.speed[0]+50*Math.cos(r1.ang),r1.speed[1]+50*Math.sin(r1.ang)] } catch(err) { console.log("ERRORORRORORORO" );}
    }
    r1.throttle=throttle;
    //if(throttle)r1.throttle = true;
    //else r1.throttle = false;
    return r1;
  }
  removePlanet(id){
    this.planets.delete(id);
  }
  findMaxMassPlanet(){
    var p = null;
    var maxPlanetMass = 0;
    this.planets.forEach(function(v,k,m){
      if(v.mass&gt;maxPlanetMass) {
        p = v;
        maxPlanetMass = v.mass;
      }
    });
    return p;
  }
  findPlanetWithMassOrder(pos){
    let list = [];
    this.planets.forEach(function(v,k,m){list.push(v);});
    list.sort(function(p1,p2){ return p2.mass -p1.mass; });
    return (pos &lt; list.length) ? list[pos] : list[0];
  }
  addThisPlanet(p){
    p.id = this.getFreePlanetId();
    this.planets.set(p.id,p);
  }
  addPlanet(x,y,radius,color){
    var p = new Planet(x,y,radius,color);
    p.id = this.getFreePlanetId();
    this.planets.set(p.id,p);
    return p;
  }
  setOrbit(sun,planet,random){
    var r = this.distances(sun,planet)[2];
    var speed = Math.sqrt((this.g*sun.mass)/(r));
    //var speed = Math.sqrt(this.g*sun.mass/this.distances(sun,planet)[2]);
    //var speed = Math.sqrt(this.g*sun.mass);
    var angle = this.angleCalc(sun,planet);
    var v = [Math.cos(angle),Math.sin(angle)];
    var v_p = [-v[1],v[0]]; //perpendicular
    planet.speed = [random+sun.speed[0]+v_p[0]*speed,random+sun.speed[1]+v_p[1]*speed];
  }
  addSolarSystem(middle,x,y,planets){
    var sun = this.addPlanet(x,y,Math.round(1500+Math.random()*300),this.randomColor());
    this.setOrbit(middle,sun,Math.random()*5);
    var d = 5000;
    for(let i = 0; i&lt; planets;i++){
      let angle = 2*Math.PI*Math.random();
      let p = this.addPlanet(sun.x+d*(Math.cos(angle)),sun.y+d*(Math.sin(angle)),100+Math.random()*200,this.randomColor());

      this.setOrbit(sun,p,0);
      if(Math.random()&lt;0.1) {
        let moon = this.addPlanet(p.x + 2*p.radius, p.y, 15+Math.random()*30, this.randomColor());
        this.setOrbit(p, moon, 0);
      }
      d+=3000+(d/8);
    }
  }
  addRandomSystem(){
    let sun = this.addPlanet(0,0,30000,this.randomColor());
    let d = 1000000;
    for(let i = 0; i &lt; 5; i++){
      let ang = Math.random()*2*Math.PI;
      this.addSolarSystem(sun,d*Math.cos(ang),d*Math.sin(ang),10);
      d+= 400000;
    }
    //let sun = this.addPlanet(0,0,1100,this.randomColor());
    //let p1 = this.addPlanet(2500,0,300,this.randomColor());
    //this.setOrbit(sun,p1,0);
    //let p2 = this.addPlanet(0,2500,100,this.randomColor());
    //p2.speed = [24,-2];
  }


  smash(p1,p2,toAdd){
    let ang = this.angleCalc(p1,p2);
    let amount = 3+Math.trunc(Math.random()*7);
    let orto = [-Math.sin(ang),Math.cos(ang)];
    let blastAng = ang-(Math.PI/2);
    let offset = -p2.radius+50;
    for(let i = 0; i&lt; amount;i++){

      let speed = 20+Math.random()*20;
      let r = Math.round(15+Math.random()*Math.sqrt(p2.mass)/amount);
      let height = r+30;
      if(i+1&gt;=amount) height = 200+Math.random()*100;
      let x = p1.x + (offset*orto[0])+ (Math.cos(ang) * (p1.radius + height));
      let y = p1.y + (offset*orto[1])+ (Math.sin(ang) * (p1.radius + height));
      let blast = new Planet(x, y,r,(Math.random()&lt;0.2) ? p1.color : p2.color);
      let rang = ang+((-Math.PI/2)+Math.random()*Math.PI);

      blast.speed = [p1.speed[0]+speed*Math.cos(blastAng),p1.speed[1]+speed*Math.sin(blastAng)];
      if(i+1 &gt;= amount) this.setOrbit(p1,blast,0);
      blastAng+=(Math.PI)/amount;
      offset+=(((2*p2.radius)+100)/amount);
      toAdd.push(blast);
    }
  }


  collision(k1,k2,p1,p2,toAdd,toRemove){
    if(Math.abs(p1.x-p2.x)-p1.radius-p2.radius&gt;200) return;
    if(Math.abs(p1.y-p2.y)-p1.radius-p2.radius&gt;200) return;
    if(Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2))&lt;p1.radius+p2.radius){

      if(p1.type == 0 &amp;&amp; p2.type==0){ // planets
        let v1 = scale(p1.mass/(p1.mass+p2.mass),p1.speed)[0]+scale(p2.mass/(p1.mass+p2.mass),p2.speed)[0];
        let v2 = scale(p1.mass/(p1.mass+p2.mass),p1.speed)[1]+scale(p2.mass/(p1.mass+p2.mass),p2.speed)[1];

        let p2MassProportion = p2.mass/(p1.mass+p2.mass);
        if(p2MassProportion &lt; 0.5){ //p2 was the smaller one
          p1.setSize(p1.mass+p2.mass/2);
          p1.setSpeed(v1,v2);

          if(p2.mass &gt; 2000) {
            p1.setSize(p1.mass+p2.mass/2);
            this.smash(p1,p2,toAdd);
          } else {
            p1.setSize(p1.mass+p2.mass);
          }
          toRemove.push(k2);
          return;
        } else {
          p2.setSpeed(v1,v2);
          if(p1.mass &gt; 2000){
            p2.setSize(p1.mass+p2.mass/2);
            this.smash(p2,p1,toAdd);
          } else {
            p2.setSize(p2.mass+p1.mass);
          }

          toRemove.push(k1);
          //this.planets.delete(k1);
          return;
          //continue;
        }

      }else if(p1.type ^ p2.type) {
        //Unit vectors
        let un = scale(1/Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2)),[p2.x-p1.x,p2.y-p1.y]);
        let ut = [-un[1],un[0]];

        let p1_vn = un[0]*p1.speed[0]+un[1]*p1.speed[1];
        let p1_vt = ut[0]*p1.speed[0]+ut[1]*p1.speed[1];
        let p2_vn = un[0]*p2.speed[0]+un[1]*p2.speed[1];
        let p2_vt = ut[0]*p2.speed[0]+ut[1]*p2.speed[1];

        let new_p1_vn = (p1_vn*(p1.mass-p2.mass)+(2*p2.mass*p2_vn))/(p1.mass+p2.mass);
        let new_p2_vn = (p2_vn*(p2.mass-p1.mass)+(2*p1.mass*p1_vn))/(p1.mass+p2.mass);

        let new_p1v = [new_p1_vn*un[0],new_p1_vn*un[1]];
        p1_vt = [p1_vt*ut[0],p1_vt*ut[1]];

        let new_p2v = [new_p2_vn*un[0],new_p2_vn*un[1]];
        p2_vt = [p2_vt*ut[0],p2_vt*ut[1]];

        let distanceInside = p1.radius+p2.radius-Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2));

        let new_speed_p1;
        let new_speed_p2;
        if(p2.type==1) {
          new_speed_p1 = add(new_p1v,p1_vt);
          new_speed_p2 = add(new_p2v,p1_vt);
        }
        else {
          new_speed_p1 = add(new_p1v,p2_vt);
          new_speed_p2 = add(new_p2v,p2_vt);
        }
        //
        let diff_p1_x = new_speed_p1[0]-p1.speed[0];
        let diff_p1_y = new_speed_p1[1]-p1.speed[1];
        let diff_p2_x = new_speed_p2[0]-p2.speed[0];
        let diff_p2_y = new_speed_p2[1]-p2.speed[1];

        p1.speed=[p1.speed[0]+(diff_p1_x*0.6),p1.speed[1]+(diff_p1_y*0.6)];
        p2.speed=[p2.speed[0]+(diff_p2_x*0.6),p2.speed[1]+(diff_p2_y*0.6)];

        var rocket = ((p1.type==1) ? p1 : p2);
        var planet = ((p1.type==0) ? p1 : p2);
        rocket.x += (distanceInside)*Math.cos(this.angleCalc(planet,rocket));
        rocket.y += (distanceInside)*Math.sin(this.angleCalc(planet,rocket));
      }
    }
    return;
  }

  update(){
    // forces &amp; collision
    var toRemove = [];
    var toAdd = [];
    this.planets.forEach(function(p1,k1,m){
      //console.log(this);
      if(p1.instable) {
        p1.instable--; console.log(p1.instable);
        if(p1.instable&lt;=0) toRemove.push(k1);
      }
      var i = this.planets.entries();
      while(i.next().value[1].id != k1);
      var planet = i.next();
      while(!planet.done){
        //instable


        //calc
        let p2 = planet.value[1];
        let k2 = planet.value[0];

        this.collision(k1,k2,p1,p2,toAdd,toRemove);

        var dist = this.distances(p1,p2);
        var ang = this.angleCalc(p1,p2);
        var f = [Math.cos(ang),Math.sin(ang)];
        var k = this.g*(p1.mass*p2.mass)/((Math.pow(dist[2],2)));
        f = [k*f[0],k*f[1]];
        if(p2.type!=1) p1.force = [p1.force[0]+f[0],p1.force[1]+f[1]]; // ( p1 )--&gt;     (p2)
        if(p1.type!=1) p2.force = [p2.force[0]-f[0],p2.force[1]-f[1]]; // ( p1 )     &lt;--(p2)

        planet= i.next();
      }
    }.bind(this));

    for(let i of toRemove){
      this.planets.delete(i);
    }

    for(let i of toAdd){
      this.addThisPlanet(i);
    }

    // applying movement
    this.planets.forEach(function(p,k,m){
      //console.log(k+", "+ p.x);
      if(p.type == 1 &amp;&amp; p.throttle) p.addForce(11);
      p.acc = [p.force[0]/p.mass,p.force[1]/p.mass];

      p.speed[0] += p.acc[0]*this.timescale;
      p.speed[1] += p.acc[1]*this.timescale;

      p.x += p.speed[0]*this.timescale;
      p.y += p.speed[1]*this.timescale;

      //Danger! Cannot be done here if one want to see forces
      p.showForce = p.force;
      p.force = [0,0];
      p.acc = [0,0];
    }.bind(this));
  }

  distances(obj1, obj2) {
  	var a = obj2.x - obj1.x;
  	var b = obj2.y - obj1.y;
  	var c = Math.sqrt( Math.pow(a,2) + Math.pow(b,2));
  	return declassify([a,b,c]); /// <<< HERE
  }
  angleCalc(obj1, obj2) {
  	var d = this.distances(obj1,obj2);
  	var a = d[0]; var b = d[1]; var c = d[2];
	// HERE >>> 
  	if ( a &gt;= 0 &amp;&amp; b &gt;= 0 ) return declassify(Math.abs(Math.asin( d[1] / d[2] )));
  	else if ( a &lt;= 0 &amp;&amp; b &gt;= 0 ) return declassify((Math.PI) - Math.abs(Math.asin( d[1] / d[2])));
  	else if ( a &lt;= 0 &amp;&amp; b &lt;= 0 ) return declassify((Math.PI) +  Math.abs(Math.asin( d[1] / d[2])));
  	else if ( a &gt;= 0 &amp;&amp; b &lt;= 0 ) return declassify((Math.PI*2) - Math.abs(Math.asin( d[1] / d[2])));
  }
}

module.exports = Universe;
