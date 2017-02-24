const TAX_RATE = 0.08;
const PHONE_PRICE = 99.99;
const ACCESSORY_PRICE = 9.99;
const SPENDING_TRESHOLD = 200;
let bankAccountBalance = 303.91;
let moneySpent = 0;

while (canIAffordIt(moneySpent, bankAccountBalance)) {
  buyPhone();
}
moneySpent = addTax(moneySpent);
console.log(`Your purchase is worth ${formatAmount(moneySpent)}`);

if (moneySpent > bankAccountBalance) {
  console.log(`Whoops, you can't afford this!`);
}

function buyPhone() {
  moneySpent += PHONE_PRICE;
  if (SPENDING_TRESHOLD > moneySpent) {
    moneySpent += ACCESSORY_PRICE;
  }
}

function canIAffordIt(amount, bankAccountBalance) {
  if (amount < bankAccountBalance) {
    return true;
  }
  return false;
}

function addTax(priceWithoutTax) {
  return priceWithoutTax = priceWithoutTax + (priceWithoutTax * TAX_RATE);
}
function formatAmount(price) {
  return `$${price.toFixed(2)}`;
}