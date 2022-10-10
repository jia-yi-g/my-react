//step 0
// const element = <h1 title="foo">Hello</h1>;
const element={
    type:'h1',
    props:{
        title:'foo',
        children:'Hello',
    }
}
//一个JSX元素就是一个有type和props等属性的对象，type表示了DOM节点的类型
 const container = document.getElementById("root");
// ReactDOM.render(element, container);
const node = document.createElement(element.type)
//更新DOM
//将props传入node
node.title=element.props.title
const text=document.createTextNode(element.props.children)
//将节点添加到父节点中
node.appendChild(text)
container.appendChild(node)


