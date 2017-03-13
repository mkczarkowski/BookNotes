##**Rozdział III - Obiekty**

####Składnia

Obiekt można utworzyć za pomocą deklaracji lub konstruktora.

Forma dosłowna (deklaracja):
```markdown
var myObj = {
  key: value
}
```
Konstruktor:
```markdown
var myObj = new Object();
myObj.key = value;
```
Obydwie formy prowadzą do tego samego rezultatu. Druga zmusza nas do pojedynczego dodawania właściwości przez co 
nie występuje w praktyce.

####Typ

Istnieje sześć podstawowych typów wbudowanych w JS:

+ `string`
+ `number`
+ `boolean`
+ `null`
+ `undefined`
+ `object`

Pamiętajmy, że proste tyt prymitywne (`string`, `number`, `boolean`, `null` oraz `undefined`) nie są same w sobie `object`.
`null` czasami jest mylony z obiektem z powodu buga metody `typeof null` zwracającej stringa `"object"`. W rzeczywistości
null jest typem prymitywnym.

Istnieje błędne przekonanie, że wszystko w JS jest obiektem. Nieprawda.

Jednak istnieje kilka podtypów obiektów, któe możemy nazywać złożonymi prymitywami. `function` jest podtypem obiektu
(wywoływalny obiekt). Funkcje są w JS obiektami 'pierwszej klasy', co oznacza, że są traktowane jak zwykłe obiekty. Kolejnym
podtypem obiektu są tablice.

#####Obiekty wbudowane

W skład listy obiektów wbudowanych wchodzi kilka pozycji, których nazwy wskazują na bezpośredni związek z typami prymitywnymi,
jednak ta relacja jest dużo bardziej skomplikowana.

+ `String`
+ `Number`
+ `Boolean`
+ `Object`
+ `Function`
+ `Array`
+ `Date`
+ `RegExp`
+ `Error`

Te obiekty przypominają w swoich cechach typy, a nawet klasy z innych języków (np. Java).

Jednak w JS są to tylko wbudowane funkcje. Każda z tych wbudowanych funkcji może być użyta jako konstruktor.
```markdown
var strPrimitive = "I am a string";
typeof strPrimitive; // "string"
strPrimitive instanceof String; // false

var strObject = new String("I am a string");
typeof strObject; // "object"
strObject instanceof String; // true

Object.prototype.toString.call(strObject); // [object String]
```
Wartość prymitywna `"I am a string"` nie jest obiektem, jest prymitywną wartością dosłowną i niezmienną. Aby wykonać na niej operacje,
takie jak sprawdzenie długości, pobranie pojedynczych znaków, itd, potrzebujemy obiektu `String`. Na szczęście silnik
dokonuje automatycznej koercji prymitywnego `"string"` do obiektu `String`, gdy zachodzi taka potrzeba. Dzięki temu praktycznie
nigdy nie musimy jawnie tworzyć obiektu.
```markdown
var strPrimitive = "I am a string";

console.log(strPrimitive.length); // 13
console.log(strPrimitive.charAt(3)); // "m"
```
W obydwóch przypadkach wywołujemy metodę/właściwość na prymitywnym stringu, a silnik dokonuje automatycznej koercji. Taka sama
mechanika znajduje zastosowanie w przypadku `Number`, `Boolean` i ich prymitywnych odpowiedników.

`null` oraz `undefined` nie posiadają opakowujących obiektów, istnieją jedynie jako wartości prymitywne. Za to `Date` może zostać
stworzone jedynie za pomocą konstruktora i nie posiada prymitywnego odpowiednika.

####Zawartość

Jak wszyscy wiedzą obiekt składa się z wartości przechowywanych w specjalnych lokalizacjach nazywanych właściwościami.
Oczywiście to tylko abstrakcyjna konstrukcja, to gdzie przechowywane są same wartości zależy od implementacji silnika - 
nazwy właściwości zawierają referencje do komórek pamięci przechowujących wartości, które mogą być rozproszone.
```markdown
var myObject = {
  a: 2,
};

myObject.a; // 2
myObject["a"];
```
Aby uzyskać dostęp do wartości o lokalizacji `a` w `myObject` możemy skorzystać z operatora `.` lub operatora `[ ]`.
Składnia `.a` jest zwykle określana jako dostęp za pomocą właściwości, podczas gdy składnia `["a"]` to tak zwany dostęp za pomocą
klucza. Obydwa sposoby dają dostęp do tej samej lokalizacji przez co otrzymujemy tę samą wartość, `2`.

Zasadnicza różnica pomiędzy tymi operatorami dostępu polega na tym, że operator `.` wymaga nazwy właściwości zgodnej z 
`Identifier`, podczas gdy składnia `[".."]` przyjmuje jakiegokolwiek stringa kompatybilnego z UTF-8/unicode. Aby uzyskać
dostęp do wartości przechowywanej w lokalizacji, do której referencję posiada właściwość "Super-Fun!" musimy skorzystać
z składni: `["Super-Fun!"]`, ponieważ taka nazwa nie jest zgodna z `Identifier`.

W notacji `[..]` korzystamy ze stringów aby określić lokalizację co daje nam możliwość wygenerowania wartości
tych stringów w czasie wykonywania programu.
```markdown
var wantA = true;
var myObject = {
  a: 2,
};

var idx;

if (wantA) {
  idx = "a"
}

// później

console.log(myObject[idx]); // 2
```
W obiektach nazwy właściwości **ZAWSZE** są stringami. Jeżeli użyjesz innej wartości prymitywnej zostanie ona przekonwertowana
do stringa. Tyczy się to również `number`, które są najczęściej używane jako indeksy w tablicach, więc należy rozrózniać
ich zachowanie pomiędzy obiektami, a tablicami.
```markdown
var myObject = { };

myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";

myObject["true"]; // "foo"
myObject["3]; // "bar"
myObject["[object Object]"]; // baz
```
#####Wyliczone nazwy właściwości

Notacja dostępu z użyciem `[..]` jest użyteczna, gdy chcemy skorzystać z wartości wyrażenia wyliczonego podczas wykonywania
kodu. W ES6 umożliwiono wykonywanie działań na stringach podczas dosłownej formy deklarowania obiektu.
```markdown
var prefix = "foo";

var myObject = {
  [prefix + "bar"]: "hello",
  [prefix + "baz"]: "world",
};

myObject["foobar"]; // hello
myObject["foobaz"]; // world
```
Wyliczone nazwy właściwości najprawdopodobniej będą używane w połączeniu z `Symbol`ami, czyli nowym prymitywnym typem
danych wprowadzonym w ES6. `Symbol` trochę przypomina stringa ale każda jego instancja jest unikatowa. Dzięki temu uzyskujemy
większe bezpieczeństwo w kwestii uzyskiwania dostępu do zawartości obiektu.
```markdown
const MY_KEY = Symbol();
let obj = {
  [MY_KEY]: 123
};
console.log(obj[MY_KEY]); // 123
console.log(obj["MY_KEY"]); // undefined
```

#####Właściwość vs. metoda

W wielu językach programowania zachodzi podział nazewnictwa właściwości ze względu na jej wartość. Jeżeli jest nią funkcja
to mówimy o metodzie. Stąd mówi się o dostępie do metody i dostępie do właściwości. Specyfikacja JS również wyróżnia takie nazewnictwo.

Jednakże biorąc pod uwagę mechanikę wiązania `this`, które CZASAMI wskazuje na referencję do obiektu wywołującego w call-site.
Takie działanie `this` nie czyni funkcji, do której referencja przechowywana jest w obiekcie "metodą" w większym stopniu, niż jakiejkolwiek innej.
Wiązanie `this` powstaje dynamicznie, podczas wykonywania kodu w oparciu o call-site, więc jego relacja z obiektem jest pośrednia.

Za każym razem, gdy uzyskujemy dostęp do właściwości jest to dostęp w oparciu o właściwość - niezależnie od wartości, która
zostanie nam zwrócona. Nie ma niczego nadzwyczajnego (poza niejawnym wiązaniem `this` opisanym w rodziale 2) w funkcji zwróconej
w oparciu o dostęp do właściwości.
```markdown
function foo() {
  console.log("foo");
}

var someFoo = foo;

var myObject = {
  someFoo: foo,
};

foo; // function foo() {..}
someFoo; // function foo() {..}
myObject.someFoo // function foo() {..}
```
someFoo oraz myObject.someFoo to dwie oddzielne referencje do tej samej funkcji, żadne z nich nie implikuje stosunku posiadania
samej funkcji w swoim wnętrzu. Jeżeli `foo()` wykorzystywałoby wiązanie this, przy wywołaniu `myObject.someFoo()` doszłoby do 
powstania wiązania niejawnego.

W związku z tym pojęć funkcja i metoda można śmiało używać zamiennie w JS.

**Warto wiedzieć**: ES6 wprowadziło referencję `super`, używaną zwykle razem z `class`. W ten sposób tworzy się statyczne wiązanie,
zapewniające silniejszy związek pomiędzy wiązaną funkcją, a klasą dzięki czemu można mówić o "metodzie".

Nawet gdy stworzymy wyrażenie funkcyjne wewnątrz obiektu nie zwiększa to stopnia powiązania samej funkcji z obiektem
zawierającym. Cały czas mamy do czynienia ze zwykłą referencją.
```markdown
var myObject = {
  foo: function foo() {
    console.log("foo");
  }
};

var someFoo = myObject.foo;

someFoo; // function foo() {..}
myObject.foo // function foo() {..}
```

#####Tablice

Tablice korzystają z notacji `[]`. Posiadają one bardziej rozbudowaną strukturę organizacyjną związaną z przechowywaniem
danych (pozostawiając swobodę co do przechowywanych wartości). Tablice działają w oparciu o numeracyjne indeksowanie lokalizacji, 
w której przechowywane są wartości. Indeksy są nieujemnymi integerami.
```markdown
var myArray = ["foo", 42, "bar"];

myArray.length; // 3

myArray[0]; // "foo"

myArray[2]; // "bar"
```
Tablice są obiektami, więc mimo tego, że indeksy mają postać nieujemych intów to możemy dodawać do nich właściwości.
```markdown
var myArray = ["foo", 42, "bar"];

myArray.baz = "baz";

myArray.length; // 3

myArray.baz; // "baz"
```
Warto wiedzieć, że dodanie właściwości nie skutkuje zmianą wartości zwracanej przez `length`.

Tablice są zoptymalizowane do działania w oparciu o indeksy, podobnie jak obiekty w oparciu o pary klucz/wartość - nie warto
stosować ich zamiennie.

#####Duplikowanie obiektów

Nowi developerzy często proszą o wprowadzenie feature'a pozwalającego na kopiowanie obiektu.
```markdown
function anotherFunction() { /*..*/ }

var anotherObject = {
  c: true
};

var anotherArray = [];

var myObject = {
  a: 2,
  b: anotherObject, // referencja, a nie kopia!
  c: anotherArray, // kolejna referencja
  d: anotherFunction
};

anotherArray.push(anotherObject, myObject);
```
Pierw zastanówmy się nad tym jaka powinna być to kopia - płytka czy głęboka? Płytka kopia skutkowałaby powstaniem nowego `a`,
z przekopiowaną wartością `2`, lecz `b`, `c` i `d` byłyby referencjami do tych samych miejsc co w pierwowzorze. Głęboka kopia
musiałaby utworzyć nowy egzamplarz `myObject`, `anotherObject` i `anotherArray`. Jednak `anotherArray` posiada referencję do `anotherObject` i
`myObject`, więc one również musiałyby zostać zduplikowane. Nietrudno domyślić się, że wynikiem takiego rozwiązania byłoby 
nieskończone koło referencji.

Każdy framework znalazł swój sposób na wybrnięcie z tego problemu. Póki co jedynym bezpiecznym rozwiązaniem w oparciu o
standard JS dotyczy tylko obiektów, które mogą być przekształcone w JSON'owe stringi i na powrót przetworzone na obiekty
o takich samych właściwościach i wartościach. 
`var newObj = JSON.parse(JSON.stringify(someObj));`

Jako, że płytkie kopiowanie nastręcza mniej problemów w ES6 wprowadzono Object.assing(..). Jako pierwszy parametr przyjmuje
obiekt będący celem operacji kopiowania, a kolejne są źródłem kopiowanych właściwości. Metoda iteruje po wszystkich policzalnych 
właściwościach obiektu źródłowego i kopiuje je za pomocą operatora przypisania `=` do obiektu będącego celem.
```markdown
var newObj = Object.assign({}, myObject);

newObj.a; // 2
newObj.b === anotherObject; // true
newObj.c === anotherArray; // true
newObj.d === anotherFunction // true
```
Jako, że niejawnie korzystamy z operatora przypisania `=`, więc specjalne cechy właściwości
(takie jak `writable`) z obiektu źródłowego nie zostają zachowane w nowym obiekcie. Funkcjonalność zachowania tych cech
posiada metoda `Object.defineProperty(..)`.

#####Deskryptor właściwości

Przed ES5 język JS nie zapewniał żadnych możliwości inspekcji cech właściwości, takich jak np. read-only.

Od wprowadzenia ES5 do opisywania tych cech służą deskryptory właściwości.
```markdown
var myObject = {
  a: 2,
}
Object.getOwnPropertyDescriptor(myObject, "a");
// {
//   value: 2,
//   writable: true,
//   enumarable: true,
//   configurable: true
// }
```
Jak widać deskryptor właściwości dla `a` zawiera więcej danych, niż zaledwie jej wartość równą `2`. Pozostałe trzy cechy to:
`writable` (zapisywalność), `enumerable` (policzalność) oraz `configurable` (konfigurowalność).

Domyślnie wszystkie cechy właściwości są ustawione na `true`. Jeżeli chcemy wpłynąć na ich stan możemy utworzyć/edytować
właściwość za pomocą `Object.defineProperty(..)`.
```markdown
var myObject = {};

Object.defineProperty(myObject, "a", {
  value: 2,
  writable: true,
  configurable: true,
  enumarable: true,
});
```
Za pomocą `defineProperty(..)` dodaliśmy właściwość `a` do `myObject` w manualny, jawny sposób. Dodawanie właściwości
w ten sposób nie ma większego sensu, jeżeli nie zależy nam na zmianie domyślnego stanu cech.

**Writable**

Decyduje o możliwości zmiany wartości właściwości.
```markdown
var myObject = {};

Object.defineProperty(myObject, "a", {
  value: 2,
  writable: false, // niezapisywalna!
  configurable: true,
  enumerable: true
});

myObject.a = 3;

myObject.a; // 2
```
Jak widać operacja zmiany wartości nie powiodła się. Będąc w strict-mode zostałby wyrzucony `TypeError`.

**Configurable**

Dopóki właściwość jest konfigurowalna, możemy modyfikować deskryptor za pomocą `defineProperty(..)`.
```markdown
var myObject = {
  a: 2,
};

myObject.a = 3;
myObject.a; // 3

Object.defineProperty(myObject, "a", {
  value: 4,
  writable: true,
  configurable: false, // niekonfigurowalna!
  enumerable: true,
});

myObject.a; // 4
myObject.a = 5;
myObject.a // 5

Object.defineProperty(myObject, "a", {
  value: 6,
  writable: true,
  configurable: true,
  enumerable: true,
}); // TypeError
```
Niezależnie od stanu `strict mode` operacja modyfikacji niekonfigurowalnej właściwości spowoduje wyrzucenie `TypError`. 
Jak widać zmiana `configurable` na `false` jest nieodwracalna w skutkach, więc trzeba uważać.

Warto wiedzieć: nawet gdy `configurable` jest ustawione na `false` nadal możemy zmienić stan `writable` z `true` na `false`
(nie ma takiej możliwości przy odwrotnej operacji - `false` na `true`).

Ustawienie `configurable` na `false` zapobiega możliwości usunięcia właściwości za pomocą operatora `delete`.
```markdown
myObject.a; // 2
delete myObject.a;
myObject.a; // 2
```
`delete` jest używane do usuwania właściwości bezpośrednio z obiektu. Nie należy go traktować jako narzędzia do zwalniania
pamięci jak w C/C++.

**Enumerable**

Ta cecha decyduje o tym czy właściwość będzie widoczna podczas enumeracji takich jak np. pętla `for..in`.

#####Niezmienność (ang. _immutability_)

Czasami zależy nam na stworzeniu właściwości/obiektów, które nie mogą ulec późniejszym zmianom. ES5 daje nam kilka takich
możliwości, jednak wszystkie z nich zapewniają płytką niezmienność. Znaczy to tyle, że niezmienność będzie dotyczyła
tylko samego obiektu i jego właściwości. Jeżeli jedna z właściwości przechowuje referencję do innego obiektu pozostanie on
nietknięty.

**Stała obiektowa**

Łącząc `writable: false` oraz `configurable: false` możemy utworzyć stałą (nie można jej zmienić, ponownie zdefiniować
ani usunąć).
```markdown
var myObject = {};

Object.defineProperty(myObject, "FAVORITE_NUMBER", {
  value: 42,
  writable: false,
  configurable: false,
});
```

**Zapobieganie rozbudowie**

Jeżeli chcemy zablokować dodawanie nowych właściwości pozostawiając resztę obiektu nietkniętą korzystamy z `Object.preventExtensions(..)`.
```markdown
var myObject = {
  a: 2,
};

Object.preventExtensions(myObject);

myObject.b = 3;
myObject.b; // undefined
```
W `non-strict mode` próba utworzenia `b` stanowi ciche niepowodzenie, w `strict mode` wyrzucony zostaje `TypeError`.

**Pieczęć**

`Object.seal(..)` tworzy "zapieczentowany" obiekt, czyli najzwyczajniej wywołuje na nim `Object.preventExtensions(..)` i
ustawia deskryptor `configurable` wszystkich jego właściwości na `false`.

**Freeze**

`Object.freeze(..)` tworzy zamrożony obiekt, czyli wywołuje na nim `Object.seal(..)` i ponadto ustawia deskryptor `writable`
na `false`. To rozwiązanie zapewnia najwyższy stopień niezmienności jaki możemy uzyskać dla obiektu. 

#####**`[[Get]]`**

Warto zastanowić się nad szczegółami procesu uzyskiwania dostępu do właściwości.
```markdown
var myObject = {
  a: 2,
};

myObject.a; // 2
```
myObject.a to dostęp do właściwości, ale nie polega na przeszukaniu `myObject` i odnalezieniu właściwości o nazwie `a`.
Zgodnie z specyfikacją dochodzi do wykonania operacji `[[Get]]`. Składa się z dwóch części: przeszukania obiektu i działania
związanego z rezultatem tych poszukiwań. Jeżeli właściwość została odnaleziona to zostaje zwrócona jej wartość, jeżeli nie
to jest przeszukiwany łańcuch `[[Prototype]]`. Jeżeli ta operacja również skutkuje niepowodzeniem zwrócone zostaje `undefined`.

Ten mechanizm nie obowiazuje w przypadku wyszukiwania zmiennych w oparciu o ich identyfikator. Jeżeli zmienna nie istnieje
w zakresie leksykalnym to dochodzi do wyrzucenia `ReferenceError`.
```markdown
var myObject = {
  a: undefined
};

myObject.a; // undefined
myObject.b; // undefined
```
Z punktu widzenia zwróconej wartości dwie powyższe operacje są identyczne - otrzymujemy `undefined`. Jednakże `[[Get]]` wykonało
większą ilość operacji w przypadku `myObject.b`, niż `myObject.a`. Skupiając się jedynie na zwróconej wartości nie jesteśmy
w stanie odróżnić czy właściwość posiadała jawnie przypisaną wartość `undefined` czy nie została w ogóle odnaleziona w obiekcie.

#####**`[[Put]]`**

Mechanika `[[Put]]` jest zależna od wielu czynników, przede wszystkim od tego czy właściwość istnieje już w obiekcie.

Jeżeli właściwość istnieje w obiekcie, algorytm `[[Put]]` sprawdzi czy:

+ Właściwość jest deskryptorem dostępu (Getter/Setter)? Wywołaj setter'a.
+ Właściwość jest deskryptorem danych z `writable` ustawionym na `false`? Wykonaj cichą porażkę w `non-strict mode` lub
wyrzuć `TypeError` w `strict mode`.
+ W każdym innym przypadku normalnie ustaw wartość istniejącej właściwości.

Jeżeli właściwość nie istnieje w obiekcie, mechanika [[Put]] staje się bardziej skomplikowana i zostanie opisana w rozdziale
5 dotyczącym prototypów.

#####Gettery i Settery

ES5 wprowadziło częściową możliwość nadpisywania domyślnych operacji `[[Get]]` i `[[Put]]` na poziomie samych właściwości, a 
nie całego obiektu. Służą do tego gettery i settery. Getter to właściwość, która niejawnie wywołuje funkcję zwracającą wartość.
Setter to właściwość, która niejawnie wywołuje funkcje, aby przypisać wartość.

Kiedy przypiszemy getter lub setter do właściwości jej definicja staje się `deskryptorem dostępu` zamiast `deskryptorem danych`.
Dla deskryptorów dostępu cechy `value` i `writable` sporne i ignorowane zamiast nich silnik JS bierze pod uwagę cechy `get` i `set`.
```markdown
var myObject = {
  // definicja getter dla 'a'
  get a() {
    return 2;
  }
};

Object.defineProperty(
  myObject, // cel
  "b", // nazwa właściwości
  {
    // definicja gettera dla 'b'
    get: function() { return this.a * 2 },
    
    enumerable: true
  }
);

myObject.a; // 2
myObject.b; // 4
```
Obydwa sposoby, dosłowne zdefiniowanie `get a() { .. }` oraz jawna definicja z użyciem `Object.defineProperty(..)` pozwalają
na utworzenie właściwości, która nie przechowuje wartości. Dostęp do danych jest zapewniony przez ukrytą funkcję wywoływaną
przez gettera.
```markdown
var myObject = {
  get a() {
    return 2;
  }
};

myObject.a = 3;

myObject.a; // 2
```
Skoro zdefiniowaliśmy jedynie getter dla `a`, to późniejsza próba przypisania wartości `3` do `a` skutkuje cichym niepowodzeniem.
Nawet gdyby istniał setter to zwykła operacja przypisania zostałaby zignorowana. Stąd konieczność definiowania zarówno
getterów jak i setterów, inaczej musimy się liczyć z nieoczekiwanymi/zaskokującymi zachowaniami silnika.
```markdown
var myObject = {
  // zdefiniuj getter dla 'a'
  get a() {
    return this._a_;
  },
  
  // zdefiniuj setter dla 'a'
  set a(val) {
    this._a_ = val * 2;
  }
};

myObject.a = 2;
myObject.a; // 4
```
W tym przykładzie podana wartość 2 jest przechowywana w innej zmiennej, `_a_`. Takie nazewnictwo to zwykła konwencja, nie implikuje
żadnej specjalnej mechaniki.

#####Egzystencja

Udowodniliśmy wcześniej, że dostęp do właściwości jak np. `myObject.a` może skutkować zwróceniem `undefined` zarówno w przypadku
jawnego ustawienia tej wartości, jak i gdy `a` nigdy nie zostało zdefiniowane. Aby sprawdzić, który ze scenariuszy zaistniał
w konkretnym przypadku możemy się posłużyć metodą `hasOwnProperty(..)` lub operatorem `in`.
```markdown
var myObject = {
  a: 2
};

("a" in myObject); // true
("b" in myObject); // false
myObject.hasOwnProperty("a"); // true
myObject.hasOwnProperty("b"); // false
```
Operator `in`  sprawdza czy właściwość jest w obiekcie albo wyższym poziomie łańcucha `[[Prototype]]`. Podczas gdy 
`hasOwnProperty(..)` sprawdza tylko i wyłącznie zawartość samego obiektu nie konsultując się z wyższymi poziomami łańcucha
`[[Prototype]]`. 

Metoda `hasOwnProperty(..)` jest dostępna dla każdego obiektu posiadającego delegację do `Object.prototype`. Istnieje możliwość
utworzenia obiektu, który nie posiada takiej delegacji za pomocą `Object.create(null)`. W takim wypadku wywołanie `hasOwnProperty(..)`
skutkuje wyrzuceniem `TypeError`.

Bardziej rozrosłym sposobem na wykonanie tej operacji jest `Object.prototype.hasOwnProperty.call(myObject, "a")`. Tworzymy
jawne wiązanie `this` z `myObject` i wywołujemy metodę wprost z prototypu.

Warto wiedzieć: operator in sprawdza obiekt tylko pod kątem nazwy właściwości, a nie przechowywanej wartości, więc nie można
go używać do przeszukiwania tablicy. Operacja `4 in [1, 2, 4]` zwraca `false`, podczas gdy `0 in [1, 2, 4]` zwraca `true`.

`Enumeracja`

```markdown
var myObject = { };

Object.defineProperty(
  myObject,
  "a",
  // zezwól na enumerację 'a'
  { enumerable: true, value: 2 }
);

Object.defineProperty(
  myObject,
  "b",
  // wyłącz enumerację dla 'b'
  { enumerable: false, value: 3 }
);

myObject.b; // 3
("b" in myObject); // true
myObject.hasOwnProperty("b"); // true

for (var k in myObject) {
  console.log(k, myObject[k]);
}
// "a" 2
```
Jak widać `myObject.b` istnieje jako dostępna wartość, ale nie jest drukowana z poziomu pętli `for..in` (jednak jest widoczna
dla operatora `in`). Stąd `enumerable` możemy rozumieć jako 'będzie włączone w skład iterowanych właściwości'.

Warto wiedzieć: zastosowanie pętli `for..in` na tablicy skutkuje nieoczekiwanymi rezultatami, ponieważ uzyskujemy dostęp nietylko
do indeksów ale i wszystkich pozostałych policzalnych właściwości. Stąd pętla `for..in` powinna być używana tylko dla zwykłych obiektów,
podczas gdy do innych celów należy wykorzystywać tradycyjną pętlę `for`.
```markdown
var myObject = { };

Object.defineProperty(
  myObject,
  "a",
  { enumerable: true, value: 2 }
);

Object.defineProperty(
  myObject,
  "b",
  { enumerable: false, value: 3 }
);

myObject.propertyIsEnumerable("a"); // true
myObject.propertyIsEnumerable("b"); // false

Object.keys(myObject); // ["a"]
Object.getOwnPropertyNames(myObject); // ["a", "b"]
```
Metoda `propertyIsEnumerable(..)` sprawdza czy właściwość istnieje wewnątrz obiektu oraz czy deskryptor enumerable jest ustawiony na `true`.
Metoda `Object.keys(..)` zwraca tablicę wszystkich policzalnych właściwości, podczas gdy `Object.getOwnPropertyNames(..)` zwraca 
tablicę wszystkich właściwości, policzalnych lub nie.

Póki co nie istnieje sposób na zdobycie wszystkich właściwości o mechanice analogicznej do operatora `in` (czyli włącznie
z przeszukaniem wyższych poziomów łańcucha `[[Prototype]]`).

####Iterowanie

Pętla for..in iteruje po liście nazw policzalnych właściwości (włącznie z łańcuchem `[[Prototype]]`). Co zrobić, gdy chcemy
iterować po wartościach?

W przypadku numerycznie indeksowanych tablic iteracja po wartościach jest możliwa z użyciem pętli `for`.
```markdown
var myArray = [1, 2, 3];

for (var i = 0; i < myArray.length; i++) {
  console.log(myArray[i]);
}
// 1 2 3
```
Niestety, nie jest to iteracja po wartościach per se, tylko iterowanie po indeksach w celu uzyskania referencji do wartości.

ES5 wprowadziło kilka pomocników w iterowaniu po tablicach takich jak `forEach(..)`, `every(..)` oraz `some(..)`. Każdy z tych
pomocników przyjmuje jako parametr callback wywoływany na każdym z elementów tablicy, odróżnia je reakcja na otrzymaną z callbacka
wartość. 

`forEach(..)` iteruje po wszystkich wartościach tablicy i ignoruje zwracaną przez callbacka wartość. `every(..`) iteruje dopóki
callback nie zwróci `false`/wartości falsy. `some(..)` iteruje dopóki callback nie zwróci `true`/wartości truthy.

Mechanika `every(..)` oraz `some(..)` przypomina trochę wyrażenie `break` wewnątrz normalnej pętli `for`.

**Warto wiedzieć**: w przeciwieństwie do tablic, iterując po obiekcie nie mamy gwarancji zachowania kolejności w dostępie do
właściwości. 

Jeżeli zależy nam na iteracji wprost po wartościach zamiast po indeksach tablicy możemy skorzystać z wprowadzonej w ES6 pętli `for..of`. 
Pętle można zastosować na obiektach jeżeli zdefiniujemy własny iterator.
```markdown
var myArray = [1, 2, 3];

for (var v of myArray) {
  console.log(v);
}
// 1
// 2
// 3
```
Pętla `for..of` wykonuje zapytanie do iteratora obiektu (w oparciu o wewnętrzną funkcję `@@iterator`) o następny element
do iterowania, po czym wykonuje iterację na otrzymanej wartości i ponownie wywołuje metodę `next()`.

Tablice mają wbudowany `@@iterator`, więc `for..of` działa na nich bez zarzutu. Wykonajmy manualną iterację, aby zaprezentować
mechanikę `@@iterator`.
```markdown
var myArray = [1, 2, 3];
var it = myArray[Symbol.iterator]();

it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: false }
it.next(); // { done: true }
```
Warto wiedzieć: Uzyskujemy dostęp do `@@iteratora`, wewnętrznej właściwości obiektu za pomocą `Symbol`u ES6: `Symbol.iterator`.
Takie użycie `Symbol`u zapewnia unikalność referencji do specjalnej właściwości. Nazwa może być myląca ale `@@iterator` nie jest
obiektem iteracyjnym, a funkcją która zwraca ten obiekt. 

Jak widać w powyższym przykładzie przy wywołaniu metody `next()` na iteratorze otrzymujemy wartość obecnie iterowanego elementu
w właściwości `value` oraz informację o tym czy mamy jeszcze po czym iterować w właściwości `done`.

Wartość `3` jest zwrócona z `done: false`, dopiero po czwartym wywołaniu `next()` otrzymujemy `done: true`.

Zwykłe obiekty nie posiadają wbudowanego `@@iterator`a. Wynika to z przyczyn bezpieczeństwa. Zawsze lepiej okroić implementację, jeżeli
może ona spowodować problemy w działaniu niektórych obiektów. Mamy możliwośc manualnego zdefiniowana `@@iterator`a dla naszych obiektów.
```markdown
var myObject = {
  a: 2,
  b: 3,
};

Object.defineProperty(myObject, Symbol.iterator, {
  enumerable: false,
  writable: false,
  configurable: true,
  value: function() {
    var o = this;
    var idx = 0;
    var ks = Object.keys(o);
    return {
      next: function() {
        return {
          value: o[ks[idx++]],
          done: (idx > ks.length)
        }
      }
    };
  }
});

// manualna iteracja po 'myObject'
var it = myObject[Symbol.iterator]();
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: false }
it.next(); // { value: undefined, done: true }

// iteracja po 'myObject' z użyciem pętli 'for..of'
for (var v of myObject) {
  console.log(v);
}
// 2
// 3
```
Wykorzystaliśmy `Object.defineProperty(..)` do stworzenia `@@iterator`a (głównie ze względu na możliwość ustawienia niepoliczalności),
jednocześnie stosując `Symbol` jako wyliczoną nazwę właściwości. Możnaby użyć go jawnie w nastepujący sposób:
`var myObject = { a: 2, b: 3, [Symbol.iterator]: function() { /* .. */ } }`. 

Pętla for..of daje nam wiele możliwości tworzenia własnych, bardziej skomplikowanych iteratorów dostosowanych do potrzeb
programu. Na przykład, lista obiektów `Pixel` (z wartościami kordynatów `x` oraz `y`) mogłaby korzystać z porządku iteracji
opartego o odległości od współrzędnych `(0, 0)`.

Możemy również stworzyć iteratory, które nigdy nie docierają do końca obiektu i cały czas zwracają nowe wartości (np. pseudolosowe, 
inkrementowane, unikalne identyfikatory, etc). Jednak nie należy używać takich iteratorów bez odpowiedniej pętli `for..of`,
ponieważ działałaby w nieskończoność.
```markdown
var randoms = {
  [Symbol.iterator]: function() {
    return {
      next: function() {
        return { value: Math.random() };
      }
    };
  }
};

var random_pool = [];
for (var n of randoms) {
  randoms_pool.push(n);
   
  if (randoms_pool.length === 100) break;
}
```

####Podsumowanie

Obiekty w JS mogą przyjmować formę dosłowną taką jak `var a = { .. }` oraz wartość konstruowaną taką jak `var a = new Array(..)`.

Wiele osób mylnie stwierdza, że wszystko w JS jest obiektem. Obiekty to jedna z sześciu wartości prymitywnych. Obiekty
posiadają podtypy take jak `function` czy zorientowane na konkretną mechanike `[object Array]` będące reprezentacją tablicy w JS.

Obiekty są kolekcjami par kluczy i wartości. Dostęp do właściwości uzyskiwany jest za pomocą składni `.propName` lub `["propName"]`.
Przy każdym dostępie do właściwości silnik wywołuje wewnętrzną domyślną operację `[[Get]]` (lub `[[Put]]` dla ustawiania wartości), która
nietylko przeszukuje sam obiekt ale i wyższe poziomy łańcucha `[[Prototype]]`.

Obiekty posiadają cechy, które mogą być kontrolowane za pomocą deskryptorów właściwości takich jak `writable`, `configurable`
czy `enumerable`. Mamy również możliwość ustawiania stopnia zmienności obiektu za pomocą `Object.preventExtensions(..)`, 
`Object.sale(..`) oraz `Object.freeze(..)`.

Właściwości nie muszą przechowywać wartości - moga być getterami albo setterami znanymi jako deskryptory dostępu. 

Mamy możliwość bezpośredniego iterowania po wartościach struktury danych za pomocą `for..of` wprowadzonego w ES6. 
Korzysta ona z wbudowanego lub zdefiniowanego `@@iterator`a, który składa się z metody `next()` służącej do przekazywania
kolejnych elementów struktury.