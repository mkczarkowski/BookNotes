## **Rozdział IV - Mieszanie obiektów "klas"**

W tym rozdziale skupimy się na programowaniu obiektowym. Przyjrzymy się wzorcowi projektowemu zorientowanemu na klasy.
Wyjaśnimy znaczenie podstawowych pojęć takich jak: klasy, instancje, dziedziczenie i relatywny polimorfizm.

Zastanowimy się dlaczego te koncepcje nie są dopasowane do mechaniki obiektów w JS.

#### Teoria klas

"Klasa/dziedziczenie" opisuje pewien sposób na organizacje i architekturę kodu - jedno z rozwiązań przenoszenia problemów
z rzeczywistości do abstrakcyjnych programów komputerowych.

Programowanie obiektowe kładzie nacisk na to, że dane są połączone z określonym zachowaniem zależnym od typu i natury
tychże danych. Stąd wynika konieczność wspólnego pakowania danych wraz z zachowaniem. Ta koncepcja nosi nazwę "struktury
danych" w formalnej informatyce.

Przykładowo: seria znaków/fraza na ogół określana jest mianem "stringa". Znaki są naszymi danymi. Jednakże najczęściej
zależy nam głównie na możliwości modyfikowania tych danych, więc polegamy na metodach (pozwalających na określenie długości, 
dołączanie kolejnych znaków, wyszukiwanie wzorców) klasy `String`.

Każdy string jest instancją klasy, więc jest połączoną paczką danych w formie znaków i zachowań, które można na tych
danych przeprowadzić.

Często podawanym przykładem jest zależność pomiędzy klasą `Samochód` i `Pojazd`. `Samochód` jest specyficzną formą `Pojazd`u.

Definicja `Pojazd`u uwzględnia napęd (tj. silnik itd.), możliwość przewożenia ludzi, itd. Wszystko co zawiera definicja `Pojazd`u
jest wspólne dla wszystkich jego typów (samolotów, samochodów, pociągów itd.). Nie ma większego sensu redefiniować możliwości
przewożenia ludzi dla każdego typu pojazdu. Aby uniknąć tej czynności wykorzystujemy mechanizm dziedziczenia czyli przejęcia
przez `Samochód` podstawowych cech `Pojazd`u.

Kolejnym kluczowym pojęciem jest "polimorfizm", który tyczy się możliwości nadpisywania przez klasę dziedziczącą mechanizmów
w celu nadania im większego stopnia szczegółowości. Polimorfizm relatywny daje nam możliwość odwoływania się do nadpisywanego
mechanizmu z poziomu mechanizmu nadpisującego.

##### "Klasowy" wzorzecz projektowy

Czasami można zapomnieć, że programowanie obiektowe jest zaledwie wzorcem projektowym, a nie nisko-poziomową mechaniką, 
od której zależne są wszystkie wysoko-poziomowe implementacje. Innymi wzorce to: programowanie proceduralne, programowanie
funkcyjne. W przypadku języka Java nie mamy wyboru, wszystko jest klasą. Inne języki takie jak C/C++ czy PHP dają nam składniową
możliwość programowania proceduralnego oraz zorientowanego na klasy. 

##### Klasy w JS

Mamy w JS do czynienia z kilkoma elementami składni, które wskazują na istnienie mechanizmów klasowych (`new`, `instanceof`, `class`).
Czy są one wystarczające, aby mówić o istnieniu klas w JS? Zdecydowanie nie.

JS daje możliwość, z dość dużą dawką wysiłku, zaimplementowanie wzorca klasowego w oparciu o dostępną składnię. Jednakże
sama mechanika języka skutecznie walczy przeciwko takiemu rozwiązaniu. 

#### Mechanika klas

W wielu zorientowanych na klasy językach, standardowa biblioteka zapewnia strukturę danych "stosu" (push, pop, itd.) jako
klasę `Stos`. Taka klasa posiadałaby wewnętrzy zbiór pól i dostępnych zachowań (metod) do prowadzenia interakcji z danymi.

W takim scenariuszu nie operuje się na klasie `Stos`, która jest abstrakcyjnym wytłumaczeniem tego co rozumiemy przez "stos".
Aby wykonać działania na konkretnej strukturze danych musimy stworzyć instancję klasy. 

##### Budowanie

Tradycyjna metafora tłumacząca różnice pomiędzy klasą i instancją pochodzi z konstrukcji budynków.

Architekt planuje wszystkie cechy budynku: szerokość, wysokośc, ilość okien i ich położenie, typ wykorzystywanego materiału
do budowy ścian i dachu. Architekta niespecjalnie obchodzi gdzie budynek zostanie wybudowany, ani ile takich budynków powstanie.
Nie interesuje go również zawartość budynku (meble, tapety itd.). 

Praca architekta przedstawia zaledwie projekt budynku, a nie sam fizyczny budynek. Aby przerodzić ten plan w miejsce, do którego
możemy wejść potrzebny jest budowniczy. 

Kiedy proces budowania jest zakończony mamy do czynienia z instancją budynku powstałego na bazie projektu architekta. 
Proces tworzenia budynku w oparciu o ten plan może być powtarzany w nieskończoność. 

Związek pomiędzy budynkiem i projektem jest pośredni. Można przeanalizować projekt, aby zrozumieć strukturę budynku lecz
po wejściu do jego instancji rozumiemy, że mamy do czynienia zaledwie z prezentacją tego jak ten budynek powinien wyglądać,
a nie z samym budynkiem.

Klasa to nasz projekt. Aby otrzymać obiekt, z którym możemy prowadzić interakcję musimy zbudować (stworzyć instancję) czegoś
z klasy. Rezultatem procesu budowania jest obiekt, nazywany zwykle instancją, na którym możemy wywoływać metody i uzyskać
dostęp do publicznych danych, jeżeli zachodzi taka potrzeba.

Ten obiekt jest kopią wszystkich cech opisanych przez klasę.

Wchodząc do budynku rzadko mamy do czynienia z widokiem wywieszonego na ścianie planu, stąd rzadko używamy obiektu do
modyfikowania klasy ani nie udostępniamy za jego pośrednictwem tak poufnych danych publicznie. 

##### Konstruktor

Instancja klasy jest konstruowana przez specjalną metodę klasy, zwykle noszącą tę samą nazwę co klasa, zwaną "konstruktorem".
Jawnym zadaniem tej metody jest inicjalizacja stanu, który będzie wymagała każda z instancji.

Pseudo-kod przedstawiający ten mechanizm:
```markdown
class CoolGuy {
  specialTrick = nothing
  
  CoolGuy(trick) {
    specialTrick = trick
  }
  
  showOff() {
    output("Here's my trick: ", specialTrick)
  }
}
```
Aby utworzyć instancję CoolGuy posłużymy się konstruktorem:
```markdown
Joe = new CoolGuy("jumping rope")

Joe.showOff() // Here's my trick: jumping rope
```
Jak widać klasa `CoolGuy` posiada konstruktor `CoolGuy()`, który został wywołany w linii `new CoolGuy(..)`. Zwrócony zostaje
obiekt będący instancją klasy, co pozwala nam na wywołanie na nim metody `showOff()`, która prezentuje nam trik konkretnego
przedstawiciela klasy `CoolGuy`.

Konstruktor jest zawsze wywoływany wraz z operatorem `new`, w ten sposób język rozpoznaje, że chcemy stworzyć instancję klasy.

#### Dziedziczenie klas

W językach zorientowanych na klasy możemy stworzyć nową klasę, która dziedziczy po klasie, która powstała wcześniej. Mówi się, 
że klasa dziedzicząca jest 'dzieckiem', a ta po której się dziedziczy 'rodzicem'.

Wróćmy do wspomnianych na początku rozdziału klas - `Vehicle` i `Car`. Po raz kolejny posłużymy się pseudo-kodem.
```markdown
class Vehicle {
  engines = 1
  
  ignition() {
    output("Turning on my engine.")
  }
  
  drive() {
    ignition()
    output("Steering and moving forward!")
  }
}

class Car inherits Vehicle {
  wheels = 4
  
  drive() {
    inherited: drive()
    output("Rolling on all ", wheels, " wheels!")
  }
}

class SpeedBoat inherits Vehicle {
  engines = 2
  
  ignition() {
    output("Turning on my ", engines, " engines.")
  }
  
  pilot() {
    inherited: drive()
    output("Speeding through the water with ease!")
  }
}
```
Konstruktory zostały pominięte dla ułatwienia przedstawienia przykładu.

Pierw zdefiniowaliśmy klasę `Vehicle`, która zakładała istnienie silnika, możliwości jego odpalenia (metoda `ignition`) oraz
jeżdżenia pojazdem. Mamy do czynienia z pojazdem, który póki co pozostaje abstrakcyjną koncepcją.

W oparciu o naszego rodzica tworzymy dwa typy pojazdów: `Car` oraz `SpeedBoat`. Obydwoje dziedziczą charakterystyczne
cechy `Vehicle` jednocześnie rozszerzając je o specjalistyczne właściwości. Samochód potrzebuje czterech kół, a motorówka
dwóch silników. 

##### Polimorfizm

`Car` definiuje własną metodę `drive()`, która nadpisuje metodę odziedziczoną od `Vehicle`. Jednakże metoda `drive()` klasy
`Car` wywołuje `inherited: drive()`, co wskazuje na to, że `Car` odwołuje się do nadpisanej metody `drive()`. Ta sama
sytuacja zachodzi w przypadku metody `pilot()` klasy `SpeedBoat`.

Ta technika nazywana jest polimorfizmem lub polimorfizmem wirtualnym. W tym przypadku jest to dokładniej polimorfizm relatywny.

Polimorfizm to znacznie szerszy temat, niż to co poruszyliśmy w naszych rozważaniach. Mówiąc o polimorfiźmie relatywnym
mamy na myśli możliwość odwoływania się przez jedną metodę do drugiej, która jest na wyższym poziomie hierarchii dziedziczenia.
Używamy pojęcia relatywny ponieważ nie podajemy informacji, do którego dokładnie poziomu będziemy się odwoływać - relatywnie
odwołujemy się do jednego poziomu wyżej.
l
W wielu językach w tym celu wykorzystuje się słowo kluczowe `super`, w naszym przykładzie było to `inherited:`. Takie 
nazewnictwo ("super") odwołuje się do idei rodzica/przodka aktualnej klasy.

Kolejnym aspektem polimorfizmu jest możliwość użycia tych samych nazw dla metod na różnym poziomie łańcuchu dziedziczenia i 
dobieranie odpowiednich definicji podczas konkretnego wywołania tychże metod. Mechanizm ten jest zobrazowany w powyższym
przykładzie: `drive()` jest zdefiniowane zarówno w `Vehicle` jak i `Car`, oraz `ignition()` jest zdefiniowane w `Vehicle`
i `SpeedBoat`.

**Warto wiedzieć**: Tradycyjne języki zorientowane na klasy umożliwiają za pomocą `super` odwoływanie się z poziomu
konstruktora dziecka do konstruktora rodzica. W przypadku JS powinniśmy raczej myśleć o tym, że to "klasa" należy do konstruktora.
Relacja pomiędzy rodzicem i dzieckiem zachodzi tylko w przypadku dwóch obiektów `.prototype` poszczególnych konstruktorów.
Same konstruktory nie są ze sobą bezpośrednio powiązanie, nie mamy więc możliwości prostego odwołania się do jednego z 
poziomu drugiego (w załączniku A zostaje zaprezentowane jak radzi sobie z tym `class` wprowadzone w ES6).

Warto zauważyć, że to klasa dziedzicząca, a nie jej instancja może się odwoływać (zwykle za pomocą `super`) do rodzica/przodka.

##### Dziedziczenie wielokrotne

Niektóre języki zorienowane klasowo pozwalają na podanie więcej, niż jednego rodzica, po którym będziemy dziedziczyć. 
W związku z tym dziedziczenie wielokrotne zakłada, że definicja kilku rodziców zostanie przekopiowana do klasy dziedziczącej.

Na pozór jest to znaczne wzmocnienie naszych możliwości, jednakże nietrudno zauważyć, że prowadzi do kilku nieścisłości.
Jeżeli obydwoje rodzice posiadają metodę `drive()`, która jej wersja ma być odziedziczona przez dziecko? Czy za każdym razem
musielibyśmy manualnie podawać, która z metod ma być odziedziczona tracąc w ten sposób zalety dziedziczenia polimorficznego?
 
Popularną wariacją opisanego powyżej problemu jest 'problem diamentu', który opisuje następujący scenariusz: klasa-dziecko "D"
dziedziczy z dwóch klas rodziców "B" i "C". Obydwie dziedziczą z klasy "A" posiadającej metodę `drive()`. Zarówno klasa "B" jak i "C"
nadpisuje tę metodę za pomocą polimorfizmu. Którą implementacje ma odziedziczyć "D"? `B:drive()` czy `C:drive()`?

JavaScript nie posiada wbudowanego mechanizmu dziedziczenia wielokrotnego, aby uniknąć tego typu komplikacji. 

#### Miksowanie

Mechanizm obiektowy w JS nie wykonuje automatycznego kopiowania zachowań podczas dziedziczenia czy instancjonowania. 
W JS najzwyczajniej nie ma czegoś takiego jak "klasa" do zainicjowania, mamy tylko obiekty, które nie są do siebie kopiowane
lecz są ze sobą łączone.

Jako, że nie mamy do czynienia z wbudowanym kopiowaniem przeanalizujemy jak developerzy miksują ten proces w jawny i niejawny sposób.

##### Jawne miksowanie

Wrócimy do przykładu `Vehicle` oraz `Car`. Stworzymy funkcjonalność, która manualnie skopiuje dziedziczone zachowanie.
W większości bibliotek ten mechanizm nazywa się `extend(..)`, w tym przykładzie posłużymy się `mixin(..)`.
```markdown
//uproszczona metoda "mixin(..)"
function mixin(sourceObj, targetObj) {
  for (var key in sourceObj) {
    // kopiuj tylko, gdy właściwość nie została jeszcze zdefiniowana
    if (!(key in targetObj)) {
      targetObj[key] = sourceObj[key];
    }
  }
  
  return targetObj;
}

var Vehicle = {
  engines: 1,
  
  ignition: function() {
    console.log("Turning on my engine.");
  },
  
  drive: function() {
    this.ignition();
  }
};

var Car = mixin(Vehicle, {
  wheels: 4,
  
  drive: function() {
    Vehicle.drive.call(this);
    console.log("Rolling on all " + this.wheels + " wheels!");
  }
});
```
**Warto zauważyć**: Nie mamy do czynienia z klasami, `Vehicle` i `Car` to obiekty.

`Car` posiada teraz kopię właściwości i funkcji z `Vehicle`. Technicznie rzecz biorąc, funkcje nie są tak naprawdę
zduplikowane, a jedynie utworzono do nich referencje. `Car` posiada właściwość `ignition` jest skopiowaną referencją
do funkcji `ignition()`. `Car` posiadał właściwość `drive`, więc nie doszło do nadpisania tej referencji. 

##### Wracając do "polimorfizmu"

Przeanalizujmy to wyrażenie: `Vehicle.drive.call.(this)`. Możemy to nazwać "jawnym pseudo-polimorfizmem". Wracając do wcześniejszego
przykładu, korzystaliśmy z `inherited: drive()` nazywanego "polimorfizmem relatywnym".

JS nie posiada (przed ES6) mechanizmu polimorfizmu relatywnego. W przypadku funkcji o tej samej nazwie: `drive()`
występującej zarówno w `Car` jak i `Vehicle`, aby rozróżnić jedną od drugiej musimy bezwzględnie się do niej odwołać.

Jeżeli ograniczylibyśmy się do `Vehicle.drive()`, wiązanie `this` cały czas wskazywałoby na `Vehicle` zamiast na `Car`.
Stąd dodatek w postaci `.call(this)`, który zapewnia nas, że wiązanie zostanie utworzone w oparciu o obiekt `Car`.

Jak widać koszt utrzymania takiego kodu wzrasta z każdą kolejną przykrytą funkcją, która wymaga od nas "jawnego pseudo-polimorfizmu".
Dodatkowo zmniejszeniu ulega czytelność i wzrasta poziom skomplikowania naszego kodu.
Z tego powodu mechanizm "jawnego pseudo-polimorfizmu" powinien być unikany za wszelką cenę.

**Kopiowanie podczas miksowania**
```markdown
function mixin(sourceObj, targetObj) {
  for (var key in sourceObj) {
    // kopiuj tylko, gdy właściwość nie została jeszcze zdefiniowana
    if (!(key in targetObj)) {
      targetObj[key] = sourceObj[key];
    }
  }
  
  return targetObj;
}
```
Przeanalizujmy sposób działania `mixin(..)`. Iteruje po właściwościach `sourceObj` (`Vehicle` w naszym przykładzie) i jeżeli
nie odnajdzie właściwości o danej nazwie w `targetObj` (`Car` w naszym przykładzie), tworzy jej kopię. Skoro kopia ma być
utworzona w istniejącym już obiekcie musimy się upewnić, że nie dojdzie do nadpisania. 

Gdybyśmy zdecydowali się na uprzednie kopiowanie, przed stworzeniem zawartości `Car` moglibyśmy zrezygnować z takiego środka
ostrożności. Jednakże jest to rozwiązanie mniej efektywne i podatne na błędy.
```markdown
function mixin(sourceObj, targetObj) {
  for (var key in sourceObj) {
    targetObj[key] = sourceObj[key];
  }
  
  return targetObj;
}

var Vehicle = {
  // ..
}

// pierw, stwórz pusty obiekt z przekopiowaną zawartością 'Vehicle'
var Car = mixin(Vehicle, {});

mixin({
  wheels: 4,
  
  drive: function() {
    // ...
  }
}, Car);
```
Kopiując w ten sposób, `Car` jest niejako niezależne od `Vehicle`. Jeżeli dodamy właściwość do `Car` nie wpłynie to
na zawartość `Vehicle` i na odwrót.

Warto zauważyć: Są sytuacje, w których te obiekty mogą na siebie oddziaływać już po zakończeniu operacji kopiowania,
ze względu na współdzielone referencje. 

Skoro dochodzi do współdzielenia referencji do funkcji można wywnioskować, że nie zachodzi faktyczne kopiowanie jak w przypadku
klas i ich instancji. Gdybyśmy zmienili zawartość obiektu funkcyjnego (np. `ignition()`) chociażby poprzez dodanie do niego właściwości
wpłynelibyśmy zarówno na `Vehicle` jak i `Car`.

Jawny pseudo-polimorfizm jest sprawnie działającym mechanizmem w JS, lecz jest znacznie silniejszy, niż się zdaje.
Nie zyskujemy wiele korzyści z pseudo-kopiowania właściwości w porównaniu z zdefiniowaniem właściwości podwójnie, 
raz dla każdego z obiektów. 

**Dziedziczenie pasożytnicze**

Wariacja jawnego miksowana, która jednocześnie jest procesem jawnym jak i niejawnym, nazywana jest "dziedziczeniem pasożytniczym".
Zyskała popularność dzięki Douglas'owi Crockford'owi.
```markdown
// "Tradycyjna klasa w JS"
function Vahicle() {
  this.engines = 1;
}
Vehicle.prototype.ignition = function() {
  console.log("Turning on my engine.");
};
Vehicle.prototype.drive = function() {
  this.ignition();
  console.log("Steering and moving forward!");
};

//Pasożytnicza klasa 'Car'
function Car() {
  // pierw 'car' jest przedstawicielem 'Vehicle'
  var car = new Vehicle();
  
  // zmodyfikujmy nasz 'car', aby nadać mu specjalizację
  car.wheels = 4;
  
  // zapisujemy referencję do 'Vehicle::drive()'
  var vehDrive = car.drive;
  
  //nadpisujemy 'Vehicle::drive()'
  car.drive = function() {
    vehDrive.call(this);
    console.log("Rolling on all " + this.wheels + " wheels!");
  };
  
  return car;
}

var myCar = new Car();

myCar.drive();
// Turning on my engine.
// Steering and moving forward!
// Rolling on all 4 wheels!
```
Jak widać pierw utworzyliśmy obiekt "rodzica" `Vehicle`, zmieszaliśmy go z elementami 'dziecka' w definicji, po czym 
zwróciliśmy efekt tego połączenia jako obiekt `car`.

**Warto wiedzieć**: Stosując `new Car()`, tworzymy nowy obiekt z wiązaniem do `this` w `Car`. Jednakże ten obiekt nie jest użyty, a
zwracamy utworzony obiekt `car`, więc dochodzi do jego natychmiastowego usunięcia. Możemy zrezygnować z `new` zachowując funkcjonalność,
jednocześnie oszczedzając zasoby niepotrzebnie używane podczas tworzenia i usuwania obiektu.

##### Niejawne miksowanie

Niejawne miksowanie jest ściśle związane z "jawnym pseudo-polimorfizmem", stąd posiada te same wady.
```markdown
var Something = {
  cool: function() {
    this.greeting = "Hello World";
    this.count = this.count ? this.count + 1 : 1;
  }
};

Something.cool();
Something.greeting; // "Hello World"
Something.count; // 1

var Another = {
  cool: function() {
    // niejawne miksowanie 'Something' z 'Another'
    Something.coo.call(this);
  }
};

Another.cool();
Another.greeting; // "Hello World"
Another.count; // 1 (nie dzieli stanu z 'Something')
```
Za pomocą `Something.cool.call(this)` dokonujemy "zapożyczenia" funkcji `Something.cool()` i wywołania jej w kontekście
`Another` (za pomocą jawnego wiązania `this`) zamiast `Something`. Stąd przypisania wykonywane przez `Something.cool()` są aplikowane
do obiektu `Another`, a nie do obiektu `Something`.

Niestety to rozwiązanie wymaga od nas bezwzględnego wskazywania rodzica, więc nie posiada zalet polimorfizmu relatywnego.

#### Podsumowanie

Klasy to wzorzecz projektowy. Wiele języków zapewnia składnię, która jest naturalnie zorientowana na klasy. JS posiada taki syntax,
ale zachowuje się kompletnie inaczej.

Klasy oznaczają kopie.

Tworząc instancję tradycyjnej klasy, zachodzi kopiowanie zachowań klasy do instancji. Kiedy klasy są dziedziczone, również
zachodzi kopiowanie zachowań z rodzica do dziecka.

Polimorfizm (posiadania różnych funkcji o tej samej nazwie na różnych poziomach dziedziczenia) może sprawiać wrażenie, jakby
implikował relatywne połączenie dziecka z powrotem do rodzica ale są rezultatem kopiowania zachowań.

JavaScript nie dokonuje automatycznego kopiowania pomiędzy obiektami.

Wzorzec miksowania jest wykorzystywany do imitiowania kopiowania zachowań przez klasy, na ogół prowadzi do brzydkiego i
ciężkiego w utrzymaniu kodu. 

Jawne miksowanie nie oddaje tego czym są kopie powstałe na bazie klasy, ponieważ zapewnia jedynie dzielone referencje,
a nie unikalne kopie obiektów/funkcji.

