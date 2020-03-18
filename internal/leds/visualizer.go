package leds

import (
	"../logger"
	"net/http"
	"io/ioutil"
)

func Visualizer(blend1,) {
	var top []Pixel = BilinearGradient(blend1, blend2, blend3, blend4, method, 0)
	var bottom []Pixel = BilinearGradient(blend1, blend4, blend3, blend2, method, 5)

	var front []Pixel = LinearGradient(blend1, blend2, method, 1)
	var left []Pixel = LinearGradient(blend2, blend3, method, 2)
	var back []Pixel = LinearGradient(blend3, blend4, method, 3)
	var right []Pixel = LinearGradient(blend4, blend1, method, 4)

	logger.Log("Pre paint generated")

	var levels map[int][]Pixel = make(map[int][]Pixel)

	for col := 0; col < settings.Cols; col++ {
	
		front = Filter(front, func(v Pixel) bool {
			return v.Y == col
		})

		left = Filter(left, func(v Pixel) bool {
			return v.Y == col
		})

		back = Filter(back, func(v Pixel) bool {
			return v.Y == col
		})

		right = Filter(right, func(v Pixel) bool {
			return v.Y == col
		})

		var pixels []Pixel

		pixels = append(pixels, front...)
		pixels = append(pixels, left...)
		pixels = append(pixels, back...)
		pixels = append(pixels, right...)

		levels[col] = pixels
	}

	logger.Log("Pixels seperated by cols")
	logger.Log("GET Volume")

	var resp byte[]

	for {
		var err Error
		resp, err = http.Get("http://192.168.2.254/volume")

		if err != nil {
			logger.Log(err)
			continue
		}

		defer resp.Body.Close()

		body, err = ioutil.ReadAll(resp.Body)

		if err != nil {
			logger.Log(err)
			continue
		}

		level := math.Floor(int(body) / settings.Cols)
		var pLevel []Pixel

		pLevel = append(pLevel, bottom[i])

		if level == settings.Cols {
			pLevel = append(pLevel, top)
		}

		for i := 0; i <= level; i++ {
			pLevel = append(pLevel, levels[i])
		}

		Apply(pLevel)
	}

	//GET Request
	/*
		0) Generate the pixels for the cube and divide it by Top | col * 32  | Bottom
			
		1) Clear sides and top of Cube and only leave bottom on
			resp, err := http.Get("http://example.com/")
			if err != nil {
				// handle error
			}
			defer resp.Body.Close()
			body, err := ioutil.ReadAll(resp.Body)
			// ...
		2) Get the volume level from the ESP
			Make a get request for the current volume level
		3) Scale it down to be Math.floor(volume/settings.cols)
		4) Paint the bottom + all the cols up two the current volume level. If the volume is 100, light up the top.

	*/
}

func Filter(pxls []Pixel, f func(Pixel) bool) []Pixel {
	ret := make([]Pixel, 0)

    for _, p := range pxls {
        if f(p) {
            ret = append(ret, p)
        }
	}
	
    return ret
}