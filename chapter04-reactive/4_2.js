/* 4.2 响应式数据的基本实现 */

const bucket = new Set();

const obj = new Proxy(data, {
  get(target, key){
    bucket.add(effect);
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    bucket.forEach(fn => fn());
    return true;
  }
})

function effect(){
  el.innerText = obj.text;
}

effect();