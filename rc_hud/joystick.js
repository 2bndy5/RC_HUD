// Controller object for use on canvas element
class Joystick {
    constructor(canvas, color = '#ff0000', radius = 80) {
        this.canvas = canvas;
        this.color = color;
        this.radius = radius;
        this.rect = this.canvas.getBoundingClientRect();
        this.height = this.radius * 2;
        this.width = this.radius * 2;
        this.stick = {
            x: 0,
            y: 0,
            angle: Math.PI / 2,
            radius: 0,
            color: "#f3f3f3"
        }
        this.draw();
    }
    get value() {
        return {
            "x": Math.round((this.stick.x - this.radius) / (this.radius / 2) * 100),
            "y": Math.round((this.stick.y - this.radius) / (this.radius / 2) * -100),
            "theta": Math.round((Math.abs(this.stick.angle / Math.PI) - 0.5) * -200),
            "radius": Math.round(this.stick.radius / this.radius * (this.stick.angle > 0 ? -200 : 200)),
        };
    }
    set value([x, y]) {
        if (x == null && y == null) {
            let joyLayer = document.getElementById('joystick-layer');
            if (joyLayer.hasChildNodes)
                joyLayer.removeChild(this.canvas);
        } else {
            this.stick.x = x;
            this.stick.y = y;
            this.stick.angle = Math.atan2(this.stick.y, this.stick.x);
            this.draw();
        }

    }
    draw() {
        this.stick.radius = Math.hypot(this.stick.x, this.stick.y);
        if (this.stick.radius > this.radius / 2) {
            this.stick.x = Math.cos(this.stick.angle) * this.radius / 2 + this.radius;
            this.stick.y = Math.sin(this.stick.angle) * this.radius / 2 + this.radius;
            this.stick.radius = this.radius / 2;
        } else {
            this.stick.x += this.radius;
            this.stick.y += this.radius;
        }
        // console.log("x:", this.stick.x, "y:", this.stick.y);
        let ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.beginPath();
        ctx.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5;
        // thumb stick limit
        ctx.beginPath();
        ctx.arc(this.radius, this.radius, this.radius * 0.975, 0, Math.PI * 2);
        ctx.lineWidth = this.radius * 0.05;
        ctx.stroke();
        ctx.globalAlpha = 1;
        // thumb stick glow
        ctx.beginPath();
        let gradient = ctx.createRadialGradient(this.stick.x, this.stick.y, 0, this.stick.x, this.stick.y, this.radius);
        gradient.addColorStop(0.05, this.color);
        gradient.addColorStop(0.75, "#f3f3f300");
        ctx.fillStyle = gradient;
        ctx.arc(this.stick.x, this.stick.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        // actual thumb stick
        ctx.beginPath();
        gradient = ctx.createRadialGradient(this.stick.x, this.stick.y, 0, this.stick.x, this.stick.y, this.radius * 0.5);
        gradient.addColorStop(0, '#f3f3f300');
        gradient.addColorStop(0.55, '#808080d0');
        gradient.addColorStop(0.55, '#f3f3f3');
        gradient.addColorStop(1, '#d5d5d5cc');
        ctx.fillStyle = gradient;
        ctx.arc(this.stick.x, this.stick.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class JoystickLayer {
    constructor(element, radius = 80){
        this.el = element;
        this.joysticks = {};
        this.radius = radius;
        this.el.addEventListener('touchstart', this.touchStart, false);
        this.el.addEventListener('touchmove', this.getTouchPos, false);
        this.el.addEventListener('touchend', this.touchEnd, false);
        this.el.addEventListener('touchcancel', this.touchEnd, false);
        this.el.addEventListener('mousedown', this.mouseStart, false);
        this.el.addEventListener('mouseup', this.mouseEnd, false);
        this.el.addEventListener('mousemove', this.mouseMove, false);
        this.el.addEventListener('mouseleave', this.mouseEnd, false);
    }
    addNewJoy(e){
        // create a new canvcas element
        let newL = document.createElement('canvas');
        // give it a class name
        newL.className = "joystick";
        // reposition & resize the new element accordingly
        newL.height = this.radius * 2;
        newL.width = this.radius * 2;
        let layerRect = e.target.getBoundingClientRect();
        if (e.type.includes("touch")){
            let touches = e.touches;
            for (let touches of e.touches){
                // console.log(touches);
                let touchX = touches.pageX - layerRect.left;
                let touchY = touches.pageY - layerRect.top;
                touchX = Math.max(this.radius, Math.min(layerRect.right - this.radius, touchX));
                touchY = Math.max(this.radius, Math.min(layerRect.bottom - this.radius, touchY));
                newL.style.top = (touchY - this.radius) + 'px';
                newL.style.left = (touchX - this.radius) + 'px';
            }
        }
        else{
            let touchX = e.pageX - layerRect.left;
            let touchY = e.pageY - layerRect.top;
            touchX = Math.max(this.radius, Math.min(layerRect.right - this.radius, touchX));
            touchY = Math.max(this.radius, Math.min(layerRect.bottom - this.radius, touchY));
            newL.style.top = (touchY - this.radius) + 'px';
            newL.style.left = (touchX - this.radius) + 'px';
        }
        // add new joystick's canvas element to triggering element as a child
        e.target.appendChild(newL); // add the new canvas element to the page
        let inheritedColor = window.getComputedStyle(e.target)["color"];
        // instantiate the joystick object on the new canvas (also does `Joystick.draw()`)
        // and save for later manipulations
        if (e.type.includes("touch")){
            // console.log("touches Total: " + e.touches.length);
            for (let touches of e.touches){
                // console.log("touch joystick added using id:", touches[i].identifier);
                this.joysticks[touches.identifier] = new Joystick(newL, inheritedColor);
            }
        }
        else
            this.joysticks['mouse'] = new Joystick(newL, inheritedColor);
    }
    touchStart = e => {
        this.addNewJoy(e);
        // console.log("joysticks:", joysticks, e.touches.length);
        // do manipulations
        this.getTouchPos(e);
        e.preventDefault();// prevent canceling this event
    }
    touchEnd = e =>{
        let touchIDs = [];
        for (let touch of e.touches)
            touchIDs.push(touch.identifier);
        for (let key in this.joysticks){
            if (!(key in touchIDs) || !touchIDs.length) {
                // found joystick artifact; now remove it
                this.joysticks[key].value = [null, null];
                delete this.joysticks[key];
            }
        }
        e.preventDefault();// prevent canceling this event
    }
    getTouchPos = e => {
        for (let touch of e.touches) {
            let touchX = touch.clientX;
            let touchY = touch.clientY;

            if (touch.identifier in this.joysticks){
                touchX = touch.pageX - this.radius - this.joysticks[touch.identifier].rect.left;
                touchY = touch.pageY - this.radius - this.joysticks[touch.identifier].rect.top;
                this.joysticks[touch.identifier].value = [touchX, touchY];
                // let newVal = this.joysticks[touch.identifier].value;
                // console.log("joystick value =", newVal);
            }
        }
    }
    mouseStart = e => {
        this.addNewJoy(e);
        e.preventDefault();
    }
    mouseEnd = e => {
        if ('mouse' in this.joysticks){
            this.joysticks['mouse'].value = [null, null];
            delete this.joysticks['mouse'];
        }
    }
    mouseMove = e => {
        if(e.buttons == 1 && (e.movementX || e.movementY)){
            let rect = this.joysticks['mouse'].rect;
            let mouseX = e.pageX - this.radius - rect.left;
            let mouseY = e.pageY - this.radius - rect.top;
            this.joysticks['mouse'].value = [mouseX, mouseY];
            // let newVal = this.joysticks['mouse'].value;
            // console.log("joystick value =", newVal);
        }
    }
}
