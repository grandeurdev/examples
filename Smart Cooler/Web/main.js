/**
 * @file: main.js
 * Initialize the SDK and get 
 * a reference to the project
*/

var project = grandeur.init("YOUR-API-KEY", "YOUR-ACCESS-KEY", "YOUR-ACCESS-TOKEN");

/** 
 * This function uses the sdk to validate
 * that if the user is authenticated or not
*/
async function start() {
	/** Use sdk auth class to check auth status */
	var res = await project.auth().isAuthenticated();

	/** Then if the user isn't authorized then show the login screen */
	if (res.code === "AUTH-UNAUTHORIZED") {
		return displayLogin();
	}

	/** Display devices screen */
	displayDevices();
}

/** Listener on login form button to authenticate a user */
document.getElementById("submitLogin").addEventListener("click", async () => {
	/** Get email and password from inputs */
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;

	/** Display laoder */
	displayLoader();

	/** Use the sdk auth class to login the user */
	var res = await project.auth().login(email, password);

	/** If the operation was successful */
	if (res.code === "AUTH-ACCOUNT-LOGGEDIN") {
		/** Reset the login page */
		document.getElementById("email").value = "";
		document.getElementById("password").value = "";
		
		/** Display devices screen */
		return displayDevices();
	}

	/** otherwise display the login screen again */
	displayLogin();
});

/** Attach an event listener on connection event of sdk */
project.onConnection((status) => {
	/** Handle the connection status */
	if(status == "CONNECTED") {
		/** Get devices list and populate the tiles */
		getDevicesList();
	}
});

/** Function to get devices list from server and populate the ui*/
async function getDevicesList() {
	/** Use sdk devices class */
	var devices = await project.devices();
	var res = await devices.list();

	/** Variable to hold the ui */
	var content = "";

	/** Then loop over the devices list returned in response and populate the ui */
	res.devices.forEach(device => {
		/** Add tile to the ui */
		content += `
			<div class="tile" onclick="updateState('${device.deviceID}')">
				<div class="inner ${device.parms.state? "on" : ""}" id="${device.deviceID}" data-state="${device.parms.state}">
					<div>${device.name}</div>
					<img src="src/fan.svg" />
				</div>
			</div>
		`

		/** Then also subscribe to the state update event of the device */
		devices.device(device.deviceID).onParms( parms => {
			/** Update the tile color to represent that the device is on*/
			document.getElementById(device.deviceID).setAttribute("class", parms.state? "inner on": "inner");

			/** Update local attribute and store the latest state in it */
			document.getElementById(device.deviceID).setAttribute("data-state", parms.state);
		})
	});

	/** Assign content to ui */
	document.getElementById("tiles").innerHTML = content;
}

/** Function to update the state of a device */
async function updateState(deviceID) {
	/** Create new state */
	var newState = document.getElementById(deviceID).getAttribute("data-state") === "1" ? 0 : 1;

	/** Use the devices class of sdk to report the upgrade */
	await project.devices().device(deviceID).setParms({
		state: newState
	});
}

/** Add event handler on logout icon */
document.getElementById("logout").addEventListener("click", async () => {
	/** Show the loader */
	displayLoader();

	/** and use the auth class of sdk to logout the user */
	await project.auth().logout();

	/** Then call start again */
	start();
});

/** Function to show laoder screen */
function displayLoader() {
	/** Display loader */
	document.getElementById("loader").style.display = "flex";

	/** Hide login screen */
	document.getElementById("login").style.display = "none";

	/** Hide devices screen */
	document.getElementById("devices").style.display = "none";
}

/** Function to show login screen */
function displayLogin() {
	/** Hide loader */
	document.getElementById("loader").style.display = "none";

	/** Display login screen */
	document.getElementById("login").style.display = "flex";
}

/** Function to show devices screen */
function displayDevices() {
	/** Hide loader */
	document.getElementById("loader").style.display = "none";

	/** Display devices screen */
	document.getElementById("devices").style.display = "flex";
}

/** Start the app */
start();