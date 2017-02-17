##Rozdział 3 - zakres funkcji vs zakres bloków

W powszechnym obiegu utrwaliła się opinia o tym, że w JS jedynie funkcje tworzą własne zakresy. Nie jest to prawdą.

####Zakres na podstawie funkcji

```
function foo(a) {
 var b = 2;
 // kod
 function bar() {
 // ...
 }
 // więcej kodu
 var c = 3;
}
```

Zakres foo w tym przypadku zawiera cztery identyfikatory: `a`, `b`, `bar` i `c`. Zgodnie z zasadą, że identyfikatory są 
dostępne tylko w danym zakresie i zakresach zagnieżdżonych odwołanie się do nich w zakresie globalnym skutkuje wyrzuceniem `ReferenceError`.
```
... // zakres globalny
bar(); // ReferenceError

console.log(a, b, c); // ReferenceError dla każdego z identyfikatorów
```
Taka mechanika zachęca do korzystania z zadeklarowanych w zakresie funkcji zmiennych w całej jej ciele 
(również w zakresach funkcji zagnieżdżonych). 

####Ukrycie w zwykłym zakresie

Standardowa procedura myślenia o funkcjach zakłada ich deklarację, po czym dodanie kodu do ich ciała.
Warto wykorzystać całkowicie odwrotne spojrzenie i wykorzystać funkcję jako formę ukrycia kodu w nowym zakresie.
W ten sposób wszelkie deklaracje będą należeć do nowo utworzonego zakresu - dzięki czemu 'ukryjemy' je w tym zakresie.

Fundamentem praktyki ukrywania za pomocą zakresów jest **zasada najmniejszego uprzywilejowania**. Jest to zasada projektowania
oprogramowania zakładająca, że system powinien udostępniać minimalną część niezbędną do wykonania zadania, ukrywając resztę.

Przykład programu zaprojektowanego bez uwzględnienia ZNU:
```
function doSomething(a) {
 b = a + doSomethingElse(a * 2);
 console.log(b * 3);
}
function doSomethingElse(a) {
 return a - 1;
}
var b;
doSomething(2); // 15
```
Jak widać zarówno zmienna `b` jak i funkcja `doSomethingElse()` są prywatnymi detalami działania funkcji `doSomething()` -
udostępnianie dostępu do nich w zakresie zewnętrznym jest niepotrzebne i może prowadzić do niechcianych skutków ubocznych
wpływających na działanie `doSomething()`.

Przykład programu zaprojektowanego z uwzględnieniem ZNU:
```
function doSomething(a) {
 function doSomethingElse(a) {
 return a - 1;
 }
 var b;
 b = a + doSomethingElse(a * 2);
 console.log(b * 3);
}
doSomething(2); // 15
```
W ten sposób `b` i `doSomethingElse()` nie są dostępne z zewnętrznych zakresów i kontrole nad ich działaniem posiada wyłącznie
`doSomething()`. Funkcjonalność i efekt końcowy nie uległ zmianie przy jednoczesnym wzroście bezpieczeństwa co świadczy
o przydatności tej zasady projektowania.

####Unikanie kolizji

Kolejna zaletą ukrywania zmiennych i funkcji w zakresie jest unikanie niechcianych kolizji pomiędzy dwoma identyfikatorami o
tej samej nazwie lecz innym planowanym przeznaczeniu. Kolizja często skutkuje nieoczekiwanym nadpisaniem wartości.

```
function foo() {
 function bar(a) {
 i = 3; // zmiana wartości 'i' w zakresie otaczającym pętle for
 console.log(a + i);
 }
 for (var i = 0; i < 10; i++) {
 bar(i * 2); // nieskończona pętla
 }
}
foo();
```
Operacja przypisania `i = 3` wewnątrz `bar()` nieoczekiwanie nadpisuje `i` zadeklarowane w pętli for wewnątrz `foo()`.
W tym przypadku skutkuje to nieskończoną pętlą ponieważ `i` przyjmuje stałą wartość `3` przy każdej iteracji.
Gdyby przypisanie wewnątrz `bar()` wyglądało w następujący sposób: `var i = 3;` uniknęlibyśmy opisanego wyżej problemu.
Doszłoby do zaciemnienia zmiennej `i` z pętli for na rzecz tej zadeklarowanej w zagnieżdżonym zakresie. Moglibyśmy również
zdecydować się na zupełnie inny identyfikator, np. `var j = 3;` (o ile projekt programu na to pozwala).

#####Globalna przestrzeń nazw

Nietrudno wyobrazić sobie sytuację kolizji zmiennych w zakresie globalnym. Biorąc pod uwagę mnogość
załadowanych bibliotek, może dojść do ich kolizji między sobą jeżeli nie ukrywają one swoich prywatnych funkcji i zmiennych.
Aby ustrzec się przed kolizjami dla każdej biblioteki zadeklarowana zostaje zmienna (zazwyczaj obiekt) z unikalną nazwą.
W ten sposób obiekt tworzy przestrzeń nazw dla tejże biblioteki i chcąc skorzystać z jej funkcjonalności odwołujemy się
do jego właściwości.

#####Zarządzanie modułami

Kolejnym sposobem na zapobieganie kolizjom jest wykorzystanie bardziej nowoczesnej praktyki - podejścia modułowego.
Jest to możliwe dzięki menadżerom zależności, które zapobiegają tworzeniu identyfikatorów w zakresie globalnym przez biblioteki.
Menadżer zależności wymaga utworzenia identyfikatora dla całej biblioteki, której zawartość jest załadowana do nowo utworzonego
zakresu. 

####Funkcje jako zakresy

Aby nie zanieczyszczać globalnej przestrzeni nazw identyfikatorem funkcji, której ciała chcemy użyć tylko raz możemy
skorzystać z następującego mechanizmu:
```
var a = 2;
(function foo(){ 
 var a = 3;
 console.log( a ); // 3
})(); 
console.log( a ); // 2
```
Otaczając standardową deklarację funkcji nawiasami czynimy z niej wyrażenie funkcyjne. 

**Jak odróżnić deklarację funkcji od wyrażenia funkcyjnego?**  
Wystarczy spojrzeć na położenie słowa kluczowego `function`. Jeżeli znajduje się na absolutnie pierwszym miejscu
mamy do czynienia z deklaracją, w każdym innym przypadku (np. przypisanie funkcji do zmiennej, otoczenie nawiasami) mówi
się o wyrażeniu funkcyjnym.

#####Anonimowość kontra nazwa

Gdy wyrażenie funkcyjne nie posiada identyfikatora w formie nazwy mówimy o **anonimowym wyrażeniu funkcyjnym**.
Deklaracja funkcji wymaga identyfikatora, podczas gdy wyrażenie funkcyjne zostawia nam wolną rękę.

Funkcje anonimowe mają liczne zalety. Można je szybciej i łatwiej napisać przez co ich użycie jest faworyzowane przez wiele
bibliotek i narzędzi. Warto jednak pamiętać o następujących wadach:

+ Funkcje anonimowe nie posiadają nazwy przez co trudniej je zidentyfikować podczas debuggowania.
+ Jako, że funkcja nie posiada nazwy utrudnia to odwoływanie się do niej podczas rekurencji. Jesteśmy więc zmuszeni
do korzystania z wycofanej metody arguments.callee. Innym przykładem konieczności odwoływania się funkcji do samej siebie
jest odbindowanie funkcji obsługującej wydarzenie po jego wystąpieniu.
+ Brak nazwy może prowadzić do zmniejszenia czytelności kodu.

Wyrażenia funkcyjne inline są bardzo potężną i użyteczną mechaniką. W ten sposób neutralizujemy wady funkcji anonimowych
nie narażając się na żadne mankamenty. 

**Dobra praktyka:** zawsze nazywaj swoje wyrażenia funkcyjne.

#####Natychmiastowe wywoływanie wyrażeń funkcyjnych

```
var a = 2;
(function foo(){
 var a = 3;
 console.log(a); // 3
})();
console.log(a); // 2
```
Otaczając funkcję nawiasami czynimy z niej wyrażenie funkcyjne. Przez dodanie dwóch nawiasów na końcu wyrażenia dochodzi
do jego natychmiastowego wykonania. 

Jest to na tyle popularna praktyka, że otrzymała własną nazwę: IIFE (ang. _immediately invoked function expression_).
IIFE nie wymaga nazwy stąd często korzysta się z anonimowych wyrażeń funkcyjnych. Jednak z powodów opisanych powyżej
warto nazywać swoje IIFE.

Jedną z wariacji IIFE jest wykorzystanie tego, że mamy przecież do czynienia z funkcją, więc możemy jej przekazać argument.

```
var a = 2;
(function IIFE(global){
 var a = 3;
 console.log(a); // 3
 console.log(global.a); // 2
})(window);
console.log(a); // 2
```

Kolejnym zastosowaniem tego wzorca jest zabezpieczenie się przed nadpisaniem wartości domyślnego identyfikatora `undefined`,
co mogłoby spowodować nieoczekiwane skutki uboczne. Nazywając parametr `undefined` bez przypisywania mu wartości mamy pewność,
że wewnątrz IIFE będziemy mieli do czynienia z domyślną wartością `undefined`.

```
undefined = true; // karta pułapka!
(function IIFE(undefined){
 var a;
 if (a === undefined) {
 console.log( "Uf, undefined ocalone!" );
 }
})();
```