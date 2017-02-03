const TAX_RATE = 0.23;
const PHONE_PRICE = 79.99;
const ACCESSORY_PRICE = 9.99;
const SPENDING_TRESHOLD = 1000;
let bankAccountBalance = 1300;
let moneySpent = 0;

while (canIAffordIt(calculatePurchasePrice(), bankAccountBalance)) {
    buyPhone();
}
function calculatePurchasePrice() {
    let purchasePriceWithoutTax = PHONE_PRICE;
    if (SPENDING_TRESHOLD > moneySpent) {
        purchasePriceWithoutTax += ACCESSORY_PRICE;
    }
    let fullPrice = addTax(purchasePriceWithoutTax);
    return fullPrice = formatPriceAmount(fullPrice);
}

function buyPhone() {
    bankAccountBalance -= calculatePurchasePrice();
    moneySpent += calculatePurchasePrice();
    console.log(moneySpent);
}

function canIAffordIt(price, bankAccountBalance) {
    if (price < bankAccountBalance) {
        return true;
    } return false;
}

function addTax(priceWithoutTax) {
    return priceWithoutTax *= TAX_RATE;
}
function formatPriceAmount(price) {
    console.log(`$${price.toFixed(2)}`);
    return price.toFixed(2);
}