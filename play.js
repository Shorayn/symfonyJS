let foods = new WeakMap();
foods.set(['italian'], 'gelato');
foods.set(['mexican'], 'torta');
foods.set(['canadian'], 'poutine');

let southernUSStates = ['Tennessee', 'Kentucky', 'Texas'];

foods.set(southernUSStates, 'hot chicken');
southernUSStates = null;

console.log(
    foods.get(['italian']),
    foods.get(southernUSStates),
    foods.size
);

