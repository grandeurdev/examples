/** @file: hardware.ino 
*/

/** Arduino SDK header */
#include <Apollo.h>

/** Cloud Configurations */
String deviceID = "devicekb1am3d9000v01yoci1j0wxv";
String apiKey = "grandeurkb1ah4gb000s01yo0t707owz";
/** This access token is generated when the device is paired with the user */
String token = "eyJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwWkNJNkltUmxkbWxqWld0aU1XcDJjSFYxTURBeU1EQXhlVzh4Y1dSamFHSTFiaUlzSW5SNWNHVWlPaUprWlhacFkyVWlMQ0pwWVhRaU9qRTFPVEV6TWpFM05EWjkua3c2S2I3QU1lcUFXeklYeHNHaV9pYnY5NFN4RDIweTJoYVdDSGxkSk5IWSJ9";

/** Your WiFi credentials */
String ssid = "Home-BB";
String passphrase = "nopassword";

/** Variable for ApolloDevice object */
ApolloDevice device;

/** Connection status and device state */
int status = false;
double state = 0;

void setup() {
  /** Beginning the serial at 9600 */
  Serial.begin(9600);
  
  /** This initializes the global object "apollo" with your configurations. */
  device = apollo.init(deviceID, apiKey, token, ssid, passphrase);

  /** Using the device credentials, the SDK establishes a real-time connection with the
   * cloud. And that change in connection status is propagated through the onConnection function
   * here.
  */
  device.onConnection([](JSONObject updateObject) {
    /** This callback function is called when the connection status changes */
    switch((int) updateObject["event"]) {
      case CONNECTED:
        /** If the device is connected with the cloud,
         * this sets the status to true.
        */
        status = true;
        Serial.println("Device is connected to the cloud.");
        return;

      case DISCONNECTED:
        /** If the app is disconnected from the cloud,
         * this sets the status to false.
        */
        status = false;
        Serial.println("Device is disconnected from the cloud.");
        return;
    }
  });

  /** Passing a function to onParmsUpdated causes the SDK to listen for any update in device
   * parms. When an update occurs, the function passed to onParmsUpdated is called with the
   * updated parms values.
  */
  device.onParmsUpdated([](JSONObject updatedParms) {
    Serial.printf("Updated state is: %i\n", (bool) updatedParms["state"]);
  });
}

void loop() {
  /** This synchronizes the SDK with the cloud */
  device.update();
}
