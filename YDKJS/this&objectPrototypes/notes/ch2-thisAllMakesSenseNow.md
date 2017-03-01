##**Rozdział II - `this` All Makes Sense Now!**

####Call-site

Aby zrozumieć wiązanie `this`, należy zrozumieć call-site: jest to lokalizacja w kodzie gdzie doszło
do wywołania funkcji (nie mylić z miejscem deklaracji). Musimy przeanalizować call-site aby odpowiedzieć na pytanie:
na co wskazuje `this`?

Ważne jest to, aby brać pod uwagę call-stack (stos funkcji, który został wywołany aby dotrzeć do obecnego momentu wykonania).
Call-site, który nas interesuje znajduje się **w** wywołaniu **przed** obecnie wykonywaną funkcją.
```markdown
function baz() {
  // call-stack: 'baz'
  // call-site: zakres globalny
  
  console.log("baz");
  bar(); // call-site dla 'bar'
}

function bar() {
  // call-stack: 'baz' -> 'bar'
  // call-site: 'baz'
  console.log("bar");
  foo(); // call-site dla 'foo'
}

function foo() {
  // call-stack: 'baz' -> 'bar' -> 'foo'
  // call-site: 'bar'
  console.log("foo");
}

baz(); // call-site: dla 'baz'
```
Analizując powyższy przykład należy zwrócić uwagę na aktualny call-site (z stosu wywołań), to jedyne co się liczy dla
wiązania `this`.

Można sobie wizualizować call-stack za pomocą łańcucha wywołań funkcji w taki sam sposób jak zaprezentowany w powyższym
przykładzie. Niestety jest to męcząca metoda, do tego podatna na błędy. Innym narzędziem obserwowania stosu wywołań jest
skorzystanie z debuggera w przeglądarce. Wystarczy ustawić breakpoint na `foo()` albo wprowadzić wyrażenie debugger;
w pierwszej linii. W czasie wykonywania kodu debugger wykona pausę na danej linii kodu i zaprezentuje listę wywołanych dotąd
funkcji - czyli nasz call stack. Drugi element od góry na naszej liście to rzeczony call-site.

####Liczą się tylko zasady

Musimy skoncentrować naszą uwagę na tym gdzie `this` będzie wskazywało podczas wykonywania funkcji.

Należy przyjrzeć się call-site i dojść do tego, która z czterech zasad zostanie zastosowana. Pierw opiszemy każdą z czterech
zasad osobno, a następnie przedstawimy kolejność ich stosowania oraz sytuacje zastosowania kilku zasad jedocześnie.

#####Wiązanie domyślne

Pierwsza zasada pochodzi z najczęściej występującej sytuacji: samodzielnego wywołania funkcji. Zasada ta znajduje swoje
zastosowanie gdy żadna inna nie wchodzi w grę.
```markdown
function foo() {
  console.log(this.a);
}

var a = 2;

foo(); // 2
```
Pierwszą rzeczą godną odnotowania jest, że zadeklarowana zmienna w zakresie globalnym jest tożsama z właściwością obiektu
globalnego o tej samej nazwie. Nie są to kopie, ani nic z tych rzeczy - są one dokładnie tym samym. 
Dwie strony tej samej monety.

Przy wywołaniu `foo()`, `this.a` odwołuje się globalnej zmiennej `a`. Dlaczego? W tym przypadku dochodzi do zastosowania
wiązania domyślnego dla `this`, więc wskazany zostaje obiekt globalny.

Skąd wiemy, że zasada wiązania domyślnego obowiązuje w tym przypadku? Wystarczy spojrzeć na call-site, aby zaobserwować
sposób wywołania `foo()`. W naszym przykładzie, `foo()` jest wywołane za pomocą zwykłej referencji do funkcji. 
Żadna z zasad, które zostanie zaprezentowana nie obowiązuje w takiej sytuacji, więc mamy do czynienia z wiązaniem domyślnym.
 
Jeżeli znajdujemy się w `strict mode`, obiekt globaly nie jest dostępny dla wiązania domyślnego, więc `this` zostaje ustawione
dla `undefined`.
```markdown
function foo() {
  "use strict"
  
  console.log(this.a);
}

var a = 2;

foo(); // TypeError: Cannot read property 'a' of undefined
```
Subtelny, lecz istotny detal: mimo, że ogólne zasady wiązania `this` są całkowicie oparte o call-site, obiekt globalny
jest tylko dostępny, gdy **zawartość** foo() nie działa w `strict mode`. Stan `strict mode` call-site'u samego `foo()` jest
bez znaczenia.
```markdown
function foo() {
  console.log(this.a);
}

var a = 2;

(function(){
  "use strict"
  
  foo(); // 2
})();
```
Takie mieszanie `strict-mode` i non-`strict-mode` jest czymś niepożądanym. Cały program powinien znajdować się w jednym
trybie. Naruszenie tej zasady jest uzasadnione jedynie przy użyciu niektórych bibliotek wymagających subtelnej kompatybilności.

#####Wiązanie niejawne

Kolejna zasada do rozpatrzenia: czy call-site posiada kontekstowy obiekt, również nazywany obiektem posiadającym lub zawierającym
lecz te określenia mogą wprowadzać w błąd co do jego natury.
```markdown
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
};

obj.foo(); // 2
```
Po pierwsze zauważmy w jaki sposób `foo()` jest zadeklarowane i później dodane jako referencja właściwości do `obj`. 
Niezależnie od tego czy `foo()` zostało pierwotnie zadeklarowane w `obj` czy dodane później jako referencja (jak w tym przykładzie),
w żadnym z przypadków funkcje nie jest tak naprawdę posiadana przez `obj`.

Jednakże, call-site korzysta z kontekstu `obj`, aby uzyskać referencję do funkcji, więc śmiało można powiedzieć, że `obj`
posiada lub zawiera referencję do funkcji w momencie jej wywołania.

Niezależnie jak nazwiemy ten wzorzec, moment wywołania foo() jest poprzedzony referencją do obiektu `obj`. Gdy mamy 
do czynienia z obiektem kontekstowym dla referencji funkcji, zasada niejawnego wiązania mówi, że właśnie ten obiekt 
będzie wskazywany przez wiązanie `this`.
```markdown
function foo() {
  console.log(this.a);
}

var obj2 = {
  a: 42,
  foo: foo,
};

var obj1 = {
  a: 2,
  obj2: obj2,
};

obj1.obj2.foo(); // 42
```

######Niejawna strata

Jedną z największy frustracji związanych z wiązaniem `this` jest, gdy niejawne wiązanie zostaje utracone, co najczęściej 
oznacza odwołaniem się do wiązania domyślnego, z obiektem globalnym lub `undefined` w zależności od strict mode.
```markdown
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
};

var bar = obj.foo; // referencja do funkcji/alias

var a = "oops, global"; // 'a' jest jednocześnie właściwością obiektu globalnego

bar(); // "oops, global"
```
Mimo, że `bar` pozornie stanowi referencję do `obj.foo` tak naprawdę jest tylko referencją do samego `foo`. Poza tym,
interesuje nas call-site, a call-site bar() jest zwyczajnym, pojedynczym wywołaniem, więc zastosowane zostaje wiązanie domyślne.

Ten sam proces, co prawda bardziej subtelny, a jednocześnie częściej występujący i mniej oczekiwany zachodzi przy przekazaniu 
funkcji callback:
```markdown
function foo() {
  console.log(this.a);
}

function doFoo(fn) {
  // 'fn' to kolejna referencja do foo
  fn(); // call-site
}

var obj = {
  a: 2,
  foo: foo
};

var a = "oops, global";

doFoo(obj.foo); // "oops, global"
```
Przekazywanie parametru to nic innego jak niejawne przypisanie. Jako, że przekazujemy funkcję jest to niejawne przypisanie 
referencji, więc otrzymujemy taki sam rezultat jak w poprzednim przykładzie.

Taka sama sytuacja zachodzi w przypadku zastosowania funkcji wbudowanych.
```markdown
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
};

var a = "oops, global"; // 'a' jest jednocześnie właściwością obiektu globalnego

setTimeout(obj.foo, 100); // "oops, global"
```
Spójrzmy na tę pseudo-implementację setTimeout(), która jest jedną z wbudowanych funkcji środowiska JavaScript.
```markdown
function setTimeout(fn, delay) {
  // zaczekaj (w jakiś sposób) określony 'delay' milisekund
  fn(); // call-site
}
```
Sytuacja, w której nasze callbacki tracą swoje wiązanie `this` jest częsta, co zaprezentowały powyższe przykłady.
Inny sposób, w który `this` może nas zaskoczyć to wtedy, gdy funkcja, której przekazaliśmy callback celowo zmienia `this`
dla tego wywołania. Obsługa zdarzeń w popularnych bibliotekach JS jest czuła na wymuszanie, aby `this` wskazywało element DOM,
który wywołał zdarzenie. Czasami jest to przydatne rozwiązanie, czasami w żadnym wypadku. Niestety, rzadko możemy dokonać 
wyboru.

#####Wiązanie jawne

Cały koncept opiera się na wymuszaniu wiązania `this` z wybranym przez nas obiektem bez konieczności tworzenia właściwości
z referencją do funkcji. 
 
Wszystkie funkcje (z kilkoma wyjątkami) w języku mają taką możliwość (za pomocą swojego `[[Prototype]]`). 
Najważniejszymi z nich są metody `call()` i `apply()`. 

Jak działają te metody? Każda z nich jako pierwszy parametr przyjmuje obiekt, na który będzie wskazywało `this`. Skoro
wprost decydujemy na co będzie wskazywało `this` możemy śmiało mówić o **jawnym wiązaniu**.
```markdown
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
};

foo.call(obj); // 2
```
Wywołanie `foo(`) z jawnym wiązaniem poprzez użycie `foo.call()` pozwala na wymuszenie, aby `this` wskazywało na `obj`.

Jeżeli przekażesz wartość prymitywną (typu `string`, `boolean` lub `number`) jako wiązanie `this`, ta wartość prymitywna
jest zapakowana w formie obiektu (za pomocą `new String()`, `new Boolean()` lub `new Number()`). Ten proces często nazywany
jest "boxing".

Warto wiedzieć: w odniesieniu do wiązania this, `call()` i `apply()` są identyczne. Zachowują się inaczej przy dodaniu 
kolejnych parametrów, co nie jest obecnie istotne.

Niestety, wiązanie jawne samo w sobie nie oferuje rozwiązania dla opisanego wcześniej problemu z funkcjami tracącymi 
wiązanie `this` albo ich nadpisywaniem przez frameworki.

######Wiązanie twarde

Możemy wykorzystać specjalny wzorzec wiązania jawnego, który załatwi nasz problem.
```markdown
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
}

var bar = function() {
  foo.call(obj);
}

bar(); // 2
setTimeout(bar, 100); // 2
// 'bar' wykonuje twarde wiązanie this 'foo' do 'obj'
// dzięki temu nie można go nadpisać
bar.call(window); // 2
```
Tworzymy funkcję `bar()`, która w swoim wnętrzu wywołuje `foo.call(obj)` co powoduje wykonanie `foo` z wiązaniem `this` wskazującym
na `obj`. Nieistotne jak później wywołamy bar, zawsze dojdzie do wykonania `foo` z `obj`. To wiązanie jest zarówno jawne
jak i silne, stąd nazwa - twarde wiązanie.

Najczęściej spotykany sposób opakowywania funkcji z użyciem wiązania twardego tworzy przejście dla wszystkich przekazanych
argumentów i wszystkich zwracanych wartości:
```markdown
function foo(something) {
  console.log(this.a, something);
  return this.a + something;
}

var obj = {
  a: 2,
}

var bar = function() {
  return foo.apply(obj, arguments);
};

var b = bar(3); // 2 3
console.log(b); // 5
```
Ten sam wzorzec można zaprezentować przy pomocy pomocnika wielokrotnego użytku (ang. _re-usable helper_).
```markdown
function foo(something) {
  console.log(this.a, something);
  return this.a + something;
}
// nasz pomocnik do tworzenia wiązań
function bind(fn, obj) {
  return function() {
    return fn.apply(obj, arguments);
  };
}

var obj = {
  a: 2,
};

var bar = bind(foo, obj);

var b = bar(3); // 2 3
console.log(b); // 5
```
Jako, że twarde wiązanie jest tak często używanym wzorcem stanowi on wbudowaną funkcjonalność ES5: `Function.prototype.bind`.
```markdown
function foo(something) {
  console.log(this.a, something);
  return this.a + something;
}

var obj = {
  a: 2,
}

var bar = foo.bind(obj);

var b = bar(3); // 2 3
console.log(b); // 5
```
`bind()` zwraca nową funkcję, która jest przygotowana do wywołania oryginalnej funkcji z ustawionym przez nas kontekstem `this`.

######"Kontekst" API Call

Wiele bibliotek oraz nowych, wbudowanych funkcji języka JavaScript pozwala na przekazanie opcjonalnego parametru, 
zwykle nazywanego "kontekstem". Pozwala to na obejście konieczności używania `bind()`, aby upewnić się, że callback
będzie używał określonego `this`.
```markdown
function foo(el) {
  console.log(el, this.id);
}

var obj = {
  id: "awesome",
};

// użyj 'obj' jako 'this' dla wywołań 'foo()'
[1, 2, 3].forEach(foo, obj); // 1 awesome 2 awesome 3 awesome
```

#####Wiązanie `new`

Ostatnia, czwarta zasada wymaga ponownego zastanowienia się na bardzo częstym błędzie myślowym związanym z funkcjami i
obiektami w JavaScript.

W tradycyjnych zorientowanych na klasy językach, konstruktory to specjalne metody załączone do klasy, które są wywoływane
w momencie tworzenia obiektu danej klasy za pomocą słowa kluczowego `new`.
`something = new MojaKlasa(..);`
JavaScript posiada operator `new`, aczkolwiek mimo podobnej składni mamy do czynienia z inną mechaniką.

W JS konstruktory to nic innego jak zwyczajne funkcje poprzedzone operatorem new. Nie są załączone do żadnej klasy, nie
tworzą jej instancji. Nie są nawet specjalnym typem funkcji. Z tego powodu nie możemy mówić o konstruktorach, a raczej
konstrukcyjnym wywołaniu funkcji.

W momencie konstrukcyjnego wywołania funkcji dochodzi do:
+ powstania nowego obiektu
+ nowo powstały obiekt jest połączony z `[[Prototype]]`
+ nowo powstały obiekt jest ustawiony jako wiązanie `this` dla tego wywołania funkcji
+ jeżeli funkcja nie zwraca innego obiektu, dojdzie do automatycznego zwrócenia `new`'ego obiektu (taki żarcik)
```markdown
function foo(a) {
  this.a = a;
}

var bar = new foo(2);
console.log(bar.a); // 2
```
Wywołując `foo(..)` za pomocą operatora `new` skonsturowaliśmy nowy obiekt i ustawiliśmy go jako `this` dla tego wywołania `foo(..)`.
W ten sposób zaprezentowaliśmy jak tworzyć wiązanie za pomocą `new`.

####Wszystko na swoim miejscu

Znając cztery zasady tworzenia wiązań jedyne co pozostaje to odnalezienie call-site i przeanalizowanie, które z zasad
znajduje zastosowanie. W przypadku występowania kilku zasad jednocześnie odwołujemy się do kolejności pierwszeństwa.

Wiązanie domyślne posiada najniższy priorytet.

```markdown
function foo() {
  console.log(this.a);
}

var obj1 = {
  a: 2,
  foo: foo,
};

var obj2 = {
  a: 3,
  foo: foo,
};

obj1.foo(); // 2
obj2.foo(); // 3

obj1.foo.call(obj2); // 3
obj2.foo.call(obj1); // 2
```
Jak widać wiązanie jawne ma pierwszeństwo nad wiązaniem niejawnym, więc jego wystąpienie powinno być analizowane w pierwszej
kolejności.
```markdown
function foo(something) {
  this.a = something;
}

var obj1 = {
  foo: foo,
};

var obj2 = {};

obj1.foo(2);
console.log(obj1.a); // 2

obj1.foo.call(obj2, 3);
console.log(obj2.a); // 3

var bar = new obj1.foo(4);
console.log(obj1.a); // 2
console.log(bar.a); // 4
```
Wiązanie `new` ma pierwszeństwo nad wiązaniem niejawnym. Nie ma możliwości bezpośredniego porównania wiązania jawnego z 
wiązaniem `new` ponieważ nie możemy użyć tego operatora razem z `call`/`apply`. Do tego porównania użyjemy wiązania twardego.
```markdown
function foo(something) {
  this.a = something;
}

var obj1 = {};

var bar = foo.bind(obj1);
bar(2);
console.log(obj1.a); // 2

var baz = new bar(3);
console.log(obj1.a); // 2
console.log(baz.a); // 3
```
Wbrew oczekiwaniom po wywołaniu `new bar(3`) nie doszło do zmiany `obj1.a` na `3` jak możnaby się spodziewać. Zamiast tego,
doszło do nadpisania twardego wiązania `obj1` do `bar(..)` za pomocą `new`. W ten sposób zwróciliśmy nowy obiekt o nazwie `baz`,
który posiada właściwość `a` równą `3`.
