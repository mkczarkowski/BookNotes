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
takie jak sprawdzenie długości, pobranie pojedynczych znaków, itd, potrzebujemy obiektu `String`. Na szczęście silnik
dokonuje automatycznej koercji prymitywnego `"string"` do obiektu `String`, gdy zachodzi taka potrzeba. Dzięki temu praktycznie
nigdy nie musimy jawnie tworzyć obiektu.
```markdown
var strPrimitive = "I am a string";

console.log(strPrimitive.length); // 13
console.log(strPrimitive.charAt(3)); // "m"
```
W obydwóch przypadkach wywołujemy metodę/właściwość na prymitywnym stringu, a silnik dokonuje automatycznej koercji. Taka sama
mechanika znajduje zastosowanie w przypadku `Number`, `Boolean` i ich prymitywnych odpowiedników.

`null` oraz `undefined` nie posiadają opakowujących obiektów, istnieją jedynie jako wartości prymitywne. Za to `Date` może zostać
stworzone jedynie za pomocą konstruktora i nie posiada prymitywnego odpowiednika.

####Zawartość

Jak wszyscy wiedzą obiekt składa się z wartości przechowywanych w specjalnych lokalizacjach nazywanych właściwościami.
Oczywiście to tylko abstrakcyjna konstrukcja, to gdzie przechowywane są same wartości zależy od implementacji silnika - 
nazwy właściwości zawierają referencje do komórek pamięci przechowujących wartości, które mogą być rozproszone.
```markdown
var myObject = {
  a: 2,
};

myObject.a; // 2
myObject["a"];
```
Aby uzyskać dostęp do wartości o lokalizacji `a` w `myObject` możemy skorzystać z operatora `.` lub operatora `[ ]`.
Składnia `.a` jest zwykle określana jako dostęp za pomocą właściwości, podczas gdy składnia `["a"]` to tak zwany dostęp za pomocą
klucza. Obydwa sposoby dają dostęp do tej samej lokalizacji przez co otrzymujemy tę samą wartość, `2`.

Zasadnicza różnica pomiędzy tymi operatorami dostępu polega na tym, że operator `.` wymaga nazwy właściwości zgodnej z 
`Identifier`, podczas gdy składnia `[".."]` przyjmuje jakiegokolwiek stringa kompatybilnego z UTF-8/unicode.