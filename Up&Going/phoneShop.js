const TAX_RATE = 0.23;
const PHONE_PRICE = 79.99;
const ACCESSORY_PRICE = 9.99;
const SPENDING_TRESHOLD = 1000;
let bankAccountBalance = 1300;
let moneySpent = 0;

while (canIAffordIt(calculatePurchasePrice(), bankAccountBalance)) {
    let fullPurchasePrice = calculatePurchasePrice();
    console.log(`Koszt telefonu: ${formatAmount(fullPurchasePrice)}`);
    buyPhone(fullPurchasePrice);
}

function calculatePurchasePrice() {
    let purchasePriceWithoutTax = PHONE_PRICE;
    if (SPENDING_TRESHOLD > moneySpent) {
        purchasePriceWithoutTax += ACCESSORY_PRICE;
    }
    let fullPrice = addTax(purchasePriceWithoutTax);
    return fullPrice
}

function buyPhone(phonePrice) {
    bankAccountBalance -= phonePrice;
    moneySpent += phonePrice;
    console.log(`Wydane pieniądze: ${formatAmount(moneySpent)}`);
}

function canIAffordIt(price, bankAccountBalance) {
    if (price < bankAccountBalance) {
        return true;
    } return false;
}

function addTax(priceWithoutTax) {
    return priceWithoutTax  = priceWithoutTax + (priceWithoutTax * TAX_RATE);
}
function formatAmount(price) {
    return `$${price.toFixed(2)}`;
}