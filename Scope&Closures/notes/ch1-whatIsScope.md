**--- PL ---**

Przechowywanie wartości i pobieranie ich ze zmiennych nadaje
programowi **stan** (eng. _state_).

**Zakres** (ang. _scope_) - zbiór zasad dotyczący przechowywania i odnajdywania zmiennych.

Javascript, mimo powszechnej opinii, jest językiem **kompilowanym**, a nie dynamicznym/interpretowanym.

Na tradycyjny proces kompilacji składa się z:

1. Tokenizacja/Leksykalizacja
    
    + Tokenizacja: dzielenie łańcucha znaków na sensowne dla języka części, np.
      `var a = 3;` zostanie podzielone na: var, a, =, 3 oraz ;.
    + Leksykalizacja: proces odpowiadający za decydowanie o tym czy dana część kodu jest oddzielnym tokenem.
    
2. Parsowanie
    
    + Pobiera strumień (tablicę) tokenów i tworzy z nich drzewo zagnieżdżonych elementów 
    reprezentujące gramatyczną strukturę programu. 
    Takie drzewo nazywa się drzewem składni abstrakcyjnej (ang. _abstract syntax tree, AST_).
    + Drzewo dla  `var a = 3;` wygląda następująco: najwyższy węzeł o nazwie VariableDeclaration, 
    z potomnymi węzłami Identifier (o wartości a) oraz AssingmentExpression, 
    które posiada potomka NumericLiteral (o wartości 3).
    
3. Generowanie kodu

    + Proces przetwarzania AST na wykonywalny kod wraz z rezerwowaniem pamięci etc.
    
Kod Javascript jest najczęściej kompilowany na kilka mikrosekund przed jego wykonaniem.