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

/* Function to check device's connection status */
void onConnection(JSONObject updateObject) {
  switch((int) updateObject["event"]) {
        case CONNECTED:
          /* Device connected to the cloud */
          
          Serial.println("Device is connected to the cloud.");
          return;

        case DISCONNECTED:
          /* Device disconnected to cloud */
          Serial.println("Device is disconnected to the cloud.");

          return;
  }
}

/* Function to handle update in device state */
void handleUpdate(JSONObject updateObject) {
    /* Get state */
    double state = (double) updateObject["state"];
    
    /* Print state */
    Serial.printf("Updated state is %f\n", state);

}

/* In setup */
void setup() {
    /* Begin the serial */
    Serial.begin(9600);
    
    /* Initializes the global object "apollo" with your configurations. */
    device = apollo.init(deviceID, apiKey, token, ssid, passphrase);

    /* Sets connection state update handler */
    device.onConnection(onConnection);

    /* Subscribe to change of params data */
    device.onParmsUpdated(handleUpdate);
}

/* Loop function */
void loop() {
    /* Synchronizes the SDK with the cloud */
    device.update();
}