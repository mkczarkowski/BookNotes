## Załącznik A - ES6 `class`

Wróćmy do przykładu `Widget` / `button` z rozdziału VI.
```aidl
class Widget {
  constructor(width, height) {
    this.width = width || 50;
    this.height = height || 50;
    this.$elem = null;
  }
  render($where) {
    if (this.$elem) {
      this.$elem.css({
        width: this.width + 'px',
        height: this.height + 'px',
      }).appendTo($where);
    }
  }
}

class Button extends Widget {
  constructor(width, height, label) {
    super(width, height);
    this.label = label || "Default";
    this.$elem = $("<button>").text(this.label);
  }
  render($where) {
    super.render($where);
    this.$elem.click(this.onClick.bind(this));
  }
  onClick(evt) {
    console.log("Button " + this.label + " clicked!");
  }
}
```
Poza tym, że powyższa składnia wygląda ładnie, jakie problemy rozwiązuje ES6?

1. Pozbyliśmy się (na swój sposób, więcej na dole) referencji do `.prototype`, które brudziły nasz kod.
2. `Button` bezpośrednio dziedziczy z `Widget` za pomocą `extends`, nie musimy korzystać z `Object.create(..)`,
aby dokonać podmiany obiektu `.prototype`, ustawiać `.__proto__` ani wywoływać `Object.setPrototypeOf(..)`.
3. `super(..)` daje nam możliwość relatywnego polimorfizmu, dzięki czemu każda metoda może się odwołać do metody
o tej samej nazwie o jeden poziom wyżej w łańcuchu.
4. Składnia `class` nie pozwala na określanie właściwości (jedynie metody). W większości przypadków stan powinien być
przechowywany w instancjach, a nie samym zbiorniku. W ten sposób unikamy pomyłek.
5. `extends` pozwala na dziedziczenie nawet po typach wbudowanych, takich jak `Array` czy `RegExp`. 

#### Haczyki w `class`

Niestety, nic nie jest idealne i `class` nastręcza wiele problemów z punktu widzenia projektowania. Przede wszystkim, 
`class` to tylko upiększenie składni, pod którym (w większości) kryje się stary mechanizm delegacji `[[Prototype]]`.

Nadal nie dochodzi do statycznego kopiowania definicji podczas deklaracji. Jeżeli przypadkowo/celowo dokonamy zmian w
metodzie rodzica to wpłyną one na działanie metod klas potomnych.
```aidl
class C {
  constructor() {
    this.num = Math.random();
  }
  rand() {
    console.log("Random: " + this.num);
  }
}

var c1 = new C();
c1.rand(); // "Random 0.4324299..."

C.prototype.rand = function() {
  console.log("Random: " + Math.round(this.num * 1000));
};

var c2 = new C();
c2.rand(); // "Random: 867"

c1.rand(); // "Random: 432" -- oops!!!
```
Takie zachowanie języka wydaje się nam naturalne dopiero, gdy znamy delegacyjną naturę rzeczy. Nie ma to nic wspólnego
z niezależnymi kopiami/instancjami.

Składnia `class` nie pozwala na śledzenie zmian stanu, ponieważ możemy deklarować jedynie metody, a nie właściwości.
Obejście tego problemu wymaga wykorzystania brzydkiej składni `.prototype`.
```aidl
class C {
  constructor() {
    // upewnijmy się, że będziemy modyfikować współdzielony stan
    // a nie zacienioną właściwość w instancji
    C.prototype.count++;
    
    // tutaj, 'this.count' będzie działało jak należy
    // dzięki delegacji
    console.log("Hello: " + this.count);
  }
}

C.prototype.count = 0;

var c1 = new C();
// Hello: 1

var c2 = new C();
// Hello: 2

c1.count === 2; // true
c1.count === c2.count; // true
```