##**Rozdział II - `this` All Makes Sense Now!**

####Call-site

Aby zrozumieć wiązanie `this`, należy zrozumieć call-site: jest to lokalizacja w kodzie gdzie doszło
do wywołania funkcji (nie mylić z miejscem deklaracji). Musimy przeanalizować call-site aby odpowiedzieć na pytanie:
na co wskazuje `this`?

Ważne jest to, aby brać pod uwagę call-stack (stos funkcji, który został wywołany aby dotrzeć do obecnego momentu wykonania).
Call-site, który nas interesuje znajduje się **w** wywołaniu **przed** obecnie wykonywaną funkcją.
```markdown
function baz() {
  // call-stack: 'baz'
  // call-site: zakres globalny
  
  console.log("baz");
  bar(); // call-site dla 'bar'
}

function bar() {
  // call-stack: 'baz' -> 'bar'
  // call-site: 'baz'
  console.log("bar");
  foo(); // call-site dla 'foo'
}

function foo() {
  // call-stack: 'baz' -> 'bar' -> 'foo'
  // call-site: 'bar'
  console.log("foo");
}

baz(); // call-site: dla 'baz'
```
Analizując powyższy przykład należy zwrócić uwagę na aktualny call-site (z stosu wywołań), to jedyne co się liczy dla
wiązania `this`.

Można sobie wizualizować call-stack za pomocą łańcucha wywołań funkcji w taki sam sposób jak zaprezentowany w powyższym
przykładzie. Niestety jest to męcząca metoda, do tego podatna na błędy. Innym narzędziem obserwowania stosu wywołań jest
skorzystanie z debuggera w przeglądarce. Wystarczy ustawić breakpoint na `foo()` albo wprowadzić wyrażenie debugger;
w pierwszej linii. W czasie wykonywania kodu debugger wykona pausę na danej linii kodu i zaprezentuje listę wywołanych dotąd
funkcji - czyli nasz call stack. Drugi element od góry na naszej liście to rzeczony call-site.

####Liczą się tylko zasady

Musimy skoncentrować naszą uwagę na tym gdzie `this` będzie wskazywało podczas wykonywania funkcji.

Należy przyjrzeć się call-site i dojść do tego, która z czterech zasad zostanie zastosowana. Pierw opiszemy każdą z czterech
zasad osobno, a następnie przedstawimy kolejność ich stosowania oraz sytuacje zastosowania kilku zasad jedocześnie.

#####Wiązanie domyślne

Pierwsza zasada pochodzi z najczęściej występującej sytuacji: samodzielnego wywołania funkcji. Zasada ta znajduje swoje
zastosowanie gdy żadna inna nie wchodzi w grę.
```markdown
function foo() {
  console.log(this.a);
}

var a = 2;

foo(); // 2
```
Pierwszą rzeczą godną odnotowania jest, że zadeklarowana zmienna w zakresie globalnym jest tożsama z właściwością obiektu
globalnego o tej samej nazwie. Nie są to kopie, ani nic z tych rzeczy - są one dokładnie tym samym. 
Dwie strony tej samej monety.

Przy wywołaniu `foo()`, `this.a` odwołuje się globalnej zmiennej `a`. Dlaczego? W tym przypadku dochodzi do zastosowania
wiązania domyślnego dla `this`, więc wskazany zostaje obiekt globalny.

Skąd wiemy, że zasada wiązania domyślnego obowiązuje w tym przypadku? Wystarczy spojrzeć na call-site, aby zaobserwować
sposób wywołania `foo()`. W naszym przykładzie, `foo()` jest wywołane za pomocą zwykłej referencji do funkcji. 
Żadna z zasad, które zostanie zaprezentowana nie obowiązuje w takiej sytuacji, więc mamy do czynienia z wiązaniem domyślnym.
 
Jeżeli znajdujemy się w `strict mode`, obiekt globaly nie jest dostępny dla wiązania domyślnego, więc `this` zostaje ustawione
dla `undefined`.
```markdown
function foo() {
  "use strict"
  
  console.log(this.a);
}

var a = 2;

foo(); // TypeError: Cannot read property 'a' of undefined
```
Subtelny, lecz istotny detal: mimo, że ogólne zasady wiązania `this` są całkowicie oparte o call-site, obiekt globalny
jest tylko dostępny, gdy **zawartość** foo() nie działa w `strict mode`. Stan `strict mode` call-site'u samego `foo()` jest
bez znaczenia.
```markdown
function foo() {
  console.log(this.a);
}

var a = 2;

(function(){
  "use strict"
  
  foo(); // 2
})();
```
Takie mieszanie `strict-mode` i non-`strict-mode` jest czymś niepożądanym. Cały program powinien znajdować się w jednym
trybie. Naruszenie tej zasady jest uzasadnione jedynie przy użyciu niektórych bibliotek wymagających subtelnej kompatybilności.

#####Niejawne wiązanie

Kolejna zasada do rozpatrzenia: czy call-site posiada kontekstowy obiekt, również nazywany obiektem posiadającym lub zawierającym
lecz te określenia mogą wprowadzać w błąd co do jego natury.
```markdown
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
};

obj.foo(); // 2
```
Po pierwsze zauważmy w jaki sposób `foo()` jest zadeklarowane i później dodane jako referencja właściwości do `obj`. 
Niezależnie od tego czy `foo()` zostało pierwotnie zadeklarowane w `obj` czy dodane później jako referencja (jak w tym przykładzie),
w żadnym z przypadków funkcje nie jest tak naprawdę posiadana przez `obj`.

Jednakże, call-site korzysta z kontekstu `obj`, aby uzyskać referencję do funkcji, więc śmiało można powiedzieć, że `obj`
posiada lub zawiera referencję do funkcji w momencie jej wywołania.

Niezależnie jak nazwiemy ten wzorzec, moment wywołania foo() jest poprzedzony referencją do obiektu `obj`. Gdy mamy 
do czynienia z obiektem kontekstowym dla referencji funkcji, zasada niejawnego wiązania mówi, że właśnie ten obiekt 
będzie wskazywany przez wiązanie `this`.
```markdown
function foo() {
  console.log(this.a);
}

var obj2 = {
  a: 42,
  foo: foo,
};

var obj1 = {
  a: 2,
  obj2: obj2,
};

obj1.obj2.foo(); // 42
```

######Niejawna strata

Jedną z największy frustracji związanych z wiązaniem `this` jest, gdy niejawne wiązanie zostaje utracone, co najczęściej 
oznacza odwołaniem się do wiązania domyślnego, z obiektem globalnym lub `undefined` w zależności od strict mode.
```markdown
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
};

var bar = obj.foo; // referencja do funkcji/alias

var a = "oops, global"; // 'a' jest jednocześnie właściwością obiektu globalnego

bar(); // "oops, global"
```
Mimo, że `bar` pozornie stanowi referencję do `obj.foo` tak naprawdę jest tylko referencją do samego `foo`. Poza tym,
interesuje nas call-site, a call-site bar() jest zwyczajnym, pojedynczym wywołaniem, więc zastosowane zostaje wiązanie domyślne.

Ten sam proces, co prawda bardziej subtelny, a jednocześnie częściej występujący i mniej oczekiwany zachodzi przy przekazaniu 
funkcji callback:
```markdown
function foo() {
  console.log(this.a);
}

function doFoo(fn) {
  // 'fn' to kolejna referencja do foo
  fn(); // call-site
}

var obj = {
  a: 2,
  foo: foo
};

var a = "oops, global";

doFoo(obj.foo); // "oops, global"
```
Przekazywanie parametru to nic innego jak niejawne przypisanie. Jako, że przekazujemy funkcję jest to niejawne przypisanie 
referencji, więc otrzymujemy taki sam rezultat jak w poprzednim przykładzie.

Taka sama sytuacja zachodzi w przypadku zastosowania funkcji wbudowanych.
```markdown
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
};

var a = "oops, global"; // 'a' jest jednocześnie właściwością obiektu globalnego

setTimeout(obj.foo, 100); // "oops, global"
```
Spójrzmy na tę pseudo-implementację setTimeout(), która jest jedną z wbudowanych funkcji środowiska JavaScript.
```markdown
function setTimeout(fn, delay) {
  // zaczekaj (w jakiś sposób) określony 'delay' milisekund
  fn(); // call-site
}
```
Sytuacja, w której nasze callbacki tracą swoje wiązanie `this` jest częsta, co zaprezentowały powyższe przykłady.
Inny sposób, w który this może nas zaskoczyć to wtedy, gdy funkcja, której przekazaliśmy callback celowo zmienia `this`
dla tego wywołania. Obsługa zdarzeń w popularnych bibliotekach JS jest czuła na wymuszanie, aby `this` wskazywało element DOM,
który wywołał zdarzenie. Czasami jest to przydatne rozwiązanie, czasami w żadnym wypadku. Niestety, rzadko możemy dokonać 
wyboru.
