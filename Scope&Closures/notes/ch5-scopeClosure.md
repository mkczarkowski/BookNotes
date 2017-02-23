##Rozdział V - Zakres domknięcia

Domknięcia są czymś naprawdę powszechnym w JS, należy nauczyć się je rozpoznawać i wykorzystywać. Są one
naturalnym następstwem pisania kodu w oparciu o zakres leksykalny. 

####Sedno sprawy

Formalna definicja domknięcia: Z domknięciem mamy do czynienia, gdy funkcja ma możliwość zapamiętania i 
dostęp do zakresu leksykalnego, nawet kiedy jest ona wywoływana poza swoim zakresem leksykalnym.

```markdown
function foo() {
  var a = 2;
  
  function bar() {
    console.log(a); // 2
  }
  
  bar();
}

foo();
```
Czy mamy tutaj do czynienia z kwintesencją domknięcia? Nie do końca, głównie posługujemy się mechaniką
wyszukiwania w zakresie leksykalnym, co jest tylko (istotną) częścią tego co oferują domknięcia.

Funkcja `bar()` ma domknięcie na zakresie funkcji `foo()` (oraz pozostałymi zakresami, w których jest zagnieżdżona).
Domknięcie w tym przykładzie nie jest ani bezpośrednio widoczne, ani nie znajduje bezpośrednio wykorzystania.
```markdown
function foo() {
  var a = 2;
  
  function bar() {
    console.log(a);
  }
  
  return bar; 
}
var baz = foo();

baz(); // 2 - szanowni państwo, cóż za zacne domknięcie!
```
W powyższym przykładzie korzystamy z zakresu leksykalnego w ten sam sposób co w poprzednim przykładzie. Jednak
zwracamy funkcję `bar` jako wartość i przypisujemy do zmiennej `baz`. Po wywołaniu `baz()` dochodzi do wywołania 
zapisanej wewnątrz funkcji `bar()` (różnica polega jedynie na identyfikatorze).

Magia domknięcia w powyższym przykładzie pozwala na wykonanie `bar()` poza jej zadeklarowanym zakresem leksykalnym.
Po wykonaniu `foo()` moglibyśmy sądzić, że całość wewnętrznego zakresu poszła w niepamięć ze względu na gromadzenie nieużytków
przez silnik języka. Nie doszło do takiej sytuacji ponieważ `bar()` wykorzystuje ten zakres. Właśnie taka referencja do zakresu
jest nazywana domknięciem. W ten sposób w czasie wykonywania `baz()` nadal mamy dostęp do wartości `2` przypisanej do zmiennej `a` w zakresie `foo()`.
Jest to możliwe, mimo że funkcja jest wywołana poza zakresem leksykalnym powstałym w czasie pisania programu.
```markdown
function foo() {
  var a = 2;
  function baz() {
    console.log(a); // 2
  }
  bar(baz);
}
function bar(fn) {
  fn(); // domknięcie!
}
```
Przekazujemy wewnętrzną funkcję `baz` do `bar`, po czym wywołujemy ją jako parametr. W ten sposób korzystamy
z domknięcia na zakresie `foo()`, dzięki czemu mamy dostęp do wartości zmiennej `a`.

Podobną operację możemy wykorzystać nie wprost:
```markdown
var fn;
function foo() {
  var a = 2;
  function baz() {
    console.log(a);
  }
  fn = baz; // przypisanie
}

function bar() {
  fn(); // look ma, I saw closure!
}

foo();
bar(); // 2
```
Za każdym razem gdy przenosimy funkcje wewnętrzną poza zakres leksykalny zachowa ona referencję do zakresu, w którym
została pierwotnie zadeklarowana. Przy wywołaniu takiej funkcji możemy korzystać z domkniętych zakresów.

####Zastosowanie prakyczne

Poprzednie przykłady mają akademicki charakter i są skonstruowane do zilustrowania mechaniki domknięcia. W tym paragrafie
skupimy się na udowodnieniu jak powszechne domknięcia są w kodzie pisanym na co dzień.

```markdown
function wait(message) {
  
  setTimeout(function timer() {
    console.log(message);
  }, 1000);
}
wait("Witam domknięcie!");
```
Bierzemy funkcję wewnętrzną `timer` i przekazujemy ją jako argument do `setTimeout(...)`. `timer` posiada domknięcie
na zakresie `wait(...)` i w rzeczy samej zachowuje oraz korzysta z referencji do zmiennej `message`.

Za kulisami silnik korzysta z wbudowanej funkcjonalności metody `setTimeout(...)`. Metoda ta posiada referencję do parametru,
o przykładowej nazwie `func`. Silnik wywołuje tę funkcję, w naszym przypadku jest to `timer`, dzięki czemu jej referencje do zakresów
pozostają nietknięta. Klasyczne domknięcie.

Zobaczymy przykład z zastosowaniem jQuery:
```markdown
function setupBot(name, selector) {
  $(selector).click(function activator() {
    console.log("Activating: " + name);
  });
}

setupBot("Closure Bot 1", "#bot_1");
setupBot("Closure Bot 2", "#bot_2");
```
Kiedykolwiek i gdziekolwiek traktujesz funkcję (wykorzystujące własne zakresy leksykalne) jako wartości pierwszej klasy
i przekazujesz je dalej to na ogół korzystasz z domknięć. Wszelkie timery, obsługa zdarzeń, zapytania Ajax i wszelkie inne
zadania asynchroniczne wykorzystujące callbacki oparte są na domknięciach.

Często mówi się, że wzorzec IIFE (opisany w rozdziale trzecim) jest przykładem domknięcia. Zgodnie z opisaną tutaj definicją
nie można się z tym zgodzić ponieważ tego typu funkcje nie są wykonywane poza zakresem leksykalnym. Wartość zmiennej `a` jest
uzyskiwana za pomocą normalnego procesu wyszukiwania, a nie dzięki domknięciu. Jednak IIFE tworzą własne zakresy, które mogą
być (i bardzo często są) wykorzystywane w domknięciach.

####Pętle i domknięcie

Jednym z najpopularniejszych (wręcz kanonicznych) przykładów używanych do zaprezentowania
domknięć jest stara dobra pętla `for`. 

```
for (var i = 1; i <= 5; i++) {
  setTimeout(function timer(){
    console.log(i);
  }, i * 1000);
}
```
Uwaga: lintery często podkreślają użycie funkcji wewnątrz pętli for jako niepożądaną praktykę. Dopóki wiemy co robimy możemy
polegać na własnych umiejętnościach pamiętając o tym, że linter nie rozumie wszystkich subtelności zawartych w naszym kodzie.

Moglibyśmy się spodziewać, że powyższy przykład doprowadzi do wydrukowania liczb od `1` do `6` w odstępie 1 sekundy. Nic bardziej mylnego,
Dochodzi do pięciokrotnego wydrukowania liczby `6` w rzeczonym odstępie. Skąd takie zawirowanie? Mianowicie callback
uruchamia się dawno po zakończeniu wykonywania pętli (sytuacja wyglądałaby tak samo w przypadku delayu ustawionego na 0).
Z tego powodu wydrukowany zostaje finalna wartość iteratora równy 6.

Co zrobić, żeby otrzymać pierwotnie oczekiwany rezultat i doprowadzić do złapania każdej z wartości `i`? Zastanówmy się nad
działaniem zakresu leksykalnego, przy każdej iteracji dochodzi do ponownej deklaracji naszej funkcji i przypisania jej do tego samego
zakresu globalnego, który zawiera tylko jedno `i`. Przez to wszystkie funkcje zawierają referencję do tego samego `i`.

Potrzebujemy przebudowy przykładu, który pozwoli na efektywniejsze domknięcie zakresu. Spróbujmy do tego wykorzystać IIFE.
```markdown
for (var i = 1; i <= 5; i++) {
  (function(){
    setTimeout( function timer(){
      console.log(i);
    }, i * 1000 );
  })();
}
```
Niestety, to nie wystarczy - nadal otrzymujemy ten sam rezultat. Oczywiście zakres leksykalny zyskał rozbudowę. Każdy z callbacków
domyka swój zakres wewnątrz danej iteracji stworzony przez IIFE. Jedynym problemem jest fakt, że utworzony zakres jest... pusty.
Wystarczy stworzyć zmienną przechowującą aktualny stan i.
```markdown
for (var i = 1; i <= 5; i++) {
  (function(){
    var j = i;
    setTimeout( function timer(){
      console.log(i);
    }, j * 1000 );
  })();
}
```
Działa!

Można skorzystać z bardziej wyszukanego rozwiązania dającego ten sam rezultat:
```markdown
for (var i = 1; i <= 5; i++) {
  (function(j){
    setTimeout( function timer(){
      console.log(j);
    }, j * 1000 );
  })(i);
}
```
Z wykorzystaniem IIFE mogliśmy stworzyć zakres dla każdej iteracji, w którym mieliśmy dostęp do aktualnego stanu `i`.

####Wracając do zakresów blokowych

W rozdziale trzecim poznaliśmy deklarację zmiennej przy pomocy `let`, która tworzy zakres dla bloku. Jest to idealne rozwiązanie
dla problemu domykania każdej z iteracji pętli z poprzedniego paragrafu.
```markdown
for (var i = 1; i <= 5; i++) {
  let j = i; // zakres blokowy dla naszego domknięcia!
   setTimeout(function timer(){
     console.log(j);
   }, j * 1000 );
}
```
W ten sposób możemy zrezygnować z wykorzystania IIFE dzięki czemu nasz kod staje się bardziej zrozumiały.
Ale to nie wszystko! Deklaracja `let` ma specjalne zastosowanie w pętlach `for`, mianowicie dochodzi do deklaracji
zmiennej `i` przy każdej iteracji. 
```markdown
for (let i = 1; i <= 5; i++) {
  setTimeout(function timer(){
    console.log(i);
  }, i * 1000 );
}
```

####Moduły

Są inne wzorce, które wykorzystują możliwości domknięć lecz na pierwszy rzut oka wcale nie są zwiazane z callbackami.
Przyjrzyjmy się napotężniejszemu z nich: moduł.
```markdown
function CoolModule() {
  var something = "cool";
  var another = [1, 2, 3];
  
  function doSomething() {
    console.log(something);
  }
  
  function doAnother() {
    console.log(another.join("!"));
  }
  
  return {
    doSomething: doSomething,
    doAnother: doAnother
  };
}

var foo = CoolModule();

foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```
Taki wzorzec jest właśnie w Javascript nazywany modułem. Najpopularniejszym sposobem implementacji wzorca modułowego jest
często nazywane odkrywaniem modułu, jego wariacja jest widoczna powyżej.

`CoolModule()` to po prostu funkcja ale trzeba ją wywołać, aby powstała instancja naszego modułu. Bez wykonania funkcji zewnętrznej
nie doszłoby do powstania zakresu wewnętrznego przez co nie miałyby miejsca wykorzystane domknięcia. `CoolModule()` zwraca
obiekt oznaczony przez składnię literału obiektowego (ang. _object literal syntax_) `{ key: value, ... }`. Zwrócony obiekt ma
referencje do wewnętrznych funkcji modułu, a nie do samych zmiennych przechowywujących dane. W ten sposób zmienne pozostają ukryte i prywatne.
Możemy postrzegać zwrócony obiekt jako publiczne API dla naszego modułu. Aby otrzymać ten sam efekt moglibyśmy zrezygnować z zwracania
obiektu na rzecz zwrócenia samych funkcji wewnętrznych. W ten sam sposób działa biblioteka jQuery, której publicznym identyfikatorem
jest $, za którym kryją się zwracane nam funkcje.

Funkcje `doSomething()` i `doAnother()` mają domknięcie na wewnętrznym zakresie instancji naszego modułu (powstałego przy wywołaniu
`CoolModule()`). Kiedy transportujemy te funkcje poza ich zakres leksykalny za pomocą referencji we właściwościach zwracanego obiektu tworzymy
warunki do wykorzystania domknięć.

Upraszczając, istnieją dwa warunki do wykorzystania wzorca modułowego:

1. Musi istnieć zewnętrzna funkcja otaczająca wywołana przynajmniej raz (za każdym razem tworzy ona nową instancję modułu).
2. Funkcja otaczająca musi zwrócić przynajmniej jedną funkcję wewnętrzną, która będzie posiadała domknięcie na jej prywatnym zakresie.
Pozwala to na dostęp i modyfikację do prywatnego stanu funkcji otaczającej niezależnie od tego ile czasu minęło od jej wywołania.

Obiekt, który po prostu posiada funkcję jako właściwość nie jest tak naprawdę modułem. Obiekt zwrócony przez funkcję, który
posiada jedynie właściwości z danymi bez funkcji z domknięciem na zakresie otaczającym nie jest tak naprawdę modułem.

Jeżeli zależy nam na utworzeniu tylko jednej instancji modułu możemy zamienić deklarację naszej funkcji na IIFE:
```markdown
var foo = (function CoolModule() {
             var something = "cool";
             var another = [1, 2, 3];
             ... // dalsza część kodu naszego modułu
           })();
foo.doSomething(); // "cool"
foo.doAnother(); // 1 ! 2 ! 3
```
Jako, że moduły są tylko specjalną wersją funkcji możemy przekazać do nich parametry:
```markdown
function CoolModule(id) {
  function identify() {
    console.log(id);
  }
  
  return {
    identify: identify
  };
}

var foo1 = CoolModule("foo 1");
var foo2 = CoolModule("foo 2");

foo1.identify(); // "foo 1"
foo2.identify(); // "foo 2"
```
Kolejną niewielką lecz przydatną wariacją na wzorcu modułowym jest określenie zwracanego obiektu jako publiczne API:
```markdown
var foo = (function CoolModule(id) {
  function change() {
    // metoda modyfikująca publiczne API
    publicAPI.identify = identify2;
  }
  
  function identify1() {
    console.log(id);
  }
  
  function identify2() {
    console.log(id.toUpperCase());
  }
  
  var publicAPI = {
    change: change,
    identify: identify1
  };
  
  return publicAPI;
}("foo module");

foo.identify(); // "foo module"
foo.change();
foo.identify() // "FOO MODULE"
```
Utrzymując referencję do obiektu publicAPI możemy modyfikować instancję naszego modułu od wewnątrz, włączając dodawanie i odejmowanie
metod oraz właściwości wraz z zmianą ich wartości.