// main.js

// Initialize the SDK and get
// a reference to the project
var apolloProject = apollo.init("YOUR-API-KEY", "YOUR-ACCESS-KEY", "YOUR-ACCESS-TOKEN");

var timer = null;

// Subscribe to the connection status
apolloProject.onConnection((status) => {
  // This callback gets fired
  // whenever the connection status
  // changes

  switch (status) {
    case "CONNECTED":
      // SDK connected 
      // Set the status
      document.getElementById("status").innerText = "Connected";

      // Start timer to send data
      timer = setInterval(async function () {
        // Send data to device 
        // We will update the parameters of
        // device and set state to a random 
        // string

        // Store device id in a variable
        var deviceID = "devicekag09i2q000d01ysabe142je";

        // Variable to store updated state
        var state = Date.now();

        // Get reference to device class
        var device = apolloProject.device();

        // Send data
        await device.setDeviceParms(deviceID, { state: Date.now() });

        // Log the data we send         
        console.log(state);
      }, 5000);

      break;
    default:
      // Disconnected
      document.getElementById("status").innerText = "Disconnected";

      // Clear timer
      clearInterval(timer);
  }
});

// Function to login user
async function login() {
  // Store credentials into variables
  var email = "test@example.com";
  var password = "test:80";

  // Set the status to logging in
  document.getElementById("status").innerText = "Logging in";

  // The get a reference to auth class
  var auth = apolloProject.auth();

  // and in a try catch block
  try {
    // Submit request using login function
    var res = await auth.login(email, password);

    // Got the response to login
    // handle response
    switch (res.code) {
      case "AUTH-ACCOUNT-LOGGEDIN":
      case "AUTH-ACCOUNT-ALREADY-LOGGEDIN":
        // User Authenticated
        // Set the status to success
        document.getElementById("status").innerText = "User Authenticated";
        break;

      default:
        // Logging failed due
        // to invalid data
        document.getElementById("status").innerText = "Authentication Failed";
    }
  }
  catch (err) {
    // Error usually got generated when
    // we are not connected to the internet
    document.getElementById("status").innerText = "Network Error";
  }
}

// Call login on startup
login();