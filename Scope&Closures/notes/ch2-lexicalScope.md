##Rozdział 2 - Zakres leksykalny

Istnieją dwa najczęściej implementowane modele działania zakresów. Pierwszy, zdecydowanie najpopularniejszy, nazywany jest
**zakresem leksykalnym**. Drugi model, używany przez Basha i Perl, nazywany jest zakresem dynamicznym.

####Leksykalizacja

Jak pisałem w notatkach do pierwszego rozdziału, leksykalizacja to proces analizowania ciągu kodu źródłowego i 
nadawania tokenom semantycznego znaczenia.

Zakres leksykalny powstaje własnie w procesie leksykalizacji, więc jego stan jest bezpośrednio związany z 
kodem napisanym przez programistę przed rozpoczęciem kompilacji. Po zakończeniu leksykalizacji semantyka kodu jest już ustalona
i nie może ulec zmianom (w większości przypadków).
```
function foo(a) {
 var b = a * 2;
 function bar(c) {
 console.log(a, b, c); // Zakres funkcji bar
 }
 bar(b * 3); // Zakres funkcji foo
}
foo(2); // Zakres globalny
```
Zakres globalny zawiera jeden identyfikator: `foo`.  
Zakres funkcji foo zawiera trzy identyfikatory: `a`, `bar` i `b`.  
Zakres funkcji bar zawiera jeden identyfikator: `c`.

Każda funkcja tworzy własny zakres zagnieżdżany w funkcji zewnętrznej. Zakres funkcji bar jest zagnieżdżony
 w zakresie funkcji foo itd. 

####Wyszukiwanie

Struktura i relatywne umiejscowienie zakresów tłumaczy mechanizm wyszukiwania identyfikatorów przez silnik. 
Silnik rozpoczyna poszukiwania od aktualnego zakresu, w przypadku braku efektów przechodzi o poziom wyżej, do zakresu zewnętrznego. 
Ten proces powtarza się, aż do natrafienia na zakres globalny. Wyszukiwanie kończy się po natrafieniu na pierwszy wynik.

**Zaciemnianie zmiennej** - używanie tego samego identyfikatora dla zmiennych w różnych zakresach. 
Wewnętrzny identyfikator zaciemnia zewnętrzny (na niego silnik natrafia szybciej).

**Warto pamiętać:**
Zmienne globalne automatycznie stają się właściwościami globalnego obiektu (window dla przeglądarek), 
więc można się do nich odwoływać zarówno za pomocą nazwy leksykalnej jak i notacji kropkowej, np. `window.a`.

Zakres leksykalny dotyczy tylko identyfikatorów pierwszej klasy. W przypadku referencji do foo.bar.baz
wyszukiwanie zakresu leksykalnego ograniczyłoby się do odnalezienia identyfikatora foo. Kolejne działania byłyby zależne
od zasad dostępu do właściwości obiektu.

####Oszukiwanie leksykalizacji

Istnieją dwa sposoby oszukiwania zakresu leksylanego w JS. Posiadają one niepożądane skutki uboczne 
(przede wszystkim spadek wydajności) przez co nie należy ich
używać ale warto znać ich działanie.

#####eval

Silnik pobiera stringa będącego argumentem tej metody i traktuje go jako fragment kodu w danej linijce programu. 
W ten sposób można generować kod podczas wykonywania programu i uruchomić go jakby znajdował się w nim od samego początku. 
```
function foo(str, a) {
 eval(str); // oszustwo!
 console.log(a, b);
}
var b = 2;
foo("var b = 3;", 1); // 1, 3
```
W momencie wywołania `eval()` deklaracja `"var b = 3;"` w zakresie foo jest traktowana jak pozostałe fragmenty kodu, 
które znalazły się tam w momencie pisania programu. W ten sposób dochodzi do zacieniowania zmiennej globalnej `b`. 
Silnik wykonując wyszukiwanie RHS podczas wywoływania metody log() natrafia szybciej na wstawioną przez eval 
zmienną b i to jej wartość zostaje przyjęta jako argument.

**Warto pamiętać:** W strict-mode lub przy deklaracji z użyciem let eval tworzy swój własny zakres dzięki czemu
nie dochodzi do zacieniowania.

W JS istnieją dwie inne metody, które mogą traktować zawartość przekazanego stringa jako kod dynamicznie wygenerowanej funkcji,
jest to `setTimeout()` i `setInterval()`.

Podobną mechanikę posiada konstruktor funkcji `new Function(...)`, który przekształca ostatni argument w dynamicznie 
wygenerowaną funkcję.

Dynamicznie wygenerowany kod zawsze skutkuje spadkiem wydajności praktycznie nigdy nie wynagradzając tego w należyty sposób.

#####with

Druga metoda, wycofana w ES6. Pozwala ona na szybsze zapisywanie referencji do właściwości obiektu ze względu na brak
konieczności powtarzania referencji do samego obiektu.
```
var obj = {
 a: 1,
 b: 2,
 c: 3
};
```
Edycja przy użyciu notacji kropkowej:
```
obj.a = 2;
obj.b = 3;
obj.c = 4;
```
Edycja z użyciem `with`:
```
with (obj) {
 a = 3;
 b = 4;
 c = 5;
}
```
Aby lepiej zobrazować co tak naprawdę dzieje się przy użyciu `with` warto skorzystać z innego przykładu:
```
function foo(obj) {
 with (obj) {
 a = 2;
 }
}
var o1 = {
 a: 3
};
var o2 = {
 b: 3
};
foo(o1);
console.log(o1.a); // 2
foo(o2);
console.log(o2.a); // undefined
console.log(a); // 2 - wyciek do zmiennej globalnej!
```
`with` traktuje obiekt jako oddzielny zakres leksykalny przez co w tym przypadku dochodzi do zadeklarowania zmiennej globalnej,
ponieważ silnik wykonał nieudane wyszukiwanie LHS w zakresach wewnętrznych (`obj` i `foo`) oraz zakresie globalnym. 
Do takiej sytuacji dojdzie oczywiście tylko w non-strict mode.

#####Wpływ na wydajność

Jeżeli silnik natrafi na `eval()` lub `with()` podczas kompilacji kodu wychodzi z słusznego założenia, 
że cała jego wiedza na temat identyfikatorów może być niezgodna ze stanem podczas wykonywania kodu. 
Rezygnuje więc z optymalizacji, która i tak byłaby bezsensowna w obliczu zmian wprowadzanych przez te metody.

Wniosek: użycie `eval` lub `with` prowadzi do nieuchronnego spowolnienia działania programu, więc nie warto ich używać.