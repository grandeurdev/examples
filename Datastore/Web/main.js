/**
 * @file main.js - Handles the working of our web app.
*/
const apiKey = "grandeurkcqeuvyy1ged01yjbl2pejkr";
const accessKey = "accesskd67pzg0082g01vccg2ehv4c";
const accessToken = "eyJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwWkNJNkltRmpZMlZ6YzJ0a05qZHdlbWN3TURneVp6QXhkbU5qWnpKbGFIWTBZeUlzSW5SNWNHVWlPaUpoWTJObGMzTWlMQ0pwWVhRaU9qRTFPVFU1TlRjeU1UbDkubXNVOTRCTnhSeTBqNHpxTF9kZVpvcDY2bmtZZTJvQTlydkFhMF9URlNQZyJ9";
/** Initializing the SDK and getting reference to our project */
var myProject = apollo.init(apiKey, accessKey, accessToken);

/** This contains our device's ID */
var deviceID = "devicekd69jt7f0bmj01vcg19o68ar";
/** This gets reference to device class */
var myDevice = myProject.devices().device(deviceID);

/** Function to log in the user */
async function login() {
  /** Hard-coding user's credentials here. In a production-ready app, this will be replaced
   * by a login screen.
  */
  var email = "ma@grandeur.tech"; /** YOUR USER'S EMAIL */
  var password = "mabdullah284"; /** YOUR USER'S PASSWORD */

  /** This sets the status to "logging in" */
  document.getElementById("status").innerText = "Logging in";

  /** Getting reference to Auth class */
  var auth = myProject.auth();

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
    console.log(err);
    document.getElementById("status").innerText = "Network Error";
  }
}

/** Calling login here runs it when the app loads */
login();

/** State of our device */
var deviceState = false;

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
};

/** This function is called when the web app loads */
window.onload = function() {
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
});