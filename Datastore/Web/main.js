/**
* @file main.js - Handles the working of our web app.
*/

const apiKey = "YOUR-API-KEY";
const accessKey = "YOUR-ACCESS-KEY";
const accessToken = "YOUR-ACCESS-TOKEN";

/** Initializing the SDK and getting reference to our project */
var project = grandeur.init(apiKey, accessKey, accessToken);

/** Function to log in the user */
async function login() {
	/** Hard-coding user's credentials here. In a production-ready app, 
	 *  this will be replaced by a login screen.
	*/
	var email = "test@grandeur.tech"; 
	var password = "test:80";

	/** This sets the status to "logging in" */
	document.getElementById("status").innerText = "Logging in";

	/** Getting reference to Auth class */
	var auth = project.auth();

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
		 *  An error usually occurs only if we are not connected to the internet.
		*/
		document.getElementById("status").innerText = "Network Error";
	}
}

/** Calling login here runs it when the app loads */
login();

/** State of our device */
var deviceState = false;

/** Store the device's ID */
var deviceID = "YOUR-DEVICE-ID";

/** Mode of graph */
var mode = "r";

/** Configuration for chart */
const chartConfig = {
	type: "line",
	data: {
		labels: [], 
		datasets: [{
			borderColor: '#000000',
			steppedLine: true,
			data: []
		}]
	},
	options: {
		legend: {display: false},
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			xAxes: [{
				type: "time",
				scaleLabel: {labelString: "Time"}, 
			}],
			yAxes: [{
				ticks:{min: 0, max: 1, stepSize: 1}, 
				scaleLabel: {labelString: "State"}
			}]
		}
	}
};

/** This function is called when the web app loads */
window.onload = function() {
	/** We draw an empty chart when the app loads. */
	const ctx = document.getElementById('graph').getContext('2d');

	/** Creating a new chart */
	window.graph = new Chart(ctx, chartConfig);
}

/** This sets onclick handler for the toggle-state button */
async function toggleState() {
	/** This function toggles the state value and publishes it to the cloud */

	/** Toggling the state */
	deviceState = !deviceState;

	/** Get a timestamp */
	var timeStamp = Date.now();

	/** This gets reference to device class */
	var device = project.devices().device(deviceID);

	/** From packet */
	var packet = {
		state: deviceState,
		changedAt: timeStamp
	}

	/** This publishes the state update to the cloud */
	await device.data().set("", packet);

	/** Log the data into history by using datastore */
	await project.datastore().collection("history").insert([packet]);
}

/** Get data from datastore */
async function getData() {
	/** Variable to store documents */
	var documents = [];

	/** Search datastore and get packets */
	var history = project.datastore().collection("history");
	var res = await history.search();

	/** Push documents to array */
	documents = res.documents;

	/** If the number of documents received
	 *  are less than total. Then query again 
	*/
	var page = 2;

	while(documents.length < res.nDocuments) {
		res = await history.search({}, undefined, page);

		/** Push documents */
		documents = [...documents, ...res.documents];

		/** Increase page number */ 
		page += 1;
	}

	/** Loop over the documents */
	documents.forEach(doc => {
		/** Push data to chart */
		chartConfig.data.labels.push(doc.changedAt);
		chartConfig.data.datasets[0].data.push(doc.state);
	});
}

/** Change graph mode */
async function changeMode(m) {
	/** Set mode */
	mode = m;

	/** Update label */
	document.getElementById("graph-mode").innerHTML = mode == "r"? "Realtime" : "History";

	/** Clear the graph data and label */
	chartConfig.data.labels = [];
	chartConfig.data.datasets[0].data = [];

	/** If mode is now history */
	if (mode == "h") {
		await getData();
	}

	/** Update graph */ 
	window.graph.update();
}

/** After successful user authentication, 
 * the SDK establishes a real-time connection with the
 * cloud. And that change in connection status is propagated 
 * through the onConnection function here.
*/
project.onConnection((status) => {
	/** This callback function is called when the connection status changes */
	switch(status) {
		case "CONNECTED":
			/** If the app is connected with the cloud,
			 * this sets the status to "Connected".
			*/
			document.getElementById("status").innerText = "Connected";
			
			/** Add event listener on device parms */
			project.devices().device(deviceID).data().on("", (path, update) => {
				/** If the mode of the graph is realtime */
				if (mode == "r") {
					/** Push to graph */
					chartConfig.data.labels.push(update.changedAt);
					chartConfig.data.datasets[0].data.push(update.state);

					/** Update graph */
					window.graph.update();
				}
			});

			/* Set mode and label */
			mode = "r";
			document.getElementById("graph-mode").innerHTML = mode == "r"? "Realtime": "History";

			break;

		default:
			/** If the app is disconnected from the cloud,
			 * this sets the status to "Disconnected".
			*/
			document.getElementById("status").innerText = "Disconnected";
	}
});