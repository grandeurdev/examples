```javascript
// Init the SDK
const project = grandeur.init("API-KEY", "ACCESS-KEY", "ACCESS-TOKEN");

// ... Your app logic

// Trigger authorization process
await project.auth().oauth("INTEGRATION-ID");

// Then you can obtain auth token
const { token } = await project.auth().oauthAccessToken("INTEGRATION-ID");

// ... Rest of your code logic
```