##**Rozdział III - Obiekty**

####Składnia

Obiekt można utworzyć za pomocą deklaracji lub konstruktora.

Forma dosłowna (deklaracja):
```markdown
var myObj = {
  key: value
}
```
Konstruktor:
```markdown
var myObj = new Object();
myObj.key = value;
```
Obydwie formy prowadzą do tego samego rezultatu. Druga zmusza nas do pojedynczego dodawania właściwości przez co 
nie występuje w praktyce.

####Typ

Istnieje sześć podstawowych typów wbudowanych w JS:

+ `string`
+ `number`
+ `boolean`
+ `null`
+ `undefined`
+ `object`

Pamiętajmy, że proste tyt prymitywne (`string`, `number`, `boolean`, `null` oraz `undefined`) nie są same w sobie `object`.
`null` czasami jest mylony z obiektem z powodu buga metody `typeof null` zwracającej stringa `"object"`. W rzeczywistości
null jest typem prymitywnym.

Istnieje błędne przekonanie, że wszystko w JS jest obiektem. Nieprawda.

Jednak istnieje kilka podtypów obiektów, któe możemy nazywać złożonymi prymitywami. `function` jest podtypem obiektu
(wywoływalny obiekt). Funkcje są w JS obiektami 'pierwszej klasy', co oznacza, że są traktowane jak zwykłe obiekty. Kolejnym
podtypem obiektu są tablice.

#####Obiekty wbudowane

W skład listy obiektów wbudowanych wchodzi kilka pozycji, których nazwy wskazują na bezpośredni związek z typami prymitywnymi,
jednak ta relacja jest dużo bardziej skomplikowana.

+ `String`
+ `Number`
+ `Boolean`
+ `Object`
+ `Function`
+ `Array`
+ `Date`
+ `RegExp`
+ `Error`

Te obiekty przypominają w swoich cechach typy, a nawet klasy z innych języków (np. Java).

Jednak w JS są to tylko wbudowane funkcje. Każda z tych wbudowanych funkcji może być użyta jako konstruktor.
```markdown
var strPrimitive = "I am a string";
typeof strPrimitive; // "string"
strPrimitive instanceof String; // false

var strObject = new String("I am a string");
typeof strObject; // "object"
strObject instanceof String; // true

Object.prototype.toString.call(strObject); // [object String]
```
Wartość prymitywna `"I am a string"` nie jest obiektem, jest prymitywną wartością dosłowną i niezmienną. Aby wykonać na niej operacje,
takie jak sprawdzenie długości, pobranie pojedynczych znaków, itd, potrzebujemy obiektu `String`.