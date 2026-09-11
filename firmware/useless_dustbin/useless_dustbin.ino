/*
  DOES THIS BELONG HERE?
  An unnecessarily serious waste-authentication dustbin.

  Board: ESP32 Dev Module
  Sensor: IR Obstacle Sensor Module (FC-51 / TCRT5000 / Digital IR)
  Actuators: 2 Hobby Servos (Powered by Arduino 5V/GND with Common GND to ESP32)

  Wiring:
    IR Sensor OUT      -> GPIO 18 (Digital Input)
    IR Sensor VCC      -> 3.3V or 5V
    IR Sensor GND      -> ESP32 GND
    
    Lid Servo Signal   -> GPIO 19
    Reject Servo Signal-> GPIO 21
    
    *POWER WIRING*:
    - Servo VCC (+5V)  -> Arduino 5V
    - Servo GND        -> Arduino GND
    - ESP32 GND        -> Arduino GND  <-- CRITICAL: Common Ground must be connected!

  Libraries required in Arduino IDE:
    1. ESP32 board package (by Espressif)
    2. WebSockets (by Markus Sattler)
    3. ESP32Servo (by Kevin Harrington)
    4. ArduinoJson (by Benoit Blanchon, v6 or v7)
*/

#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <WebSocketsServer.h>
#include <WiFi.h>

// ---------------------------------------------------------------------------
// Configuration & Pin Definitions
// ---------------------------------------------------------------------------

const char* WIFI_SSID = "Not Secure";        // Replace with your Wi-Fi SSID
const char* WIFI_PASSWORD = "Vac3233d"; // Replace with your Wi-Fi Password
const uint16_t WEBSOCKET_PORT = 81;

// Pin Assignments
const uint8_t IR_SENSOR_PIN = 18;      // Digital output pin from IR sensor
const uint8_t LID_SERVO_PIN = 19;      // Servo #1 (Top Lid)
const uint8_t REJECT_SERVO_PIN = 21;   // Servo #2 (Bottom Rejection Door)

// IR Sensor polarity: Most digital IR modules output LOW when an object is detected.
// Set to true if LOW = Object Detected, or false if HIGH = Object Detected.
const bool IR_ACTIVE_LOW = true;

// Optional Pins (set to 255 if not connected)
const uint8_t STATUS_LED_PIN = 2;       // Onboard LED for WiFi status
const uint8_t BUZZER_PIN = 255;         // Optional Piezo Buzzer

// Servo Angles (Degrees) - Increase REJECT_OPEN_ANGLE for wider door opening
const int LID_CLOSED_ANGLE = 8;
const int LID_OPEN_ANGLE = 180;
const int REJECT_CLOSED_ANGLE = 0;     // Fully closed bottom door
const int REJECT_OPEN_ANGLE = 180;    // Maximum physical opening angle (180°)

// Timing Constants
const unsigned long LID_OPEN_TIME_MS = 3000;
const unsigned long OFFLINE_VERDICT_TIMEOUT_MS = 6000;
const unsigned long REJECT_DOOR_OPEN_TIME_MS = 3000;
const unsigned long SENSOR_READ_INTERVAL_MS = 100;
const unsigned long STATUS_BROADCAST_INTERVAL_MS = 500;
const unsigned long DETECTION_COOLDOWN_MS = 2500;
const unsigned long WIFI_RETRY_INTERVAL_MS = 10000;
const unsigned long SERVO_STEP_INTERVAL_MS = 15;

// ---------------------------------------------------------------------------
// State Machine
// ---------------------------------------------------------------------------

enum SystemState {
  IDLE = 0,
  PERSON_DETECTED = 1,
  LID_OPEN = 2,
  WAITING_FOR_WASTE = 3,
  WASTE_DETECTED = 4,
  LID_CLOSING = 5,
  AWAITING_VERDICT = 6,
  REJECTING = 7,
  COMPLETE = 8,
  ERROR_STATE = 9
};

const char* stateName(SystemState state) {
  switch (state) {
    case IDLE: return "IDLE";
    case PERSON_DETECTED: return "PERSON_DETECTED";
    case LID_OPEN: return "LID_OPEN";
    case WAITING_FOR_WASTE: return "WAITING_FOR_WASTE";
    case WASTE_DETECTED: return "WASTE_DETECTED";
    case LID_CLOSING: return "LID_CLOSING";
    case AWAITING_VERDICT: return "AWAITING_VERDICT";
    case REJECTING: return "REJECTING";
    case COMPLETE: return "COMPLETE";
    case ERROR_STATE: return "ERROR_STATE";
  }
  return "UNKNOWN";
}

// Global Objects & States
Servo lidServo;
Servo rejectServo;
WebSocketsServer webSocket(WEBSOCKET_PORT);

SystemState currentState = IDLE;

bool objectPresent = false;
float currentDistanceCm = 400.0; // Simulated distance for web dashboard compatibility (10cm = detected, 400cm = clear)
int lidAngle = LID_CLOSED_ANGLE;
int rejectAngle = REJECT_CLOSED_ANGLE;
int lidTargetAngle = LID_CLOSED_ANGLE;
int rejectTargetAngle = REJECT_CLOSED_ANGLE;

bool webClientConnected = false;
uint8_t webClientCount = 0;
bool rejectionMotionStarted = false;

unsigned long stateStartedAt = 0;
unsigned long lastSensorReadAt = 0;
unsigned long lastStatusBroadcastAt = 0;
unsigned long lastServoStepAt = 0;
unsigned long lastDetectionAt = 0;
unsigned long lastWifiRetryAt = 0;
unsigned long rejectDoorOpenedAt = 0;

// Function Declarations
void setState(SystemState nextState, const char* eventName, const char* details);
void readIRSensor();
void updateServos();
void handleStateMachine();
void beginRejection(const char* reason);
void connectWiFi();
void handleWiFi();
void setupWebSocket();
void onWebSocketEvent(uint8_t clientId, WStype_t type, uint8_t* payload, size_t length);
void handleCommand(const char* command);
void broadcastEvent(const char* eventName, const char* details);
void broadcastStatus();
void closeEverything();
void beep(unsigned int frequency, unsigned long durationMs);

// ---------------------------------------------------------------------------
// Setup & Loop
// ---------------------------------------------------------------------------

void setup() {
  Serial.begin(115200);
  delay(300);

  Serial.println();
  Serial.println("======================================");
  Serial.println("  DOES THIS BELONG HERE?");
  Serial.println("  Waste Authentication Authority (IR Version)");
  Serial.println("======================================");

  // Configure IR Sensor Pin
  pinMode(IR_SENSOR_PIN, INPUT_PULLUP);

  if (STATUS_LED_PIN != 255) {
    pinMode(STATUS_LED_PIN, OUTPUT);
    digitalWrite(STATUS_LED_PIN, LOW);
  }

  if (BUZZER_PIN != 255) {
    pinMode(BUZZER_PIN, OUTPUT);
  }

  // Servo Timers Allocation for ESP32
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);

  lidServo.setPeriodHertz(50);
  rejectServo.setPeriodHertz(50);
  lidServo.attach(LID_SERVO_PIN, 450, 2550);
  rejectServo.attach(REJECT_SERVO_PIN, 450, 2550);

  closeEverything();
  connectWiFi();
  setupWebSocket();

  setState(IDLE, "SYSTEM_READY", "Waste tribunal is online (IR Sensor active)");
}

void loop() {
  handleWiFi();
  webSocket.loop();

  const unsigned long now = millis();

  if (now - lastSensorReadAt >= SENSOR_READ_INTERVAL_MS) {
    lastSensorReadAt = now;
    readIRSensor();
  }

  updateServos();
  handleStateMachine();

  if (now - lastStatusBroadcastAt >= STATUS_BROADCAST_INTERVAL_MS) {
    lastStatusBroadcastAt = now;
    broadcastStatus();
  }
}

// ---------------------------------------------------------------------------
// Wi-Fi & WebSocket Management
// ---------------------------------------------------------------------------

bool wifiConnectedLogged = false;

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("[WiFi] Connecting to ");
  Serial.print(WIFI_SSID);
  Serial.println(" ...");
}

void handleWiFi() {
  const unsigned long now = millis();

  if (WiFi.status() == WL_CONNECTED) {
    if (!wifiConnectedLogged) {
      wifiConnectedLogged = true;
      Serial.println();
      Serial.println("==========================================");
      Serial.println("  🎉 Wi-Fi CONNECTED SUCCESSFULLY!");
      Serial.print("  ESP32 IP ADDRESS : ");
      Serial.println(WiFi.localIP());
      Serial.print("  WebSocket Server : ws://");
      Serial.print(WiFi.localIP());
      Serial.println(":81");
      Serial.println("==========================================");
      Serial.println();
    }
    if (STATUS_LED_PIN != 255) {
      digitalWrite(STATUS_LED_PIN, HIGH);
    }
    return;
  }

  wifiConnectedLogged = false;

  if (STATUS_LED_PIN != 255) {
    digitalWrite(STATUS_LED_PIN, (now / 300) % 2);
  }

  if (now - lastWifiRetryAt >= WIFI_RETRY_INTERVAL_MS) {
    lastWifiRetryAt = now;
    Serial.println("[WiFi] Not connected. Retrying connection...");
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }
}

void setupWebSocket() {
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);
  Serial.print("[WebSocket] Server listening on port ");
  Serial.println(WEBSOCKET_PORT);
}

// ---------------------------------------------------------------------------
// Sensor & Servo Operations
// ---------------------------------------------------------------------------

void readIRSensor() {
  int sensorVal = digitalRead(IR_SENSOR_PIN);
  objectPresent = (sensorVal == (IR_ACTIVE_LOW ? LOW : HIGH));
  
  // Set simulated distance for web dashboard visualizer (10cm = object detected, 400cm = clear)
  currentDistanceCm = objectPresent ? 10.0 : 400.0;
}

void updateServos() {
  const unsigned long now = millis();
  if (now - lastServoStepAt < SERVO_STEP_INTERVAL_MS) {
    return;
  }
  lastServoStepAt = now;

  // Smooth gradual movement for Servo 1 (Main Lid)
  if (lidAngle < lidTargetAngle) {
    lidAngle++;
    lidServo.write(lidAngle);
  } else if (lidAngle > lidTargetAngle) {
    lidAngle--;
    lidServo.write(lidAngle);
  }

  // Smooth gradual movement for Servo 2 (Rejection Door)
  if (rejectAngle < rejectTargetAngle) {
    rejectAngle++;
    rejectServo.write(rejectAngle);
  } else if (rejectAngle > rejectTargetAngle) {
    rejectAngle--;
    rejectServo.write(rejectAngle);
  }
}

// ---------------------------------------------------------------------------
// Main State Machine Logic
// ---------------------------------------------------------------------------

void handleStateMachine() {
  const unsigned long now = millis();

  switch (currentState) {
    case IDLE:
      rejectionMotionStarted = false;
      if (objectPresent && (now - lastDetectionAt >= DETECTION_COOLDOWN_MS)) {
        lastDetectionAt = now;
        setState(PERSON_DETECTED, "OBJECT_DETECTED", "Object detected by IR Sensor");
        beep(1400, 70);
      }
      break;

    case PERSON_DETECTED:
      lidTargetAngle = LID_OPEN_ANGLE;
      setState(LID_OPEN, "LID_OPENING", "Servo 1 is opening the main lid");
      break;

    case LID_OPEN:
      if (lidAngle == lidTargetAngle) {
        setState(WAITING_FOR_WASTE, "LID_OPENED", "Lid is open for deposit window");
      }
      break;

    case WAITING_FOR_WASTE:
      if (now - stateStartedAt >= LID_OPEN_TIME_MS) {
        setState(WASTE_DETECTED, "WASTE_DETECTED", "Deposit window ended");
      }
      break;

    case WASTE_DETECTED:
      lidTargetAngle = LID_CLOSED_ANGLE;
      setState(LID_CLOSING, "LID_CLOSING", "Servo 1 is closing the lid");
      break;

    case LID_CLOSING:
      if (lidAngle == lidTargetAngle) {
        broadcastEvent("LID_CLOSED", "Servo 1 closed the lid");
        setState(AWAITING_VERDICT, "VERIFICATION_STARTED", "Dashboard verdict required");
      }
      break;

    case AWAITING_VERDICT:
      // Rejection door NEVER opens automatically.
      // Wait indefinitely until user presses "NO" on dashboard (which sends REJECT_WASTE).
      break;

    case REJECTING:
      if (!rejectionMotionStarted) {
        rejectionMotionStarted = true;
        rejectTargetAngle = REJECT_OPEN_ANGLE;
        rejectDoorOpenedAt = now;
        broadcastEvent("REJECTION_STARTED", "Servo 2 opened the rejection door");
        beep(600, 180);
      }

      if (now - rejectDoorOpenedAt >= REJECT_DOOR_OPEN_TIME_MS) {
        rejectTargetAngle = REJECT_CLOSED_ANGLE;
      }

      if (now - rejectDoorOpenedAt >= REJECT_DOOR_OPEN_TIME_MS && rejectAngle == rejectTargetAngle) {
        setState(COMPLETE, "REJECTION_COMPLETED", "Rejected waste expelled");
      }
      break;

    case COMPLETE:
      if (now - stateStartedAt >= 1000) {
        setState(IDLE, "SYSTEM_READY", "Ready for next human interaction");
      }
      break;

    case ERROR_STATE:
      if (STATUS_LED_PIN != 255) {
        digitalWrite(STATUS_LED_PIN, (now / 120) % 2);
      }
      closeEverything();
      break;
  }
}

void beginRejection(const char* reason) {
  lidTargetAngle = LID_CLOSED_ANGLE;
  rejectionMotionStarted = false;
  setState(REJECTING, "REJECTION_QUEUED", reason);
}

void closeEverything() {
  lidTargetAngle = LID_CLOSED_ANGLE;
  rejectTargetAngle = REJECT_CLOSED_ANGLE;
  lidAngle = LID_CLOSED_ANGLE;
  rejectAngle = REJECT_CLOSED_ANGLE;
  lidServo.write(lidAngle);
  rejectServo.write(rejectAngle);
}

void setState(SystemState nextState, const char* eventName, const char* details) {
  currentState = nextState;
  stateStartedAt = millis();

  Serial.print("[State] ");
  Serial.print(stateName(currentState));
  Serial.print(" | ");
  Serial.println(details);

  broadcastEvent(eventName, details);
}

// ---------------------------------------------------------------------------
// WebSocket Callbacks & Commands
// ---------------------------------------------------------------------------

void onWebSocketEvent(uint8_t clientId, WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED: {
      webClientCount++;
      webClientConnected = webClientCount > 0;
      IPAddress ip = webSocket.remoteIP(clientId);

      Serial.print("[WebSocket] Client connected: ");
      Serial.println(ip);

      broadcastEvent("ESP32_CONNECTED", "Dashboard connected to waste tribunal");
      broadcastStatus();
      break;
    }

    case WStype_DISCONNECTED:
      if (webClientCount > 0) {
        webClientCount--;
      }
      webClientConnected = webClientCount > 0;
      Serial.println("[WebSocket] Client disconnected.");
      break;

    case WStype_TEXT: {
      StaticJsonDocument<256> doc;
      DeserializationError error = deserializeJson(doc, payload, length);
      if (error) {
        broadcastEvent("ERROR", "Invalid JSON received");
        return;
      }

      const char* command = doc["command"];
      if (command != nullptr) {
        handleCommand(command);
      }
      break;
    }

    default:
      break;
  }
}

void handleCommand(const char* command) {
  Serial.print("[Command] ");
  Serial.println(command);

  if (strcmp(command, "REJECT_WASTE") == 0) {
    beginRejection("Dashboard rejected the claim");
  } else if (strcmp(command, "ACCEPT_WASTE") == 0) {
    setState(COMPLETE, "ACCEPTED", "Dashboard accepted the waste");
  } else if (strcmp(command, "OPEN_LID") == 0) {
    lidTargetAngle = LID_OPEN_ANGLE;
    setState(LID_OPEN, "LID_OPENING", "Manual lid open command");
  } else if (strcmp(command, "CLOSE_LID") == 0) {
    lidTargetAngle = LID_CLOSED_ANGLE;
    setState(LID_CLOSING, "LID_CLOSING", "Manual lid close command");
  } else if (strcmp(command, "OPEN_REJECTION_DOOR") == 0) {
    rejectTargetAngle = REJECT_OPEN_ANGLE;
    setState(REJECTING, "REJECTION_STARTED", "Manual rejection door open command");
  } else if (strcmp(command, "CLOSE_REJECTION_DOOR") == 0) {
    rejectTargetAngle = REJECT_CLOSED_ANGLE;
    setState(COMPLETE, "REJECTION_COMPLETED", "Manual rejection door close command");
  } else if (strcmp(command, "SIMULATE_PERSON") == 0) {
    setState(PERSON_DETECTED, "OBJECT_DETECTED", "Simulated human presence");
  } else if (strcmp(command, "SIMULATE_WASTE") == 0) {
    setState(WASTE_DETECTED, "WASTE_DETECTED", "Simulated waste deposit");
  } else if (strcmp(command, "RESET_SYSTEM") == 0) {
    closeEverything();
    setState(IDLE, "SYSTEM_READY", "Manual reset complete");
  } else if (strcmp(command, "PING") == 0) {
    broadcastStatus();
  }
}

void broadcastEvent(const char* eventName, const char* details) {
  StaticJsonDocument<384> doc;
  doc["type"] = "event";
  doc["event"] = eventName;
  doc["details"] = details;
  doc["timestamp"] = millis();
  doc["distance"] = currentDistanceCm;
  doc["state"] = currentState;
  doc["lidOpen"] = lidTargetAngle == LID_OPEN_ANGLE || lidAngle > ((LID_OPEN_ANGLE + LID_CLOSED_ANGLE) / 2);
  doc["rejectionOpen"] = rejectTargetAngle == REJECT_OPEN_ANGLE || rejectAngle > ((REJECT_OPEN_ANGLE + REJECT_CLOSED_ANGLE) / 2);
  doc["uptime"] = millis() / 1000;
  doc["ip"] = WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : "not-connected";
  doc["rssi"] = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : 0;

  String output;
  serializeJson(doc, output);
  webSocket.broadcastTXT(output);
}

void broadcastStatus() {
  StaticJsonDocument<384> doc;
  doc["type"] = "status";
  doc["distance"] = currentDistanceCm;
  doc["state"] = currentState;
  doc["lidOpen"] = lidTargetAngle == LID_OPEN_ANGLE || lidAngle > ((LID_OPEN_ANGLE + LID_CLOSED_ANGLE) / 2);
  doc["rejectionOpen"] = rejectTargetAngle == REJECT_OPEN_ANGLE || rejectAngle > ((REJECT_OPEN_ANGLE + REJECT_CLOSED_ANGLE) / 2);
  doc["uptime"] = millis() / 1000;
  doc["ip"] = WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : "not-connected";
  doc["rssi"] = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : 0;

  String output;
  serializeJson(doc, output);
  webSocket.broadcastTXT(output);
}

void beep(unsigned int frequency, unsigned long durationMs) {
  if (BUZZER_PIN == 255) {
    return;
  }
  tone(BUZZER_PIN, frequency, durationMs);
}
