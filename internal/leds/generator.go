package leds

import (
	"github.com/lucasb-eyer/go-colorful"
	"../logger"
	"time"
)

var (
	stop bool
)

func Transition(colors []string, method string, steps uint, stepDuration uint) {
	StopTransition()

	stop = false

	c1, _ := colorful.Hex(colors[0])
	c2, _ := colorful.Hex(colors[1])
	c3, _ := colorful.Hex(colors[2])
	c4, _ := colorful.Hex(colors[3])
	c5, _ := colorful.Hex(colors[4])
	c6, _ := colorful.Hex(colors[5])
	c7, _ := colorful.Hex(colors[6])
	c8, _ := colorful.Hex(colors[7])

	logger.Log("Starting Transistion Loop")

	var pixels []Pixel
	var step uint = 0
	var desc = false

	for {
		if stop {
			logger.Log("Closing Transition Loop")
			return
		}

		blend1 := Blend(method, c1, c5, step, steps)
		blend2 := Blend(method, c2, c6, step, steps)
		blend3 := Blend(method, c3, c7, step, steps)
		blend4 := Blend(method, c4, c8, step, steps)

		var top []Pixel = BilinearGradient(blend1, blend2, blend3, blend4, method, 0)
		var front []Pixel = LinearGradient(blend1, blend2, method, 1)
		var left []Pixel = LinearGradient(blend2, blend3, method, 2)
		var back []Pixel = LinearGradient(blend3, blend4, method, 3)
		var right []Pixel = LinearGradient(blend4, blend1, method, 4)
		var bottom []Pixel = BilinearGradient(blend1, blend4, blend3, blend2, method, 5)

		pixels = append(pixels, top...)
		pixels = append(pixels, front...)
		pixels = append(pixels, left...)
		pixels = append(pixels, back...)
		pixels = append(pixels, right...)
		pixels = append(pixels, bottom...)

		Apply(pixels)

		if (desc && step > 0) {
			step--
		} else if (!desc && step < steps) {
			if step == steps {
				desc = true
			} else {
				step++
			}
		}

		time.Sleep(time.Duration(stepDuration) * time.Millisecond)
	}
}

func Blend(method string, c1 colorful.Color, c2 colorful.Color, step uint, steps uint) colorful.Color {
	var color colorful.Color

	switch method {
		case "rgb" :
			color = c1.BlendRgb(c2, float64(step)/float64(steps)).Clamped()
		case "hsv" :
			color = c1.BlendRgb(c2, float64(step)/float64(steps)).Clamped()
		case "lab" :
			color = c1.BlendRgb(c2, float64(step)/float64(steps)).Clamped()
		case "hsl" :
			color = c1.BlendRgb(c2, float64(step)/float64(steps)).Clamped()
		case "luv" :
			color = c1.BlendRgb(c2, float64(step)/float64(steps)).Clamped()
		default :
			return color
	}

	return color
}

func BilinearGradient(c1 colorful.Color, c2 colorful.Color, c3 colorful.Color, c4 colorful.Color, method string, offset int) []Pixel {
	var pixels []Pixel

	settings := GetSettings()

	cols := settings.Cols
	rows := settings.Rows

	for row := 0; row < rows; row++ {
		blend5 := Blend(method, c1, c2, uint(row), uint(rows))
		blend6 := Blend(method, c3, c4, uint(row), uint(rows))

		for col := 0; col < cols; col++ {
			blend := Blend(method, blend5, blend6, uint(col), uint(cols))
			r,g,b := blend.RGB255()
			
			pixels = append(pixels, Pixel{X: row + (rows * offset), Y: col, R: r, G: g, B: b})
		}
	}

	return pixels
}

func LinearGradient(c1 colorful.Color, c2 colorful.Color, method string, offset int) []Pixel {
	var pixels []Pixel

	settings := GetSettings()

	cols := settings.Cols
	rows := settings.Rows

	for row := 0; row < rows; row++ {
		blend := Blend(method, c1, c2, uint(row), uint(rows))
		r, g, b := blend.RGB255()

		for col := 0; col < cols; col++ {
			pixels = append(pixels, Pixel{X:row + (rows * offset), Y: col, R: r, G: g, B: b})
		}
	}

	return pixels
}

func StopTransition() {
	stop = true
}

