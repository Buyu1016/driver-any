import { DriverAny } from "../dist/index.js";

// 
const driver = new DriverAny({
    pushComponentPosition: "top", // 默认步骤推动元素位于引导元素的哪个方位
    ifUsePushComponent: false, // 是否使用自己所编写的引导步骤元素
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
}, {
    domSelector: "#step2",
    stepDesc: "This is the descriptor for step two",
}]);

// 最后启动我们设定好的引导步骤
driver.start();