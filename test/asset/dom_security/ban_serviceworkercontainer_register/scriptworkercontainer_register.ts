declare const container: ServiceWorkerContainer;

// direct calls
container.register('https://example.com/script.js');

// indirect use
const reg = container.register.bind(container);
reg('https://evil.com/script.js');

// other tests
const KEY = 'register';
declare const url: string;
container[KEY](url);
