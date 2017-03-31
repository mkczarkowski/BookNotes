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
używając paradygmatu klasowego, więc nie powinna nas specjalnie obchodzić.

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

![alt text](https://raw.githubusercontent.com/getify/You-Dont-Know-JS/master/this%20%26%20object%20prototypes/fig4.png "Diagram OO")

Diagram ukazuje powyższy przykład ze wszystkimi technicznymi detalami. Dzięki niemu dowiedziałem się, że tylko `Function`
i `Object` posiadają właściwość `.prototype`, podczas gdy stworzone na ich podstawie obiekty posiadają własciwość `__proto__`
wskazujące na te prototypy, podczas gdy ich prototyp domyślnie jest `undefined`. Jeżeli stworzymy obiekt na podstawie funkcji,
po czym zmienimy prototyp tej funkcji to `__proto__`, które jest właściwością dynamiczną będzie wskazywało na `Object`.

Teraz przeanalizujmy kod dla OLOO:

![alt text](https://raw.githubusercontent.com/getify/You-Dont-Know-JS/master/this%20%26%20object%20prototypes/fig6.png "Diagram OLOO")

Jak widać, w przypadku OLOO mamy dużo mniej zależności na głowie. Wynika to z założenia, że w przypadku OLOO zależy nam
jedynie na połączeniach pomiędzy obiektami.

#### Klasy vs. obiekty

Rozważymy typowy scenariusz: tworzenie widżetów UI (przyciski, drop-downy, etc.).

##### Klasy widżetowe

Myśląc w kategoriach OO od razu przychodzi nam do głowy klasa rodzic `Widget` i dziedzicząca po niej klasa `Button`.
```aidl
// Klasa rodzic
function widget(width, height) {
  this.width = width || 50;
  this.height = height || 50;
  this.$elem = null;
}

Widget.prototype.render = function($where) {
  if (this.$elem) {
    this.$elem.css({
      width: this.width + 'px',
      height: this.height + 'px',
    }).appendTo($where);
  }
};
// Klasa dziecko
function Button(width, height, label) {
  // "super" wywołanie konstruktora
  Widget.call(this, width, height);
  this.label = label || "Default";
  this.$elem = $("<button>").text(this.label);
}
// `Button` "dziedziczy" z `Widget`
Button.prototype = Object.create(Widget.prototype);
//nadpisanie odziedziczonego
Button.prototype.render = function($where) {
  // wywołanie "super"
  Widget.prototype.render.call(this, $where);
  this.$elem.click(this.onClick.bind(this));
};
$(document).ready(function() {
  var $body = $(document.body);
  var btn1 = new Button(125, 30, "Hello");
  var btn2 = new Button(150, 40, "World");
  
  btn1.render($body);
  btn2.render($body);
});
```
Wzorzec OO wymusza stworzenie podstawowej metody `render(..)` w klasie rodzica, po czym nadpisanie jej w klasie potomnej.
Nie robimy tego w celu podmiany całego kodu ale wyspecjalizowania jego działania.

**ES6 `class` sugar**

Zaprezentujemy ten sam przykład z użyciem nowej składni wprowadzonej w ES6;
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
    this.$elem = $('<button>').text(this.label);
  }
  render($where) {
    super.render($where);
    this.$elem.click(this.onClick.bind(this));
  }
  onClick(evt) {
    console.log(`Button ${this.label} clicked!`);
  }
}

$(document).ready(() => {
  var $body = $(document.body);
  var btn1 = new Button(125, 30, 'Hello');
  var btn2 = new Button(150, 40, 'World');
  
  btn1.render($body);
  btn2.render($body);
});
```
Niewątpliwie czytelność uległa znacznej poprawie. Wprowadzenie `super(..)` jest miłą odmianą. Jednak mimo składni to nadal
nie są klasy tylko mechanizmy działające w oparciu o `[[Prototype]]`.

##### Delegując widzetowe obiekty

Przejdźmy do prostszego przykładu `Widget` / `Button` z użyciem delegacji OLOO:
```
var Widget = {
  init: function(width, height) {
    this.width = width || 50;
    this.height = height || 50;
    this.$elem = null;
  },
  insert: function($where) {
    if (this.$elem) {
      this.$elem.css({
        width: this.width + 'px',
        height: this.height + 'px',
      }).appendTo($where);
    }
  }
};

var Button = Object.create(Widget);

Button.setup = function(width, height, label) {
  // wydelegowane wywołanie
  this.init(width, height);
  this.label = label || "Default"
  this.$elem = $("<button>").text(this.label);
};
Button.build = function($where) {
  // wydelegowane wywołanie
  this.insert($where);
  this.$elem.click(this.onClick.bind(this));
};
Button.onClick = function(evt) {
  console.log(`Button ${this.label} clicked!`);
};

$(document).ready(function() {
  var $body = $(document.body);
  
  var btn1 = Object.create(Button);
  btn1.setup(125, 30, "Hello");
  
  var btn2 = Object.create(Button);
  btn2.setup(150, 40, "World");
  
  btn1.build($body);
  btn2.build($body);
});
```
W podejściu OLOO nie myślimy o `Widget` jako rodzicu, a `Button` jako dziecku. `Widget` jest po prostu obiektem będącym
zbiorem użytecznych zachowań, które może wykorzystać wyspecjalizowany widżet taki jak `Button`, który również jest
samodzielnym obiektem. 

Z punktu widzenia projektowania nie udostępniliśmy tej samej nazwy metody `render(..)` dla obydwóch obiektów, zamiast
tego zastosowaliśmy nazwy, które dokładniej opisują wykonywane zadania (`insert(..)` oraz `build(..)`). Tak samo postąpiliśmy
w przypadku metod inicjalizacyjnych.

Unikneliśmy brzydoty pseudo-polimorfizmu (`Widget.call` oraz `Widget.prototype.render.call`) zastępując go czytelnymi
delegacjami w postaci `this.init(..)` oraz `this.insert(..)`.

Można zauważyć, że jedno wywołanie `var btn1 = new Button(..)` zostało zastąpione przez dwa: `var btn1 = Object.create(Button)`
oraz `btn1.setup(..)`. Na pierwszy rzut oka może to być minus, więcej kodu.

Jednakże, jest to plus kodu OLOO w porównaniu do stylu prototypowego. Dlaczego?

W przypadku konstruktorów jesteśmy zmuszeni do konstruowania i inicjalizacji w jednym kroku. W przypadku OLOO mamy
możliwość rozłożenia tych czynności w czasie dzieki czemu jesteśmy bardziej elastyczni.

OLOO zapewnia większy podział odpowiedzialności.

#### Prostszy design

OLOO zapewnia nie tylko czystszy kod, delegacja odpowiedzialności często doprowadza do prostszej architektury programu.

Nasz scenariusz przeanalizuje dwa kontrolery, jeden obsługujący formularz logowania ze strony oraz drugi, który będzie
obsługiwał autoryzację logowania z serwerem. Obsługa zapytań AJAX zostanie zrealizowana za pomocą jQuery.

Idąc za klasycznym wzorcem klasowym, rozbijemy zadanie na jego podstawową funkcjonalność w klasie `Controller` i
stworzymy dwie klasy potomne: `LoginController` oraz `AuthController`.
```aidl
// rodzic
function Controller() {
  this.errors = [];
}
Controller.prototype.showDialog = function(title, msg) {
  // wyświetl tytuł i wiadomość do użytkownika w oknie dialogowym
};
Controller.prototype.success = function(msg) {
  this.showDialog("Success", msg);
};
Controller.prototype.failure = function(err) {
  this.errors.push(err);
  this.showDialog("Error", err);
};
```
```aidl
// dziecko
function LoginController() {
  Controller.call(this);
}
// połącz dziecko z rodzicem
LoginController.prototype = Object.create(Controller.prototype);
LoginController.prototype.getUser = function() {
  return document.getElementById("login_username").value;
};
LoginController.prototype.getPassword = function() {
  return document.getElementById("login_password").value;
};
LoginController.prototype.validateEntry = function(user, pw) {
  user = user || this.getUser();
  pw = pw || this.getPassword();
  
  if (!(user && pw)) {
    return this.failure("Please enter a username & password!");
  } else if (pw.length < 5) {
    return this.failure("Password must be 5+ characters!");
  }
  // dotarłeś tutaj? zatwierdzone!
  return true;
};
// Nadpisz 'failure()'
LoginController.prototype.failure = function(err) {
  // wywołanie "super"
  Controller.prototype.failure.call(this, "Login invalid: " + err);
};
```
```aidl
function AuthController(login) {
  Controller.call(this);
  // poza dziedziczeniem potrzebujemy kompozycji
  this.login = login;
}
// połącz dziecko z rodzicem
AuthController.prototype = Object.create(Controller.prototype);
AuthController.prototype.server = function(url, data) {
  return $.ajax({
    url: url,
    data: data
  });
};
AuthController.prototype.chechAuth = function() {
  var user = this.length.getUser();
  var pw = this.login.getPassword();
  
  if (this.login.validateEntry(user, pw)) {
    this.server("/check-auth", {
      user: user,
      pw: pw
    })
    .then(this.success.bind(this))
    .fail(this.failure.bind(this));
  }
};
// nadpisujemy 'success()'
AuthController.prototype.success = function() {
  // wywołanie "super"
  Controller.prototype.success.call(this, "Authenticated!");
};
AuthController.prototype.failure = function(err) {
  // wywołanie "super"
  Controller.prototype.failure.call(this, "Auth Failed: " + err);
};
```
```aidl
var auth = new AuthController(
  // kompozycja
  new LoginController()
);
auth.checkAuth();
```
Mamy podstawowe funkcjonalności dzielone przez wszystkie kontrolery, to jest `succes(..)`, `failure(..)` oraz `showDialog(..)`.
Nasze klasy potomne nadpisują `failure(..)` oraz `success(..)` w celu uzyskania wyspecjalizowanego zachowania. Istotne
jest to, że `AuthController` potrzebuje instancji `LoginController`, aby dokonywać interakcji z formularzem.
Poza dziedziczeniem wykorzystaliśmy kompozycję, `AuthController` musi wiedzieć o `LoginController`, więc tworzymy
jego instancję i zapisujemy ją w właściwości `login`, aby `AuthController` mógł wykonywać działania na `LoginController`.

##### De-klasy-fikacja

Teraz przeanalizujemy ten sam problem wykorzystując delegację zachowań.
```aidl
var LoginController = {
  errors: [],
  getUser: function() {
    return document.getElementById("login_username").value;
  },
  getPassword: function() {
    return document.getElementById("login_password").value;
  },
  validateEntry: function(user, pw) {
    user = user || this.getUser();
    pw = pw || this.getPassword();
    
  if (!(user && pw)) {
    return this.failure("Please enter a username & password!");
  } else if (pw.length < 5) {
    return this.failure("Password must be 5+ characters!");
  }
  
  // zatwierdzono!
  return true;
  },
  showDialog: funcion(title, msg) {
    // wyświetl wiadomość w oknie dialogowym
  }
  failure: function(err) {
    this.errors.push(err);
    this.showDialog("Error", "Login invalid: " + err);
  }
};
```
```aidl
// Deleguj z 'AuthController' do 'LoginController'
var AuthController =   Object.create(LoginController);

AuthController.errors = [];
AuthController.checkAuth = function() {
  var user = this.getUser();
  var pw = this.getPassword();
  
  if (this.validateEntry(user, pw)) {
    this.server('/check-auth'), {
      user: user,
      pw: pw,
    })
    .then(this.accepted.bind(this))
    .fail(this.rejected.bind(this));
  }
};
AuthController.server = function(url, data) {
  return $.ajax({
    url: url,
    data: data
  });
};
AuthController.accepted = function() {
  this.showDialog("Success", "Authenticated!")
};
AuthController.rejected = function(err) {
  this.failure("Auth failed: " + err);
};
```
Jako, że `AuthController` jest tylko obiektem (podobnie jak `LoginController`), nie musimy tworzyć instancji, aby wykonać
nasze zadanie. Wszystko czego trzeba to:
`AuthController.checkAuth();`.
Z delegacją zachowań, `AuthController` i `LoginController` to po prostu obiekty, równolegli rówieśnicy, bez relacji
rodzic-dziecko. Wybraliśmy kierunek delegacji z `AuthController` do `LoginController` - moglibyśmy ją bez problemowo
odwrócić.

Taka organizacja kodu wymaga od nas stworzenia zaledwie dwóch (`LoginController` i `AuthController`), a nie trzech bytów
(brak `Controller`). Dzięki delegacji nie musieliśmy korzystać z kompozycji ani tworzyć instancji. Uniknęliśmy minusów
pseudopolimorfizmu rezygnując z tych samych nazw metod dla `success(..)` i `failure(..)`. Zamiast tego nazwaliśmy je
`accepted()` i `rejected()` w `AuthController` - co daje nam lepszy opis wykonywanych czynności.

Wnioski: mamy te same możliwości z zastosowaniem prostszego wzorca.

#### Ładniejsza składnia

W ES6 wprowadzono skróconą składnię dla deklaracji klas.
```
class Foo {
  methodName() { ... }
}
```
Nie musimy używać słowa kluczowego `function` do deklarowania metod!

Na szczęście, to rozwiązanie nie jest ograniczone do `class` i można z niego korzystać podczas deklaracji jakiegokolwiek
obiektu.
```
var LoginController = {
  errors: [],
  getUser() {
   // ...
  },
  getPassword() {
   // ...
  },
};
```
Jedyna różnica pomiędzy `class`, a obiektami to wymóg stawiania `,` pomiędzy kolejnymi deklaracjami.

Aby uniknąć pojedynczego deklarowania metod z użyciem `function`, pierw możemy stworzyć obiekt korzystając z zwięzłych
deklaracji, po czym utworzyć połączenie prototypowe za pomocą `Object.setPrototypeOf(..)`.
```aid1
// wykorzystajmy nową składnię do wygodniejszej deklaracji obiektu
var AuthController = {
  errors: [],
  checkAuth() {
    // ...
  },
  server(url, data) {
    // ...
  },
  // ...
};

//teraz pozwolimy na delegację z 'Auth Controller' do 'Login Controller'
Object.setPrototypeOf(AuthController, LoginController);
```

##### Alekykalność

Jest jeden minus związany ze zwięzłymi deklaracjami.
```aidl
var Foo = {
  bar() { ... }
  baz: function baz() { ... }
};
```
Po przetworzeniu na klasyczną składnię:
```aidl
var Foo = {
  bar: function() { ... }
  baz: function baz() { ... }
```
Skrócone `bar()` staje się anonimowym wyrażeniem funkcyjnym przypisanym do właściwości `bar`, ponieważ obiekt funkcyjny
nie posiada nazwy. Porównując do manualnie określonej nazwy wyrażenia funkcyjnego `function baz()`, które posiada leksykalny
identyfikator `baz`, który jest dodatkowo przypisany do właściwości `.baz`.

Przypomnimy wady anonimowych wyrażeń funkcyjnych:

1. trudniejsze debugowanie
2. odwoływanie się do funkcji z jej wnętrza jest trudniejsze
3. kod staje się (troszkę) trudniejszy do zrozumienia

Punkt 1 i 3 nie dotyczy zwięzłych deklaracji.

Mimo tego co zauważamy w przetworzeniu na klasyczną składnię, zwięzłe deklaracje ustawiają wewnętrzną właściwość `name`,
która pozwala na śledzenie nazwy w stacku.

Punkt 2 niestety nadal dotyczy zwięzłych deklaracji.
```aidl
var Foo = {
  bar: function(x) {
    if (x < 10) {
      return Foo.bar(x * 2);
    }
    return x;
  },
  baz: function baz(x) {
    if (x < 10) {
      return baz(x * 2);
    }
    return x;
  }
};
```
W tym przypadku referencja `Foo.bar(x * 2)` załatwia sprawę, lecz w bardziej złożonych przypadkach byłoby to niemożliwe.
Przykładowo gdy funkcja jest współdzielona w ramach delegacji zza pomocą wiązania `this`.

Kiedy natrafimy na tego typu problemy musimy zrezygnować z zwięzłej deklaracji na rzecz jawnie nazwanego wyrażenia funkcyjnego.

#### Introspekcja

Introspekcja to koncepcja popularna w programowaniu zorientowanym na klasy, dzięki niej możemy analizować instancję, aby
dowiedzieć się z czym mamy do czynienia.

```aidl
function Foo() {
  // ...
}
Foo.prototype.something = function() {
  // ...
}

var a1 = new Foo();

// później

if (a1 instanceof Foo) {
  a1.something();
}
```
Ponieważ `Foo.prototype` (nie mylić z `Foo`) jest w łańcuchu `[[Prototype]]` a1, operator `instanceof` (myląco) twierdzi,
że `a1` jest instancją "klasy" `Foo`. Z tego tytułu możemy błędnie wywnioskować, że `a1` posiada możliwości opisane
przez klasę `Foo`.

Oczywiście, klasa `Foo` nie istnieje, a mamy do czynienia z najzwyklejszą funkcją `Foo`, która posiada referencję do
obiektu `Foo.prototype`, do którego `a1` posiada połączenie delegacyjne. Ze względu na składnię operator `instanceof` 
udaje, że sprawdza relację pomiędzy `a1`, a `Foo`, gdy tak naprawę sprawdza relację pomiędzy `a1` i `Foo.prototype`.

W związku z zawiłością `instanceof`, aby dokonać właściwej introspekcji i sprawdzić czy `a1` posiada relację z wybranym obiektem
musimy posiadać funkcję, która posiada referencję do tego obiektu - nie mamy możliwości na bezpośrednie sprawdzenie
relacji.

Wróćmy do przykładu z początku rozdziału.
```aidl
function Foo() { ... }
Foo.prototype...

function Bar() { ... }
Bar.prototype = Object.create(Foo.prototype);

var b1 = new Bar("b1");
```
Aby dokonać introspekcji z użyciem `instanceof` i `.prototype` moglibyśmy skorzystać z następujących rozwiazań:
```aidl
// relacja pomiędzy 'Foo' oraz 'Bar'
Bar.prototype instanceof Foo; // true
Object.getPrototypeOf(Bar.prototype) === Foo.prototype; // true
Foo.prototype.isPrototypeOf(Bar.prototype); // true

// odnosząc 'b1' zarówno do 'Foo' jak i 'Bar'
b1 instanceof Foo; // true
b1 instanceof Bar; // true
Object.getPrototypeOf(b1) === Bar.prototype; // true
Foo.prototype.isPrototypeOf(b1); // true
Bar.protoype.isPrototypeOf(b1); // true
```

Kolejnym powszechnym sposobem dokonywania introspekcji jest tzw. "duck typing". Takie określenie pochodzi od porzekadła
"jeżeli wygląda jak kaczka i kwaka jak kaczka, to musimy mieć do czynienia z kaczką".
```aidl
if (a1.something) {
  a1.something();
}
```
Zamiast badać relację pomiędzy `a1`, a obiektem, który trzyma delegowalną funkcję `something()` wychodzimy z założenia,
że zdawalność testu `a1.something`, oznacza zdolność `a1` do wywołania `something()` (nie zważając na to czy funkcja znajduje
się wewnątrz `a1` czy w delegowanym obiekcie). Musimy uważać z zastosowaniem "duck typingu" w przypadku metody `then()`,
ponieważ silnik zakłada wtedy, że musimy mieć do czynienia z ES6 Promise.

W przypadku kodu OLOO, introspekcja typów jest znacznie czystsza.
```aidl
var Foo = { ... }

var Bar = Object.create(Foo);
Bar...

var b1 = Object.create(Bar);
```
Korzystając z tego podejścia, które opiera się na zwykłych obiektach związanych relacją łańcucha `[[Prototype]]` możemy
użyć uproszczonej introspekcji:
```aidl
// relacja pomiędzy 'Foo' i 'Bar'
Foo.isPrototypeOf(Bar); // true
Object.getPrototypeOf(Bar) === Foo; // true

// relacja 'b1' z 'Foo' oraz 'Bar'
Foo.isPrototypeOf(b1); // true
Bar.isPrototypeOf(b1); // true
Object.getPrototypeOf(b1) === Bar; // true
```
Nie korzystamy z mylącego operatora `instanceof`, który sugeruje nam związek z klasami. Teraz jawnie pytamy: "Czy jesteś
moim prototypem?".

W ten sposób unikamy komplikacji i cała introspekcja staje się dużo bardziej zrozumiała. Po raz kolejny OLOO okazało się
prostsze, niż imitacja klas.

#### Podsumowanie

Klasy i dziedziczenie to tylko jeden z wzorców programowania. Innym, dużo rzadziej wykorzystywanym, a dużo lepiej przystosowanym
do mechaniki JS jest **delegacja zachowań**.

Delegacja zachowań sugeruje, że obiekty są rówieśnikami, które dokonują delegacji pomiędzy sobą, zamiast tworzenia relacji
rodzic/dziecko. Mechanizm `[[Prototype]]` JavaScriptu jest w samej swojej naturze mechanizmem delegowania zachowań.

OLOO (objects-linked-to-other-objects) jest stylem pisania kodu, który obiera się na tworzeniu obiektów i ich relacji
z odejściem od klasowej abstrakcji. W ten sposób bez przeszkód wykorzystujemy zalety mechanizmu `[[Prototype]]`.