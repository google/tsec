declare const doc: Document;

doc.execCommand('bold');
// @expected-diagnostic TS21228: [tsetse] [ban-document-execcommand] Do not use
//     document.execCommand('insertHTML'), as this can lead to XSS. Use
//     safedom.safeDocument.execCommandInsertHtml. Please use
//     go/tsconformance-yaqs if you have further questions.
doc.execCommand('insertHTML', false, 'XSS');

const x = doc.execCommand;
