var controlsLayer = document.getElementById('controls-layer');
var cameraStream = document.getElementById('camera-stream');
var cameraStreamWrapper = document.getElementById('camera-stream-wrapper');
var speedController = document.getElementById("speed");
var turnController = document.getElementById("turn");
var speedSlider;
var turnSlider;
var joystickLayer = document.getElementById('joystick-layer');
var joyLayer;
var selectRemote = document.getElementById("selectRemote");
// prototype list of all data on any connected gamepads
// each item in list represents a gamepad (if any)
// each gamepad has all info about axis and buttons
var gamepads = [];
// avoid cluttering socket with duplicate data due to setInterval polling of gamepads
var prevArgs = [];

// Grab the speed and turning values and update the text as well as send them to the robot
function sendSpeedTurnValues(gamepadAxes = []) {
    let speed = null;
    let turn = null;
    if (gamepadAxes.length){ // use gamepad input
        speed = Math.round(gamepadAxes[0] * 100);
        turn = Math.round(gamepadAxes[1] * 100);
        speedSlider.value = speed;
        turnSlider.value = turn;
    }
    else if (Object.keys(joyLayer.joysticks).length){ // use joystick input(s)
        let vals = [];
        for (let joy in joyLayer.joysticks){
            vals.push(joyLayer.joysticks[joy].value);
            // console.log(vals[vals.length - 1]);
            vals[vals.length - 1]['left'] = joyLayer.joysticks[joy].rect.left;
        }
        // now set turn & speed accordingly
        if (vals.length > 1){
            speed = vals[(vals[1].left < vals[0].left ? 1 : 0)].x;
            turn = vals[(vals[1].left < vals[0].left ? 0 : 1)].y;
        }
        else {
            speed = vals[0].radius;
            turn = vals[0].theta;
        }
        speedSlider.value = speed;
        turnSlider.value = turn;
    }
    else{ // use slider input(s)
        if (speedSlider.stick.manip != null)
            speed = speedSlider.value;
        else{ // else at idle
            speedSlider.value = 0;
            speed = 0;
        }
        if (turnSlider.stick.manip != null)
            turn = turnSlider.value;
        else{ // else at idle
            turnSlider.value = 0;
            turn = 0;
        }
    }

    var args = [speed, turn];
    // only send data if it has changed
    if (prevArgs[0] != args[0] || prevArgs[1] != args[1]){
        prevArgs = args;
        // console.log("remote output = ", args[1], args[0]);
        // socket.emit('remoteOut', args);
    }
}

// Take the width/height of the camera feed and adjust the sliders accordingly
function adjustSliderSizes() {
    let baseRect = cameraStream.getBoundingClientRect();
    // controlsLayer.offsetTop = baseRect.bottom;
    // console.log("base Y:", baseRect.top);
    speedController.width = 80;
    speedController.height = Math.round(baseRect.height);
    turnController.width = Math.round(baseRect.width);
    turnController.height = 80;
    // console.log("new Cam dimensions:", Math.round(baseRect.width), 'x', Math.round(baseRect.height));
    speedSlider.resize();
    turnSlider.resize();
}

function initRemote(){
    speedSlider = new Slider(speedController, !speedController.className.includes("vertical"));
    turnSlider = new Slider(turnController, !turnController.className.includes("vertical"));
    joyLayer = new JoystickLayer(joystickLayer);
    // console.log("selection:", selectRemote.value);
    adjustSliderSizes();
    window.addEventListener('resize', adjustSliderSizes);

    // event listeners for connected gamepads
    window.addEventListener("gamepadconnected", function (e) {
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
    });
    window.addEventListener("gamepaddisconnected", function (e) {
        console.log("Gamepad disconnected from index %d: %s",
        e.gamepad.index, e.gamepad.id);
    });
    // because gamepads aren't handled with events
    window.setInterval(getGamepadChanges, 16);
}

// get data from physical gamepads
// Google's Chrome handles gamepads differently than others, so we implement a workaraound
function getGamepadChanges() {
    // do this here as it is needed for Chrome workaround
    gamepads = navigator.getGamepads();
    /*  according to the "standard" mapping scheme
     *  (compatible w/ xBox 360 & other xinput controllers):
     * axis[0] = left stick X axis
     * axis[1] = left stick Y axis
     * axis[2] = right stick X axis
     * axis[3] = right stick Y axis
     */
    let result = [];
    // only grab data from gamepad @ index 0
    if (gamepads.length) {
        if (gamepads[0] != null) {// Chrome specific workaround
            // if there is at least 3 axes on the gamepad
            if (gamepads[0].axes.length >= 3){
                // using a deadzone of +/- 4%
                if (gamepads[0].axes[1] > 0.04 || gamepads[0].axes[1] < -0.04){
                    result.push(gamepads[0].axes[1] * -1); // used for speed
                }
                else{ // axis is within deadzone
                    result.push(0);
                }
                if (gamepads[0].axes[2] > 0.04 || gamepads[0].axes[2] < -0.04) {
                    result.push(gamepads[0].axes[2]); // used for turn
                }
                else{ // axis is within deadzone
                    result.push(0);
                }
            }
        }
    }
    // result is empty if no gamepad was initialized
    // otherwise result = [speed, turn]
    sendSpeedTurnValues(result);
}
/*
// show gamepad button presses
// analog triggers have a preset threshold that make them behave like buttons
for (i = 0; i < gamepads.length; i++){
    for (j = 0; j < gamepads[i].buttons.length; j++) {
        var temp = gamepads[i].buttons[j].pressed;
        if (temp)
        console.log("gamepad[" + i + "], button[" + j + "] = " + temp);
    }
}
*/
