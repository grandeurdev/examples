/* Connect to Grandeur over MQTT
*/

#include "freertos/FreeRTOS.h"
#include "esp_netif.h"
#include "esp_log.h"
#include "mqtt_client.h"
#include "wifi.h"

static const char *TAG = "GRANDEUR_MQTT";

#define MQTT_BROKER_URL "mqtt://mqtt.api.grandeur.tech:1883"
// Replace with your API key and Auth token or run idf.py menuconfig and update them in "Grandeur Configuration"
#define API_KEY CONFIG_API_KEY
#define AUTH_TOKEN CONFIG_AUTH_TOKEN

#define N_TOPICS 2
const char* topicsList[N_TOPICS] = {"devicelfdzibp1qwso0jj7blg4a407/current", "devicelfdzibp1qwso0jj7blg4a407/voltage"};

void subscribe(esp_mqtt_client_handle_t client, const char* topic) {
    esp_mqtt_client_subscribe(client, topic, 0);
}

static esp_err_t mqtt_event_handler_cb(esp_mqtt_event_handle_t event) {
    // Checks which event occurred.
    switch (event->event_id) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI(TAG, "Connected to Grandeur!");
            for(int i = 0; i < N_TOPICS; i++) subscribe(event->client, topicsList[i]);
            break;
        case MQTT_EVENT_DISCONNECTED:
            ESP_LOGI(TAG, "Disconnected from Grandeur!");
            break;
        case MQTT_EVENT_ERROR:
            ESP_LOGI(TAG, "Error occurred!");
            break;
        case MQTT_EVENT_DATA:
            // When an update occurs, this prints topic and the updated data on that topic.
            printf("Update on topic %.*s: ", event->topic_len, event->topic);
            printf("%.*s\r\n", event->data_len, event->data);
            break;
        case MQTT_EVENT_SUBSCRIBED:
        case MQTT_EVENT_BEFORE_CONNECT:
        case MQTT_EVENT_PUBLISHED:
        case MQTT_EVENT_UNSUBSCRIBED:
        case MQTT_EVENT_ANY:
        break;
    }
    return ESP_OK;
}

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
    mqtt_event_handler_cb(event_data);
}

static void mqtt_app_start(void) {
    // Sets up a new MQTT configuration.
    esp_mqtt_client_config_t mqtt_cfg = {
        .uri = MQTT_BROKER_URL,
        .username = API_KEY,
        .password = AUTH_TOKEN
    };

    // Creates a new MQTT client with our configuration.
    esp_mqtt_client_handle_t client = esp_mqtt_client_init(&mqtt_cfg);
    // Sets up our event handler.
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, client);
    // Fires up the MQTT client.
    esp_mqtt_client_start(client);
}

void app_main(void) {
    // Initializes the TCP/IP adapter.
    ESP_ERROR_CHECK(esp_netif_init());
    // Creates an event loop for event-handling.
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    // Initializes the WiFi.
    wifi_init_sta();
    // Starts the MQTT.
    mqtt_app_start();
}
