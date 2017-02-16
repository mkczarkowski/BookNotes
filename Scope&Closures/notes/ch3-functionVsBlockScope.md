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
W ten sposób wszelkie deklaracje będą należeć do nowo utworzonego zakresu - dzięki czemu 'ukryjemy' deklaracje w tym zakresie.

