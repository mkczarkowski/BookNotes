function foo(obj) {
  with (obj) {
     c = 2;
  }

}
var o1 = {
  a: 3
};

var o2 = {
  b: 3
}

foo(o2);

console.log(c);