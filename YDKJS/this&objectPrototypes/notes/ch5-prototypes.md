##Rozdział V - **Prototypy**

####`[[Prototype]]`

Obiekty w JS posiadają wewnętrzną właściwość nazwaną w specyfikacji `[[Prototype]]`, którajest po prostu referencją do innego obiektu. 
Praktycznie każdy obiekt otrzymuje non-`null`ową wartość dla tej właściwości w momencie utworzenia.
```markdown
var myObject = {
  a: 2,
};

myObject.a; // 2
```
Do czego używana jest referencja `[[Prototype]]`? W rozdziale 3 omówiliśmy sposób działania operacji `[[Get]]`, która jest
wywoływana podczas referencji do właściwości obiektu, np. `myObject.a`. Pierwszą operacją, którą wykonuje `[[Get]]` jest 
sprawdzenie czy obiekt posiada właściwość 'a', jeżeli tak - zostaje ona zwrócona.

Co się dzieje, jeżeli właściwość nie wchodzi w skład `myObject`? Tutaj do akcji wkracza `[[Prototype]]`.
`[[Get]]` podąża za łańcuchem `[[Prototype]]`, jeżeli nie może odnaleźć właściwości bezpośrednio w obiekcie.
```markdown
var anotherObject = {
  a: 2,
};

// stwórz obiekt połączony z 'anotherObject'
var myObject = Object.create(anotherObject);

myObject.a; // 2
```
Działanie `Object.create(..)` zostanie dokładniej opisane później, póki co załóżmy, że tworzy obiekt z połączeniem `[[Prototype]]`
do wybranego obiektu. Stworzyliśmy `myObject` połączony `[[Prototype]]` z `anotherObject`. Ma się rozumieć, że `myObject.a`
nie istnieje, a mimo to dostęp do właściwości kończy się sukcesem i zostaje zwrócona wartość `2`.
 
Jednakże, gdyby `a` nie zostało odnalezione w `anotherObject` jego łańcuch `[[Prototype]]` zostałby poddany dalszej konsultacji
w celu odszukania właściwości.

Ten proces trwa dopóki dopóki nazwa właściwości zostanie odnaleziona lub łańcuch `[[Prototype]]` zakończy się. Jeżeli właściwość
nie zostanie odnaleziona rezultatem `[[Get]]` będzie `undefined`.

#####`Object.prototype`

Gdzie tak właściwie kończy się łańcuch `[[Prototype]]`?

Górną granicą każdego zwykłego łańcucha `[[Prototype]]` jest wbudowany `Object.prototype`. Ten obiekt zawiera wiele 
powszechnych funkcjonalności używanych w JS, ponieważ wszystkie wbudowane obiekty JS 'pochodzą' od `Object.prototype`.

Do wyżej wymienionych funkcjonalności należą między innymi `.toString()` lub `.valueOf()`. W rozdziale 3, przedstawiliśmy
inne takie jak: `.hasOwnProperty()`. Inną funkcją pochodzacą z `Object.prototype`, która może być Wam nieznana jest 
`isPrototypeOf(..)`. Zostanie opisana w dalszej części notatek.

#####Ustawianie i zaciemnianie właściwości

W rozdziale 3 wspomnieliśmy o tym, że ustawianie właściwości obiektu jest bardziej skomplikowane, niż samo jej dodanie
lub zmiana wartości istniejącej właściwości.  
`myObject.foo = "bar";`
Jeżeli `myObject` posiadał już normalny akcesor danych dla właściwości nazwanej `foo` to operacja przypisania ograniczy się
do zmiany wartości.

Jeżeli `foo` nie jest obecne wewnątrz `myObject`, przemierzamy łańcuch `[[Prototype]]`, jak w przypadku operacji `[[Get]]`.
Jeżeli `foo` nie zostanie odnalezione wewnątrz łańcucha zostanie bezpośrednio dodane do `myObject` wraz z przypisaną wartością.

Jeśli `foo` jest obecne gdzieś wyżej w łańcuchu, zniuansowane (i poniekąd zaskakujące) działanie będzie towarzyszyło 
wyrażeniu `myObject.foo = "bar"`. 

Jeśli `foo` istnieje zarówno w `myObject` jak i na wyższym poziomie łańcucha `[[Prototype]]`, który zaczyna się na `myObject`
mamy do czynienia z cieniowaniem. Właściwość `foo` bezpośrednio w `myObject` cienuje każdą właściwość `foo`, która znajduje
się wyżej w łańcuchu. 

Przeanalizujemy teraz trzy scenariusze przypisania `myObject.foo = "bar"` gdy `foo` nie jest obecne wewnątrz `myObject` ale
zostaje odnalezione wyżej w łańcuchu `[[Prototype]]`:

1. Jeżeli zwyczajny akcesor danych właściwości nazwanej `foo` jest odnaleziony gdziekolwiek wyżej w łańcuchu `[[Prototype]]`
i nie jest odznaczony jako read-only (`writable:false`), nowa właściwość `foo` jest dodana wprost do `myObject`, skutkując
zacieniowaniem właściwości.
2. Jeżeli `foo` jest odnaleziona wyżej w łańcuchu `[[Prototype]]` i jest odznaczona jako read-only (`writable: false`) to
zarówno ustawienie istniejącej właściwości jak i stworzenie nowej jest niemożliwe. Jeżeli kod jest wykonywany w `strict mode`,
silnik wyrzuci błąd. Jeżeli nie, dojdzie do cichego zignorowania operacji przypisania. 
3. Jeżeli `foo` jest odnalezione wyżej w łańcuchu `[[Prototype]]` i jest setterem to zawsze dojdzie do wywołania settera.
