package leds

import (
	"../logger"
	"../file"
	"encoding/json"
	"github.com/mcuadros/go-rpi-rgb-led-matrix"
	"image/color"
	//"../painter"
)

var (
	powerState	bool
	canvas		*rgbmatrix.Canvas
	config		rgbmatrix.HardwareConfig
	settings	*Settings
)

type Pixel struct {
	X  int  `json:"x"`
	Y  int  `json:"y"`
	R  uint8  `json:"r"`
	G  uint8  `json:"g"`
	B  uint8  `json:"b"`
}

type Favorite struct {
	Title	string	`json:"title"`
	Pixels	[]Pixel	`json:"pixels"`
}

type Settings struct {
	Rows                     int    `json:"rows"`
	Cols                     int    `json:"cols"`
	Parallel                 int    `json:"parallel"`
	Chained                  int    `json:"chained"`
	Brightness               int    `json:"brightness"`
	Hardware_mapping         string `json:"hardware_mapping"`
	Show_refresh             bool   `json:"show_refresh"`
	Inverse_colors           bool   `json:"inverse_colors"`
	Disable_hardware_pulsing bool   `json:"disable_hardware_pulsing"`
}

func initMatrix() rgbmatrix.Matrix {
	config := &rgbmatrix.DefaultConfig
	config.Rows = settings.Rows
	config.Cols = settings.Cols
	config.Parallel = settings.Parallel
	config.ChainLength = settings.Chained
	config.Brightness = settings.Brightness
	config.HardwareMapping = settings.Hardware_mapping
	config.ShowRefreshRate = settings.Show_refresh
	config.InverseColors = settings.Inverse_colors
	config.DisableHardwarePulsing = settings.Disable_hardware_pulsing

	m, _ := rgbmatrix.NewRGBLedMatrix(config)
	return m
}

func New() *rgbmatrix.Canvas {

	if powerState == true { return canvas }
	
	powerState = true

	LoadSettings()
	m := initMatrix()
	canvas = rgbmatrix.NewCanvas(m)

	Load()

	return canvas
}

func Delete() {
	if powerState == false {
		return
	}

	//painter.StopTransition()
	powerState = false

	canvas.Close()
}

func Save(pxls []Pixel) {
	fileDat, _ := json.Marshal(pxls)

	file.Create(string(fileDat), "start")
}

func Load() {
	var pixels []Pixel
	dat := file.Read("start")

	json.Unmarshal(dat, pixels)

	Apply(pixels)
}

func Apply(data []Pixel) {
	logger.Log("Applying changes")

	New()
	//painter.StopTransition()

	go paint(data)
	return
}

func paint(data []Pixel) {
	logger.Log("Painting started...")
	//bounds := canvas.Bounds()

	for _, led := range data {
		canvas.Set(led.X, led.Y, color.RGBA{R:led.R, G:led.G, B:led.B, A:255})
	}

	canvas.Render()
	logger.Log("Painting finished...")
}

func SetSettings(s Settings) {
	settings = &s

	Delete()
	New()
}

func GetSettings() *Settings {
	return settings
}

func LoadSettings() {
	settings = &Settings{}

	dat := file.SafeRead("settings",`{"rows":32, "cols":32, "parallel":1, "chained":6, "brightness":100, "hardware_mapping":"adafruit-hat-pwm","show_refresh":false, "inverse_colors":false, "disable_hardware_pulsing":false }`)
	json.Unmarshal(dat, settings)
}
