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

Każda funkcja tworzy własny zakres zagnieżdżany w funkcji zewnętrznej. Zakres funkcji bar jest zagnieżdżony w zakresie funkcji foo itd. 

####Wyszykiwanie

Struktura i relatywne umiejscowienie zakresów tłumaczy mechanizm wyszukiwania identyfikatorów przez silnik. 
Silnik rozpoczyna poszukiwania od aktualnego zakresu, w przypadku braku efektów przechodzi o poziom wyżej, do zakresu zewnętrznego. 
Ten proces powtarza się, aż do natrafienia na zakres globalny. Wyszukiwanie kończy się po natrafieniu na pierwszy wynik.

Zaciemnianie zmiennej - używanie tego samego identyfikatora dla zmiennych w różnych zakresach. Wewnętrzny identyfikator zaciemnia
zewnętrzny (na niego silnik natrafi szybciej).

**Warto pamiętać:**
Zmienne globalne automatycznie stają się właściwościami globalnego obiektu (window dla przeglądarek), 
więc można się do nich odwoływać zarówno za pomocą nazwy leksykalnej jak i notacji kropkowej, np. `window.a`.

Zakres leksykalny dotyczy tylko identyfikatorów pierwszej klasy. W przypadku referencji do foo.bar.baz
wyszukiwanie zakresu leksykalnego ograniczyłoby się do odnalezienia identyfikatora foo. Kolejne działania byłyby zależne
od zasad dostępu do właściwości obiektu.

