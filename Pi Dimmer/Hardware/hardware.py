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
def handleEvent(data):
    # Print
    print("Brigness: " + data["state"] + "%")
    led.value = int(data["state"])/100

# Callback function to handle current state
def handleParms(data):
    # Print
    print("Brigness: " + data["deviceParms"]["state"] + "%")
    led.value = int(data["deviceParms"]["state"])/100

# Init the SDK and get reference to the project
project = grandeur.init(apiKey, token)

# Place listener
project.onConnection(onConnection)

# Get a reference to device class
device = project.device(deviceID)

# Subscribe to state change event
device.onParms(handleEvent)

# Get current state
device.getParms(handleParms)

# Block main thread
while 1:
    pass