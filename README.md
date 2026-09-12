<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# DOES THIS BELONG HERE? 🎯


## Basic Details
### Team Name: Useless Duo


### Team Members
- Team Lead: Anshias Anto - Jyothi Engineering College
- Member 2: Vaishnav C - Jyothi Engineering College

### Project Description
Meet Teeku, our beloved trashbin and probably the most emotionally neglected member of our team. Every day, people throw their waste at her without asking how she feels. So we decided to give Teeku a voice, a brain, and the power to decide what belongs to her.

### The Problem (that doesn't exist)
Every day, we watched Teeku suffer in silence. People approached her, threw random things at her, and walked away without even a “thank you.” She has a soft heart, but nobody respects her feelings. The worst part? She couldn't even say NO.

### The Solution (that nobody asked for)
We gave Teeku what she always deserved: a little intelligence and a lot of attitude. With an IR sensor, servos, ESP32, and a fancy dashboard, Teeku can detect people, open her lid, question their waste, and reject it when she's not in the mood. Because sometimes, a trashbin just needs boundaries. 😂
## Technical Details
### Technologies/Components Used
For Software:
- Languages: TypeScript, JavaScript, HTML, C++ (Arduino/ESP32)
- Frameworks: React 18, Vite
- Libraries: Three.js, `@react-three/fiber`, `@react-three/drei`, Canvas Confetti, Lucide React, WebSockets
- Tools: VS Code, npm, Web Audio API

For Hardware:
- Main components: ESP32 Dev Module, 2x SG90/MG90S Servo Motors, FC-51 IR Obstacle Sensor Module
- Specifications: GPIO 18 (IR Sensor), GPIO 19 (Lid Servo), GPIO 21 (Rejection Servo), 5V DC Power (Common Ground to ESP32)
- Tools required: Arduino IDE, Soldering Iron, Jumper Wires, 5V Power Supply

### Implementation
For Software:
# Installation
```bash
cd dashboard
npm install
```

# Run
```bash
npm run dev
```

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![Dashboard Overview](images/software2.png)
**Initial State:* The dashboard displays the system status, sensor readings, servo positions, and the cartoon dustbin opens the lid when the sensor detects an object..*

![Dashboard Overview](images/software1.png)
**Waste Detection & Verdict:* The system detects an object and presents the user with the question *“DOES THIS BELONG HERE?”* along with YES and NO options.*

![Dashboard Overview](images/software4.png)
**Confirmation Stage:* After selecting YES, the system challenges the user with a proof/audit prompt, making the YES option intentionally difficult to select.*

![Dashboard Overview](images/software3.png)
**Rejection & Angry Mode:* When the user finally selects NO, the system rejects the waste with an angry cartoon animation, screen effects, and the message *“CLAIM REJECTED!”**


# Diagrams

![System workflow](images/workflow.png)

```
[ IR Sensor (GPIO 18) ] ---> ( Detects Person / Waste )
                                       |
                                       v
[ ESP32 Microcontroller ] <=== ( WebSocket Port 81 ) ===> [ React + Three.js Web Dashboard ]
   |                  |                                               |
   | (GPIO 19)        | (GPIO 21)                                     v
   v                  v                                     [ Waste Tribunal Case ]
( Lid Servo )    ( Reject Door Servo )                             - "DOES THIS BELONG HERE?"
                                                                   - Full-Screen Evasive YES Button
                                                                   - Surrender / Reject Trigger
```
*System Workflow & Hardware Architecture Diagram*

For Hardware:

# Schematic & Circuit
![Hardware Circuit Wiring](images/schematics.png)
*Hardware circuit wiring displaying ESP32 GPIO 18 (IR Sensor), GPIO 19 (Lid Servo), GPIO 21 (Rejection Servo) and 5V Common Ground connection.*

![Hardware Physical Structure](images/hardware%20back%20view.jpg)
*Physical mechanical schematic showing dual-servo trapdoor assembly for top intake and bottom rejection.*

# Build Photos

![Components](images/components.png) 
### 🧰 Components Used
| Component | Quantity | Purpose |
|---|---:|---|
| **ESP32 Dev Module** | 1 | Main microcontroller; handles sensor input, servo control, and WebSocket communication |
| **Servo Motor** | 2 | One servo controls the main lid, while the second controls the waste rejection trapdoor |
| **IR Obstacle Sensor Module** | 1 | Detects the presence of a person/object near the dustbin |
| **Jumper Wires** | As required | Used for connecting the ESP32, sensor, and servo motors |
| **Arduino Uno** | 1 | Provides 5V power for the servo motors |
| **Breadboard** | 1 | Used for temporary prototyping and circuit connections |


## 🛠️ Our Building Journey

On *September 11th, at around 2:00 PM, we started working on this project and continued working through the night. We finally completed it by **6:00 AM on September 12th. What you see now is the result of **16 hours of straight hard work, problem-solving, and teamwork*.

We started building our project at around *2:00 PM. Thankfully, we had all the necessary sensors and components ready for the project. However, at the last minute, our **ultrasonic sensor suddenly stopped working. Instead of giving up, we immediately came up with a backup plan. We had an **IR sensor* that we had purchased as a backup, so we decided to use it instead. This allowed us to continue building without letting a last-minute hardware failure stop us.

### 🖨️ A Compromise Due to Time & Budget

We initially planned to *3D print both the servo-controlled opening lid and the servo-controlled rejection lid* for our physical trashbin. However, due to *time constraints and budget limitations*, we were unable to get the parts 3D printed.

Although we could not implement our original design exactly as planned, we adapted the physical setup with the resources available to us and continued working towards a functional prototype.

### 🎭 An Unexpected Idea — Giving Teeku a Voice

The *Malayalam movie dialogues* used in our project were not part of our initial plan. While developing the project, we felt that something was missing. We wanted to give our physical trashbin more *personality and character*.

That's when we came up with the idea of giving our trashbin a *face* and making it feel as though it could actually talk. We added a few funny Malayalam movie dialogues to make the interaction more entertaining and give the impression that *Teeku, our trashbin, is actually talking to the user*.

What started as a simple addition turned out to be one of the elements that gave Teeku its own personality and made the project much more fun.

![Final](images/hardware%20front%20view.jpg)
*Final completed physical build of the DOES THIS BELONG HERE? Smart Dustbin.*

### Project Demo
# 🎥 Video
![Software Demo Video](images/software_demo.gif)
## 🎥 Software Demo Video

[▶️ Watch the Software Demo Video](https://drive.google.com/file/d/1OewOA4GsU9W6zA58sZD-3-WlhjrQukd1/view?usp=sharing)
- *Demonstrates the WebGL 3D dashboard, Waste Tribunal case popup, sound effects, and full-screen evasive YES button physics.*

## 🎥 Hardware Demo Video
[▶️ Watch the Hardware Demo Video](https://drive.google.com/file/d/1Zwif39WzWgbZErMasutLqKOMjEUEVCMh/view?usp=sharing)
- *Shows the physical ESP32 bin detecting waste, opening the top lid, receiving WebSocket commands, and triggering the bottom rejection door to dump waste.*

## Team Contributions
- Anshias Anto: Developed the React 3D Dashboard, WebGL Three.js bin model, WebSocket client service, full-screen evasive button physics & clamping algorithm, retro-cartoon design system, and custom Web Audio sound engine.
- Vaishnav C: Designed the ESP32 state machine firmware, IR sensor threshold tuning, dual servo actuation mechanics (Lid Servo & Rejection Trapdoor), circuit power wiring, and physical bin chassis assembly.

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)
