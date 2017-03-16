##Rozdział V - **Prototypy**

####`[[Prototype]]`

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

#####`Object.prototype`

Gdzie tak właściwie kończy się łańcuch `[[Prototype]]`?

Górną granicą każdego zwykłego łańcucha `[[Prototype]]` jest wbudowany `Object.prototype`. Ten obiekt zawiera wiele 
powszechnych funkcjonalności używanych w JS, ponieważ wszystkie wbudowane obiekty JS 'pochodzą' od `Object.prototype`.

Do wyżej wymienionych funkcjonalności należą między innymi `.toString()` lub `.valueOf()`. W rozdziale 3, przedstawiliśmy
inne takie jak: `.hasOwnProperty()`. Inną funkcją pochodzacą z `Object.prototype`, która może być Wam nieznana jest 
`isPrototypeOf(..)`. Zostanie opisana w dalszej części notatek.

#####Ustawianie i zaciemnianie właściwości

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

