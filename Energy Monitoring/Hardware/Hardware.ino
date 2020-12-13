/* Including the SDK and WiFi library */
#include <Grandeur.h>
#include <ESP8266WiFi.h>

/* For NTP */
#include <NTPClient.h>
#include <WiFiUdp.h>

/* Configurations */
String deviceID = "YOUR-DEVICE-ID";
String apiKey = "YOUR-APIKEY";
String token = "YOUR-ACCESS-TOKEN";

/* WiFi credentials */
String ssid = "WIFI-SSID";
String password = "WIFI-PASSWORD";

/* Create variable to hold project and device */
Project project;
Device device;

/* Start NTP */
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

/* Define the pins */
#define led 2

/* Variable to keep track of connection state and time */
int connected = 0;
uint32_t lastUpdate = 0;

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

          /* Record connection state and time */
          connected = 1;
        
          lastUpdate = millis();
          return;

        case DISCONNECTED:
          /* 
            Device disconnected from cloud  
            so turn on the led 
          */
          digitalWrite(led, 0);

          Serial.println("Device is disconnected from the cloud.");

          connected = 0;
          return;
  }
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

/* Function to confirm that data has been updated */
void summaryCallback(JSONObject setResult) {
  /* If the update was recorded successfully */
  if(setResult["code"] == "DEVICE-SUMMARY-UPDATED") {
    /* Get data */
    double current = (double) setResult["update"]["current"];
    double power = (double) setResult["update"]["power"];

    /* Print */
    Serial.printf("Current: %f Power: %f\n", current, power);
    
    return;
  }
  
  /* If the summary could not be updated. */
  Serial.println("Failed to Update Summary");
  return;
}

/* Function to send updated current and power readings */
void sendUpdate() {
    /* Send a new update after every 2 seconds */
    if (millis() - lastUpdate > 2000) {
		/* 
			We are first required to measure the Vpp of the input signal 
			in order to determine the current.
		*/
		int readValue;  
		int maxValue = 0;
		int minValue = 1024;
		float Vpp;
		float Vrms;
		float current;
		float power;

		/* Note the time */
		uint32_t startTime = millis();

		/* and start a loop for one second to determine the max and min sensor value */
		while( millis() - startTime < 1000) {
			/* Read sensor value */
			readValue = analogRead(A0);

			/* Determine max value */    
			if (readValue > maxValue) maxValue = readValue; 

			/* Determine min value */
			if (readValue < minValue) minValue = readValue;
		}

		/* Then calculate the Vpp */
		Vpp = ((maxValue - minValue) * 3.3) / 1024.0;

		/* Determine the Vrms */
		Vrms = (Vpp / 2.0) * 0.707;

		/* 
			Then find the current using sensitivity of sensor 
			It is 185mV/A for 5A, 100 mV/A for 20A and 66mV/A for 30A Module
			We are using 5A sensor
		*/
		current = (Vrms * 1000.0) / 185.0;

		/* Finally calculate the power considering ideal state with pure resistive load */
		power = 230.0 * current;
		
		/* Update time */
		timeClient.update();
		
		/* Epoch Time */
		unsigned long time = timeClient.getEpochTime();
		
		// Form packet
		JSONObject summary;

		summary["current"] = current;
		summary["power"] = power;
		summary["time"] = time;

		/* Record update */
		device.setSummary(summary, summaryCallback);
		
		/* Record last record send time */
		lastUpdate = millis();
    }
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
    
    /* Set mode of LED pin to output */
    pinMode(led, OUTPUT);

    /* Setup pin state */    
    digitalWrite(led, 1);

    /* Get time */
    timeClient.begin();

    randomSeed(analogRead(0));
}

void loop() {
    /* 
        Synchronizes the SDK with the cloud
        SDK will loop till we are connected to WiFi    
    */
    project.loop(WiFi.status() == WL_CONNECTED);

    /* Send update to server */
    if (connected) sendUpdate();
}
