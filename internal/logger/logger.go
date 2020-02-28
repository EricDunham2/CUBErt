package logger

import (
	"fmt"
	"time"
)

var logs []string

func format(t time.Time) string {
	hour := t.Hour()
	min := t.Minute()
	sec := t.Second()

	output := fmt.Sprintf("%02d:%02d:%02d",
		hour,
		min,
		sec)

	return output
}

func Log(message string) {

	fmt.Println(message)

	if len(logs) > 1500 {
		logs = logs[1:]
	}

	logs = append(logs, ("[" + format(time.Now()) + "] " + message))
}

func GetLogs() []string{
	return logs
}