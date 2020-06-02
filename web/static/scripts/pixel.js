class Pixel {
    constructor(x, y, r, g, b, panel) {
        this.x = x;
        this.y = y;
        this.id = `[${this.x}, ${this.y}]`
        this.r = r;
        this.g = g;
        this.b = b;
        this.modified = false;
        this.panel = panel;
        this.style = {
            background: `rgb(${this.r},${this.g},${this.b})`
        };
    }

    setColor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;

	var color = chroma.rgb(this.r, this.g, this.b).hex()

        this.modified = true;

        this.style = {
            background: color
        };
    }
}
