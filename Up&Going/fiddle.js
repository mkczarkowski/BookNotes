"use strict";

let foo = {
  a: 42
};

let bar = Object.create(foo);

bar.b = "hello world";
console.log(bar.a);
console.log(bar.b);