/*
    TASK 1 - Help Alice and Bob to choose the nearest restaurant
*/

function createRandomRestaurant(name){
    let x = Math.floor(Math.random()*50)+1;
    let y = Math.floor(Math.random()*50)+1;
    let price = Math.round(Math.random()*200);
    print("Creating " + name ": " + price);
    var restaurant = {
        name: name,
        locX: x,
        locY: y,
        avgPrice: price
    }
    return restaurant;
}

var restaurants = [
    createRandomRestaurant("Pelles Thai"), createRandomRestaurant("Pelles Pizza"),
    createRandomRestaurant("Pelles Pasta"), createRandomRestaurant("Jannes Jalapeño"),
    createRandomRestaurant("Lisas Lakrits"), createRandomRestaurant("Jacobs Jordgubbar"),
    createRandomRestaurant("Alis Aubergine-emoji"), createRandomRestaurant("Bullens"),
    createRandomRestaurant("Restaurang Q"), createRandomRestaurant("Hannas Hamburgare")
]

print(restaurants);

restaurants[0].avgPrice = 5;
restaurants[0].locX = 0;
restaurants[0].locY = 0;

//var alicePos = lbl([0,1]);
var alicePos = [3,6];
var bobPos = lbl([0,0]);

var aliceCash = lbl(10000000);
var bobCash = lbl(50);

var charliePos = lbl([2,2]);
var threshold = 100;

// Find the nearest for all guys
function chooseRestaurant(persons, restaurants, threshold){
    let shortest = [100000000,""];
    for (let i in restaurants) {
        let r = restaurants[i];
        if(r.avgPrice >= threshold) {
            let distance = lbl(0);
            for(let j in persons) {
                distance += calcDistance(persons[j], [r.locX, r.locY]);
            }
            let declDistance = declassify(distance)
            if (declDistance < shortest[0]) shortest = [declDistance,r];
        }
  }
  return shortest;
}

function calcDistance(person,r){
    //let distance = Math.abs(r[0]-person[0]);
    //distance += Math.abs(r[1]-person[1]);
    let distance = Math.sqrt(Math.pow(person[0]-r[0],2)+Math.pow(person[1]-r[1],2));
    return declassify(distance);
}

function findRestaurantFromPerson(charlie,dist){
    print("task3: " + dist);
    for(let i in restaurants){
        let r = restaurants[i];
        if(calcDistance(charlie,[r.locX,r.locY]) == dist) return r.name;
    }
    return "No restaurant found";
}

function electronicWallet(moneyLeft, price){
  var canAffordOrNot = moneyLeft>price
  if(declassify(canAffordOrNot)){
    moneyLeft = moneyLeft-price;
  }else{
    lprint("Error: insufficient funds");
  }
}

function trackAlice(){
    let p1 = [-10,0];
    let p2 = [10,0];
    let p3 = [0,-10];

    let u = 20; // The distance between p1 & p2
    let r1 = calcDistance(alicePos,p1);
    let r2 = calcDistance(alicePos,p2);
    let r3 = calcDistance(alicePos,p3);

    // let x = ((Math.pow(r1,2)-Math.pow(r2,2) )+ Math.pow(u,2)) / (2*u);
    // let y1 = Math.sqrt(Math.pow(r1,2)-Math.pow(x,2));
    let A = -2*p1[0] + 2*p2[0];
    let B = -2*p1[1] + 2*p2[1];
    let C = Math.pow(r1,2) - Math.pow(r2,2) - Math.pow(p1[0],2) + Math.pow(p2[0],2) - Math.pow(p1[1],2) + Math.pow(p2[1],2);
    let D = -2*p2[0] + 2*p3[0];
    let E = -2*p2[1] + 2*p3[1];
    let F = Math.pow(r2,2) - Math.pow(r3,2) - Math.pow(p2[0],2) + Math.pow(p3[0],2) - Math.pow(p2[1],2) + Math.pow(p3[1],2);
    x = (C*E - F*B)/(E*A - B*D);
    y = (C*D - A*F)/(B*D-A*E);
    lprint(x);
    lprint(r1);
    lprint(y);


}

let res = chooseRestaurant([alicePos,bobPos],restaurants,threshold);
lprint(res);
let resCharlie = calcDistance(charliePos, alicePos);
lprint("Distance Charlie-Alice: " + resCharlie + " restaurant is : " + findRestaurantFromPerson(charliePos,resCharlie));
lprint("Alice payed: ");
lprint("Average price was: " + res[1].avgPrice);
electronicWallet(aliceCash, res[1].avgPrice);
lprint("Bob payed: ");
electronicWallet(bobCash, res[1].avgPrice);
trackAlice();
