// Init the SDK of Grandeur
const project = grandeur.init("API-KEY", "ACCESS-KEY", "ACCESS-TOKEN");

// Integration id
const integrationID = "INTEGRATION-ID";

// Slack access token
var accessToken = null;

// Function which will run at start 
// to determine the state of the application
async function main() {
    // Display loading screen
    document.getElementById("loader").style.display = "flex";

    // Create instance of auth class
    const auth = project.auth();
    
    // Then check if user is authenticated
    const isAuth = await auth.isAuthenticated();

    // If user isn't authorized
    if (isAuth.code === "AUTH-UNAUTHORIZED") {
        // Show login screen
        return showLogin();
    }

    // Show the app screen
    showApp();
}

// Function to show login screen
async function showLogin() {
    // Clear fields
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

    // Hide loader
    document.getElementById("loader").style.display = "none";

    // Show login screen
    document.getElementById("login").style.display = "flex";
}

// Function to show main app screen
async function showApp() {
    // Create instance of auth class
    const auth = project.auth();

    // Then get the token of the integration
    const slack = await auth.oauthAccessToken(integrationID);

    // If the user has't authorized this integration
    if (!slack.token) {
        // Show slack connect screen
        return showConnect();
    }

    // Else store the token 
    token = slack.token;

    // Hide loader
    document.getElementById("loader").style.display = "none";

    // Show app
    document.getElementById("send-message").style.display = "flex";
}

// Function to show connect screen
async function showConnect() {
    // Hide loader
    document.getElementById("loader").style.display = "none";

    // Show connect slack screen
    document.getElementById("connect-slack").style.display = "flex";
}

// Function to authenticate user
async function login() {
    // Hide login screen
    document.getElementById("login").style.display = "none";

    // Display loading screen
    document.getElementById("loader").style.display = "flex";

    // Create instance of auth class
    const auth = project.auth();

    // Get data from form
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Log the user into the profile
    const res = await auth.login(email, password);

    // Handle response
    if (res.code === "AUTH-ACCOUNT-LOGGEDIN") {
        // Show app screen
        return showApp();
    }

    // Show login screen
    showLogin();
}

// Function to connect slack
async function connect() {
    // Display loading screen
    document.getElementById("loader").style.display = "flex";

    // Hide login screen
    document.getElementById("connect-slack").style.display = "none";

    // Create instance of auth class
    const auth = project.auth();

    // Start oauth process
    await auth.oauth(integrationID);
}

// Function to logout
async function logout() {
    // Hide login screen
    document.getElementById("send-message").style.display = "none";
    document.getElementById("connect-slack").style.display = "none";

    // Display loading screen
    document.getElementById("loader").style.display = "flex";

    // Create instance of auth class
    const auth = project.auth();

    // Send request
    const res = await auth.logout();

    // Show login
    showLogin();
}

// Function to send message
async function sendMessage() {
    // Get message
    const message = document.getElementById("message-field").value;

    // Get channel id
    const channelID = document.getElementById("channel-id").value;

    // Clear field
    document.getElementById("message-field").value = "";

    // Submit request to slack
    var res = await fetch(`https://slack.com/api/chat.postMessage?token=${token}&channel=${channelID}&text=${message}`, {
        method: "POST"
    });

    // Convert to json
    res = await res.json();

    // Validate response code
    if (res.ok) {
        // Show notification
        return showNotification("Message Sent!");
    }

    // Otherwise show notification that message sending failed
    showNotification("Sending failed!");
}

function showNotification(message) {
    // Set message
    document.getElementById("notification-message").innerText = message;

    // Show notification
    document.getElementById("notification").setAttribute("class", "notification show");

    // Start timer to hide notification after 2 seconds
    setTimeout(() => document.getElementById("notification").setAttribute("class", "notification"), 2000);
}

// Run main function
main();