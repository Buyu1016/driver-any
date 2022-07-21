export interface IDriverConfig {
    /**
     * 自定义遮罩层class
     * @default
     */
    maskClass?: string;
    /**
     * 自定义遮罩层z-index
     * @default 100
     */
    maskZIndex?: number;
    /**
     * 自定义选中元素背景板class
     * @default 
     */
    selectClass?: string
    /**
     * 自定义选中元素padding
     * @default 5
     */
    selectPadding?: number
    /**
     * 是否采用默认推动状态组件
     * @default true
     */
    ifUsePushComponent?: boolean;
    /**
     * 提示推动下一步状态组件的位置
     * @default "bottom"
     */
    pushComponentPosition?: IDriverDirection
    /**
     * 关闭按钮文本, 当主动传递的值为空字符串是会不显示该按钮
     * @default "关闭"
     */
    closeButtonText?: string;
    /**
     * 下一步按钮文本,  当主动传递的值为空字符串是会不显示该按钮
     * @default "下一步"
     */
    nextButtonText?: string;
    /**
     * 完成按钮文本
     * @default "完成"
     */
    finishButtonText?: string;
    /**
     * 是否展示关闭按钮
     * @default false
     */
    ifShowCloseButton?: boolean;
    /**
     * 是否展示下一步按钮
     * @default true
     */
    ifShowNextButton?: boolean;
    /**
     * 是否开始移动动画
     * @default true
     */
    animation?: boolean;
    /**
     * 自定义pushComponent组件描述文本类名
     * @default ""
     */
    pushComponentClass?: string;
    /**
     * 点击遮罩层是否可关闭引导
     * @default true
     */
    ifClickMaskCloseStep?: boolean;
    /**
     * 遮罩层开始时是否允许页面滚动
     * @default false
     */
    ifScrollPageWhenMaskStart?: boolean;
    /**
     * 步骤更改回调函数
     * @default () => {}
     */
    onNextCallback?: (step: IDriverStepConfig) => void;
    /**
     * 完成所有步骤回调函数
     * @default () => {}
     */
    onFinishCallback?: () => void;
    /**
     * 关闭步骤回调函数
     * @default () => {}
     */
    onCloseCallback?: () => void;
}

export interface IDriverStepConfig {
    /**
     * Dom选择器
     */
    domSelector: string
    /**
     * 步骤描述文本
     */
    stepDesc?: string
    /**
     * 自定义步骤确认框选择器, 如果您在建立改类是已经选用了默认pushComponent组件则该值无效
     */
    customizedPushComponent?: string
    /**
     * 每一个单独的步骤也可以配置确认框位置, 如果没有配置则采用全局中配置的位置
     */
    pushComponentPosition?: IDriverDirection,
    /**
     * 自定义参数, 用于辅助用户自定义操作
     */
    customParameters?: object
}

export type IDriverDirection = "top" | "bottom" | "left" | "right";