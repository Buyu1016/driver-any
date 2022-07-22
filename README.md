# Driver-Any

## what is driver-any?

Custom step guide library, you can customize the name, description, type, parameters, etc. of the step.

## how do i use

**Vue**

Please import it globally first ```import "driver-any/dist/index.css"```

```js
import DriverAny from 'driver-any';
onMounted(() => {
    const driver = new DriverAny({
        pushComponentPosition: "top",
        ifUsePushComponent: true,
        ifClickMaskCloseStep: false,
        animation: true,
        onCloseCallback: () => {console.log("close");},
        onFinishCallback: () => {console.log("finish");},
        onNextCallback: (item) => {console.log("next", item);},
        onPrevCallback: (item) => {console.log("prev", item);},
    });
    driver.configurationSteps([{
        domSelector: "#step1",
        stepDesc: "This is the descriptor for step one",
        customizedPushComponent: "#step1-form",
        pushComponentPosition: "top"
    }, {
        domSelector: "#step2",
        stepDesc: "This is the descriptor for step two",
        customizedPushComponent: "#step2-form",
        pushComponentPosition: "right"
    }]);
    // Start the bootstrap step
    driver.start();
});
```

## Parameter Description

🤞 Please see types/index.d.ts in the driver-any folder