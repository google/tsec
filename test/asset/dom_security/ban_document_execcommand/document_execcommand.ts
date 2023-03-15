declare const doc: Document;

doc.execCommand('bold');
doc.execCommand('insertHTML', false, 'XSS');

const x = doc.execCommand;
