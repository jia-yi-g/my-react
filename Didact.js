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
      ? document.createTextNode(fiber.props.nodeValue)
      : document.createElement(fiber.type);
  //object.keys返回一个包含对象所有键的数组,将element的props传入
  //const isProperty =key => key!=='children'
  Object.keys(fiber)
    .filter((item) => item !== "children")
    .forEach((prop) => (dom[prop] = fiber.props[prop]));
}

const isEvent=key=>key.startsWith("on")
const isProperty=key=>key!=="children"&&!isEvent(key)
const isNew=(prev,next)=>key=>prev[key]!==next[key]
const isGone=(prev,next)=>key=>!(key in next)
function updateDom(dom,prevProps,nextProps) {
  //改变,删除过去的事件监听器
  Object.keys(prevProps).filter(isEvent).filter(key=>!(key in nextProps)||isNew(prevProps,nextProps)(key))
  .forEach(name=>{
    const eventType=name.toLowerCase().substring(2)
    dom.removeEventListener(eventType, prevProps[name]);//参数为type和名称
  })
  //添加事件监听器
  Object.keys(nextProps).filter(isEvent).filter(isNew(prevProps,nextProps))
  .forEach(name=>{
    const eventType=name.toLowerCase().substring(2)
    dom.addEventListener(eventType,nextProps[name])
  })
  //移除旧的属性
  Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps,nextProps))
  .forEach(name=>{
    dom[name]=""
  })
  //改变或添加新属性
  Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps,nextProps))
  .forEach(name=>{
    dom[name]=nextProps[name]
  })
}



function commitRoot(){
  //add nodes to dom
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  wipRoot=null
}

function commitWork(fiber){
  if(!fiber){
    return 
  }
  let domParentFiber=fiber.parent
  while(!domParentFiber.dom){
    domParentFiber=domParentFiber.parent
  }
  const domParent=domParentFiber.dom
  if(fiber.effectTag==="PLACEMENT"&&fiber.dom!=null){
    domParent.appendChild(fiber.dom)
  }
  else if(fiber.effectTag==="DELETION"){
    domParent.removeChild(fiber.dom)
  }
  else if(fiber.effectTag==="UPDATE"&&fiber.dom!=null){
    updateDom(fiber.dom,fiber.alternate.props,fiber.props)
  }
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
function commitDeletion(fiber,domParent){
  if(fiber.dom){
    domParent.reconcileChildren(fiber.dom)
  }
  else{
    commitDeletion(fiber.child,domParent)
  }
}
function render(element,container){
    wipRoot={
        dom: container,
        props:{
            children:[element]
        },
        alternate: currentRoot,
    }
    deletions=[]//保存要删除的fiber
    nextUnitOfWork=wipRoot//work-in-progress树，防止为渲染完的app出现在屏幕上
}
//递归导致问题，将DOM树分成小部分异步执行
//并发模式
//这里是react中的reconciler
let nextUnitOfWork =null
let wipRoot=null 
let currentRoot=null
let deletions=null
function workloop(deadline) {
    let shouldYield =false
    while(nextUnitOfWork && !shouldYield){
        nextUnitOfWork =performUnitOfWork(
            nextUnitOfWork
        )
        shouldYield=deadline.timeRemaining() <1//在剩余时间不足时将控制权交给浏览器
    }
    if(!nextUnitOfWork&&wipRoot){
      commitRoot()
    }
    requestIdleCallback(workloop)//控制权返回浏览器，进入等待的状态
}
requestIdleCallback(workloop)//在浏览器有空闲时间时执行workloop

//这里使用了requestcallback函数,对应的是react中使用的scheduler，功能就是在浏览器有剩余时间时通知我们
//mdn文档：插入一个函数，这个函数将在浏览器空闲时期被调用。
//这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。
function performUnitOfWork(fiber) {
  const isFunctionComponent=fiber.type instanceof Function
  if(isFunctionComponent){
    updateFunctionComponent(fiber)
  }
  else{
    updateHostComponent(fiber)
  }
//判断是否是函数组件
  
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
function updateFunctionComponent(fiber){
  wipFiber=fiber
  hookIndex=0
  wipFiber.hooks=[]
  const children=[fiber.type(fiber.props)]
reconcileChildren(fiber.children)
}

//状态钩子
let wipFiber=null
let hookIndex=null
function useState(initial){
  oldHook=wipFiber.alternate&&wipFiber.alternate.hooks&&
  wipFiber.alternate.hooks[hookIndex]
  const hook={
    state: oldHook?oldHook.state:initial,
    queue:[]
  }
  //检查有无旧hooks
  const setState=action=>{
    hook.queue.push(action)
    wipRoot={
      dom: currentRoot.dom,
      props:currentRoot.props,
      alternate:currentRoot
    }
    nextUnitOfWork=wipRoot
    deletions=[]
  }
  //返回一个会引起re-render的函数
  const actions=oldHook?oldHook.queue:[]
  actions.forEach(action=>{
    hook.state=action(hook.state)
  })
  //运行actions
  wipFiber.hooks.push(hook)
  hookIndex++
  return[hook.state,setState]
}


function updateHostComponent(fiber){
  if(!fiber.dom){
    fiber.dom=createDOM(fiber)
  }
  reconcileChildren(fiber,fiber.props.children)
}
//这个函数用来对比新旧fiber树的差别
function reconcileChildren(wipFiber,elements){
  let index = 0;
  let oldFiber=wipFiber.alternate&&wipFiber.alternate.child
  let prevSibling = null;

  while(index<elements.length||oldFiber!=null){
    const element=elements[index]
    let newFiber=null
    const sameType=oldFiber&&element&&element.type==oldFiber.type
    if(sameType){
      //更新节点的属性
      newFiber={
        type:oldFiber.type,
        props:element.props,
        dom:oldFiber.dom,
        parent:wipFiber,
        alternate:oldFiber,
        effectTag:"UPDATE"//告诉renderer如何处理
      }
    }
    if(element&&!sameType){
      //增加节点
      newFiber={
        type:element.type,
        props:element.props,
        dom:null,//WTF is dom???????!!!!!!
        parent:wipFiber,
        alternate:null,
        effectTag:"PLACEMENT"
      }
    }
    if(oldFiber&&!sameType){
      //删除该节点
      oldFiber.effectTag="DELETION"
      deletions.push(oldFiber)
    }

  }
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
}


//每一个element就是一个fiber，每一个fiber就是一个任务单元
//reconcilation



export default Didact