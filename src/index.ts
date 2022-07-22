import { IDriverConfig, IDriverStepConfig, TDriverDirection, TDriverAny } from "./types/index";

var DriverAny: TDriverAny = class {
    private stepsConfig: IDriverStepConfig[];
    private oMask: HTMLElement;
    private oSelector: HTMLElement;
    private oPushState?: HTMLElement;
    public resolveNext?: (value?: unknown) => void;
    public rejectClose?: (value?: unknown) => void;
    public resolvePrev?: (value?: unknown) => void;
    private pushComponentExtraInterval: number = 10;
    private currentStepIndex: number = 0;

    constructor(public config?: IDriverConfig) {
        this.stepsConfig = [];
        const [oMask, oSelector, oPushState] = this.init();
        this.oMask = oMask;
        this.oSelector = oSelector;
        this.oPushState = oPushState;
    };
    // 初始化
    private init(): [HTMLElement, HTMLElement, HTMLElement | undefined] {
        this.configInit();
        // 需要一个遮盖层Dom
        const oMask = this.maskInit();
        const oSelector = this.selectorInit();
        let oPushState: HTMLElement | undefined;
        if (this.config?.ifUsePushComponent) {
            oPushState = this.pushComponentInit();
        }
        return [oMask, oSelector, oPushState];
    };

    // 配置引导步骤
    public configurationSteps(stepsConfig: IDriverStepConfig[]) {
        this.stepsConfig = stepsConfig;
        if (!this.config?.ifUsePushComponent) {
            // 说明用户采用自己的编写的组件, 我们需要对其进行处理
            this.customizedPushComponentInit();
        }
    };

    // 开始执行引导步骤
    public start() {
        // 第一次引导肯定要打开遮罩层级
        this.openMask();
        // 特殊情况就是this.stepsConfig为空的情况
        if (this.stepsConfig.length === 0) return;
        disableScrollBar();
        // 按照顺序执行引导步骤(感觉这里的处理类似于控制请求并发)
        const implement = () => {
            // 如果只有一步则直接下一步按钮变为完成按钮
            if (this.stepsConfig.length == 1) {
                const oNextBtn: HTMLButtonElement | null = document.querySelector(".driver-next-btn");
                oNextBtn && (oNextBtn.innerText = this.config?.finishButtonText as string);
            }
            // 当前步骤处于第一步时应该隐藏掉上一步按钮, 其余步骤应该根据用户配置决定是否显示上一步
            const oPrevBtn: HTMLButtonElement | undefined | null = this.oPushState?.querySelector(".driver-prev-btn");
            if (oPrevBtn) {
                if (this.currentStepIndex === 0) {
                    oPrevBtn.classList.remove("active");
                } else if (this.config?.ifShowPrevButton) {
                    oPrevBtn.classList.add("active");
                }
            }
            // 如果是倒数第一步则修改下一步按钮文字为完成
            const oNextBtn: HTMLButtonElement | null = document.querySelector(".driver-next-btn");
            if (this.currentStepIndex === this.stepsConfig.length - 1) {
                oNextBtn && (oNextBtn.innerText = this.config?.finishButtonText as string);
            } else {
                oNextBtn && (oNextBtn.innerText = this.config?.nextButtonText as string);
            }
            // 我认为应该每一次看currentIndex与this.currentStepIndex的差值就能决定应该触发上一步的回调函数还是下一步的回调函数
            const currentIndex = this.currentStepIndex;
            this.next(this.stepsConfig[this.currentStepIndex]).then(_ => {
                // 每次都要把上一步选中的元素的driver-dom-active类名去掉
                const oSelectorDom: HTMLElement | null = document.querySelector(this.stepsConfig[currentIndex].domSelector);
                oSelectorDom && oSelectorDom.classList.remove("driver-dom-active");
                if (this.config?.ifUsePushComponent) {
                    this.closePushComponent();
                } else {
                    // 在未使用默认推动时应进去除的用户自己使用的推动状态组件
                    const oCustomizedPushComponent: HTMLElement | null = document.querySelector(this.stepsConfig[currentIndex].customizedPushComponent as string);
                    oCustomizedPushComponent && domAddOrRemoveClass(oCustomizedPushComponent, "active", "remove");
                }
                // 看一下当前步骤是否为最后一步
                if (this.currentStepIndex === this.stepsConfig.length - 1) {
                    this.closeMask();
                    this.closeSelector();
                    // 清除暴露的resolveNext与rejectClose
                    this.resolveNext = undefined;
                    this.rejectClose = undefined;
                    this.resolvePrev = undefined;
                } else {
                    // 否则接着执行下一步
                    this.currentStepIndex ++;
                    implement();
                }
                // 触发回调规则(-1代表上一步, 1代表下一步, 0代表完成)
                const stepDiff = this.currentStepIndex - currentIndex;
                switch(stepDiff) {
                    case -1:
                        this.config?.onPrevCallback && this.config?.onPrevCallback(this.stepsConfig[this.currentStepIndex]);
                        break;
                    case 1:
                        this.config?.onNextCallback && this.config?.onNextCallback(this.stepsConfig[this.currentStepIndex]);
                        break;
                    case 0:
                        // 触发下一步回调与完成回调
                        this.config?.onNextCallback && this.config?.onNextCallback(this.stepsConfig[this.currentStepIndex]);
                        this.config?.onFinishCallback && this.config?.onFinishCallback();
                        enableScrollBar();
                        break;
                }
            }, _ => {
                // 失败表明用于点击了关闭引导步骤的按钮, 此时应该直接关闭遮罩层
                // 也可能是用户提供的选择器的元素不存在
                this.config?.onCloseCallback && this.config?.onCloseCallback();
                enableScrollBar();
                this.closeMask();
                this.openSelector();
                this.closePushComponent();
                if (!this.config?.ifUsePushComponent) {
                    if (this.currentStepIndex < 0) { // 校准数据
                        this.currentStepIndex = 0;
                    }
                    const oCustomizedPushComponent: HTMLElement | null = document.querySelector(this.stepsConfig[this.currentStepIndex].customizedPushComponent as string);
                    oCustomizedPushComponent && domAddOrRemoveClass(oCustomizedPushComponent, "active", "remove");
                    this.oSelector && domAddOrRemoveClass(this.oSelector, "active", "remove");
                }
            })
        }
        // 启动引导步骤
        implement();
    };

    // 引导下一步
    private next(config: IDriverStepConfig) {
        return new Promise((resolve, reject) => {
            const oSelectorDom: HTMLElement | null = document.querySelector(config.domSelector);
            // resolve应该取决于用户点击下一步按钮
            if (!oSelectorDom) return reject();
            // 需要拿到目前元素的宽高和位置并为元素增加relative定位提高z-index
            oSelectorDom.classList.add("driver-dom-active");
            const { offsetWidth, offsetHeight, offsetLeft, offsetTop } = oSelectorDom;
            // 更改oSelector元素的宽高与位置
            // 需要知道元素的padding;
            // this.config各个可选属性在现在都是必定存在默认值的
            if(!this.config) return reject();
            this.oSelector.style.padding = `${this.config?.selectPadding}px`;
            this.oSelector.style.width = `${offsetWidth}px`;
            this.oSelector.style.height = `${offsetHeight}px`;
            this.oSelector.style.left = `${offsetLeft - (this.config.selectPadding as number)}px`;
            this.oSelector.style.top = `${offsetTop - (this.config.selectPadding as number)}px`;
            this.openSelector();
            // 更改oPushState组件位置
            if (this.config.ifUsePushComponent && this.oPushState) {
                // 这一步要提前打开pushComponent, 要么后续无法计算其尺寸的其位置相关的
                this.openPushComponent();
                // 应该检测元素上当前是否有driver-desc开头的class, 如果有则进行清除操作
                this.oPushState.className = this.oPushState.className.replace(/driver-desc-\w+/g, "");
                domAddOrRemoveClass(this.oPushState, `driver-desc-${config.pushComponentPosition || this.config.pushComponentPosition}`, "add");
                // 如果用户使用了还需要看用户想要规定的提示框的位置
                // 感觉应该按照选中的那个元素的位置做计算
                computedTargetData(oSelectorDom, this.oPushState, config.pushComponentPosition || this.config.pushComponentPosition as TDriverDirection, this.config.selectPadding as number + this.pushComponentExtraInterval || this.pushComponentExtraInterval);
                // 修改步骤描述词
                const oPushDesc: HTMLButtonElement | null = this.oPushState.querySelector(".driver-desc");
                oPushDesc && (oPushDesc.innerText = config.stepDesc || "");
            } else {
                // 用户使用了自己的自定义推动状态组件
                if (config.customizedPushComponent) {
                    const oCustomizedPushComponent: HTMLElement | null = document.querySelector(config.customizedPushComponent);
                    if (oCustomizedPushComponent) {
                        // 开始处理
                        oCustomizedPushComponent.classList.add("active");
                        computedTargetData(oSelectorDom, oCustomizedPushComponent, config.pushComponentPosition || this.config.pushComponentPosition as TDriverDirection, this.config.selectPadding || 0);
                    }
                };
            }
            // 把resolve与reject放入
            this.resolveNext = resolve;
            this.resolvePrev = () => {
                // 回退一步并执行resolve
                this.currentStepIndex -= 2;
                resolve(undefined);
                // 这个还不能直接调用, 如果是最后一步则需要特殊处理
            };
            this.rejectClose = reject;
        });
    };
    /**
     * 初始化一些config配置
     */
    private configInit() {
        // 如果用户未传this.config先进行初始化操作
        this.config = this.config || {};
        const {
            maskClass,
            maskZIndex,
            selectClass,
            selectPadding,
            ifUsePushComponent,
            pushComponentPosition,
            closeButtonText,
            nextButtonText,
            prevButtonText,
            finishButtonText,
            ifShowCloseButton,
            ifShowNextButton,
            ifShowPrevButton,
            animation,
            pushComponentClass,
            ifClickMaskCloseStep,
            ifScrollPageWhenStepStart,
            onNextCallback,
            onPrevCallback,
            onFinishCallback,
            onCloseCallback,
        } = this.config;
        // 初始化默认配置的值
        this.config = {
            maskClass: maskClass || "",
            maskZIndex: maskZIndex || 100,
            selectClass: selectClass || "",
            selectPadding: selectPadding || 5,
            ifUsePushComponent: ifUsePushComponent || (ifUsePushComponent === false ? false : true),
            pushComponentPosition: pushComponentPosition || "bottom",
            closeButtonText: closeButtonText || "关闭",
            nextButtonText: nextButtonText || "下一步",
            prevButtonText: prevButtonText || "上一步",
            finishButtonText: finishButtonText || "完成",
            ifShowCloseButton: ifShowCloseButton || true,
            ifShowNextButton: ifShowNextButton || true,
            ifShowPrevButton: ifShowPrevButton || (ifShowPrevButton === false ? false : true),
            animation: animation || (animation === false ? false : true),
            pushComponentClass: pushComponentClass || "",
            ifClickMaskCloseStep: ifClickMaskCloseStep || (ifClickMaskCloseStep === false ? false : true),
            ifScrollPageWhenStepStart: ifScrollPageWhenStepStart ||  (ifScrollPageWhenStepStart === false ? false : true),
            onNextCallback: onNextCallback || (() => {}),
            onPrevCallback: onPrevCallback || (() => {}),
            onFinishCallback: onFinishCallback || (() => {}),
            onCloseCallback: onCloseCallback || (() => {}),
        }
    };
    /**
     * 初始化遮罩层
     */
    private maskInit(): HTMLElement {
        // 可能存在热更新造成之前的Dom遗留问题所以这一步做特殊处理, 沿用/创建
        const oMask: HTMLElement = document.querySelector(".driver-mask") || document.createElement("div");
        oMask.className = `driver-mask ${this.config?.maskClass || ''}`;
        oMask.style.zIndex = `${this.config?.maskZIndex || 100}`;
        if (this.config?.ifClickMaskCloseStep) {
            oMask.addEventListener("click", (event) => {
                event.stopPropagation();
                this.rejectClose && this.rejectClose();
            });
        }
        document.body.appendChild(oMask);
        return oMask;
    };
    /**
     * 打开遮罩层
     */
    private openMask() {
        // 如果存在则直接打开遮罩层
        if (this.oMask) {
            domAddOrRemoveClass(this.oMask, "active", "add");
        } else {
            // 如果没有则需要初始化遮罩层
            this.maskInit();
            this.openMask();
        }
    }
    /**
     * 关闭遮罩层
     */
    private closeMask() {
        domAddOrRemoveClass(this.oMask, "active", "remove");
    }
    /**
     * 初始化选中元素
     * @returns 
     */
    private selectorInit(): HTMLElement {
        // 初始化一个选中目前元素的背景Dom元素
        const oSelector: HTMLElement = document.querySelector(".driver-mask-select") || document.createElement("div");
        oSelector.className = `driver-mask-select ${this.config?.selectClass || ''}`;
        if (this.config?.animation) {
            domAddOrRemoveClass(oSelector, "driver-move", "add");
        }
        oSelector.style.zIndex = `${(this.config?.maskZIndex || 100) + 1}`;
        document.body.appendChild(oSelector);
        return oSelector;
    };
    /**
     * 打开选中元素
     */
    private openSelector() {
        if (this.oSelector) {
            domAddOrRemoveClass(this.oSelector, "active", "add");
        } else {
            this.selectorInit();
            this.openSelector();
        }
    }
    /**
     * 关闭选中元素
     */
    private closeSelector() {
        domAddOrRemoveClass(this.oSelector, "active", "remove");
    }
    /**
     * 初始化推动状态组件
     * @returns 
     */
    private pushComponentInit(): HTMLElement {
        // 如果之前存在这个Dom则沿用
        const oldElement: HTMLElement | null = document.querySelector(".driver-mask-push-state");
        if (oldElement) return oldElement;
        // 初始化一个推送状态的Dom元素
        const oPushState: HTMLElement = document.querySelector(".driver-mask-push-state") || document.createElement("div");
        oPushState.className = `driver-mask-push-state`;
        if (this.config?.animation) {
            oPushState.classList.add("driver-move");
        }
        const oDescText = document.createElement("div");
        oDescText.className = `driver-desc ${this.config?.pushComponentClass}`;
        oPushState.appendChild(oDescText);
        const oBtnContainer = document.createElement("div");
        oBtnContainer.className = "driver-btn-container";
        // 生成关闭按钮(可选)
        if (this.config?.ifShowCloseButton) {
            const oCloseBtn = createDom("button", "driver-close-btn", this.config.closeButtonText as string);;
            oCloseBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                this.rejectClose && this.rejectClose();
            });
            oBtnContainer.appendChild(oCloseBtn);
        }
        // 生成上一步按钮(可选)
        if (this.config?.ifShowNextButton) {
            const oPrevBtn = createDom("button", "driver-prev-btn", this.config.prevButtonText as string);
            oPrevBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                this.resolvePrev && this.resolvePrev();
            });
            oBtnContainer.appendChild(oPrevBtn);
        }
        // 生成下一步按钮(可选)
        if (this.config?.ifShowNextButton) {
            const oNextBtn = createDom("button", "driver-next-btn", this.config.nextButtonText as string);
            oNextBtn.addEventListener("click", event => {
                event.stopPropagation();
                this.resolveNext && this.resolveNext();
            });
            oBtnContainer.appendChild(oNextBtn);
        }
        oPushState.appendChild(oBtnContainer);
        document.body.appendChild(oPushState);
        return oPushState;
    };
    /**
     * 打开推动状态组件
     */
    private openPushComponent() {
        if (this.oPushState) {
            domAddOrRemoveClass(this.oPushState, "active", "add");
        } else {
            this.pushComponentInit();
            this.openPushComponent();
        }
    }
    /**
     * 关闭推动状态组件
     */
    private closePushComponent() {
        if (this.oPushState) {
            domAddOrRemoveClass(this.oPushState, "active", "remove");
        }
    }
    /**
     * 初始化用户自定义的推动状态组件
     */
    private customizedPushComponentInit() {
        this.stepsConfig.forEach(item => {
            if (item.customizedPushComponent) {
                const oCustomizedPushComponent: HTMLElement | null = document.querySelector(item.customizedPushComponent);
                if (oCustomizedPushComponent) {
                    oCustomizedPushComponent.classList.add("driver-customize-mask-push-state");
                }
            }
        })
    }
}

/**
 * 计算出目标与当前元素之间的位置关系并进行直接移动
 * @param target 目标元素
 * @param confirmTarget 引导步骤框位置
 * @param direction 方向
 * @param difference 误差值
 */
function computedTargetData(target: HTMLElement, confirmTarget: HTMLElement, direction: TDriverDirection, difference: number) {
    const { offsetHeight: th, offsetWidth: tw, offsetTop: tt, offsetLeft: tl } = target;
    const { offsetHeight: ch, offsetWidth: cw, style } = confirmTarget;
    let left: number = 0,
        top: number = 0;
    // TODO: 这里有Bug, 具体描述就是在第一次使用到cw或者ch是拿到的数值不正确
    switch (direction) {
        case "top":
            left = tl;
            top = tt - ch - difference;
            break;
        case "bottom":
            left = tl;
            top = tt + th + difference;
            break;
        case "left":
            left = tl - cw - difference;
            top = tt;
            break;
        case "right":
            left = tl + tw + difference;
            top = tt;
            break;
        default:
            break;
    }
    style.left = `${left}px`;
    style.top = `${top}px`;
}

/**
 * 为目标元素增加/移除某个类名
 * @param dom 目标元素
 * @param className class类名
 * @param type 操作方式
 */
function domAddOrRemoveClass(dom: HTMLElement, className: string, type: "add" | "remove") {
    dom.classList[type](className);
}

/**
 * 
 * @param domType 生成的dom类型
 * @param className dom携带类名
 * @param innerText dom的内容
 * @param event dom的事件类型
 * @param callback 事件触发回调
 */
function createDom(domType: string, className: string, innerText: string): HTMLElement {
    const oDom: HTMLElement = document.createElement(domType);
    oDom.className = className;
    oDom.innerText = innerText;
    return oDom;
}

/**TODO: 待做
 *  1. 在遮罩层开启后是否允许页面滚动 √
 *  2. 有可能步骤配置的选择器为string[]类型及一次选中多个元素
 */
/**
 * 启动滚动条
 */
function enableScrollBar() {
    domAddOrRemoveClass(document.body, "driver-body-disable", "remove");
}

/**
 * 关闭滚动条
 */
function disableScrollBar() {
    domAddOrRemoveClass(document.body, "driver-body-disable", "add");
}

window.DriverAny = DriverAny;
export default DriverAny;