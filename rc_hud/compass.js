class Compass {
    constructor(canvas) {
        this.canvas = canvas;
        this.height = 80;
        this.width = 160;
        this.pos = 0;
        this.color = window.getComputedStyle(this.canvas)["color"];
    }
    resize(){
        let currentStyle = this.canvas.getBoundingClientRect();
        // console.log(this.canvas.id, currentStyle.width, currentStyle.height);
        this.height = currentStyle.height;
        this.width = currentStyle.width;
        this.draw();
    }
    set value(val){
        this.pos = Math.max(0, Math.min(360, Math.round(val)));
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
}
