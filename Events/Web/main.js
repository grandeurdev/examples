/** main.js
*/

/** Initializing the SDK and getting reference to our project */
var apolloProject = apollo.init(
  "grandeurkb1ah4gb000s01yo0t707owz",
  "accesskb1b83kj000w01yoeftj89ew",
  "eyJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwWkNJNkltRmpZMlZ6YzJ0aU1XSTRNMnRxTURBd2R6QXhlVzlsWm5ScU9EbGxkeUlzSW5SNWNHVWlPaUpoWTJObGMzTWlMQ0pwWVhRaU9qRTFPVEV6TURjeU1EZDkuVmd2bDkwN2tadFg4MVpKOTcyczF4ZFJ6V0Z6cTEwbFFYaWZIM195bDRLVSJ9"
);

/** Function to log in the user */
async function login() {
    /** Hard-coding user's credentials here. In a production-ready app, this will be replaced
     * by a login screen.
    */
    var email = "test@example.com"; /** YOUR USER'S EMAIL */
    var password = "test:80"; /** YOUR USER'S PASSWORD */

    /** This sets the status to "logging in" */
    document.getElementById("status").innerText = "Logging in";

    /** Getting reference to Auth class */
    var auth = apolloProject.auth();

    try {
        /** Logging in the user */
        var res = await auth.login(email, password);

        /** Checking response code */
    switch(res.code) {
      case "AUTH-ACCOUNT-LOGGEDIN": 
      case "AUTH-ACCOUNT-ALREADY-LOGGEDIN":
        /** If the user's logged in,
         * This sets the status to "User Authenticated".
        */
        document.getElementById("status").innerText = "User Authenticated";
        break;

      default: 
        /** If login did not succeed
         * This sets the status to "Authentication Failed".
        */
        document.getElementById("status").innerText = "Authentication Failed";
    }
  }
  catch(err) {
    /** If an error occurred.
     * An error usually occurs only if we are not connected to the internet.
    */
    document.getElementById("status").innerText = "Network Error";
  }
}

/** Calling login here runs it when the app loads */
login();

/** After successful user authentication, the SDK establishes a real-time connection with the
 * cloud. And that change in connection status is propagated through the onConnection function
 * here.
*/
apolloProject.onConnection((status) => {
  /** This callback function is called when the connection status changes */
  switch(status) {
    case "CONNECTED": 
        /** If the app is connected with the cloud,
         * this sets the status to "Connected".
        */
        document.getElementById("status").innerText = "Connected";

        /** After connecting to the cloud,
         * Here we enable the state-container div
         */
        document.getElementById("state-container").style.display = "block";
        break;
    default: 
        /** If the app is disconnected from the cloud,
         * this sets the status to "Disconnected".
        */
        document.getElementById("status").innerText = "Disconnected";
        /** After disconnecting from the cloud,
         * Here we disable the state-container div
         */
        document.getElementById("state-container").style.display = "none";
  }
});

/** State of our device */
var deviceState = false;

/** This sets onclick handler for the toggle-state button */
document.getElementById("toggle-state").onclick = async () => {
  /** This function toggles the state value and publishes it to the cloud */

  /** Toggling the state */
  deviceState = !deviceState;

  /** This contains our device's ID */
  var deviceID = "devicekb1am3d9000v01yoci1j0wxv";
  /* This gets reference to device class */
  var device = apolloProject.device();
  /* This publishes the state update to the cloud */
  await device.setDeviceParms(deviceID, {state: deviceState});

  /* This displays the updated state to in the app */
  document.getElementById("state").innerHTML = "State is: " + deviceState;
}