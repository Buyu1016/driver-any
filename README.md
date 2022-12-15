### 👨介绍/Why

🚀 Driver-any能够帮助你更加快速的自定义化的为你页面中添加引导步骤, 只需简单的配置步骤即可呈现想要的引导用户快速使用王咱的效果.

### 💻使用/Use

##### 引入样式文件

⭐ 在使用前你应该及时的引用来自**Driver-any**的样式文件, 该文件中涵盖着默认引导步骤所需要的样式.
```js
import "driver-any/dist/index.css"
```

##### 使用Driver-any

###### 🚀 简单使用
```js
import "driver-any/dist/index.css"
import { DriverAny } from "driver-any";

// 通过driver包中导出的DriverAny类产生一个实例
const driver = new DriverAny();

// 自定义引导步骤的每一步
driver.configurationSteps([{
    domSelector: "#step1", // 该步骤所引导的元素的选择器
    stepDesc: "This is the descriptor for step one", // 该步骤的步骤描述
    pushComponentPosition: "top" 
}, {
    domSelector: "#step2",
    stepDesc: "This is the descriptor for step two",
    pushComponentPosition: "right"
}]);

// 最后启动我们设定好的引导步骤
driver.start();
```

###### 🏂 更加自由的使用

```js
import { DriverAny } from "driver-any";

// 通过driver包中导出的DriverAny类产生一个实例
const driver = new DriverAny({
    pushComponentPosition: "top", // 默认步骤推动元素位于引导元素的哪个方位
    ifUsePushComponent: true, // 是否使用自己所编写的引导步骤元素
    ifClickMaskCloseStep: false, // 点击遮罩层是否可关闭
    animation: true, // 动画过渡效果
    onCloseCallback: () => {console.log("close");}, // 引导步骤关闭时触发的回调函数
    onFinishCallback: () => {console.log("finish");}, // 引导步骤完成时触发的回调函数
    onNextCallback: (item) => {console.log("下一步", item);}, // 引导步骤的下一步触发时触发的回调函数
    onPrevCallback: (item) => {console.log("上一步", item);}, // 引导步骤的上一步触发时触发的回调函数
});

// 自定义引导步骤的每一步
driver.configurationSteps([{
    domSelector: "#step1", // 该步骤所引导的元素的选择器
    stepDesc: "This is the descriptor for step one", // 该步骤引导的描述语
    customizedPushComponent: "#step1-form",// 使用自己所书写的推动引导步骤的元素的选择器
    pushComponentPosition: "top" // 该步骤元素位于引导元素的哪个方位
}, {
    domSelector: "#step2",
    stepDesc: "This is the descriptor for step two",
    customizedPushComponent: "#step2-form",
    pushComponentPosition: "right"
}]);

// 最后启动我们设定好的引导步骤
driver.start();
```

### 参数/Params

##### DriverAny
| 名称 | 注解 | 类型 | 默认值 |
| :-: | :-: | :-: | :-: |
| maskClass | 自定义遮罩层class名 | string \| undefined | "" |
| maskZIndex | 自定义遮罩层z-index | number | 100 |
| selectClass | 自定义选中元素背景板class名 | string \| undefined | "" |
| selectPadding | 自定义选中元素背景板padding | number | 5 |
| ifUsePushComponent | 是否采用默认推动组件状态 | boolean | true |
| pushComponentPosition | 提示推动下一步引导步骤的状态组件位置 | "top" \| "right" \| "bottom" \| "left" | "bottom" |
| closeButtonText | 关闭按钮的按钮文本 | string \| undefined | "关闭" |
| nextButtonText | 下一步按钮的按钮文本 | string \| undefined | "下一步" |
| prevButtonText | 上一步按钮的按钮文本 | string \| undefined | "上一步" |
| finishButtonText | 完成按钮的按钮文本 | string \| undefined | "完成" |
| ifShowCloseButton | 是否展示关闭按钮 | boolean \| undefined | false |
| ifShowNextButton | 是否展示下一步按钮 | boolean \| undefined | true |
| ifShowPrevButton | 是否展示上一步按钮 | boolean \| undefined | false |
| animation | 是否开启动画效果 | boolean \| undefined| true |
| pushComponentClass | 自定义推送状态组件的描述文本class名 | string \| undefined | "" |
| ifClickMaskCloseStep | 点击遮罩层是否可关闭引导 | boolean \| undefined | true |
| ifScrollPageWhenStepStart | 引导步骤时是否允许页面滚动(暂时只支持禁止滚动) | boolean | false |
| onNextCallback | 引导步骤触发下一步时触发的回调函数 | ```(step: IDriverStepConfig) => void``` \| undefined | () => {} |
| onPrevCallback | 引导步骤触发上一步时触发的回调函数 | ```(step: IDriverStepConfig) => void``` \| undefined | () => {} |
| onFinishCallback | 引导步骤触发完成时触发的回调函数 | ```() => void``` \| undefined | () => {} |
| onCloseCallback | 引导步骤触发关闭时触发的回调函数 | ```() => void``` \| undefined | () => {} |
