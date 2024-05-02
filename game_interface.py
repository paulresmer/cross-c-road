import serial
import time

ser = serial.Serial("COM3", 115200, timeout=1)

try:
    while True:
        if ser.in_waiting > 0:
            line = ser.readline().decode("utf-8").rstrip()
            print("Received:", line)
        time.sleep(0.1)
finally:
    ser.close()
    print("Closed connection.")
