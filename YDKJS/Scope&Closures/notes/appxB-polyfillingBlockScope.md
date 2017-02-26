##**Załącznik B - Uzupełnianie (_ang. polyfilling_)  zakresu blokowego**

W rozdziale trzecim omówiliśmy zakres blokowy. Podaliśmy dwa przykłady generowania tego zakresu przed ES6, chodzi o `with`
i `catch`.
```markdown
{
 let a = 2;
 console.log(a); // 2
}
console.log(a); // ReferenceError
```
Co zrobić jeżeli chcielibyśmy stworzyć zakres blokowy bez wykorzystywania `let`?
```markdown
try{throw 2}catch(a) {
  console.log(a);
}

console.log(a);
```
To chyba najpaskudniejszy JavaScript jaki napisałem w tym roku, na dodatek nie mam pojęcia co się tam dzieje. 
Widzimy try/catch, która wymusza wyrzucenie błędu, który z kolei po prostu wypluwa wartość `2`. 
Następnie deklaracja zmiennej, która otrzymuje tę wartość znajduje się w klauzuli catch(a). Dzieci, nie róbcie tego same
w domu.

Jakby nie patrzeć jest to "poprawny" sposób na wykorzystanie zakresu blokowego w środowisku przed-ES6. Oczywiście nikt
nie będzie samodzielnie pisał czegoś takiego ale teraz wiemy jak radzą sobie narzędzia transpilujące kod ES6 do ES5.

####Traceur

Jest to projekt utrzymywany przez Google, który odpowiada za transpilowanie ES6 do ES5 (głównie!), aby kod pozostawał użyteczny
w starszych środowiskach. Komitet TC39 polega na tym narzędziu podczas testowania semantyki wprowadzanych zmian.

Co Traceur stworzyłby z naszego pierwszego przykładu?
```markdown
{
  try {
    throw undefined;
  } catch (a) {
    a = 2;
    console.log(a);
  }
}

console.log(a);
```

####Jawne kontra niejawne bloki

Przyjrzyjmy się tej alternatywnej formie użycia `let` nazywanej **blokiem `let`** lub **wyrażeniem `let`** (w przeciwieństwie do używanej
najczęściej **deklaracji `let`**).
```markdown
let (a = 2) {
  console.log(a); // 2
}

console.log(a); // ReferenceError
```
Zamiast niejawnie modyfikować istniejący blok, wyrażenie `let` tworzy własny jawny blok z przydzielonym zakresem.
Jawny blok jest dużo bardziej widoczny podczas refaktorowania kodu i tworzy czystszy kod, zmuszając do zadeklarowania 
wszystkich zmiennych na szczycie bloku. W ten sposób łatwiej zauważyć co należy do zakresu danego bloku, a co nie.

Jako wzorzec jest to idealne odbicie podejścia wielu ludzi, którzy samodzielnie wynoszą deklaracje swoich `var` na szczyt 
funkcji. Wyrażenie `let` wymusza takie działanie i dopóki nie jest nadużywane prowadzi do czystszego i czytelniejszego kodu.

Mamy tylko jeden problem, wyrażenie `let` nie jest częścią ES6. Traceur również nie obsługuje takiej formy kodu.

Możemy z tego wybrnąć dwojako, możemy przeformatować składnię zgodną z ES6 w następujący sposób:
```markdown
/*let*/ { let a = 2;
  console.log(a);
}

console.log(a);
```
Tylko po co to wszystko, w końcu mamy narzędzia, które rozwiązują nasze problemy. Naszą drugą możliwością jest tworzenie
jawnych wyrażeń let i przetranspilowanie ich za pomocą narzędzia do działającego kodu. Kyle Simpson stworzył **_let-er_**,
aby rozwiązać ten problem. Jest to transpilator, którego jedynym zadaniem jest odnajdywanie wyrażeń `let`. Z tego względu
należy go używać w pierwszej kolejności podczas transpilowania, aby Traceur/Babel mógł zająć się resztą. Let-er posiada flagę
konfiguracyjną --es6, której stan odpowiada za rodzaj powstałego kodu. Otrzymamy albo try/catch z es3 albo jawny blok z 
użyciem deklaracji let.

Repozytorium let-er'a: https://github.com/getify/let-er

####Wydajność

Szybka notka na temat wydajności try/catch i jednoczesna odpowiedź na pytanie: "Dlaczego nie użyć IIFE do stworzenia zakresu?"

Po pierwsze, wydajność try/catch jest mniejsza, ale nie oznacza to, że musi tak być/zawsze tak będzie. Od kiedy komitet TC-39
zatwierdziło wykorzystywanie try/catch przez oficjalny transpilator, Chrome pracuje nad usprawnieniem wydajności tego mechanizmu.

Po drugie, rywalizacja pomiędzy IIFE i try/catch nie jest sprawiedliwa ponieważ owinięcie fragmentu kodu przez funkcję zmienia
znaczenie takich wyrażeń jak `this`, `return`, `break` oraz `continue`. 
