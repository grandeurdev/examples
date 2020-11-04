# Import the library
import grandeurcloud.apollo.device as apollo
from gpiozero import LED

led = LED(17)

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
    print(data)
    led.value = data["state"]

# Callback function to handle current state
def handleParms(data):
    # Print
    print(data["deviceParms"])
    led.value = data["deviceParms"]["state"]

# Init the SDK and get reference to the project
project = apollo.init(apiKey, token)

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