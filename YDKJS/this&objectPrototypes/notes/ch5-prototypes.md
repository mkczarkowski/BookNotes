## Rozdział V - **Prototypy**

#### `[[Prototype]]`

Obiekty w JS posiadają wewnętrzną właściwość nazwaną w specyfikacji `[[Prototype]]`, którajest po prostu referencją do innego obiektu. 
Praktycznie każdy obiekt otrzymuje non-`null`ową wartość dla tej właściwości w momencie utworzenia.
```markdown
var myObject = {
  a: 2,
};

myObject.a; // 2
```
Do czego używana jest referencja `[[Prototype]]`? W rozdziale 3 omówiliśmy sposób działania operacji `[[Get]]`, która jest
wywoływana podczas referencji do właściwości obiektu, np. `myObject.a`. Pierwszą operacją, którą wykonuje `[[Get]]` jest 
sprawdzenie czy obiekt posiada właściwość 'a', jeżeli tak - zostaje ona zwrócona.

Co się dzieje, jeżeli właściwość nie wchodzi w skład `myObject`? Tutaj do akcji wkracza `[[Prototype]]`.
`[[Get]]` podąża za łańcuchem `[[Prototype]]`, jeżeli nie może odnaleźć właściwości bezpośrednio w obiekcie.
```markdown
var anotherObject = {
  a: 2,
};

// stwórz obiekt połączony z 'anotherObject'
var myObject = Object.create(anotherObject);

myObject.a; // 2
```
Działanie `Object.create(..)` zostanie dokładniej opisane później, póki co załóżmy, że tworzy obiekt z połączeniem `[[Prototype]]`
do wybranego obiektu. Stworzyliśmy `myObject` połączony `[[Prototype]]` z `anotherObject`. Ma się rozumieć, że `myObject.a`
nie istnieje, a mimo to dostęp do właściwości kończy się sukcesem i zostaje zwrócona wartość `2`.
 
Jednakże, gdyby `a` nie zostało odnalezione w `anotherObject` jego łańcuch `[[Prototype]]` zostałby poddany dalszej konsultacji
w celu odszukania właściwości.

Ten proces trwa dopóki dopóki nazwa właściwości zostanie odnaleziona lub łańcuch `[[Prototype]]` zakończy się. Jeżeli właściwość
nie zostanie odnaleziona rezultatem `[[Get]]` będzie `undefined`.

##### `Object.prototype`

Gdzie tak właściwie kończy się łańcuch `[[Prototype]]`?

Górną granicą każdego zwykłego łańcucha `[[Prototype]]` jest wbudowany `Object.prototype`. Ten obiekt zawiera wiele 
powszechnych funkcjonalności używanych w JS, ponieważ wszystkie wbudowane obiekty JS 'pochodzą' od `Object.prototype`.

Do wyżej wymienionych funkcjonalności należą między innymi `.toString()` lub `.valueOf()`. W rozdziale 3, przedstawiliśmy
inne takie jak: `.hasOwnProperty()`. Inną funkcją pochodzacą z `Object.prototype`, która może być Wam nieznana jest 
`isPrototypeOf(..)`. Zostanie opisana w dalszej części notatek.

##### Ustawianie i zaciemnianie właściwości

W rozdziale 3 wspomnieliśmy o tym, że ustawianie właściwości obiektu jest bardziej skomplikowane, niż samo jej dodanie
lub zmiana wartości istniejącej właściwości.  
`myObject.foo = "bar";`
Jeżeli `myObject` posiadał już normalny akcesor danych dla właściwości nazwanej `foo` to operacja przypisania ograniczy się
do zmiany wartości.

Jeżeli `foo` nie jest obecne wewnątrz `myObject`, przemierzamy łańcuch `[[Prototype]]`, jak w przypadku operacji `[[Get]]`.
Jeżeli `foo` nie zostanie odnalezione wewnątrz łańcucha zostanie bezpośrednio dodane do `myObject` wraz z przypisaną wartością.

Jeśli `foo` jest obecne gdzieś wyżej w łańcuchu, zniuansowane (i poniekąd zaskakujące) działanie będzie towarzyszyło 
wyrażeniu `myObject.foo = "bar"`. 

Jeśli `foo` istnieje zarówno w `myObject` jak i na wyższym poziomie łańcucha `[[Prototype]]`, który zaczyna się na `myObject`
mamy do czynienia z cieniowaniem. Właściwość `foo` bezpośrednio w `myObject` cienuje każdą właściwość `foo`, która znajduje
się wyżej w łańcuchu. 

Przeanalizujemy teraz trzy scenariusze przypisania `myObject.foo = "bar"` gdy `foo` nie jest obecne wewnątrz `myObject` ale
zostaje odnalezione wyżej w łańcuchu `[[Prototype]]`:

1. Jeżeli zwyczajny akcesor danych właściwości nazwanej `foo` jest odnaleziony gdziekolwiek wyżej w łańcuchu `[[Prototype]]`
i nie jest odznaczony jako read-only (`writable:false`), nowa właściwość `foo` jest dodana wprost do `myObject`, skutkując
zacieniowaniem właściwości.
2. Jeżeli `foo` jest odnaleziona wyżej w łańcuchu `[[Prototype]]` i jest odznaczona jako read-only (`writable: false`) to
zarówno ustawienie istniejącej właściwości jak i stworzenie nowej jest niemożliwe. Jeżeli kod jest wykonywany w `strict mode`,
silnik wyrzuci błąd. Jeżeli nie, dojdzie do cichego zignorowania operacji przypisania. 
3. Jeżeli `foo` jest odnalezione wyżej w łańcuchu `[[Prototype]]` i jest setterem to zawsze dojdzie do wywołania settera.
`foo` nie zostanie dodane do `myObject`, ani nie dojdzie do redefiniowania settera `foo`.

Jeżeli zależy nam na cieniowaniu w #2 i #3 scenariuszu operator przypisania `=` nie wystarczy, 
należy wykorzystać `Object.defineProperty()`. 

Warto zauważyć: Najbardziej zaskakującym scenariuszem jest niewątpliwie #2, akcesor dostępu na wyższym poziomie łańcucha
`[[Prototype]]` skutecznie blokuje możliwość zaciemniania na niższych poziomach. Wynika to z próby imitiowania zachowania klas,
młodsza klasa otrzymuje "kopię" właściwości wraz z stanem akcesorów. Jednakże w rzeczywistości nie dochodzi do tego kopiowania,
więc takie zachowanie może się wydawać nienaturalne. Kolejnym źródłem nieścisłości jest to, że zablokowany jest operator przypisania 
podczas, gdy metoda `Object.defineProperty(..)` pozwala na skuteczne cieniowanie.

Cieniowanie za pomocą metod często prowadzi do brzydkiej formy jawnego pseudo-polimorfizmu, jeżeli dochodzi do konieczności 
delegowania pomiędzy nimi. Nasz kod staje się przez to bardziej skomplikowany przy małej liczbie korzyści.
 ```markdown
var anotherObject = {
  a: 2,
}

var myObject = Object.create(anotherObject);

anotherObject.a; // 2
myObject.a; // 2

anotherObject.hasOwnProperty("a"); // true
myObject.hasOwnProperty("a"); // false

myObject.a++; // niejawne cieniowanie!

anotherObject.a; //2
myObject.a; // 3

myObject.hasOwnProperty("a"); // true
```
Mogłoby się wydawać, że `myObject.a++` powinno wyszukać i inkrementować właściwość `anotherObject.a`, jednakże operacja `++`
sprowadza się do `myObject.a = myObject.a + 1`. Rezultatem jest operacja `[[Get]]` pobierająca wartość właściwości `a`
za pomocą łańcucha `[[Prototype]]` z `anotherObject.a`, następnie dochodzi do inkrementacji o jeden i operacja `[[Put]]`
przypisuje wartość `3` do nowej, zacieniowanej właściwości `a` w `myObject`.

#### "Klasa"

Po co jednemu obiekt połączenie z drugim obiektem? Jakie są tego zalety? Rozważymy pierw czym NIE jest łańcuch `[[Prototype]]`, 
aby odpowiedzieć na te pytania.

JS nie posiada abstrakcyjnych wzorców dla obiektów nazywanych klasami, które występują w językach zorientowanych na klasy.
JS posiada tylko obiekty.

##### Funkcje "klasowe"

Przez długi okres czasu istniała bezwstydna praktyka, której nadużywano przez lata, aby imitować działanie klas.

Funkcje domyślnie otrzymują publiczną, niepoliczalną właściwość o nazwie `prototype`, która wskazuje na dowolny obiekt.
```markdown
function Foo() {
  // ...
}

Foo.prototype; // {}
```
Ten obiekt często otrzymuje miano "prototypu Foo", ponieważ uzyskujemy do niego dostęp za pomocą 
referencji z właściwości `Foo.prototype`. Na ten obiekt będzie wskazywał `[[Prototype]]` każdego obiektu utworzonego
za pomocą `new Foo()`.
```markdown
function Foo() {
  // ...
}

var a = new Foo();

Object.getPrototypeOf(a) === Foo.prototype; // true
```
Obrazuje to różnicę pomiędzy klasami, a prototypami. W przypadku klas każda instancją jest kopią utworzoną na bazie projektu
zawartego w klasie, podczas gdy prototypy zapewniają połączenie pomiędzy obiektami nie kopiując bezpośrednio ich zawartości.

`new Foo()` tworzy nowy obiekt i tenże obiekt `a` jest wewnętrznie połączony za pomocą `[[Prototype]]` z obiektem `Foo.prototype`.
Efektem końcowym są dwa obiekty połączone ze sobą. Nie powstała żadna instancja, nie doszło do kopiowania zachowań
z klasy do obiektu. Jedynym skutkiem operacji jest powstałe **POŁĄCZENIE**.

Funkcja `new Foo()` nie ma bezpośredniego związku z utworzeniem tego połączenia, jest to jej skutek uboczny. Aby stworzyć
połączenie prototypowe w bardziej bezpośredni sposób używamy metody `Object.create(..)`.

**Co jest w nazwie?**

Mechanizm działania `[[Prototype]]` polegający na tworzeniu połączeń między obiektami nazywany jest "dziedziczeniem prototypowym".
Taka nazwa przynosi wiele szkód z powodu nieścisłości jakie powstają chcąc przyrównać ze sobą dwa odmienne procesy: 
dziedziczenie znane z klas i połączenia prototypowe. "Dziedziczenie" implikuje powstawanie kopii, co nie zachodzi w JS.
W przypadku połączeń obiektów w JS mamy raczej do czynienia z "delegowaniem".

##### "Konstruktory"

```markdown
function Foo() {
  // ...
}

var a = new Foo();
```
Co karze nam sądzić, że `Foo` jest klasą?

Po pierwsze, użyte zostało słowo kluczowe `new`, które w językach zorientowanych na klasy służą do konstruowania instancji klas.
Po drugie, wygląda na to, że wywołaliśmy konstruktor, ponieważ `Foo()` jest zadeklarowaną metodą, dokładnie jak w przypadku
normalnych klas.
```markdown
function Foo() {
  // ...
}

Foo.prototype.constructor = Foo; // true

var a = new Foo();
a.constructor === Foo(); // true
```
Obiekt `Foo.prototype` domyślnie (w pierwszej linii kodu) otrzymuje publiczną, niepoliczalną właściwość `.constructor`.
Ta właściwość jest referencją do funkcji, z którą związany jest obiekt. Ponadto, wygląda jakby obiekt `a` stworzony poprzez
wywołanie "konstruktora" `new Foo()` posiadał właściwość `.constructor`, która również wskazuje na funkcję, która go "stworzyła".

**Warto wiedzieć**: Powyższe spostrzeżenia nie są zgodne z prawdą. Obiekt `a` nie posiada właściwości `.constructor`, mimo że
`a.constructor` faktycznie wskazuje na `Foo`. "constructor" wcale nie znaczy "został skonstruowany przez".

Kolejnym znakiem wskazującym na to, że mamy do czynienia z klasą jest konwencja nazewnicza, według której funkcje nazwane
z dużej litery są klasami. Jest ona na tyle zakorzeniona w społeczności, że lintery często podkreślają użycie `new` wraz 
z metodą nazwaną z małej litery. Nie ma to **żadnego** wpływu na działanie silnika.

**Konstruktor czy wywołanie?**

Na podstawie powyższego przykładu możemy pochopnie nazwać `Foo` konstruktorem.

W rzeczywistości, `Foo` w niczym nie przypomina konstruktora bardziej, niż jakakolwiek inna funkcja. Funkcje nie są same
w sobie konstruktorami. Jednakże, gdy umieścimy `new` przed zwykłą funkcją, czyni to wywołanie funkcji "wywołaniem konstruktora".
W ten sposób funkcja zachowuje swoje dotychczasowe działanie jednocześnie tworząc nowy obiekt.
```markdown
function NothingSpecial() {
  console.log("Don't mind me!");
}

var a = new NothingSpecial();
// "Don;t mind me!"

a; // {}
```
`NothingSpecial` jest zwykłą funkcją, lecz gdy zostaje wywołana wraz z `new` konstruuje obiekt, niemal jako efekt uboczny,
który zostaje przypisany do `a`. Wywołanie było wywołaniem konstrukcyjnym, lecz `NothingSpecial` samo w sobie nie jest konstruktorem.

Tak więc, w JavaScript, najodpowiedniej nazywać "konstruktorem" jakąkolwiek funkcję wywołaną z `new`. Funkcje nie są
konstruktorami, lecz wywołanie funkcji z `new` jest wywołaniem konstrukcyjnym.

##### Mechanika

Czy wymieniliśmy już wszystkie sposoby imitowania klas w JS?

Nie do końca.
```markdown
function Foo(name) {
  this.name = name;
}

Foo.prototype.myName = function() {
  return this.name;
};

var a = new Foo("a");
var b = new Foo("b");

a.myName(); // "a"
b.myName(); // "b"
```
Powyższy przykład prezentuje dwa kolejne triki imitowania orientacji klasowej:
1. `this.name = name`: dodajemy właściwość `.name` do każdego obiektu wskazywanego przez wiązanie `this`. W podobny sposób
instancje klasy dokonują hermetyzacji danych.
2. `Foo.prototype.myName = ...`: dodajemy właściwość do obiektu `Foo.prototype`. `a.myName()` działa zgodnie z przewidywaniami.

Można by myśleć, że w momencie powstania `a` i `b` właściwości/funkcje z obiektu `Foo.prototype` są kopiowane do `a` i `b`.
Nic bardziej mylnego.

Na początku rozdziału wyjaśniliśmy połączenie `[[Prototype]]` i to jak zapewnia podkładkę dla wyszukiwania, gdy właściwość
nie zostanie odnaleziona bezpośrednio wewnątrz obiektu podczas wykonywania domyślnej operacji `[[Get]]`.

Tak więc zgodnie z sposobem utworzenia, obiekty `a` i `b` posiadają wewnętrzne `[[Prototype]]`'owe połączenie z `Foo.prototype`.
Gdy `myName` nie jest odnalezione wewnątrz `a` i `b`, zostaje wyszukane w `Foo.prototype`.

**Redux "konstruktora"**

Wróćmy do rozważań na temat właściwości `.constructor`. `a.constructor === Foo` zwraca true, więc logika wskazywałaby, że
`a` posiada właściwość `.constructor` wskazującą na `Foo`. Nic z tych rzeczy.

Referencja właściwości `.constructor` również jest wydelegowana z `Foo.prototype`, która domyślnie wskazuje na `Foo`.

Naturalnym tok rozumowania nasuwa nam wniosek, że obiekt `a` "skonstruowany" przez `Foo` posiada dostęp do właściwości 
`.constructor` wskazującej na `Foo`. To szczęśliwy wypadek, że `a.constructor` domyślnie wskazuje na `Foo` podczas delegacji
`[[Prototype]]`. Jest kilka sytuacji, w której możemy pożałowac naiwnego założenia, że `.constructor` znaczy "skonstruowany przez".

Pierwszy przypadek: właściwość `.constructor` w `Foo.prototype` domyślnie wskazuje na `Foo` po deklaracji funkcji. Jeżeli
podmienimy prototyp na inny obiekt nie dojdzie do magicznego utworzenia nowej właściwości `.constructor`.
```markdown
function Foo() { /* ... */ }

Foo.prototype = { /* ... */ }; // nowy obiekt prototypowy

var a1 = new Foo();
a1.constructor === Foo; // false
a1.constructor === Object; // true
```
`Object(..)` nie "skonstruował" `a1`, czyż nie? Wszystko wskazuje na to, że za konstrukcję odpowiada `Foo()`.
Co dzieje się naprawdę? `a1` nie posiada właściwości `.constructor`, więc deleguje łańcuchem `[[Prototype]]` do `Foo.prototype`.
Ten obiekt również nie posiada właściwości `.constructor` (domyślnie posiada ale zamieniliśmy go na pusty obiekt), więc
wykonuje dalsza delegację do `Object.prototype`. `Object` posiada właściwość `.constructor`, która wskazuje na domyślnie
wbudowaną funkcję `Object(..)`.

`.constructor` nie jest magiczną, niezmienną właściwością. Jest nie-policzalna, ale jej wartość jest writable
(może ulec zmianie), ponadto możemy ją nieświadomie dodać lub nadpisać na dowolnym poziomie łańcucha `[[Prototype]]`.
Z tych właśnie powodów nie można polegać na tej właściwości myśląc o domyślnej referencji.

#### "Dziedziczenie (prototypowe)"

```markdown
function Foo(name) {
  this.name = name;
}

Foo.prototype.myName = function() {
  return this.name;
};

function Bar(name, label) {
  Foo.call(this, name);
  this.label = label;
}
// teraz utworzoymy  nowy prototyp Bar
// będzie wskazywał na 'Foo.prototype'
Bar.prototype = Object.create(Foo.prototype);

// Uwaga! 'Bar.prototype.constructor' zniknął.

Bar.prototype.myLabel = function() {
  return this.label;
};

var a = new Bar("a", "obj a");

a.myName(); // "a"
b.myLabel(); // "obj a"
```
Najważniejszą częścią jest `Bar.prototype = Object.create(Foo.prototype)`. `Object.create` odpowiada za utworzenie nowego
obiektu i połączenia nowego obiektu łańcuchem `[[Prototype]]` z podanym jako argument obiektem.

Dosłowny wydźwięk tej operacji to: "Stwórz nowy obiekt prototypu 'Bar.prototype', który jest połączony z 'Foo.prototype'".

Po zadeklarowaniu `Bar`, jak każda funkcja, posiada połączenie `.prototype` z domyślnym obiektem. Takie połączenie nam
nie odpowiada, więc tworzymy nowy obiekt, który jest połączony z `Foo.prototype` efektywnie odrzucając stare, domyślne
rozwiązanie.

Warto wiedzieć: częstą pomyłką jest przekonanie, że poniższe rozwiązania załatwią sprawę.
```markdown
// nie działa tak jak chcemy
Bar.prototype = Foo.prototype;

// działa tak jak chcemy, ale z
// efektami ubocznymi, których nie chcemy
Bar.prototype = new Foo();
```
`Bar.prototype = Foo.prototype` nie tworzy nowego obiektu dla `Bar.prototype`, do którego mogłoby powstać połączenie.
`Bar.prototype` staje się referencją do `Foo.prototype`, co skutecznie łączy `Bar` z tym samym obiektem, z którym połączone
jest `Foo` czyli: `Foo.prototype`. Tworząc nowe właściwości, np. `Bar.prototype.myLabel = ...`, modyfikujemy współdzielony
obiekt `Foo.prototype`, co wpłynie na wszystkie obiekty z nim połączone. Takie rozwiązanie nigdy nie powinno być pożądane,
a jeżeli jest to `Bar` najprawdopodobniej w ogóle nie jest nam potrzebne.

`Bar.prototype = new Foo()` faktycznie tworzy nowy obiekt, który jest tępo połączony z `Foo.prototype`. Używane jest
"wywołane konstrukcyjne" `Foo()`. Jeżeli funkcja posiada efekty uboczne (np. logowanie, zmiana stanu etc.) to zachodzą
one w momencie tworzenia połączenia, a nie tylko podczas tworzenia "potomków" `Bar()` jak moglibyśmy sądzić.

Tak więc pozostaje nam korzystać z `Object.create(..)`, aby tworzyć nowe obiekty z poprawnym połączeniem bez narażania
się na skutki uboczne. Jedynym minusem tego rozwiązania jest konieczność tworzenia nowego obiektu i odrzucanie starego.

Fajnie byłoby gdybyśmy posiadali standardowe i niezawodne rozwiązanie pozwalajace na tworzenie połączenia z istniejącym
obiektem. Przed ES6 mogliśmy korzystać z niestandardowej i nie w pełni obsługiwanej przez przeglądarki właściwości `__proto__`.
ES6 wprowadziło metodę `Object.setPropertyOf(..)`, która wykonuje swoje zadanie w przewidywalny sposób.

Porównajmy metodę tworzenia połączenia `Bar.prototype` z `Foo.prototype` pre-ES6 i post-ES6:
```markdown
// pre-ES6
// odrzucamy domyślny, istniejący 'Bar.prototype'
Bar.prototype = Object.create(Foo.prototype);

// post-ES6
// modyfikuje istniejący 'Bar.prototype'
Object.setPrototypeOf(Bar.prototype, Foo.prototype);
```
Ignorując minimalny spadek wydajności przy użyciu `Object.create(..)` (odrzucamy obiekt, który musi podlec usuwaniu
nieużytków), jest to czytelniejsze rozwiązanie. Obydwa są poprawne.

##### Refleksje nad "klasowymi" relacjami

Co zrobić, kiedy chcemy się dowiedzieć do jakiego obiektu deleguje wybrany obiekt `a`? Badanie instancji w celu uzyskania
informacji na temat dziedziczenia jest często określane introspekcją/refleksją w tradycyjnym środowisku klasowym.
```markdown
function Foo() {
  // ...
}

Foo.prototype.blah = ...;

var a = new Foo();
```
Aby poznać przodka (połączenie delegacyjne) `a` możemy skorzystać z rozwiązania bazującego na podrabianiu klas.
`a instanceof Foo; // true`
Operator `instanceof` bierze obiekt jako lewy argument i funkcję jako prawy argument. Pytaniem, na które odpowiada 
`instanceof` jest: **czy w całym łancuchu `[[Prototype]]` obiektu `a` istnieje obiekt, który wskazuje na `Foo.prototype`**?

Z tego powodu możemy wykorzystywać tę metodę do badania "przodków" obiektu (`a`), jeżeli posiadasz funkcję (`Foo`, wraz 
z referencją `.prototype`). Jeżeli mamy dwa różne obiekty, `a` i `b` i chcemy się dowiedzieć czy te obiekty są ze sobą
spokrewnione łańcuchem `[[Prototype]]` samo `instanceof` nie pomoże.

**Warto wiedzieć**: Jeżeli skorzystamy z wbudowanej metody `.bind(..)` powstała funkcja nie będzie posiadała właściwości
`.prototype`. W takim wypadku `instanceof` może zastąpić `.prototype` funkcji, z której stworzyliśmy twardo-związaną
funkcję.
```markdown
function isRelatedTo(o1, o2) {
  function F() {
  F.prototype = o2;
  return o1 instanceof F;
}

var a = {};
var b = Object.create(a);
isRelatedTo(b, a); // true
```
Wewnątrz `isRelatedTo(..)` korzystamy z funkcji `F`, ponownie przypisujemy jej `.prototype`, aby wskazywał na obiekt `o2`,
po czym pytamy czy obiekt `o1` jest "instancją" `F`. Oczywiście `o1` nie dziedziczy, ani nie jest nawet skonstruowany
przez `F`, a jednak otrzymujemy wartość `true`.
`Foo.prototype.isPrototypeOf(a); // true`
Pytaniem, na które odpowiada `isPrototypeOf(..)` to: czy w całym łańcuchu `[[Prototype]]` obiektu `a` pojawia się `Foo.prototype`?

Dzięki temu wystarczają nam dwa obiekty, aby zbadać relacje pomiędzy nimi.
```markdown
// Czy 'b' pojawia się gdziekolwiek w
// łańcuchu [[Prototype]] 'c'?
b.isPrototypeOf(c);
```
To rozwiązanie nie wymaga od nas znajomości funkcji ("klasy"). Bezpośrednio wykorzystujemy referencje do `b` i `c` i badamy
ich relację. Aby uzyskć `[[Prototype]]` pojedynczego obiektu możemy wykorzystać metodę z ES5.
`Object.getPrototypeOf(a);`
Teraz udowodnimy, że otrzymamy oczekiwaną referencję.
`Object.getPrototypeOf(a) === Foo.prototype; // true`
Większość przeglądarek (nie wszystkie!) posiada od dawna obsługiwaną alternatywną metodę na dostęp do wewnętrznego `[[Prototype]]`.
`a.__proto__ === Foo.prototype; // true`
Przedziwna właściwość `.__proto__` (ustandaryzowana dopiero w ES6) magicznie uzyskuje dostęp do wewnętrznego `[[Prototype]]`
obiektu w formie referencji, kiedy chcemy bezpośrednio badać kolejne ogniwa łańcucha.
 
Właściwość `.__proto__`, podobnie jak `.constructor` nie istnieje wewnątrz badanego przez nas obiektu (`a`). Jest niepoliczalną
właściwością wbudowanego `Object.prototype`, wraz z pozostałymi metodami (`.toString()`, `.isPrototypeOf()`, etc.).

`.__proto__` wygląda jak właściwość ale można go postrzegać bardziej jako getter/setter. Jego implementacje można by przedstawić
w następujący sposób:
```markdown
Object.defineProperty(Object.prototype, "__proto__", {
  get: function() {
    return Object.getPrototypeOf(this);
  },
  set: function(o) {
    Object.setPrototypeOf(this, o);
    return o;
  }
} );
```
Kiedy pobieramy wartość `a.__proto__` to robimy coś na wzór `a.__proto__()` (wywołujemy gettera). To wywołanie funkcji
posiada wiązanie `this` wskazujace na `a` mimo, że getter istnieje wewnątrz `Object.prototype`. Działa dokładnie jak
wywołanie `Object.getPrototypeOf(a)`.

`.__proto__` może ulec nadpisaniu, podobnie jak w przypadku użycia `Object.setPrototypeOf(..)`. Jednakże, na ogół
nie powinno się zmieniać `[[Prototype]]` istniejącego obiektu. Jedynym wyjątkiem od tej reguły jest zmiana domyślnego
`.prototype`, aby wskazywał na coś innego, niż `Object.prototype`. W innych przypadkach lepiej traktować `[[Prototype]]`
jako cechę "tylko do odczytu".

Warto wiedzieć: podwójna twarda spacja w społeczności JS nazywana jest "dunder'. Stąd `__proto__` często określane jest 
mianem "dunder proto".

#### Połączenia obiektów

Jak udowodniliśmy, mechanizm `[[Prototype]]` to wewnętrzne połączenie pomiędzy jednym obiektem, a drugim.

To połączenie jest przede wszystkim wykorzystywane, gdy referencja do właściwości/metody nie została odnaleziona w pierwszym
obiekcie. W takim wypadku połączenie `[[Prototype]]` wskazuje silnikowi gdzie kontynuować poszukiwania - tym właśnie jest
"łańcuch prototypu".

##### `Create()`ing Links

Wcześniej wspominaliśmy, że `Object.create(..)` powinien być naszym ulubieńcem w kontakcie z prototypami, teraz udowodnimy
dlaczego.
```markdown
var foo = {
  something: function() {
    console.log("Tell me something good...");
  }
};

var bar = Object.create(foo);

bar.something(); // Tell me something good...
```
`Object.create(..)` tworzy nowy obiekt (`bar`) połączony z wskazanym obiektem (`foo`), uzyskując wszystkie plusy delegacji
mechanizmu `[[Prototype]]` nie wdając się w skomplikowane aspekty funkcji `new` wywoływanych jako konstruktory, wraz z
całym zamieszaniem związanym z `.prototype` i `.constructor`.

**Warto wiedzieć**: `Object.create(null)` tworzy obiekt, który posiada puste połączenie `[[Prototype]]`. Nie dochodzi do
żadnych delegacji. W takim wypadku nie działa operator `instanceof` (nie ma na co wskazać), zawsze zwróci `false`. Obiekty
utworzone w ten sposób najczęściej spełniają zadanie słowników, kontenerów na dane pozbawione nieoczekiwanych efektów ubocznych
spowodowanych delegacją właściwości/funkcji przez łańcuch `[[Prototype]]`.

**Polyfill dla `Object.create()`**

`Object.create(..)` zostało dodane w ES5. Jeżeli potrzebna byłaby obsługa tej metody w środowisko pre-ES5 moglibyśmy wykorzystać
częściowy polyfill.
```markdown
if (!Object.create) {
    Object.create = function(o) {
      function F(){}
        F.prototype = o;
        return new F();
    };
}
```
W tym polyfillu korzystamy z odrzucanej funkcji `F`, której prototyp jest nadpisywany wybranym przez nas obiektem. 
Następnie używamy `new F()`, aby stworzyć obiekt z pożądanym połączeniem.

Teraz przyjrzymy się części `Object.create()`, której nie byliśmy w stanie polyfillować.
```markdown
var anotherObject = {
  a: 2,
}

var myObject = Object.create(anotherObject, {
  b: {
    enumerable: false,
    writable: true,
    configurable: false,
    value: 3,
  },
  c: {
    enumerable: true,
    writable: false,
    configurable: false,
    value 4,
  }
});

myObject.hasOwnProperty("a"); // false
myObject.hasOwnProperty("b"); // true
myObject.hasOwnProperty("c"); // true

myObject.a; // 2
myObject.b; // 3
myObject.c; // 4
```
Jako drugi argument metody `Object.create(..)` możemy przekazać nazwę właściwości wraz z jej deskryptorem. Deskryptory
zostały wprowadzone w ES5, stąd nie mamy możliwości polyfillowania tej części metody.

##### Połączenia jako plan awaryjny?

Mogłoby się wydawać, że głównym zadaniem `[[Prototype]]` jest stanowienie pewnego zabezpieczenia w przypadku "brakujących"
właściwości.
```markdown
var anotherObject = {
  cool: function() {
    console.log("cool!");
  }
};

var myObject = Object.create(anotherObject);

myObject.cool(); // "cool!"
```
Ten kod zadziała dzięki `[[Prototype]]`, ale jeżeli kod napisanoby z myślą o tym, żeby `anotherObject` stanowił zabezpieczenie
na wypadek, gdyby z jakiegoś nieznanego powodu `myObject` nie poradził sobie z jakąś metodą/własciwością to można śmiało 
przypuszczać, że Twój kod zmierza w złym kierunku.

Zdarzają się sytuacje, w której stosowanie `[[Prototype]]` jako zabezpieczenia ma sens, ale są to sytuacje rzadkie i specyficzne.

**Warto wiedzieć**: W ES6 wprowadzono nową funkcjonalność `Proxy`, która obsługuje sytuację typu 'nie odnaleziono metody'.

Aby uniknąć niezrozumiałego wykorzystania `[[Prototype]]` zaprezentowanego w powyższym przykładzie możemy pójśc w innym kierunku.
```markdown
var anotherObject = {
  cool: function() {
    console.log('cool!');
  }
};

var myObject = Object.create(anotherObject);

myObject.doCool = function() {
  this.cool(); // wewnętrzna delegacja
};

myObject.doCool(); // 'cool!'
```
Tutaj wywołujemy metodę `.doCool()` faktycznie istniejącą wewnątrz `myObject`, tworząc nasze API bardziej zrozumiałym.
Wewnętrznie nasza metoda wykorzystuje tę samą delegację co poprzedni przykład.

#### Podsumowanie

Kiedy dochodzi do próby uzyskania dostępu do właściwości, która nie istnieje wewnątrz obiektu wewnętrzne połączenie `[[Prototype]]`
decyduje gdzie operacja `[[Get]]` powinna kontynuować poszukiwania. Kaskadowe połączenie pomiędzy obiektami definiuje 
łańcuch prototypu (o działaniu podobnym do zagnieżdżonych zakresów), w którym poszukiwana będzie właściwość.

Każdy normalny obiekt posiada wbudowany `Object.prototype` na szczycie swojego łańcucha prototypu (podobnie jak zakres
globalny w wyszukiwaniu leksykalnym), tam zatrzyma się silnik w poszukiwaniu nieodnalezionej wcześniej właściwości. 
Metody `.toString()`, `.valueOf()` oraz inne często używane funkcjonalności istnieją w obiekcie `Object.prototype`. W ten
sposób mają do nich dostęp wszystkie obiekty w języku.

Są dwa sposoby na połączenie ze sobą obiektów: pierwsze wymaga słowa kluczowego `new` wraz z wywołaniem funkcji, które 
jako jeden z efektów ubocznych prowadzi do powstania nowego obiektu połączonego z innym obiektem.

Tenże nowy obiekt jest obiektem wskazanym przez właściwość `.prototype` funkcji, która została wywołana. Funkcje wywoływane
z użyciemm `new` są często nazywane 'konstruktorami', mimo że tak naprawdę nie inicjalizują klasy jak w tradycyjnych językach
zorientowanych na klasy.

W JS nie mamy do czynienia z prawdziwym dziedziczeniem ponieważ nie dochodzi do powstawania kopii. Obiekty są ze sobą łączone
za pomocą łańcucha `[[Prototype]]`. Stąd stwierdzenie delegacja jest dużo bardziej odpowiednie, niż 'dziedziczenie'.