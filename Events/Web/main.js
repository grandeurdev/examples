/*
    main.js
    Initialize the SDK and get
    a reference to the project
*/

var apolloProject = apollo.init("YOUR-API-KEY", "YOUR-ACCESS-KEY", "YOUR-ACCESS-TOKEN");

var timer = null;

/* Setting the connection status update handler */
apolloProject.onConnection((status) => {
  /* 
      This callback gets fired
      whenever the connection status
      changes
  */

  switch(status) {
    case "CONNECTED": 
        /*
            If SDK is connected,
            we set the status.
        */
        document.getElementById("status").innerText = "Connected";

        /* Here we set up the timer to update parms every 5 seconds */
        timer = setInterval(async function() { 
            /* 
                This function updates the device parameters
                and set the state to a random string.
            */
            
            var deviceID = "YOUR-DEVICE-ID";

            /* Here we use *Date* for a random state value */
            var state = Date.now();
            
            /* Gets reference to device class */
            var devices = apolloProject.devices();

            /* Updates the device state */
            await devices.device(deviceID).setParms({state: Date.now()});
   
            /* Logs the state to browser's console */  
            console.log(state);
        }, 5000);
        
        break;
    default: 
        /* If SDK gets disconnected, we display the status
           on the app and clear the timer.
         */
        document.getElementById("status").innerText = "Disconnected";

        /* Clears timer */
        clearInterval(timer);
  }
});

/* Function to login user */
async function login() {
    /* Store credentials into variables */
    var email = "EMAIL";
    var password = "PASSWORD";

    /* Set the status to logging in */
    document.getElementById("status").innerText = "Logging in";

    /* Then get a reference to auth class */
    var auth = apolloProject.auth();

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
