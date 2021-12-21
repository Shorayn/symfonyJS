let yummyThings = ['pizza', 'gelato', 'sushi', 'cheeseburger'];

let greatThings = ['swimming', 'sunset', ...yummyThings, 'New Orleans'];

let copyOfGreatThings = [...greatThings];
copyOfGreatThings.push('summer');

console.log(greatThings);
console.log(copyOfGreatThings);


