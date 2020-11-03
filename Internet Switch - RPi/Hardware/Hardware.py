# Import the library
import grandeurcloud.apollo.device as apollo
from gpiozero import LED

led = LED(17)

# Define the apiKey and Auth token
apiKey = "ck412ssij0007xr239uos8jfk"
token = "eyJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwWkNJNkltUmxkbWxqWld0bmVXVm9jalF5WVc5c2RqQXhlV1V5YnpKeVpUUmtjU0lzSW5SNWNHVWlPaUprWlhacFkyVWlMQ0pwWVhRaU9qRTJNRFF4T1RFNU9USjkuaUczWEtvX2pyaW90OUJpWjFFYzdBUTFCc1JhTWhRTTlLQnlicWtibjNwVSJ9"

# Event listener on connection state
def onConnection(state):
    # Print the current state
    print(state)

# Callback function to handle response
def handleResponse(data):
    # Print
    print(data)
    led.value = data["state"]

# Init the SDK and get reference to the project
project = apollo.init(apiKey, token)

# Place listener
project.onConnection(onConnection)

# Get a reference to device class
device = project.device("devicekgyehr3saolu01ye7ndi6ufh")

# Get summary
device.onParms(handleResponse)

# Block main thread
while 1:
    pass