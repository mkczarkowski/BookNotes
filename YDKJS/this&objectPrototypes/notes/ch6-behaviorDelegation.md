## Rozdział VI - Delegowanie zachowań

Jak dowiedzieliśmy się z poprzedniego rozdziału, fundamentem funkcjonalności `[[Prototype]]`, na którym polegamy pisząc
dobry kod JS jest połączenie jednego obiektu z innymi obiektami. Na tym założeniu będą oparte wszystkie techniki opisane
w tym rozdziale.

#### W kierunku projektowania zorientowanego na delegację

Po raz kolejny skupimy się na fundamentalnych różnicach pomiędzy projektowaniem zorientowanym na delegację, a tym zorientowanym
na klasy.

**Warto wiedzieć**: Niektóre zasady projektowania zorientowanego są jak najbardziej poprawne i godne respektowania.
Najlepszym przykładem jest enkapsulacja, która świetnie współgra z delegowaniem.

##### Teoria klas

Naszym zadaniem będzie zaprojektowanie modelu dla podobnych zadań ("XYZ", "ABC", etc.).

Wykorzystując klasy zdefiniowalibyśmy ogólną klasę rodzica (base) `Task` zawierającą zachowania dzielone przez wszystkie
zadania. Następnie, zdefiniowalibyśmy klasy potomne `XYZ` i `ABC`, obie dziedziczące z `Task`, zawierające specyficzne
zachowania do obsługi swoich zadań.

Co najważniejsze, projektowanie klasowe zachęca do jak najskuteczniejszego korzystania z dziedziczenia, wraz z nadpisywaniem
metod (i polimorfizmem). Będziemy skupiali się na szukaniu okazji do wyabstrahowania ogólnego zachowania w klasie rodzica
i wyspecjalizowania (nadpisania) go wewnątrz klas potomnych.
```aidl
class Task {
  id;
  
  // konstruktor 'Task()'
  Task(ID) { 
    id = ID; 
  } 
  
  outputTask() { 
    output(id); 
  }
}

class XYZ inherits Task {
  label;
  
  // konstruktor 'XYZ()'
  XYZ(ID, Label) { 
    super(ID);
    label = Label;
  }
  outputTask() {
    super();
    output(label);
  }
}
class ABC inherits Task {
  // ...
}
```
Teraz możemy stworzyć dowolną ilość instancji potomnej klasy `XYZ` i użyć jej do obsługi zadań typu "XYZ". Instancje posiadają
zarówno ogólne zachowania `Task` oraz specyficzne dla siebie zachowania `XYZ`.


##### Teoria delegacji

Poruszymy ten sam problem korzystając z projektowania opartego o delegację.

Pierw zdefiniujemy obiekt (nie klasę czy funkcję) o nazwie `Task` posiadający konkretne zachowania, w tym metody z których
będą korzystały wszystkie typy zadań. Następnie dla każdego zadania stworzymy obiekt przechowujący specyficzne dane/zachowania.
Utworzymy połączenie wyspecjalizowanego obiektu z obiektem użytkowym `Task`, pozwalając na delegację, gdy zajdzie taka potrzeba.
```aidl
var Task = {
  setID: function(ID) {
    this.id = ID;
  },
  outputID: function() {
    console.log(this.id);
  }
};

// pozwólmy na delegację z 'XYZ' do 'Task'
var XYZ = Object.create(Task);

XYZ.prepareTask = function(ID, Label) {
  this.setID(ID);
  this.label = Label;
};

XYZ.outputTaskDetails = function() {
  this.outputID();
  console.log(this.label);
};

// ABC = Object.create(Task);
// ...
```
W tym kodzie `Task` i `XYZ` nie są klasami, tylko zwykłymi obiektami. `XYZ` powstało przy użyciu `Object.create(..)`, aby
utworzyć delegację `[[Prototype]]` do obiektu `Task`.

Różnice pomiędzy projektowaniem zorientowanym na klasy, a tym zorientowanym na delegację:

1. Zarówno pola `id` jak i `label` z "klasowego" przykładu odpowiadają właściwościom znajdującym się wewnątrz `XYZ`.
Korzystając z delegacji `[[Prototype]]` zależy nam na tym, aby stan był przechowywany w delegatach (`XYZ`, `ABC`), a nie
w obiekcie delegowanym (`Task`).

2. W projektowaniu zorientowanym na klasy celowo użyliśmy tej samej nazwy metody `outputTask` dla rodzica (`Task`) oraz
potomka (`XYZ`), wykorzystując w ten sposób nadpisywanie (polimorfizm). W delegacji zachowań robimy dokładnie na odwrót,
za wszelką cenę unikamy tego samego nazewnictwa metod na poszczególnych poziomach łańcucha `[[Prototype]]` (cieniowanie).
Takie kolizje nazw powodują problemy z referencjami.

Takie nastawienie wymaga od nas dokładniejszego nazywania metod. W ten sposób tworzymy kod łatwiejszy do zrozumienia,
ponieważ same nazwy metod opisują ich działanie.

3.`this.setID(ID);` wewnątrz obiektu `XYZ` pierw szuka `setID()` wewnątrz `XYZ`. Obiekt nie zawiera tej metody, więc
silnik wykorzystuje delegację `[[Prototype]]` i trafia do `Task`. Ze względu na mechanizmniejawne wiązania `this` 
po uruchomieniu `setID(..)`, które zostało odnalezione wewnątrz `Task`, wiązanie `this` wskazuje na `XYZ` zgodnie z planem
i oczekiwaniami. Ten sam mechanizm zachodzi wewnątrz `this.outputID()`.

**Delegowanie zachowań**: niech wybrany obiekt dostarcza delegację do właściwości/metody, jeżeli nie została odnaleziona
w jego wnętrzu.

**Warto wiedzieć**: Poprawniejszym zastosowaniem delegacji jest wewnętrzna implementacja, niż bezpośrednie ukazywanie jej
w zewnętrznym API. Tak jak w powyższym przykładzie, staramy się ukryć zastosowanie delegacji w opakowujących metodach,
aby zwiększyć czytelność kodu.

**Wzajemna delegacja (zablokowana)**

Nie mamy możliwości utworzenia wzajemnej delegacji pomiędzy dwoma obiektami. Próba stworzenia takiego połączenia skutkuje
wyrzuceniem błędu. 

**Debugowanie**

Narzędzia dla programistów nie są objęte żadnym standardem, więc mogą zachodzić różnice pomiędzy wyświetlanymi
wartościami/strukturami. Zachowanie, które zostanie poddane analizie jest obecnie tylko do zaobserwowania w Chrome Dev Tools.

Na warsztat weźmiemy tradycyjny "konstruktor klasy" i jego reprezentację w Chrome Dev Tools.
```aidl
function Foo() {}

var a1 = new Foo();

a1; // Foo {}
```
Efektem sprawdzenia wartości a1 jest 'Foo {}', podczas gdy ten sam kod w Firefox wydrukowałby `Object {}`. Skąd taka różnica?

Chrome chce nam przekazać, że mamy do czynienia z pustym obiektem (`{}`) skonstruowanym przez funkcję o nazwie Foo.
Firefox mówi, że pusty obiekt powstał na podstawie ogólnej konstrukcji pochodzącej od Object. Chrome aktywnie śledzi,
za pomocą wewnętrznej właściwości, nazwę funkcji która dokonuje konstrukcji, podczas gdy inne przeglądarki nie posiadają
takiej funkcjonalności.
```aidl
function Foo() {}

var a1 = new Foo();

a1.constructor; // Foo(){}
a1.constructor.name; // "Foo"
```
Czy właśnie w taki sposób Chrome wypluwa nam "Foo"? Wystarczyło sprawdzić wartość właściwości `.constructor.name`? 
Tak i nie.
```aidl
function Foo() {}

var a1 = new Foo();

Foo.prototype.constructor = function Gotcha() {};

a1.constructor; // Gotcha(){}
a1.constructor.name; // "Gotcha"

a1; // Foo {}
```
Zmieniliśmy wartość `a1.constructor.name` na "Gotcha", a konsola Chrome nadal wyświetla nazwę "Foo". W takim razie skąd
odpowiedź tak na poprzednie pytanie? Teraz wygląda na to, że Chrome musi korzystać z innej metody na śledzenie nazwy.

Nie tak szybko, przeanalizujmy kod z wykorzystaniem połączenie prototypowych.
```aidl
var Foo = {};

var a1 = Object.create(Foo);

a1; // Object {}

Object.defineProperty(Foo, "constructor", {
  enumerable: false,
  value: function Gotcha() {}
});

a1; // Gotcha {} 
```
Tym razem się udało, konsola Chrome faktycznie skorzystała z wartości `.constructor.name`. Takie zachowanie jest zgłoszone
jako bug od momentu napisania YDKJS, nadal nie został on naprawiony. Cała ta mechanika ma jakiekolwiek zastosowanie tylko
używając paradygmatu klasowego, więc nie powinno nas specjalnie obchodzić.

##### Porównanie modeli mentalnych

Na bazie teoretycznego kodu porównamy dwa sposoby na jego zaimplementowanie. Pierwszy z nich wykorzysta tradycyjny
("prototypowy") styl:
```aidl
function Foo(who) {
  this.me = who;
}
Foo.prototype.identify = function() {
  return "I am " + this.me;
};

function Bar(who) {
  Foo.call(this, who);
}
Bar.prototype = Object.create(Foo.prototype);

Bar.prototype.speak = function() {
  alert("Hello, " + this.identify() + ".");
};

var b1 = new Bar("b1");
var b2 = new Bar("b2");

b1.speak(); // Hello, I am b1.
b2.speak(); // Hello, I am b2.
```
Klasa rodzic `Foo` została odziedziczona przez klasę potomka `Bar`, którego instancję utworzyliśmy dwukrotnie w postaci
`b1` oraz `b2`. `b1` deleguje do `Bar.prototype`, który deleguje do `Foo.prototype`. 

Teraz zaimplementujemy tę samą funkcjonalność z użyciem połączeń.
```aidl
var Foo = {
  init: function(who) {
    this.me = who;
  },
  identify: function() {
    return "I am" + this.me;
  }
};

var Bar = Object.create(Foo);

Bar.speak = function() {
  alert("Hello, " + this.identify() + ".");
}

var b1 = Object.create(Bar);
b1.init("b1");
var b2 = Object.create(Bar);
b2.init("b2");

b1.speak();
b2.speak();
```
Korzystamy z dokładnie tej samej zalety delegacji `[[Prototype]]` z `b1` do `Bar` do `Foo` co w poprzednim przykładzie
w przypadku `b1`, `Bar.prototype` oraz `Foo.prototype`. Otrzymujemy trzy połączone ze sobą obiekty.

Jednakże znacznie ułatwiliśmy całą resztę naszego kodu, skupiając się na samych połączeniach i unikając bałaganu związanego
z naśladowaniem klas, konstruktorów, prototypów i `new`.

![alt text](https://raw.githubusercontent.com/getify/You-Dont-Know-JS/master/this%20%26%20object%20prototypes/fig4.png "Diagram OO").

Diagram ukazuje powyższy przykład ze wszystkimi technicznymi detalami. Dzięki niemu dowiedziałem się, że tylko `Function`
i `Object` posiadają właściwość `.prototype`, podczas gdy stworzone na ich podstawie obiekty posiadają własciwość `__proto__`
wskazujące na te prototypy, podczas gdy ich prototyp domyślnie jest `undefined`. Jeżeli stworzymy obiekt na podstawie funkcji,
po czym zmienimy prototyp tej funkcji to `__proto__`, które jest właściwością dynamiczną będzie wskazywało na `Object`.

