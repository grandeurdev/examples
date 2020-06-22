/* Including the SDK and WiFi library */
#include <Apollo.h>
#include <ESP8266WiFi.h>

/* Configurations */
String deviceID = "YOUR-DEVICE-ID";
String apiKey = "YOUR-APIKEY";
String token = "YOUR-ACCESS-TOKEN";

/* WiFi credentials */
String ssid = "WIFI-SSID";
String password = "WIFI-PASSWORD";

/* Create variable to hold project and device */
Project apolloProject;
Device device;

/* Function to check device's connection status */
void onConnection(bool status) {
  switch(status) {
        case CONNECTED:
          /* Device connected to the cloud */
          
          Serial.println("Device is connected to the cloud.");
          return;

        case DISCONNECTED:
          /* Device disconnected from cloud */

          Serial.println("Device is disconnected from the cloud.");
          return;
  }
}

/* Function to handle parms update event */
void handleUpdate(JSONObject updateObject) {
    /* Get state from the updated parms */
    int state = (int) updateObject["state"];
    
    /* Print state */
    Serial.printf("Updated state is %d\n", state);
    
    /* Update pin level */
    digitalWrite(2, state);
}

/* Function to connect to WiFi */
void connectWiFi() {
    /* Set mode to station */
    WiFi.mode(WIFI_STA);

    /* Connect using the ssid and password */
    WiFi.begin(ssid, password);

    /* Block till the WiFi is connected */
    while (WiFi.status() != WL_CONNECTED) {
         delay(500);
         Serial.print(".");
    }
    
    /* Print message */
    Serial.println("");
    Serial.println("WiFi connected");

    /* And IP address */
    Serial.println(WiFi.localIP());
}

void setup() {
    /* Begin the serial */
    Serial.begin(9600);

    /* Connect to WiFi */
    connectWiFi();
    
    /* Initializes the global object "apollo" with your configurations. */
    apolloProject = apollo.init(apiKey, token);
    
    /* Get reference to device */
    device = apolloProject.device(deviceID);
    
    /* Sets connection state update handler */
    apolloProject.onConnection(onConnection);
    
    /* Add event handler on parms update */
    device.onParms(handleUpdate);   
    
    /* Set mode of LED to output */
    pinMode(2, OUTPUT);

    /* Turn the LED off by default */
    digitalWrite(2, 0);    
}

void loop() {
    /* 
        Synchronizes the SDK with the cloud
        SDK will loop till we are connected to WiFi    
    */
    apolloProject.loop(WiFi.status() == WL_CONNECTED);
}