# React设计理念

>我们认为，React 是用 JavaScript 构建**快速响应**的大型 Web 应用程序的首选方式。它在 Facebook 和 Instagram 上表现优秀

**同步更新——>异步可中断的更新**

## react架构

* scheduler(调度器)调度任务优先级
* Reconciler(协调器)找出变化的组件
* renderer 将变化的组件渲染到页面上

![Image](react更新.jpg)

### reconciler

内部采用了fiber的数据结构

* class 组件
* props，state
* effects，生命周期
* key,ref,context
* react.lazy,错误边界
* concurrent mode，suspense

##### fiber

![Image](fiber.png)

>reactDOM=fiber
>fiber(纤程)，是协程的一种
>程序执行过程：协程，线程，进程；generator是js协程的实现

除了在DOM中工作，可以在别的环境中工作

### renderer

* built-in组件(div，span...)

可以在别的环境中工作（plugin）