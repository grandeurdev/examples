/* Including the SDK and WiFi library */
#include <Grandeur.h>
#include <ESP8266WiFi.h>

/* Configurations */
String deviceID = "YOUR-DEVICE_ID";
String apiKey = "YOUR-API-KEY";
String token = "YOUR-DEVICE-ACCESS-TOKEN";

/* WiFi credentials */
String ssid = "WIFI-ADDRESS";
String password = "WIFI-PASSWORD";

/* Create variable to hold project and device */
Project project;
Device device;

/* Define the pins */
#define led D4
#define control D5 

/* Function to check device's connection status */
void onConnection(bool status) {
  switch(status) {
        case CONNECTED:
          /* 
            Device connected to the cloud 
            so turn off the led 
          */
          digitalWrite(led, 1);

          Serial.println("Device is connected to the cloud.");
          return;

        case DISCONNECTED:
          /* 
            Device disconnected from cloud  
            so turn on the led 
          */
          digitalWrite(led, 0);

          Serial.println("Device is disconnected from the cloud.");
          return;
  }
}

/* Function to handle state update event */
void updateHandler(const char* path, int state) {
    /* Print state */
    Serial.printf("Updated state is %d\n", state);
    
    /* Update pin level */
    digitalWrite(control, state);
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

         /* Toogle the LED to represent that device are trying to connect to wifi*/
         digitalWrite(led, !digitalRead(led));
    }
    
    /* Print message */
    Serial.println("");
    Serial.println("WiFi connected");

    /* Turn on the LED to represent the device is connecting to server*/
    digitalWrite(led, 0);

    /* And IP address */
    Serial.println(WiFi.localIP());
}

void setup() {
    /* Begin the serial */
    Serial.begin(9600);

    /* Connect to WiFi */
    connectWiFi();
    
    /* Initializes the global object "grandeur" with your configurations. */
    project = grandeur.init(apiKey, token);
    
    /* Get reference to device */
    device = project.device(deviceID);
    
    /* Sets connection state update handler */
    project.onConnection(onConnection);
    
    /* Add event handler on state update */
    device.data().on("state", updateHandler);   
    
    /* Set mode of LED and control pin to output */
    pinMode(led, OUTPUT);
    pinMode(control, OUTPUT);

    /* 
        Turn the LED and cooler off by default 
        Hint: Alternatively you can fetch the state
        of cooler from the server using device.getParms
        and you can also maintain a local copy of state
        using EEPROM to prevent loss of state between 
        power cycles
    */
    digitalWrite(led, 1);
    digitalWrite(control, 0);
}

void loop() {
    /* 
        Synchronizes the SDK with the cloud
        SDK will loop till we are connected to WiFi    
    */
    project.loop(WiFi.status() == WL_CONNECTED);
}
