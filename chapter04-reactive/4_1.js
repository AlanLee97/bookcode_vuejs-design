/* 4.1 响应式数据与副作用函数 */

const obj = new Proxy(data, {
  get(target, key){
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    return true;
  }
})

// effect 函数的执行会直接或间接影响其他函数的执行，这时我们说 effect 函数产生了副作用
function effect(){
  el.innerText = obj.text;
}

effect();