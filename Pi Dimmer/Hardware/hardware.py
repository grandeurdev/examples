# Import the library
import grandeur.device as grandeur
from gpiozero import PWMLED

led = PWMLED(12)

# Define the apiKey and Auth token
apiKey = "YOUR-API-KEY"
token = "YOUR-DEVICE-TOKEN"
deviceID = "YOUR-DEVICE-ID"

# Event listener on connection state
def onConnection(state):
    # Print the current state
    print(state)

# Callback function to handle state change event
def updateHandler(state, path):
    # Print
    print("Brigness: " + state + "%")
    led.value = int(state)/100

# Callback function to handle current state
def dataHandler(res):
    # Print
    print("Brigness: " + res["data"]["state"] + "%")
    led.value = int(res["data"]["state"])/100

# Init the SDK and get reference to the project
project = grandeur.init(apiKey, token)

# Place listener
project.onConnection(onConnection)

# Get a reference to device class
device = project.device(deviceID)

# Subscribe to state change event
device.data().on("state", updateHandler)

# Get current state
device.data().get("state", dataHandler)

# Block main thread
while 1:
    pass