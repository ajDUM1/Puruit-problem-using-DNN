/*
Unicycle pursuit simulation with
control over velocity, angle,
location and turn rate of the 
target and chaser


*/

let overPursuer = false;
let overTarget = false;

let xOffset = 0.0;
let yOffset = 0.0;

let k=0.005;

class Agent{
    constructor(x,y,v,theta){
        this.x = x;
        this.y = y;
        this.v = v;
        this.theta = theta;

        this.x1 = 0;
        this.x2 = 0;
        this.x3 = 0;
        
        this.y1 = 0;
        this.y2 = 0;
        this.y3 = 0;

        this.makeTriangle();
    }

    distanceTo(dx,dy){
        return dist(dx,dy,this.x,this.y);
    }

    makeTriangle() {
        let l = 5;

        this.x1 = this.x + l*Math.cos(this.theta);
        this.x2 = this.x + l*Math.cos(this.theta+3*Math.PI/4);
        this.x3 = this.x + l*Math.cos(this.theta+5*Math.PI/4);

        this.y1 = this.y + l*Math.sin(this.theta);
        this.y2 = this.y + l*Math.sin(this.theta+3*Math.PI/4);
        this.y3 = this.y + l*Math.sin(this.theta+5*Math.PI/4);
    }

    updatePosition(){
        this.x += this.v*Math.cos(this.theta);
        this.y += this.v*Math.sin(this.theta);

        this.makeTriangle();
    }
}

class Obstacle{
    constructor(){
        this.x = 50+Math.random()*1450
        this.y = 50+Math.random()*685

        this.r = Math.random()*50+40
    }

    distanceTo(Obs){
        return dist(Obs.x,Obs.y,this.x,this.y);
    }
}

let p = new Agent(750,350,0.30,3*Math.PI/2 + 0.08);//pursuers

let o = [new Obstacle(),new Obstacle(),new Obstacle(),new Obstacle(),new Obstacle()]

let map = new Map()

let rays = new Map()

//populate the point cloud with obstacles
for(i in o){
    x = o[i].x
    y = o[i].y
    r = o[i].r
    for(let j=0;j<2*Math.PI;j+=0.02){
        map.set(x+r*Math.cos(j),y+r*Math.sin(j))
    }
}

function MSDF(x,y){
    keys = [... map.keys()]

    dmin = Infinity
    xmin = 0

    for(i of keys){
        d1 = dist(x,y,i,map.get(i))
        if(d1<dmin){
            dmin=d1
            xmin=i
        }
    }

    return dmin
}

function generateRays(){
    //populate the first circle
    let r = MSDF(p.x,p.y)
    for(let j=p.theta;j<p.theta+2*Math.PI;j+=Math.PI/90){
        rays.set(p.x+r*Math.cos(j),p.y+r*Math.sin(j))
    }

    let new_rays = new Map()
    stroke("green")
    strokeWeight(5)

    for(i of rays.keys()){
        x = i
        y = rays.get(i)
        dx = MSDF(x,y)
        d = r
        while(dx>5){
            point(x,y)
            x += (dx/d)*(x-p.x)
            y += (dx/d)*(y-p.y)
            d = d+dx
            dx = MSDF(x,y)
            if(x<0||y<0||x>1500||y>735){break;}
        }
        new_rays.set(x,y)
    }

    return new_rays
}

function setup(){
    canvas = createCanvas(1500,735);
    textSize(24);

    //velocity of agents
    vslider = createSlider(1, 200, 50);
    vslider.position(500,710);
    vslider.style('width', '200px');
    vslider.input(updateParameters);
    
    //gain in control law
    gslider = createSlider(25, 250, 100);
    gslider.position(800,710);
    gslider.style('width', '200px');
    gslider.input(updateParameters);

    frameRate(30);
}

function draw(){

    clear();
    background(58); // set background

    //set text
    stroke('white');
    strokeWeight(0);

    text('Velocity',400,720);
    text('Gain',720,720);

    //target
    stroke('white');
    strokeWeight(1);

    for(i in o){
        circle(o[i].x,o[i].y,2*o[i].r)
    }

    noFill()

    nrays = generateRays()

    stroke('black')
    strokeWeight(1)

    for(i of nrays.keys()){
        line(p.x,p.y,i,nrays.get(i))
    }

    stroke('white')
    strokeWeight(1)

    for(i of rays.keys()){
        line(p.x,p.y,i,rays.get(i))
    }

    rays.clear()

    fill(255,255,255)
    
    //pursuer
    stroke('yellow');
    strokeWeight(5);

    triangle(p.x1,p.y1,p.x2,p.y2,p.x3,p.y3);

    //p.updatePosition();
    if (keyIsDown(LEFT_ARROW)) {
        p.theta -= 0.05
    }
    
    if (keyIsDown(RIGHT_ARROW)) {
        p.theta += 0.05;
    }
}

function updateParameters() {
    p.v = vslider.value()/100.0;

    k = gslider.value()/5000.0;
}

function mousePressed() {
    if(p.distanceTo(mouseX,mouseY)<45){
        overPursuer = true;

        xOffset = p.x - mouseX;
        yOffset = p.y - mouseY;
    }
}

function mouseReleased() {
    overPursuer = false;
    overTarget = false;
}

function mouseDragged() {
    if(overPursuer){
        p.x = mouseX + xOffset;
        p.y = mouseY + yOffset;

        p.makeTriangle();
    }
}

function keyPressed(){
    if(keyCode === 32){
        noLoop();
    }else{
        console.log(keyCode)
        loop();
    }
    return false
}