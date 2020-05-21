// Include the SDK
#include <Apollo.h>

// Configurations
String deviceID = "YOUR-DEVICE-ID";
String apiKey = "YOUR-APIKEY";
String token = "YOUR-ACCESS-TOKEN";

// Wifi credentials
String ssid = "Saeen Ki Wingle";
String password = "saeen786";

// Create a new object 
ApolloDevice device;

// Variable to store time reference
// unsigned long current;
unsigned long current = millis();

// Status and state
int status = false;
double state = 0;

// Function to respond to connection status changes
void onConnection(JSONObject connection) {
  switch((int) connection["status"]) {
        case APOLLO_CONNECTED:
          // Connected to the server
          status = true;

          // Take a snapshot of time 
          // to start timer
          current = millis();          

          return;

        case APOLLO_DISCONNECTED:
          // Disconnected from server
          status = false;

          return;
  }
}

// Function to handle update from server
void handleUpdate(JSONObject payload) {
    // Get state
    double newState = (double) payload["deviceParms"]["state"];
    
    // Print if got an update
    if (newState != state) {
       // Update state
       state = newState;

       // Print
       Serial.println(state);
    }
}

// In setup
void setup() {
    // Begin the serial
    Serial.begin(9600);
    
    // Initialize the global object "apollo" with your configurations.
    device = apollo.init(deviceID, apiKey, token, ssid, password);

    // Connection listener
    device.onConnection(onConnection);
}

// Loop function
void loop() {
    // Check status
    if (status) {
        // If we are connected
        // Then after every five seconds
        if (millis() - current >= 5000) {
            Serial.println("Checking for Update");
            
            // Get update from server
            device.getParms(handleUpdate);

            // Update Current
            current = millis();
        }
    }
    
    // Let the SDK sync
    device.update();
}
