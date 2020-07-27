/* Including the SDK and WiFi header */
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

/* Variable to store time reference */
unsigned long current;

/* Connection status and device state */
int connected = false;
double state = 0;

/* Function to check device's connection status */
void onConnection(bool status) {
  switch(status) {
        case CONNECTED:
          /* Device connected to the cloud */
          connected = true;

          /* 
              Takes a snapshot of time 
              for timer
          */
          current = millis();      

          return;

        case DISCONNECTED:
          /* Device disconnected from cloud */
          connected = false;

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

/* Function to connect to WiFi */
void connectWiFi() {
    /* Set mode to station */
    WiFi.mode(WIFI_STA);

    /* Connect using the ssid and password */
    WiFi.begin(ssid, password);

    /* Block till WiFi connected */
    while (WiFi.status() != WL_CONNECTED) {
         delay(500);
         Serial.print(".");
    }
    
    /* Connected to WiFi so print message */
    Serial.println("");
    Serial.println("WiFi connected");

    /* and IP address */
    Serial.println(WiFi.localIP());
}

/* In setup */
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
}

/* Loop function */
void loop() {
    /* Checks device connection status */
    if (connected) {
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
    apolloProject.loop(WiFi.status() == WL_CONNECTED);
}
