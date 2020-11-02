/** @file: hardware.ino 
*/

/** Arduino SDK and WiFi library header */
#include <Apollo.h>
#include <ESP8266WiFi.h>
/** Library we are using to get time from NTP server in milliseconds precision. */
#include <ezTime.h>

/** Cloud Configurations */
String deviceID = "devicekd69jt7f0bmj01vcg19o68ar";
String apiKey = "grandeurkcqeuvyy1ged01yjbl2pejkr";
/** This access token is generated when the device is paired with the user */
String token = "eyJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwWkNJNkltUmxkbWxqWld0a05qbHFkR0p6TUdKdGF6QXhkbU13ZEdNek1tWXlOeUlzSW5SNWNHVWlPaUprWlhacFkyVWlMQ0pwWVhRaU9qRTFPVFU1TmpBeU9UQjkuZG50ZkVUdWwwMlFqaFFlMUc0RlVweGJBaFdlTWd5cEdBb0tLcWdNcDVkcyJ9";

/** Your WiFi credentials */
String ssid = "Home-BB";
String passphrase = "nopassword";

/** Variables for required Apollo Objects */
Project myProject;
Device myDevice;
Datastore myDatastore;
/** Other variables we need */
int statePin = D0;
unsigned long current = millis();

// Function prototypes
void connectWiFi(void);
void connectionCallback(bool status);
void handleUpdate(JSONObject payload);

void setup() {
  Serial.begin(9600);
  /** This sets up the device WiFi */
  connectWiFi();
  /** This syncs device time with NTP server every 1 minute. */
  setInterval(60);
  /** Wait until time is synced with NTP server. */
  waitForSync();
  /** This initializes the SDK's configurations and returns a reference to my project on the Cloud. */
  myProject = apollo.init(apiKey, token);
  /** Getting reference to device. */
  myDevice = myProject.device(deviceID);
  /** Getting reference to datastore. */
  myDatastore = myProject.datastore();
  
  /** This schedules the connectionCallback() function to be called when connection with the cloud 
   * is made/broken.
  */
  myProject.onConnection(onConnection);
  /** This schedules parmsUpdatedCallback() function to be called when variable stored in device's
   * parms are changed on the Cloud.
  */
  myDevice.onParms(handleUpdate);
}

void loop() {
  /** This runs Apollo's event loop. */
  myProject.loop(WiFi.status() == WL_CONNECTED);
}

void onConnection(bool status) {
  switch(status) {
    case CONNECTED:
      /** Device connected to the cloud */
      
      Serial.println("Device is connected to the cloud.");
      return;

    case DISCONNECTED:
      /** Device disconnected to cloud */
      Serial.println("Device is disconnected from the cloud.");

      return;
  }
}

void connectWiFi() {
  /** Setting WiFi to Station mode which basically scans for nearby WiFi routers. */
  WiFi.mode(WIFI_STA);
  /** Begin connecting to WiFi using ssid and password we defined in the begining of this sketch. */
  WiFi.begin(ssid, passphrase);

  /** Block until WiFi isn't connected. */
  while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
  }
  
  /** This message is printed after the WiFi is connected. */
  Serial.println("");
  Serial.println("WiFi connected");
}

/** This function handles update in device's *state* variable. */
void handleUpdate(JSONObject updateObject) {
  /** Geting state from the update object we received */
  bool state = (bool) updateObject["state"];
  /** Preparing JSONObject. */
  JSONObject logs;
  /** Adding current timestamp (in ms) and state into logs */
  char milliseconds[3];
  /** Fixes the precision to 3 digits */
  sprintf(milliseconds,"%03d",ms());
  logs[0]["timestamp"] = String(now()) + milliseconds;
  logs[0]["state"] = state;
  /** Inserting JSONObject in "history" collection in our datastore. */
  myDatastore.collection("history").insert(logs, insertCallback);
  /** Printing state to Serial Monitor. */
  Serial.printf("Updated state is %d\n", (bool) state);

}

void insertCallback(JSONObject insertResult) {
  /** This function prints if the logs were successfully inserted into the datastore or not. */
  if(insertResult["code"] == "DATASTORE-DOCUMENTS-INSERTED") {
    Serial.println("Voltage is successfully logged to the Cloud.");
    return;
  }
  /** If insertion is not successful. */
  Serial.println("Failed to log voltage");
  return;
}
