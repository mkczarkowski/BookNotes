##**Załącznik A - Zakres dynamiczny**

W rozdziale drugim poruszyliśmy zagadnienie alternatywy dla zakresu leksykalnego jaką jest zakres dynamiczny.

Zakres dynamiczny jest bliskim kuzynem ważnego mechanizmu w JavaScript - słowa kluczowego `this`.

Zakres dynamiczny jest oparty na modelu, który jak nazwa wskazuje, jest dynamicznie ustalany w czasie wykonywania kodu,
a nie statycznie podczas pisania kodu jak w przypadku zakresu leksykalnego. 
```markdown
function foo() {
  console.log(a); // 2
}

function bar() {
  var a = 3;
  foo();
}
var a = 2;

bar ();
```
Zakres leksykalny w tej sytuacji wykonuje wyszukiwanie RHS wartości zmiennej `a` w zakresie `foo()` oraz otaczającym ją 
zakresie globalnym, stąd wartość `2`.

W przypadku zakresu dynamicznego silnik nie interesuje się tym jak i gdzie funkcje oraz zakresy są zadeklarowane, lecz
skąd są wywołane. Łańcuch zakresu jest oparty o stos wywołań, a nie zagnieżdżenie zakresów. 

Gdyby JavaScript posiadał zakres dynamiczny powyższy przykład zwróciłby `3`, a nie `2`.

Skąd taka sytuacja? Już tłumaczę, w przypadku gdy silnik nie odnalazłby wewnątrz `foo()` referencji do `a` zamiast przejść
do zakresu zewnętrznego wróciłby do miejsca, z którego funkcja `foo()` została wywołana, tj. `bar()` i stamtąd pobrałby wartość
dla `a`.

**Kluczowa różnica:** zakres leksykalny jest oparty o czas pisania, podczas gdy zakres dynamiczny o zakres wykonywania.
Dla zakresu istotne jest to gdzie funkcja została zadeklarowana, a dla zakresu dynamicznego skąd została wywołana.

Kończąc, dla `this` istotne jest to jak funkcja została wywołana. Udowadnia to bliski związek pomiędzy tym mechanizmem, a
zakresem dynamicznym. 