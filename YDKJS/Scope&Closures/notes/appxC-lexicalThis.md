## **Załącznik C - Lekykalne this**

Nazwa może być myląca, ponieważ ten załącznik nie dotyczy mechanizmu działania `this`, aczkolwiek opisuje jedno istotne
zagadnienie, które łączy się z tematyką zakresu leksykalnego.

ES6 wprowadziło nową formę składni do deklarowania funkcji nazywaną funkcjami strzałkowymi/grubymi strzałkami 
(ang. _arrow function/fat arrow_).
```markdown
var foo = a => {
  console.log(a);
};

foo(2);
```
Oprócz mniejszej liczby wyklepanych na klawiaturze słów musimy się liczyć z pewnymi innymi zmianami.
```markdown
var obj = {
  id: "awesome",
  cool: function coolFn() {
    console.log(this.id);
  }
};

var id = "not awesome";

obj.cool(); // awesome

setTimeout(obj.cool, 100); // not awesome
```
Problem polega na tym, że dochodzi do rozwiązania `this` w `cool()`. Najczęstszym sposobem na wybrnięcie z problemu jest
`var self = this;`.
```markdown
var obj = {
  count: 0,
  cool: function coolFn() {
    var self = this;
    
    if (self.count < 1) {
      setTimeout(function timer() {
        self.count++;
        console.log("awesome?");
      }, 100);
    }
  }
};

obj.cool(); // awesome?
```
Bez wchodzenia w szczególy, to rozwiązanie polega nam na wykorzystywanie mechaniki zakresu leksykalnego zamiast poprawnego
korzystania z wiązania `this`. `self` staje się identyfikatorem, którego wartość jest wyszukiwania w oparciu o zakres 
leksykalny i domknięcie i nie obchodzi go co dzieje się z wiązaniem `this`.

Dzięki ES6 i funkcjom strzałkowym możemy korzystać z mechaniki leksykalnego `this`.
```markdown
var obj = {
  count: 0,
  cool: function coolFn() {
    if (this.count < 1) {
      setTimeout( () => {
        this.count++;
        console.log("awesome?");
      }, 100);
    }
  }
};

obj.cool(); // awesome?
```

Jeżeli chodzi o wiązanie `this` to funkcje strzałkowe zachowują się odmiennie, niż tradycyjne deklaracje funkcji. Odrzucają
wszystkie dotychczasowe zwykłe zasady wiązania `this` i zamiast tego biorą wartość `this` najbliższego otaczającego zakresu
leksykalnego.

Dzięki czemu w powyższym przykładzie funkcja strzałkowa nie jest podatna na rozwiązanie `this` w nieprzewidywalny sposób, 
po prostu "dziedziczy' wiązanie `this` od funkcji `cool()`.

Niestety powyższa mechanika może być jednocześnie wadą i zaletą ponieważ ogranicza nasze możliwości związane z wiązaniem `this`. 
Na dodatek funkcje strzałkowe są zawsze anonimowe.

Dlatego, zdaniem Kyle'a, najodpowiedniejszym rozwiązaniem tego problemu jest właściwe użycie mechaniki `this`.
```markdown
var obj = {
  count: 0,
  cool: function coolFn() {
    if (this.count < 1) {
      setTimeout(function timer() {
        this.count++; // this jest bezpieczne, dzięki użyciu bind()
        console.log("more awesome");
      }.bind(this), 100); // rzeczone bind()!
    }
  }
};

obj.cool(); // more awesome
```
Niezależnie czy odpowiada nam mechanika leksykalnego `this` czy wolimy stare, dobre `bind()` musimy pamiętać, że funkcje strzałkowe
to nie tylko mniejsza ilość znaków niż tradycyjna deklaracja.

