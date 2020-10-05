/**
 * @file: main.js
 * Initialize the SDK and get 
 * a reference to the project
*/

var project = apollo.init("YOUR-API-KEY", "YOUR-ACCESS-KEY", "YOUR-ACCESS-TOKEN");

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
		return setTimeout(displayDevices, 5000);
	}

	/** otherwise display the login screen again */
	displayLogin();
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
			<div class="tile" onclick="displayData('${device.deviceID}')">
				<div class="inner ${device.parms.state? "on" : ""}" id="${device.deviceID}" data-state="${device.parms.state}">
					<div>${device.name}</div>
					<img src="src/power.svg" />
				</div>
			</div>
		`
	});

	/** Assign content to ui */
	document.getElementById("tiles").innerHTML = content;
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

/** Realtime data */
async function getRealtimeUpdates() {
	/** Reset config */
	chartConfig.data.labels = [];
	chartConfig.data.datasets[0].data = [];
	chartConfig.data.datasets[1].data = [];

	/** Create a new graph */
	window.graph = new Chart(ctx, chartConfig);

	/** Get reference to devices*/
	var devices = await project.devices();

	/** and add handler to update on device data */
	state.handler = await devices.device(state.deviceID).onSummary((update) => {
		/** Push labels to graph */
		chartConfig.data.labels.push(update.time * 1000);

		/** Push data */
		chartConfig.data.datasets[0].data.push(update.current);
		chartConfig.data.datasets[1].data.push(update.power);

		/* Update graph */
		window.graph.update();
	});
}

/** Add event handler to back button on graph page */
document.getElementById("displayDevices").addEventListener("click", async () => {
	/** Unsub to device updates */
	await state.handler.clear();

	/** Get list */
	displayDevices();
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

	/** Also hide graph screen */
	document.getElementById("data").style.display = "none";

	/** Display devices screen */
	document.getElementById("devices").style.display = "flex";

	/** Get devices list */
	getDevicesList();
}

/** Function to show a device data */
function displayData(deviceID) {
	/** Hide devices screen */
	document.getElementById("devices").style.display = "none";

	/** Display data screen */
	document.getElementById("data").style.display = "flex";

	/** Preserve device id */
	state.deviceID = deviceID;

	/** Get realtime data updates of device */
	getRealtimeUpdates();
}

/** State of graph */
var state = {
	deviceID: null,
	handler: null
}

/** Get reference to graph */
const ctx = document.getElementById('graph').getContext('2d');

/** Create gradients */
var gradient1 = ctx.createLinearGradient(0, 0, 0, 400);
gradient1.addColorStop(0, "rgba(116, 195, 101, 0.1)");
gradient1.addColorStop(1, "rgba(116, 195, 101, 0)");

var gradient2 = ctx.createLinearGradient(0, 0, 0, 400);
gradient2.addColorStop(0, "rgba(242, 0, 60, 0.1)");
gradient2.addColorStop(1, "rgba(242, 0, 60, 0)");

/** Configuration for chart */
const chartConfig = {
	/** Type of chart */
	type: "line",

	/** Data of chart */
	data: {
		/** xAxis labels */
		labels: [], 

		/** yAxis data */
		datasets: [{
			label: 'Current',
			yAxisID: 'current',
			borderColor: '#74C365',
			backgroundColor: gradient1,
			data: []
		},
		{
			label: 'Power',
			yAxisID: 'power',
			borderColor: '#F2003C',
			backgroundColor: gradient2,
			data: []
		}]
	},

	/** Chart options */
	options: {
		/** Display legend */
		legend: {display: true},

		/** Graph should be responsive */
		responsive: true,
		maintainAspectRatio: false,

		/** Definiton of the Axes */
		scales: {
			/** First is xAxis */
			xAxes: [{
				/** Display grid line */
				gridLines: {
					color: '#1d1d1d'
				},

				/** It is going to be time axis */
				type: "time",

				/** Only 6 readings of time will be displayed at a time */
				ticks: {
					autoSkip: true, 
					maxTicksLimit: 6
				},

				/** Show axis lable */
				scaleLabel: {
					labelString: "Time",
					display: true,
					fontColor: '#efefef'
				}, 
			}],

			/** Then comes yAxis and we are going to have two of them */
			yAxes: [{
				/** One for current on the left side*/
				id: 'current',
				position: 'left',
				ticks:{
					min: 0
				},

				/** Give our scale a lable */
				scaleLabel: {
					display: true,
					labelString: "Current",
					fontColor: '#efefef'
				}
			},
			{
				/** and one for power on the right */
				id: 'power',
				position: 'right',
				ticks:{
					min: 0
				},
				stacked: true,

				/** Give our scale a lable */
				scaleLabel: {
					display: true,
					labelString: "Power",
					fontColor: '#efefef'
				}
			}]
		}
	}
};

/** Start the app */
start();