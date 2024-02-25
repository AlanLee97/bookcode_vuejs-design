/* 4.5 嵌套的 effect 与 effect 栈 */

const bucket = new WeakMap();
const tempData = {foo: true, bar: true};

const obj = new Proxy(tempData, {
  get(target, key){
    track(target, key);
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    trigger(target, key);
    return true;
  }
})

function track(target, key) {
  if(!activeEffect) return target[key];
  let depsMap = bucket.get(target);
  if(!depsMap) {
    depsMap = new Map();
    bucket.set(target, depsMap);
  }
  let fnSet = depsMap.get(key);
  if(!fnSet) {
    fnSet = new Set();
    depsMap.set(key, fnSet);
  }
  fnSet.add(activeEffect);

  activeEffect.deps.push(fnSet);
}

function trigger(target, key) {
  const depsMap = bucket.get(target);
  if(!depsMap) return;
  const fnSet = depsMap.get(key);
  // fnSet && fnSet.forEach(fn => fn());
  const effectsToRun = new Set(fnSet); // 解决无限循环问题
  effectsToRun && effectsToRun.forEach(fn => fn());
}

let activeEffect;
const effectStack = [];
function effect(fn){
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  }
  effectFn.deps = [];
  effectFn();
}

function cleanup(effectFn) {
  for(let i = 0; i < effectFn.deps.length; i++) {
    const fnSet = effectFn.deps[i];
    fnSet.delete(effectFn);
  }
  effectFn.deps.length = [];
}

let temp1, temp2;
effect(function effectFn1(){
  console.log('alan->', 'effectFn1 run');
  effect(function effectFn2(){
    console.log('alan->', 'effectFn2 run');
    temp2 = obj.bar;
  })
  temp1 = obj.foo;
})

setTimeout(() => {
  obj.bar = false
}, 1000)