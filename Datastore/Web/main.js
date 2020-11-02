/**
* @file main.js - Handles the working of our web app.
*/

const apiKey = "YOUR-API-KEY";
const accessKey = "YOUR-ACCESS-KEY";
const accessToken = "YOUR-ACCESS-TOKEN";

/** Initializing the SDK and getting reference to our project */
var project = apollo.init(apiKey, accessKey, accessToken);

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

<<<<<<< HEAD
/** Config Object for our graph */
const chartConfig = {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      data: [],
      borderColor: "#000000",
      steppedLine: true
    }]
  },
  options: {
    title: {display: true, text: "State Update History"},
    legend: {display: false},
    hover: {mode: 'index'},
    fill: false,
    scales: {
      xAxes: [{
        type: "time",
        scaleLabel: {labelString: "Time"},
        gridLines: {display: false}
      }],
      yAxes: [{
        ticks:{min: 0, max: 1, stepSize: 1},
        scaleLabel: {labelString: "State"},
      }]
    }
  }
=======
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
>>>>>>> 00310e3f0a3563ee8d75021f4a6e5066956f0c48
};

/** This function is called when the web app loads */
window.onload = function() {
<<<<<<< HEAD
  /** We draw an empty chart when the app loads. */
  const ctx = document.getElementById('graph').getContext('2d');
  /** Creating a new chart */
  window.myChart = new Chart(ctx, chartConfig);
}

/** This sets onclick handler for the toggle-state button */
document.getElementById("toggle-state").onclick = async () => {
  /** This function toggles the state value and publishes it to the cloud */

  /** Toggling the state */
  deviceState = !deviceState;
  /** This publishes the state update to the cloud */
  await myDevice.setParms({state: deviceState});

  /** This displays the updated state to in the app */
  document.getElementById("state").innerHTML = "State is: " + deviceState;
}

/** This sets onclick handler for the refresh-graph button */
document.getElementById("refresh-graph").onclick = async () => {
  /** This function refreshes the graph with new data from datastore */
  /** This gets reference to our "history" collection in datastore*/
  var historyCollection = myProject.datastore().collection("history");
  /** This fetches first page of documents from our  "history" collection */
  var searchResponse = [];
  searchResponse[0] = await historyCollection.search({}, {documentID: 0}, 1);
  switch(searchResponse[0].code) {
    case "DATASTORE-DOCUMENTS-FETCHED":
      /** If the documents are successfully fetched
      */
      var logs = searchResponse[0].documents;
      /** If there are more pages, we fetch them too in this for-loop */
      for(var i = 1; i == 1 ? searchResponse[i - 1].documents.length != searchResponse[i - 1].numberOfDocuments :
        searchResponse[i - 1].documents.length + searchResponse[i - 2].documents.length != searchResponse[i - 1].numberOfDocuments;
        i++) {
        searchResponse[i] = await historyCollection.search({}, {documentID: 0}, i + 1);
        switch(searchResponse[i].code) {
          case "DATASTORE-DOCUMENTS-FETCHED":
            /** Adding documents to the logs array */
            logs = logs.concat(searchResponse[i].documents);
            break;
          default:
            i--;
        }
      }
      
      /** Clearing previously loaded graph data */
      chartConfig.data.datasets[0].data = [];
      chartConfig.data.labels = [];
      /** Setting labels (x-axis) and data (y-axis) */
      for(key in logs) {
        pushToGraph(new Date(Number(logs[key].timestamp)), logs[key].state)
      }
      /** Refreshing the chart
      */
      window.myChart.update();
      break;
  }
}

function pushToGraph(x, y) {
  /** This function pushes a single data point to our graph. */
  chartConfig.data.labels.push(x);
  chartConfig.data.datasets[0].data.push(y);
}

/** After successful user authentication, the SDK establishes a real-time connection with the
 * cloud. And that change in connection status is propagated through the onConnection function
 * here.
*/
myProject.onConnection((status) => {
  /** This callback function is called when our app's realtime connection
   * with the cloud is established.
  */
  switch(status) {
    case "CONNECTED": 
      /** If the app is connected with the cloud,
       * we show the status as "Connected".
      */
      document.getElementById("status").innerText = "Connected";

      /** And we enable the state-container and graph-container div,
       * making the buttons and the graph visible.
       */
      document.getElementById("state-container").style.display = "block";
      document.getElementById("graph-container").style.display = "block";

      /** Setting a parms update handler. This function will be called when someone
       * updates a parms variable.
       */
      myDevice.onParms((updatedParms) => {
        pushToGraph(new Date(), updatedParms.state);
        window.myChart.update();
      });
      
      /** We refresh our graph with data from the datastore when our app loads.
      */
     document.getElementById("refresh-graph").onclick();
      break;
    default: 
      /** If the app is disconnected from the cloud,
       * we show the status as "Disconnected".
      */
      document.getElementById("status").innerText = "Disconnected";
      /** And disables the state-container and graph-container div,
       * making the buttons and the graph invisible.
       */
      document.getElementById("state-container").style.display = "none";
      document.getElementById("graph-container").style.display = "none";
  }
=======
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
	await device.setParms(packet);

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

	while(documents.length < res.numberOfDocuments) {
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
			project.devices().device(deviceID).onParms((update) => {
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
>>>>>>> 00310e3f0a3563ee8d75021f4a6e5066956f0c48
});