/* 4.4 分支切换与 cleanup */

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
function effect(fn){
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    fn();
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

effect(() => {
  console.log('alan->', 'effect run');
  el.innerText = obj.text;
});

// setTimeout(() => {
//   obj.hello = 'hello'
// }, 1000)