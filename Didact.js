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
      : document.createElement(element.type);
  //object.keys返回一个包含对象所有键的数组,将element的props传入
  Object.keys(element)
    .filter((item) => item !== "children")
    .forEach((prop) => (dom[prop] = element.props[prop]));
  element.props.children.foreach((node) => render(node, dom));
  container.appendChild(dom);
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
let nextUnitOfWork =null
function workloop(deadline) {
    let shouldYield =false
    while(nextUnitOfWork && !shouldYield){
        nextUnitOfWork =performUnitOfWork(
            nextUnitOfWork
        )
        shouldYield=deadline.timeRemaining() <1
    }
    requestIdleCallback(workloop)
}
requestIdleCallback(workloop)

function performUnitOfWork(nextUnitOfWork) {
    //TODO
}
//performUnitOfWork 函数不仅需要执行每一小块的任务单元，还需要返回下一个任务单元??





export default Didact