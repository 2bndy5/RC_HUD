// Controller object for use on canvas element
class Slider {
    constructor(canvas, horizontal = true) {
        this.canvas = canvas;
        this.rect = this.canvas.getBoundingClientRect();
        this.height = horizontal ? 80 : 0;
        this.width = horizontal ? 0 : 80;
        this.pos = 0;
        this.horizontal = horizontal;
        this.color = window.getComputedStyle(this.canvas)["color"];
        this.stick = {
            x: 0, y: 0, radius: 0,
            manip: null // for shrink/swell of stick on manipulation
        };
        this.canvas.addEventListener('mousedown', this.mouseStart, false);
        this.canvas.addEventListener('mouseup', this.mouseEnd, false);
        this.canvas.addEventListener('mousemove', this.mouseMove, false);
        this.canvas.addEventListener('mouseleave', this.mouseEnd, false);
        this.canvas.addEventListener('touchstart', this.touchStart, false);
        this.canvas.addEventListener('touchmove', this.getTouchPos, false);
        this.canvas.addEventListener('touchend', this.touchEnd, false);
        this.canvas.addEventListener('touchcancel', this.touchEnd, false);
    }
    resize(){
        this.rect = this.canvas.getBoundingClientRect();
        // console.log(this.canvas.id, this.rect.width, this.rect.height);
        this.height = this.rect.height;
        this.width = this.rect.width;
        this.draw();
    }
    set value(val){
        this.pos = Math.max(-100, Math.min(100, Math.round(val)));
        this.draw();
    }
    get value(){
        return this.pos;
    }
    draw() {
        let ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        if (this.horizontal){
            // draw slider
            ctx.lineWidth = this.height / 3;
            ctx.moveTo(this.height / 4, this.height / 2);
            ctx.lineTo(this.width - this.height / 4, this.height / 2);
            ctx.stroke();
            // draw stick
            this.stick.radius = this.height * (this.stick.manip != null ? 0.35 : 0.3);
            this.stick.x = this.width / 2 + (this.pos / 200 * (this.width - this.stick.radius * 2));
            this.stick.y = this.height / 2;
        }
        else{
            // draw slider
            ctx.lineWidth = this.width / 3;
            ctx.moveTo(this.width / 2, this.width / 4);
            ctx.lineTo(this.width / 2, this.height - this.width / 4);
            ctx.stroke();
            // draw stick
            this.stick.radius = this.width * (this.stick.manip != null ? 0.35 : 0.3);
            this.stick.x = this.width / 2;
            this.stick.y = this.height / 2 + (this.pos / -200 * (this.height - this.stick.radius * 2));
        }
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.arc(this.stick.x, this.stick.y, this.stick.radius, 0, Math.PI * 2);
        let gradient = ctx.createRadialGradient(this.stick.x, this.stick.y, 0, this.stick.x, this.stick.y, this.stick.radius);
        gradient.addColorStop(0, '#f3f3f300');
        gradient.addColorStop(0.55, '#808080d0');
        gradient.addColorStop(0.55, '#f3f3f3');
        gradient.addColorStop(1, '#d5d5d5cc');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    mouseStart = e => {
        if (this.stick.manip == null){
            this.stick.manip = -1;
            this.getMousePos(e);
            e.preventDefault();// prevent canceling this event
        }
    }
    mouseMove = e => {
        if (this.stick.manip < 0){
            this.getMousePos(e);
            e.preventDefault();
        }
    }
    mouseEnd = e => {
        if (this.stick.manip < 0){
            this.stick.manip = null;
            this.value = 0;
        }
    }
    getMousePos = e => {
        const mouseX = ((e.pageX - this.rect.left) / this.width * 2 - 1) / ((this.width - this.stick.radius * 2) / this.width) * 100;
        const mouseY = ((e.pageY - this.rect.top) / this.height * -2 + 1) / ((this.height - this.stick.radius * 2) / this.height) * 100;
        this.value = this.horizontal ? mouseX : mouseY;
    }
    touchStart = e => {
        if (e.target == this.canvas){
            for (let touches of e.changedTouches)
            this.stick.manip = touches.identifier;
        }
        getTouchPos(e);
        e.preventDefault();// prevent canceling this event
    }
    touchEnd = e => {
        // this removes the canvas element from the page
        getTouchPos(e);
        if (e.target == this.canvas){
            this.stick.manip = null;
            this.value = 0;
        }
    }
    getTouchPos = e => {
        for (let touch of e.changedTouches) {
            let touchX = touch.clientX;
            let touchY = touch.clientY;

            if (touch.identifier == this.stick.manip || this.stick.manip == null){
                if ((touchX < this.rect.right && touchX > this.rect.left) && (touchY < this.rect.bottom && touchY > this.rect.top)) {
                    if (this.stick.manip == null)
                        this.stick.manip = touch.identifier;
                    touchX = (touchX / this.width * 2 - 1) / ((this.width - this.stick.radius * 2) / this.width) * 100;
                    touchY = (touchY / this.height * -2 + 1) / ((this.height - this.stick.radius * 2) / this.height) * 100;
                    this.value = this.horizontal ? touchX : touchY;
                }
            }
        }
    }
}// end canvas's slider object
