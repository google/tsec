// Calls that should trigger an error
eval(`alert('uhoh');`);
window.eval(`alert('uhoh');`);

const test = {
  custom: eval
};
test.custom(`alert('uhoh');`);

const indirect = eval;
indirect(`alert('ouch')`);

(0, eval)(`alert('ouch')`);
window.eval(`alert('ouch')`);
globalThis.eval(`alert('ouch')`);

window['eval'](`alert('ouch')`);

const win = window;
win.eval(`alert('ouch')`);

declare const workerScope: WorkerGlobalScope;
workerScope.self.eval(`alert('ouch')`);
workerScope.self['eval'](`alert('ouch')`);

// Calls that shouldn't trigger an error

/** Class with a custom eval method */
export class CustomEval {
  eval(x: number): boolean {
    return false;
  }
}
const customEval = new CustomEval();
customEval.eval(1);

/** Class with a custom eval property that has its own method */
export class CustomEvalProperty {
  eval = {
    doStuff(x: number) {
      return false;
    }
  };
}
const customEvalProperty = new CustomEvalProperty();
customEvalProperty.eval.doStuff(1);
