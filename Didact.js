const Didact ={createELement,render}
//我的库名
//createElemnt 函数
/** @jsx Didact.createElement */
function createELement(type,props,...children){
    return {
        type,
        props:{
           ...props,
           children: children.map(child=>{
            typeof children===Object ? child : createTextElement(child)
           })
        }

    }
}
//使用剩余参数，使children成为数组
function createTextElement(text) {
 return{
    type:'TEXT_ELEMENT',
    props:{
        nodeValue:text,
        children:[],
    }
 }
}
//当children值为基本类型时，将其转换成某个特定类型的数组
//reactDOM.render函数
function createDOM(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode(element.props.nodeValue)
      : document.createElement(fiber.type);
  //object.keys返回一个包含对象所有键的数组,将element的props传入
  //const isProperty =key => key!=='children'
  Object.keys(element)
    .filter((item) => item !== "children")
    .forEach((prop) => (dom[prop] = fiber.props[prop]));
}

function render(element,container){
    nextUnitOfWork={
        dom: container,
        props:{
            children:[element]
        }
    }
}
//递归导致问题，将DOM树分成小部分异步执行
//并发模式
//这里是react中的reconciler
let nextUnitOfWork =null
function workloop(deadline) {
    let shouldYield =false
    while(nextUnitOfWork && !shouldYield){
        nextUnitOfWork =performUnitOfWork(
            nextUnitOfWork
        )//根据顺序执行一个个unit的work，在执行这一个unit的同时返回下一个unit
        shouldYield=deadline.timeRemaining() <1//在剩余时间不足时将控制权交给浏览器
    }
    requestIdleCallback(workloop)//控制权返回浏览器，进入等待的状态
}
requestIdleCallback(workloop)//在浏览器有空闲时间时执行workloop

//这里使用了requestcallback函数,对应的是react中使用的scheduler，功能就是在浏览器有剩余时间时通知我们
//mdn文档：插入一个函数，这个函数将在浏览器空闲时期被调用。
//这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。
function performUnitOfWork(fiber) {
  //add dom node;
  if (!fiber.dom) {
    fiber.dom = createDOM(fiber);
  }
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }
  //为除了根节点之外的fiber创造节点,并将该节点加到父节点的dom（创建的dom节点）上
  //create new fiber;
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
  //为所有子节点设置fiber,并为之设置parent，child，sibling属性
  //return next unit of work
  if (fiber.child) {
    return fiber.child;//有子节点的话就返回子节点作为下一个单元
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {//没有子节点的话就是sibling节点
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;//都没有的话向上遍历各个uncle节点直到根节点
  }
}


//每一个element就是一个fiber，每一个fiber就是一个任务单元




export default Didact