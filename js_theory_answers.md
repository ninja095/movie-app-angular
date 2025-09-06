
# JS: ответы на вопросы 
**Понятное дело, что подобное писать руками не целесообразно в наш век искусственного интеллекта!**

Ниже — кратко и по делу, с мини‑примерами и ссылками на первоисточники.

---

## 1) Распространение событий в JavaScript (Event Propagation)

**Фазы:**
1. **Capturing** (захват): событие идёт сверху вниз (от `window` к целевому элементу).
2. **Target**: событие достигает **целевого** элемента.
3. **Bubbling** (всплытие): идёт снизу вверх (от целевого элемента к `window`).

**Подписка:** `addEventListener(type, handler, options)`  
- `options.capture: true` — обработчик срабатывает на фазе **capturing**.  
- По умолчанию — на фазе **bubbling**.  
- Полезные флаги: `once`, `passive`, `signal` (для abort).

**Практика:**
- **Делегирование событий**: ставим один обработчик на контейнер, ловим события от множества дочерних элементов — эффективно и удобно для динамического DOM.
- **Остановка распространения**: `event.stopPropagation()`; чтобы остановить текущую цель и остальных на этом же элементе — `event.stopImmediatePropagation()`.
- **Shadow DOM**: учитывайте `event.composedPath()` и флаг `composed`, не все события «проходят» сквозь границы shadow root.

**Мини‑пример (capturing/bubbling):**
```html
<div id="outer">
  <div id="inner">click me</div>
</div>
<script>
  const log = (msg) => console.log(msg);

  outer.addEventListener('click', () => log('outer bubble'));
  inner.addEventListener('click', () => log('inner bubble'));

  outer.addEventListener('click', () => log('outer capture'), { capture: true });
  inner.addEventListener('click', () => log('inner capture'), { capture: true });
</script>
```
Клик по `#inner` даст порядок: `outer capture` → `inner capture` → `inner bubble` → `outer bubble`.

**Мини‑пример (делегирование):**
```html
<ul id="list">
  <li data-id="1">One</li>
  <li data-id="2">Two</li>
</ul>
<script>
  list.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li || !list.contains(li)) return;
    console.log('Clicked id =', li.dataset.id);
  });
</script>
```

**Документация:**  
- MDN: [Event bubbling and capture](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture)  
- MDN: [`addEventListener` options](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
- MDN: [`Event.composedPath()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath)

---

## 2) Promise, обработка асинхронности и роль Event Loop

**Что такое Promise:** объект-обёртка над асинхронной операцией. Имеет состояния:
- `pending` → может перейти в
- `fulfilled` (успех, значение доступно) или `rejected` (ошибка).  
Состояние «замораживается» (settled) один раз.

**Методы цепочки:**  
- `.then(onFulfilled, onRejected)`  
- `.catch(onRejected)`  
- `.finally(onFinally)` — вызывается всегда (не меняет значение/ошибку).

**Статические методы:** `Promise.resolve/reject`, `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`.

**Мини‑пример:**
```js
const p = new Promise((res, rej) => {
  setTimeout(() => res(42), 100);
});

p.then(v => v * 2)
 .then(v => console.log(v)) // 84
 .catch(err => console.error(err))
 .finally(() => console.log('done'));
```

**Альтернатива для асинхронного кода — `async/await`:**
```js
const getData = () => Promise.resolve({ ok: true });

async function main() {
  try {
    const data = await getData(); // «синтаксический сахар» над промисами
    console.log(data.ok);
  } catch (e) {
    console.error('Oops:', e);
  }
}
main();
```

**Event Loop и очереди:**  
- **Tasks (macrotasks)**: `setTimeout`, `setInterval`, I/O, рендер-такты и т. п.  
- **Microtasks**: колбэки промисов (`.then/.catch/.finally`), `queueMicrotask`.  
Правило: после выполнения **каждой** macrotask движок **вычищает всю очередь microtasks**, что объясняет приоритет промисов над таймерами.

**Мини‑пример порядка выполнения:**
```js
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('microtask'));
console.log('sync');
// Порядок: "sync" -> "microtask" -> "timeout"
```

**Документация:**  
- MDN: [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)  
- MDN: [`Promise` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)  
- MDN: [Event loop, tasks, microtasks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop)

---

## 3) ООП: принципы и реализация в JavaScript

**ООП** — подход к проектированию программ с использованием объектов. Ключевые принципы:
- **Абстракция** — скрываем детали реализации, оставляем суть.
- **Инкапсуляция** — ограничиваем доступ к внутреннему состоянию (инварианты).
- **Наследование** — переиспользуем код через иерархию типов.
- **Полиморфизм** — единый интерфейс, разные реализации.

**JS‑реализация: прототипная модель**
- Каждый объект имеет скрытую ссылку `[[Prototype]]` на другой объект (прототип).
- Функции‑конструкторы + `Function.prototype` исторически использовались для моделирования классов.
- Современный синтакссис `class` — **синтаксический сахар** над прототипами.

**Мини‑пример (классы, приватные поля, наследование):**
```js
class Animal {
  #name;                          // приватное поле (не доступно вне класса)
  constructor(name) { this.#name = name; }
  speak() { return `${this.#name} makes a noise.`; }
  get name() { return this.#name; } // геттер
}

class Dog extends Animal {
  speak() { return `${this.name} barks.`; } // полиморфизм: переопределение
  static isDog(x) { return x instanceof Dog; } // статический метод
}

const d = new Dog('Rex');
console.log(d.speak());           // "Rex barks."
console.log(Dog.isDog(d));        // true
```

**Мини‑пример (чистая прототипная модель):**
```js
const AnimalProto = {
  speak() { return `${this.name} makes a noise.`; }
};

const dog = Object.create(AnimalProto);
dog.name = 'Rex';
dog.speak = function() { return `${this.name} barks.`; };
console.log(dog.speak());
```

**Композиция vs наследование:** в JS часто предпочтительна **композиция** (функции‑миксины, объекты‑поведения), чтобы избегать жёстких иерархий.

**Особенности `this`:**
- `this` определяется *контекстом вызова*, а не местом объявления. Фиксируется через `bind/call/apply` или лексически стрелочными функциями.

**Документация:**  
- MDN: [Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)  
- MDN: [Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)  
- MDN: [Private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)

---

## 4) Что происходит при вводе URL до отрисовки страницы

**Высокоуровневый конвейер:**
1. **Парсинг URL** (схема, хост, порт, путь, query, hash). HSTS может принудить HTTPS.
2. **DNS‑резолюция** (возможны кеши ОС/браузера/провайдера; DNS‑over‑HTTPS/QUIC).
3. **Установка соединения**: TCP + TLS (для HTTPS). Возможны:
   - **ALPN** → выбор HTTP/1.1 vs **HTTP/2** vs **HTTP/3 (QUIC)**.
   - **TLS resumption**, **0‑RTT** (в HTTP/3) для ускорения повторных коннектов.
4. **Отправка HTTP‑запроса**; сервер отвечает заголовками/телом (стриминг возможен).
5. **Кеши**: memory/disk cache, Service Worker, CDN. Управление через `Cache-Control`, `ETag`, `Last-Modified`.
6. **Парсинг HTML** → **DOM**. Параллельно **preload scanner** находит `<link rel="preload">`, `<script>`, `<img>`, `<link rel="stylesheet">` и т. п.
7. **Загрузка и парсинг CSS** → **CSSOM**. CSS — **блокирующий рендер**.
8. **JS**: парсинг/выполнение на главном потоке; `<script defer>` выполняется после парсинга; `<script async>` — как загрузится; модули — `type="module"` (дефер по умолчанию), поддерживают **`<link rel="modulepreload">`**.
9. **Формирование Render Tree = DOM ⨂ CSSOM** → **Layout** (расчёт геометрии) → **Paint** → **Compositing**.
10. **Шрифты/изображения**: подстановка fallback, `font-display`, `srcset/sizes`, `fetchpriority`.
11. **Service Worker** (если установлен) может **перехватывать запросы** (offline/кеш‑стратегии).

**Технологии ускорения:**
- Сеть: **CDN**, **HTTP/2/3**, компрессия (**brotli**), **TLS resumption**, **keep‑alive**.
- Навигация: `<link rel="preconnect">`, `<link rel="dns-prefetch">`, `<link rel="preload">`, `<link rel="prefetch">`, `priority`/`fetchpriority` атрибуты.
- Рендер: **критический CSS**, `defer/async`, **code‑splitting**, кэширование (`ETag`, `Cache-Control`), **Service Worker**, **lazy‑loading** (`loading="lazy"`), **responsive images** (`srcset`, `sizes`), **modulepreload**.
- Бандл: tree‑shaking, minify, gzip/br, ES‑модули, HTTP‑кеш.
- Метрики: **TTFB**, **FCP**, **LCP**, **CLS**, **INP** (Web Vitals).

**Мини‑примеры (ускорение):**
```html
<!-- Быстрый TCP/TLS и DNS -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- Явно укажем критичные ресурсы -->
<link rel="preload" href="/styles.css" as="style">
<link rel="preload" href="/main.mjs" as="script" crossorigin>

<!-- Модули и modulepreload -->
<link rel="modulepreload" href="/main.mjs">
<script type="module" src="/main.mjs"></script>

<!-- Изображения с приоритетом и responsive -->
<img src="hero-640.jpg" srcset="hero-1280.jpg 1280w, hero-1920.jpg 1920w" sizes="100vw" fetchpriority="high">
```

**Безопасность и междоменное взаимодействие:**
- **Same-Origin Policy (SOP)** ограничивает доступ к DOM/данным между разными источниками.
- **CORS** — контролируем доступ к ресурсам с других источников.
- **CSP** — политика безопасности контента против XSS/инъекций.
- **Cookies**: `Secure`, `HttpOnly`, `SameSite=Lax/Strict/None` (для трекинга/авторизации и CSRF‑защиты).
- **COOP/COEP/CORP** — изоляция и защита от атак/утечек (Spectre, cross‑process).  
- **Mixed Content** — запрет небезопасных ресурсов на HTTPS‑странице.
- **postMessage** и `BroadcastChannel` — безопасные каналы между окнами/фреймами.
- **Sandbox** для `<iframe>`.

**CORS мини‑пример:**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Документация:**  
- MDN: [CSSOM](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model) / [Critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path)  
- MDN: [`defer`/`async`](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises#async_and_await) / [modulepreload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/modulepreload)  
- MDN: [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) / [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) / [Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)  
- web.dev: [Preload, preconnect, prefetch](https://web.dev/articles/fast#prioritize-and-distribute-network-resources)  
- WHATWG HTML: [Parsing and DOM construction](https://html.spec.whatwg.org/#parsing)

---

**Полезно иметь под рукой:**
- MDN JavaScript Guide: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- MDN Web Performance: https://developer.mozilla.org/en-US/docs/Web/Performance
- Web Vitals: https://web.dev/vitals/
