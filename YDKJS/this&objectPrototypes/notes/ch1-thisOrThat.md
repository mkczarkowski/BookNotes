##**Rozdział I - `this` or That?**

Słowo kluczowe this należy do najbardziej niezrozumiałych mechanizmów w całym JavaScript.
Jest to specjalny identyfikator, który jest automatycznie zdefiniowany w zakresie każdej funkcji - na co wskazuje, 
to nie śniło się nawet największym filozofom (być może trochę przesadziłem).

Skoro jest to tak trudny do zrozumienia koncept to czy w ogóle warto poświęcać czas na jego opanowanie?
```markdown
function identify() {
  return this.name.toUpperCase();
}

function speak() {
  var greeting = "Hello, I'm" + identify.call(this);
}

var me = {
  name: "Kyle"
};

var you = {
  name: "Reader"
};

identify.call(me); // KYLE
identify.call(you); // READER

speak.call(me); // Hello, I'm KYLE
speak.call(you); // Hello, I'm READER
```
Ten fragment kodu pokazuje, że `identify()` oraz `speak()` mogą być zastosowane razem z wieloma obiektami
o różnych kontekstach (np. me i you) zamiast tworzyć oddzielną funkcję dla każdego z nich.

Zamiast korzystać z `this` moglibyśmy przekazać obiekty jako argumenty:
```markdown
function identify(context) {
  return context.name.toUpperCase();
}

function speak(context) {
  var greeting = "Hello, I'm " + identify(context);
}

identify(you); // READER
speak(me); // Hello, I'm KYLE
```
Jak widać `this` pozwala na bardziej eleganckie rozwiązanie poprzez niejawne przekazanie referencji do obiektu,
pozwalając na stworzenie czystszego kodu.

Im bardziej rozbudowana i skomplikowana jest aplikacja, tym trudniej przekazywać kontekst jako jawny parametr.

####Zamieszanie

Zanim rozpracujemy jak `this` działa musimy się zastanowić nad tym jak NIE działa. 
Na ogół z tym wiąże się większość kłopotów z opanowaniem tego mechanizmu.

#####Samo w sobie(ang. _itself_)

Pierwszym błędnym założeniem jest myślenie, że `this` odwołuje się do funkcji samej w sobie. 
Na to przynajmniej wskazuje gramatyka tego wyrażenia. 

W jakich sytuacjach takie działanie `this` miałoby sens? Najczęstszymi powodami byłaby zapewne rekurencja oraz rozwiązanie
obsługi zdarzenia (ang. _event handler_) po jego pierwszym wywołaniu. Początkujący programiści często myślą, że odwoływanie
się do funkcji jako do obiektu pozwala na przechowywanie stanu pomiędzy wywołaniami funkcji. Jest to możliwe i 
może mieć zastosowanie w niektórych sytuacjach ale książka skupi się na pokazaniu innych wzorców, które pozwalają
na lepsze przechowywanie stanu.

W międzyczasie zaprezentujemy dlaczego `this` wcale nie pozwala funkcji na odwoływanie się do samej siebie jak moglibyśmy
sądzić. W poniższym przykładzie spróbujemy śledzić ile razy doszło do wywołania `foo`.
```markdown
function foo(num) {
  console.log("foo: " + num);
  
  this.count++; // zwiększamy liczbę wywołań
}
foo.count = 0;

var i = 0;

for (i = 0; i < 10; i++) {
  if (i > 5) {
    foo(i);
  }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

console.log(foo.count); // 0 -- COOO?!
```
`foo.count` jest równe `0` mimo, że czterokrotne wyrażenia `console.log` wskazują, że `foo(`) było wywołane cztery razy.
Cały problem wynika ze zbyt dosłownej interpretacji `this`.

Podczas wykonywania kodu faktycznie doszło do stworzenia właściwości count dla obiektu `foo`. Jednakże referencja
`this.count` wewnątrz funkcji wcale nie wskazuje na tę funkcję, więc mimo zbieżności nazw właściwości mamy do czynienia z 
dwoma różnymi obiektami.

Warto zadać następujące pytanie: skoro inkrementowaliśmy inną właściwości `count`, to do jakiego obiektu należy? Jak się
okazuje doszło do utworzenia globalnej zmiennej `count`, która posiada wartość NaN. Tutaj z kolei nasuwa się
kolejne pytanie: "Skąd zmienna globalna i dlaczego jest równa NaN zamiast jakiejś prawidłowej wartości?"

W takiej sytuacji większość programistów zdecydowałoby się porzucić rozważania nt. mechaniki this i wprowadziłoby
jakieś cwane rozwiązanie pozwalające na wybrnięcie z problemu, np. poprzez stworzenie obiektu przechowującego właściwość
count.
```markdown
function foo(num) {
  console.log("foo: " + num);
  
  data.count++;
}

var data = {
  count: 0
}

var i;

for (i = 0; i < 10; i++) {
  if (i > 5) {
    foo(i);
  }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

console.log(data.count); // 4
```
Co prawda ten kod faktycznie rozwiązuje nasz problem ale jednocześnie ignoruje to co naprawdę nas interesuje - prawdziwe
zrozumienie mechaniki `this` - decydując się na powrót do strefy komfortu związanej z bardziej znajomym mechanizmem, tj. 
zakresem leksykalnym.

Referencja do obiektu funkcyjnego z jego wnętrza za pomocą `this` jest na ogół niewystarczająca.
Na ogół faktycznie przydaje się referencja oparta o leksykalny identyfikator (zmienną).
```markdown
function foo() {
  foo.count = 4;
}

setTimeout(function() {
  // funkcja anonimowa, nie może się odwołać do samej siebie
}, 10);
```
W pierwszej funkcji, będącej funkcją nazwaną (ang. _named function_), `foo` jest referencją, która może być użyta
do odwołania się do funkcji z jej własnego wnętrza.

W drugim przykładzie, callback przekazany do setTimeout(..) nie ma identyfikatora (jest to funkcja anonimowa), więc nie mamy 
możliwości odwołania się do obiektu tej funkcji.

**Warto wiedzieć:** Kiedyś korzystano z wycofanej referencji `arguments.callee`, która również wskazuje na obiekt
obecnie wykonywanej funkcji. Jest to na ogół jedyny sposób na odwoływanie się do funkcji anonimowej. Jednakże
najlepszą praktyką jest unikanie korzystania z funkcji anonimowych, zwłaszcza w sytuacji wymagającej samo-odwoływania się.
`arguments.callee` jest funkcjonalnością wycofaną, więc nie powinno się z niej korzystać.

Kolejnym sposobem na rozpracowanie naszego przykładu byłoby bezpośrednie odwoływanie się do `foo.count` z wnętrza `foo`.
```markdown
function foo(num) {
  console.log("foo: " + num);
  foo.count++
}

foo.count = 0;
// dalsza część przykładu

console.log(foo.count); // 4
```
Niestety i tym razem próbujemy obejść problem za pomocą zakresu leksykalnego zamiast zrozumieć mechanikę działania `this`.

Możemy zmusić `this` do wskazywania na obiekt funkcji `foo`.
```markdown
function foo(num) {
  console.log("foo: " + num);
  this.count++; // tym razem this faktycznie wskazuje na foo ze wzgędu na sposób wywołania samego foo
}
// dalsza część przykładu
for (i = 0; i < 10; i++) {
  if (i > 5) {
    foo.call(foo, i);
  }
}
console.log(foo.count); // 4
```
Tym razem udało nam się wykorzystać this, zamiast go unikać. W dalszej części książki umówione zostaną wykorzystywane techniki,
więc nie ma się czego bać. 

#####To zakres

Kolejnym mylnym przekonaniem jest przeświadczenie, że `this` odwołuje się do zakresu funkcji.
Mamy tu do czynienia z ciężkim orzechem do zgryzienia, ponieważ jest w tym trochę prawdy.

Warto zaznaczyć, że `this` NIE odwołuje się do leksykalnego zakresu funkcji. Prawdą jest, że zakres przypomina
obiekt z właściwościami dla każdego dostępnego identyfikatora. Jednakże obiekt zakresu nie jest dostępny z poziomu
kodu JavaScript. Jest to wewnętrzna część zaimplementowanego silnika.

Poniższy przykład prezentuje (nieudaną) próbę odwołania się do zakresu leksykalnego funkcji za pomocą `this`.
```markdown
function foo() {
  var a = 2;
  this.bar();
}
function bar() {
  console.log(this.a);
}
foo(); //ReferenceError: a is not defined
```
Ten fragment kodu posiada kilka błędów. Pierwszy to próba odwołania się do `bar()` za pomocą `this.bar()`.
Fakt, że ten kod działa (dzieje się tak tylko w przeglądarce, w node.js wyrzuca błąd `TypeError: this.bar is not a function`)
to efekt "szczęśliwego" wypadku. Najbardziej naturalnym sposobem na odwołanie się do `bar()` byłoby zwyczajne pominięcie
`this.` na rzecz leksykalnego odwołania się do identyfikatora.

Jednakże programista piszący taki kod próbuje wykorzystać this jako sposób na połączenie zakresów foo() i bar(), chcąc
umożliwić `bar()` dostęp do wewnętrznego zakresu `foo()`. Nie jest to możliwe.  Referencja `this` nie umożliwia podglądywania
zawartości zakresu leksykalnego. 

Za każdym razem gdy przyjdzie nam na myśl próba połączenia wyszukiwania w różnych zakresach leksykalnych za pomocą `this`,
należy pamiętać: takie połączenie nie istnieje.


####Czym jest `this`?

Mając za sobą wszystkie nieprawidłowe koncepcje dotyczące funkcjonowania `this`, zastanówmy się nad właściwym działaniem
tego mechanizmu. 

Stwierdziliśmy wcześniej, że `this` jest wiązaniem czasu wykonywania, a nie czasu pisania. Ma określony kontekst, zależny
od warunków wywołania funkcji. Wiązanie `this` nie ma nic do czynienia z tym gdzie funkcja została zadeklarowana, za to jest
całkowicie zależne od tego jak funkcja została wywołana.

Kiedy funkcja jest wywołana powstaje określony kontekst wykonania, rejestr aktywacji. Rejestr ten przechowuje informację
o tym gdzie funkcja została wywołana (stos wywołań), jak funkcja została wywołana, jakie parametry zostały przekazane itd.
Jednym z właściwości tego rekordu jest referencja `this` mająca swoje zastosowanie podczas wykonywania funkcji.

