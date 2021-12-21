
const aGreatNumber = 10;
const aGreatObject ={withGreatKey: true};

aGreatObject.withGreatKey = false;

if (true){
        // var aGreatNumber = 42;

}
setTimeout(() => {
   console.log(aGreatNumber);
   console.log(aGreatObject);
}, 1000);
console.log('waiting..');