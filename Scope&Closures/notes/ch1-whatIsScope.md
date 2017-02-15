##**Rozdział I - Czym jest zakres?**

Przechowywanie wartości i pobieranie ich ze zmiennych nadaje
programowi **stan** (eng. _state_).

**Zakres** (ang. _scope_) - zbiór zasad dotyczący przechowywania i wyszukiwania zmiennych.

####**Kompilator - teoria**

Javascript, mimo powszechnej opinii, jest językiem **kompilowanym**, a nie dynamicznym/interpretowanym.  

Na tradycyjny proces kompilacji składa się z:

1. Tokenizacja/Leksykalizacja
    
    + Tokenizacja: dzielenie łańcucha znaków na sensowne dla języka części, np.
      `var a = 3;` zostanie podzielone na: `var`, `a`, `=`, `3` oraz `;`.
    + Leksykalizacja: proces odpowiadający za decydowanie o tym czy dana część kodu jest oddzielnym tokenem.
    
2. Parsowanie
    
    + Pobiera strumień (tablicę) tokenów i tworzy z nich drzewo zagnieżdżonych elementów 
    reprezentujące gramatyczną strukturę programu. 
    Takie drzewo nazywa się drzewem składni abstrakcyjnej (ang. _abstract syntax tree, AST_).
    + Drzewo dla  `var a = 3;` wygląda następująco: najwyższy węzeł o nazwie VariableDeclaration, 
    z potomnymi węzłami `Identifier` (o wartości `a`) oraz `AssingmentExpression`, 
    które posiada potomka `NumericLiteral` (o wartości `3`).
    
3. Generowanie kodu

    + Proces przetwarzania AST na wykonywalny kod wraz z rezerwowaniem pamięci etc.
    + Natrafiając na `var a`, kompilator sprawdza czy zmienna istnieje w tym zakresie - 
    jeżeli tak deklaracja jest ignorowana, w innym przypadku zmienna zostaje zadeklarowana w zakresie.
    **Pamiętaj**: w przypadku dwukrotnej deklaracji zmiennej o tej samej nazwie z użyciem `let` 
    silnik wyrzuca `SyntaxError`.
    + Następnie kompilator przygotowuje kod obsługujący przypisanie wartości `3` do zmiennej `a`.
    + Podczas wykonywania kodu silnik sprawdzi czy zmienna a została zadeklarowana w zakresie. Jeżeli tak -
    przypisze jej wartość `3`, jeżeli nie - będzie szukał deklaracji w zakresach zewnętrznych.
    
Kod Javascript jest najczęściej kompilowany na kilka mikrosekund przed jego wykonaniem.

Podczas wykonywania kodu silnik wyszukuje deklaracji zmiennych przy pomocy zakresu.
Istnieją dwa rodzaje wyszukiwania operacji przypisania: LHS oraz RHS (lewostronne i prawostronne).

LHS sprawdza co jest celem przypisania i przypisuje mu nową wartość, RHS sprawdza co jest źródłem przypisania i pobiera jego wartość.

**Przykłady:**

`console.log(a);` - RHS, ponieważ interesuje nas wartość przypisana do zmiennej `a` przekazywana do `console.log()`.  
`a = 2;` - LHS, interesuje nas odszukanie zmiennej `a` w zakresie i przypisanie jej wartości `2`.
```
function foo(a) {
    console.log(a);
}
foo(2);
```
`foo(2)` - RHS, odszukiwanie wartości foo.  
`a = 2` - LHS, niejawne przypisanie wartości do parametru.  
 `console.log(a);` - RHS, odszukiwanie wartości przypisanej do parametru `a` oraz referencji do obiektu `console`.
 LHS, przypisanie wartości `2` do parametru `arg1` pierwotnej implementacji `log()`.
 
 **Quiz:**
 ```
function foo(a) {
var b = a;
return a + b;
}
var c = foo(2);
```
LHS: `var c`, `a = 2`, `var b`.  
RHS: `...foo(2)`, `... = a`, `a...`, `...b`.

####**Zagnieżdżony zakres**

Zakresy są zagnieżdżane wewnątrz siebie na tej samej zasadzie co bloki czy funkcje. Jeżeli zmienna nie może zostać
odnaleziona w aktualnym zakresie silnik sprawdza najbliższy zewnętrzny zakres kontynuując, aż do zakresu globalnego.

**Przykład:**

```
function foo(a) {
    console.log(a + b);
}
var b = 2;
foo( 2 ); // 4
```
Referencja RHS nie może zostać wykonana wewnątrz zakresu funkcji foo, 
ale jest to możliwe w zakresie zewnętrznym (globalnym).

####**Błędy**

Wyszukiwanie LHS oraz RHS inaczej reagują na brak wcześniejszego zadeklarowania zmiennej (non-strict mode).

```
function foo(a) {
 console.log(a + b);
 b = a;
}
foo(2);
```

Przy wywołaniu metody log() silnik wykonuje wyszukiwanie RHS dla wartości `b`. Zmienna nie została zadeklarowana w
aktualnym zakresie oraz zakresach zewnętrznych (w tym przypadku globalnym) co skutkuje wyrzuceniem `ReferenceError`.  

Zachowanie silnika w przypadku nieudanego wyszukiwania LHS jest zależne od aktywnego trybu. 

Non-strict mode: utworzenie zmiennej w zakresie globalnym.
Strict mode: wyrzucenie `ReferenceError` jak w przypadku wyszukiwania RHS.

Gdy po wyszukiwaniu RHS próbujemy wykonać działanie niemożliwe dla danej wartości (np. wywołanie dla wartości niefunkcyjnej, 
referencja właściwości dla null/undefined) silnik wyrzuca `TypeError`.