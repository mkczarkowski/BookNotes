function foo(p1, p2) {
  this.val = p1 + p2;
}

// korzystamy z null ponieważ nie interesuje nas wiązanie twarde
// i tak zostałoby nadpisane przez 'new'
var bar = foo.bind(null, "p1");
var baz = new bar("p2");
var boozer = new bar("p4");

console.log(baz.val); // p1p2
console.log(boozer.val);