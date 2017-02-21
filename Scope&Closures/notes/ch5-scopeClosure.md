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