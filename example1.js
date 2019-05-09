var guessedPwd = 1234; // public value

var realPwd = lbl(4321); // private value

if (declassify(guessedPwd == realPwd)) lprint("Correct password"); // print to public channel

else lprint("Wrong password"); // print to public channel
lprint(declassify(realPwd));
