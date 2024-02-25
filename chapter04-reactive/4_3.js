/* 4.3 设计一个完善的响应系统 */

// bucket(obj => map(key => set))
//   ↳ obj => map
//             ↳ key => set
//                       ↳ effectFn
//                       ↳ effectFn
//                       ↳ ...
const bucket = new WeakMap();

const obj = new Proxy(data, {
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
}

function trigger(target, key) {
  const depsMap = bucket.get(target);
  if(!depsMap) return;
  const fnSet = depsMap.get(key);
  fnSet && fnSet.forEach(fn => fn());
}

let activeEffect;
function effect(fn){
  activeEffect = fn;
  fn();
}

effect(() => {
  console.log('alan->', 'effect run');
  el.innerText = obj.text;
});

setTimeout(() => {
  obj.hello = 'hello'
}, 1000)