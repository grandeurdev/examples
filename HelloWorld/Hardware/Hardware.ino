/* Including the SDK header */
#include <Apollo.h>

/* Configurations */
String deviceID = "YOUR-DEVICE-ID";
String apiKey = "YOUR-APIKEY";
String token = "YOUR-ACCESS-TOKEN";

/* WiFi credentials */
String ssid = "WIFI-SSID";
String passphrase = "WIFI-PASSWORD";

/* New object of ApolloDevice class */
ApolloDevice device;

/* Variable to store time reference */
unsigned long current;

/* Connection status and device state */
int status = false;
double state = 0;

/* Function to check device's connection status */
void onConnection(JSONObject updateObject) {
  switch((int) updateObject["event"]) {
        case CONNECTED:
          /* Device connected to the cloud */
          status = true;

          /* 
              Takes a snapshot of time 
              for timer
          */
          current = millis();          

          return;

        case DISCONNECTED:
          /* Device disconnected from cloud */
          status = false;

          return;
  }
}

/* Function to handle update in device state */
void handleUpdate(JSONObject payload) {
    /* Get state */
    double newState = (double) payload["deviceParms"]["state"];
    
    /* Print if got an update */
    if (newState != state) {
       /* Update state */
       state = newState;

       /* Print */
       Serial.println(state);
    }
}

/* In setup */
void setup() {
    /* Begin the serial */
    Serial.begin(9600);
    
    /* Initializes the global object "apollo" with your configurations. */
    device = apollo.init(deviceID, apiKey,s token, ssid, passphrase);

    /* Sets connection state update handler */
    device.onConnection(onConnection);
}

/* Loop function */
void loop() {
    /* Checks device connection status */
    if (status) {
        /*
            If device is connected to the cloud
        */
        if (millis() - current >= 5000) {
        /* Code in this if-block runs after every 5 seconds
        */
            Serial.println("Checking for Update...");
            
            /* Gets new Parms from the cloud and passes the
               them to *handleUpdate* function.
            */
            device.getParms(handleUpdate);

            /* Updates *current* variable */
            current = millis();
        }
    }
    
    /* Synchronizes the SDK with the cloud */
    device.update();
}