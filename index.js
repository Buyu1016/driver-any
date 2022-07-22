import DriverAny from './dist/index.js';

const driverAny = new DriverAny();

driverAny.configurationSteps([{
    domSelector: ".box1",
    stepDesc: "步骤一描述词"
}, {
    domSelector: ".box2",
    stepDesc: "步骤二描述词"
}, {
    domSelector: ".box3",
    stepDesc: "步骤三描述词"
}]);
driverAny.start();