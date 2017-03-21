## **Rozdział IV - Wynoszenie (ang. _hoisting_)**

#### Kura czy jajko?

Istnieje uzasadniona pokusa, aby analizując kod postrzegać go jako zbiór instrukcji wykonywanych od góry do dołu. Byłoby to
słuszne założenie gdyby nie jeden istotny aspekt - wynoszenie.
```markdown
a = 2;

var a;

console.log(a); // 2
```
Wielu programistów sądzi, że powyższy kod wydrukuje w konsoli `undefined`. Deklaracja zmiennej następuje po przypisaniu
wartości `2`, więc można byłoby się spodziewać ponownego nadania jej wartości domyślnej. Nic bardziej mylnego, wynikiem jest `2`.
```markdown
console.log(a); // undefined

var a = 2;
```
Kolejny zwodniczy przykład, którego analizę dodatkowo utrudniły poprzednie dziwactwa. Na pierwszy rzut oka mogą przyjść
do głowy dwie (niepoprawne) odpowiedzi: `2` lub `ReferenceError`. Jak możemy się domyślić, poprawnym wynikiem
jest `undefined`.

Powyższe przykłady udowadniają, że mamy tutaj do czynienia z paradoksem. Kto ma pierwszeństwo? Deklaracja ("jajko") czy
przypisanie ("kura").

#### Powrót kompilatora

Temat kompilatora był szeroko omówiony w rozdziale pierwszym, teraz wrócimy do tej tematyki omawiając wynoszenie.
Jak pamiętamy silnik wykonuje kompilację kodu przed jego interpretacją. Częścią procesu kompilacji jest przypisanie wszystkich
deklaracji do odpowiednich zakresów. Jest to sedno zakresu leksykalnego.

Dlatego warto przyjąć następujące założenie: deklaracje są procesowane przez silnik jako pierwsze, przed wykonaniem jakiegokolwiek
kodu.

Patrząc na `var a = 2;` zdaje się nam, że mamy do czynienia z jednym wyrażeniem. Javascript postrzega tę operację jako
dwa wyrażenia: `var a;` oraz `a = 2;`. Pierwsze wyrażenie, deklaracja, jest przetwarzane podczas kompilacji. Drugie pozostaje
nietknięte na swoim miejscu, aż do momentu wykonywania kodu.

Pierwszy przykład powinien być postrzegany w ten sposób:
```markdown
var a;

a = 2;

console.log(a);
```
A drugi:
```markdown
var a;

console.log(a);

a = 2;
```
Ujmując to w ramy abstrakcji - wszystkie deklaracje zostają przeniesione z swojego pierwotnego położenia w kodzie na szczyt
zakresu. Ten proces nazywa się **wyniesieniem**.

Wracając do metafory, jajko (deklaracja) ma pierwszeństwo przed kurą (wyrażenie).
```markdown
foo();

function foo() {
  console.log(a);
  
  var a = 2;
}
```
Dzięki mechanice wyniesienia deklaracja `function foo()` jest wyniesiona ponad wywołanie tej funkcji przez co kod wykonuje się zgodnie
z planem. Biorąc pod uwagę, że wynoszenie dotyczy tylko zakresu, w którym znajduje się dana deklaracja możemy spojrzeć na nasz
przykład w następujący sposób:
```markdown
function foo() {
  var a;
  
  console.log(a); // undefined
  
  a = 2;
}

foo();
```
Deklaracje funkcji są wynoszone, jednak ten mechanizm nie obowiązuje już w przypadku wyrażeń funkcyjnych.
```markdown
foo(); // nie ReferenceError, lecz TypeError!

var foo = function bar() {
// ...
};
```
Sama zmienna `foo` została wyniesiona na szczyt zakresu lecz w momencie wykonania `foo();` posiada wartość `undefined` przez co silnik
wyrzuca `TypeError`. 

Mimo, że wyrażenie funkcyjne posiada nazwę jest ona niedostępna w zakresie otaczającym. Stąd biorąc pod uwagę wynoszenie
mamy do czynienia z:
```markdown
var foo;

foo(); // TypeError
bar(); // ReferenceError

foo = function() {
  var bar = ...self...
  // ...
```

#### Funkcje mają pierwszeństwo

Zarówno deklaracje funkcji jak i zmiennych ulegają wynoszeniu. Trzeba jednak pamiętać o subtelnym detalu: funkcje są wynoszone
jako pierwsze, a dopiero po nich zmienne.
```markdown
foo(); // 1

var foo;

function foo() {
  console.log(1);
}

foo = function() {
  console.log(2);
};
```
Dochodzi do wydrukowania `1` zamiast `2`, ponieważ silnik interpretuje ten kod jako:
```markdown
function foo() {
  console.log(1);
}

foo(); // 1

foo = function() {
  console.log(2);
};
```
Warto zauważyć, że deklaracja `var foo` została zduplikowana przez co została zignorowana mimo, że pojawiła się przed deklaracją
`function foo();`. Jest to żywy dowód na to, że funkcje są wynoszone przed zmiennymi.

Podczas gdy duplikacje var są ignorowane, w przypadku kolejnych deklaracji funkcji dochodzi do nadpisania poprzednich.
 ```markdown
foo(); // 3

function foo() {
  console.log(1);
}

var foo = function() {
  console.log(2);
}

function foo() {
  console.log(3);
}
```
Jak widać zduplikowane deklaracje prowadzą do dość nieoczekiwanych rezultatów, więc należy ich bezwzględnie unikać.
```markdown
foo(); // b
var a = true;
if (a) {
  function foo() { console.log("a");
} else {
  function foo() { console.log("b");
}
```
Powyższy przykład pokazuje, że w przypadku wyrażeń warunkowych również mamy do czynienia z wynoszeniem ostatniej deklaracji
i nadpisaniem poprzednich. Z tego powodu deklarowanie funkcji wewnątrz bloków jest złym pomysłem.