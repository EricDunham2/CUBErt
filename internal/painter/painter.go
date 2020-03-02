package painter

import (
	"github.com/lucasb-eyer/go-colorful"
	"../leds"
	"../logger"
	"time"
)

var (
	stop bool
)

func Transition(colors []string, method string, steps uint, stepDuration uint) {
	c1, _ := colorful.Hex(colors[0])
	c2, _ := colorful.Hex(colors[1])
	c3, _ := colorful.Hex(colors[2])
	c4, _ := colorful.Hex(colors[3])
	c5, _ := colorful.Hex(colors[4])
	c6, _ := colorful.Hex(colors[5])
	c7, _ := colorful.Hex(colors[6])
	c8, _ := colorful.Hex(colors[7])

	stop = false

	logger.Log("Starting Transistion Loop")

	var pixels []leds.Pixel
	var step = 0;
	var desc = false

	for ;; {

		if (stop) {
			logger.Log("Stopping Transistion Loop")
			return
		}

		time.Sleep(stepDuration * time.Millisecond)

		blend1 := c1.BlendRgb(c5, float64(step)/float64(steps)).Clamped()
		blend2 := c2.BlendRgb(c6, float64(step)/float64(steps)).Clamped()
		blend3 := c3.BlendRgb(c7, float64(step)/float64(steps)).Clamped()
		blend4 := c4.BlendRgb(c8, float64(step)/float64(steps)).Clamped()

		var top []leds.Pixel = BilinearGradient(blend1, blend2, blend3, blend4)
		var front []leds.Pixel = LinearGradient(blend1, blend2)
		var left []leds.Pixel = LinearGradient(blend2, blend3)
		var back []leds.Pixel = LinearGradient(blend3, blend4)
		var right []leds.Pixel = LinearGradient(blend4, blend1)
		var bottom []leds.Pixel = BilinearGradient(blend4, blend1, blend2, blend3)

		pixels = append(pixels, top...)
		pixels = append(pixels, front...)
		pixels = append(pixels, left...)
		pixels = append(pixels, back...)
		pixels = append(pixels, right...)
		pixels = append(pixels, bottom...)

		leds.Apply(pixels)

		if desc; step > 0 {
			step--
		} else if !desc; step < steps {
			if step == steps {
				desc = true
			} else {
				step++
			}
		}
	}
}

func BilinearGradient(c1 colorful.Color, c2 colorful.Color, c3 colorful.Color, c4 colorful.Color) []leds.Pixel {
	var pixels []leds.Pixel

	settings := leds.GetSettings()

	cols := settings.Cols
	rows := settings.Rows

	for row := 0; row < rows; row++ {
		blend5 := c1.BlendRgb(c2, float64(row)/float64(rows)).Clamped()
		blend6 := c3.BlendRgb(c4, float64(row)/float64(rows)).Clamped()

		for col := 0; col < cols; col++ {
			blend := blend5.BlendRgb(blend6, float64(col)/float64(cols)).Clamped()
			r,g,b := blend.RGB255()
			
			pixels = append(pixels, leds.Pixel{X: uint8(row), Y: uint8(col), R: r, G: g, B: b})
		}
	}

	return pixels
}

func LinearGradient(c1 colorful.Color, c2 colorful.Color) []leds.Pixel {
	var pixels []leds.Pixel

	settings := leds.GetSettings()

	cols := settings.Cols
	rows := settings.Rows

	for row := 0; row < rows; row++ {
		blend := c1.BlendRgb(c2, float64(row)/float64(rows)).Clamped()
		r, g, b := blend.RGB255()

		for col := 0; col < cols; col++ {
			pixels = append(pixels, leds.Pixel{X: uint8(row), Y: uint8(col), R: r, G: g, B: b})
		}
	}

	return pixels
}

func StopTransition() {
	stop = true
}
