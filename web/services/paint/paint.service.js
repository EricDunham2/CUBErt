class PaintService {
    cubeGradient(c1, c2, c3, c4, panel) {
        //this.gradientMode = "hsv"

        var pixels = this.panels[panel];
        var calcGradientX1 = chroma.scale([c1, c2]).domain([0, this.settings.rows - 1]).mode(this.gradientMode.toLowerCase());
        var calcGradientX2 = chroma.scale([c4, c3]).domain([0, this.settings.rows - 1]).mode(this.gradientMode.toLowerCase());

        Object.keys(pixels).forEach(row => {
            var x1 = calcGradientX1(row);
            var x2 = calcGradientX2(row);

            var calcGradientY = chroma.scale([x1, x2]).domain([0, this.settings.rows]).mode(this.gradientMode.toLowerCase());

            Object.keys(pixels[row]).forEach(col => {
                //var x3 = chroma.mix(x1,x2,col/32, this.gradientMode)
                var x3 = calcGradientY(col);
                //var x3 = chroma.blend(x1, x2, 'multiply');
                pixels[row][col].setColor(Math.round(x3._rgb[0]), Math.round(x3._rgb[1]), Math.round(x3._rgb[2]));
                //this.$forceUpdate();
            });
        });
        //this.gradientMode = "lch"
        this.$forceUpdate();
    }
}