/*
    @file: main.js

    Initialize the SDK and get
    a reference to the project
*/

var project = grandeur.init("YOUR-API-KEY", "YOUR-SECRET");

/*
    Variable to store LED state
    which will be off on start
*/
var LED = 0;

/*
    Function to send request
    to the server to toggle the LED
*/
async function toggleLED() {
    /*
        We will store the device id in a variable
        we generated this id while getting started
    */

    var deviceID = "YOUR-DEVICE-ID";

    /* Then get a reference to device class */
    var devices = project.devices();

    /* and in a try catch block */
    try {
        /* Toggle LED variable */
        LED = LED? 0: 1;

        /* Submit request to update state */
        var res = await devices.device(deviceID).data().set("state", LED);

        /* Got the response */
        switch(res.code) {
            case "DEVICE-DATA-UPDATED":
                /* Updated the device state successfully */
                console.log(`State Updated to ${LED? "ON": "OFF"}`);
                break;

            default:
                /* Failed to update the state */
                console.log("Failed to update the state");
        }
    }
    catch(err) {
        /*
            Error usually got generated when
            we are not connected to the internet
        */
        console.log("Network Error");
    }
}

/*
    We will subscribe to connection
    status of SDK. Like are we connected
    to the communication bridge of server
    or not? The SDK automatically connects
    to server on successful authentication
    of a user
*/
project.onConnection((status) => {
    /*
        This callback gets fired
        whenever the connection status
        changes.
    */

    switch(status) {
        case "CONNECTED":
            /*
                If SDK is connected,
                we set the status.
            */
            document.getElementById("status").innerText = "Connected";
            break;

        default:
            /* 
                If SDK gets disconnected, we display the status
                on the app and clear the timer.
            */
            document.getElementById("status").innerText = "Disconnected";
    }
});

/*
    Function to login user
    we creating while getting started
*/
async function login() {
    /* Store credentials into variables */
    var email = "EMAIL";
    var password = "PASSWORD";

    /* Set the status to logging in */
    document.getElementById("status").innerText = "Logging in";

    /* Then get a reference to auth class */
    var auth = project.auth();

    /* and in a try catch block */
    try {
        /* Submit request using login function */
        var res = await auth.login(email, password);

    /* 
        Got the response to login
        handle response
    */
    switch(res.code) {
      case "AUTH-ACCOUNT-LOGGEDIN": 
      case "AUTH-ACCOUNT-ALREADY-LOGGEDIN":
        /*
            User Authenticated
            Set the status to success
        */
        document.getElementById("status").innerText = "User Authenticated";
        break;

      default: 
        /* 
            Logging failed due
            to invalid data
        */
        document.getElementById("status").innerText = "Authentication Failed";
    }
  }
  catch(err) {
    /*
        Error usually got generated when
        we are not connected to the internet
    */
    document.getElementById("status").innerText = "Network Error";
  }
}

/* Call login on startup */
login();