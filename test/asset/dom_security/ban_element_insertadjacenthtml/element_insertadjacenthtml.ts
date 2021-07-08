declare const element: Element;

// direct calls
element.insertAdjacentHTML('afterend', '<h1>hello world</h1>');

// indirect use
const insertAdjacentHTML = element.insertAdjacentHTML.bind(element);
insertAdjacentHTML('afterbegin', '<p></p>');

// other tests
const KEY = 'insertAdjacentHTML';
element[KEY]('afterbegin', '<p></p>');

element['insertAdjacentHTML']('beforebegin', '<p></p>');

element['insertAdjacentHTML']('beforeend', 'basic text without html');
