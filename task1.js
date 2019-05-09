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

var alicePos = lbl([0,1]);
var bobPos = lbl([0,0]);

var aliceCash = lbl(10000000);
var bobCash = lbl(50);

var charliePos = lbl([2,2]);
var threshold = 100;

// Find the nearest for all guys
function chooseRestaurant(persons, restaurants, threshold){
    var shortest = [100000000,""];
    for (var i in restaurants) {
        var r = restaurants[i];
        if(r.avgPrice >= threshold) {
            let distance = lbl(0);
            for(var j in persons) {
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

function electronicWallet(moneyLeft, price){
  if(declassify(moneyLeft)>price){
    moneyLeft = moneyLeft-price;
  }else{
    lprint("Error: insufficient funds");
  }
}

function trackAlice(){
    let p1 = [-10,0];
    let p2 = [10,0];

    let u = 20; // The distance between p1 & p2
    let r1 = calcDistance(alicePos,p1);
    let r2 = calcDistance(alicePos,p2);

    let x = ((Math.pow(r1,2)-Math.pow(r2,2) )+ Math.pow(u,2)) / (2*u);
    let y1 = Math.sqrt(Math.pow(r1,2)-Math.pow(x,2));
    print(x);
    print(r1);
    print(y1);


}

let res = chooseRestaurant([alicePos,bobPos],restaurants,threshold);
lprint(res);
let resCharlie = calcDistance(charliePos, alicePos);
lprint("Distance Charlie-Alice: " + resCharlie);
lprint("Alice payed: ");
lprint("Average price was: " + res[1].avgPrice);
electronicWallet(aliceCash, res[1].avgPrice);
lprint("Bob payed: ");
electronicWallet(bobCash, res[1].avgPrice);
trackAlice();
