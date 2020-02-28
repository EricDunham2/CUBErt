package file

import (
	"../logger"
	"os"
	"io/ioutil"
	"fmt"
)

func Create(data string, name string) {
	file, err := os.Create(fmt.Sprintf("../config/%s.json", name))

	if err != nil {
		logger.Log("Error creating new config file...")

		return
	}

	_, err = file.Write([]byte(data))

	if err != nil {
		logger.Log("Error writing to new config file...")

		return
	}

	logger.Log("New config file created...")
}

func SafeRead(name string, defaultValues string) []byte {
	path := fmt.Sprintf("../config/%s.json", name)

	if _, err := os.Stat(path); os.IsNotExist(err) {
		logger.Log("Settings file does not exist...")
		Create(defaultValues, name)
	}

	return Read(name)
}

func Read(name string) []byte {

	path := fmt.Sprintf("../config/%s.json", name)

	file, err := os.Open(path)

	logger.Log("Reading file...")

	if err != nil {
		logger.Log(err.Error())

		return []byte{}
	}

	dat, err := ioutil.ReadAll(file)

	if err != nil {
		logger.Log(err.Error())

		return []byte{}
	}

	return dat
}

func Exists(name string) bool {
	path := fmt.Sprintf("../config/%s.json", name)

	_, err := os.Stat(path)

	if err == nil {
		return true
	} else {
		return false
	}
}

func Remove(name string) error {
	path := fmt.Sprintf("../config/%s.json", name)

	err := os.Remove(path)

	return err
}