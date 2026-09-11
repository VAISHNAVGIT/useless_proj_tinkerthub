<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# DOES THIS BELONG HERE? 🎯


## Basic Details
### Team Name: Useless Duo


### Team Members
- Team Lead: Anshias Anto - Jyothi Engineering College
- Member 2: Vaishnav C - Jyothi Engineering College

### Project Description
"DOES THIS BELONG HERE?" is an over-engineered, bureaucracy-driven smart dustbin that refuses to accept your trash without conducting a full digital trial. Equipped with ESP32 hardware sensors, dual servo-actuated trapdoors, a retro-cartoon 3D WebGL dashboard, and custom sound FX, this bin forces users to defend their waste before an aggressive Waste Tribunal.

### The Problem (that doesn't exist)
People just throw trash into dustbins carelessly without undergoing a rigorous 5-step legal interrogation, taking an oath of waste origin, or playing an agonizing game of mouse-tag with an evasive "YES" button. Society is collapsing because trash isn't being put on trial before being discarded!

### The Solution (that nobody asked for)
We built an IoT smart bin connected via WebSockets to a React/Three.js web tribunal. As you approach, the IR sensor triggers the motorized lid to open. Drop your item inside, and Case #8849-B opens on the web dashboard. If you claim the trash belongs, you must click an evasive "YES" button that flees across your entire screen! If you surrender, the bottom rejection servo opens (GPIO 21), physically dumping your garbage straight onto the floor while blasting angry sirens and confetti!

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
![Dashboard Overview](images/Screenshot%202026-09-12%20025754.png)
*Interactive Retro-Cartoon 3D Dashboard showing real-time bin status, live event log, sound FX toggle, and waste tribunal controls.*

![Hardware Front View](images/hardware%20front%20view.jpg)
*Front physical build view of the Smart Bin featuring the top motorized intake lid.*

![Hardware Back View](images/hardware%20back%20view.jpg)
*Back physical build view displaying the ESP32 microcontroller, IR sensor, and servo wiring setup.*

# Diagrams
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
![Hardware Circuit Wiring](images/hardware%20back%20view.jpg)
*Hardware circuit wiring displaying ESP32 GPIO 18 (IR Sensor), GPIO 19 (Lid Servo), GPIO 21 (Rejection Servo) and 5V Common Ground connection.*

![Hardware Physical Structure](images/hardware%20front%20view.jpg)
*Physical mechanical schematic showing dual-servo trapdoor assembly for top intake and bottom rejection.*

# Build Photos
![Components](images/hardware%20back%20view.jpg)
*ESP32 Dev Module, FC-51 IR sensor, dual SG90 servos, breadboard, and jumper wiring.*

![Build](images/hardware%20front%20view.jpg)
*Chassis fabrication showing dual trapdoors and servo arm mounting.*

![Final](images/hardware%20front%20view.jpg)
*Final completed physical build of the DOES THIS BELONG HERE? Smart Dustbin.*

### Project Demo
# Video
[Software Demo Video](videos/demo%20video%20software%20.mp4)
*Demonstrates the WebGL 3D dashboard, Waste Tribunal case popup, sound effects, and full-screen evasive YES button physics.*

# Additional Demos
[Hardware Demo Video](videos/hardware%20demo%20video.mp4)
*Shows the physical ESP32 bin detecting waste, opening the top lid, receiving WebSocket commands, and triggering the bottom rejection door to dump waste.*

## Team Contributions
- Anshias Anto: Developed the React 3D Dashboard, WebGL Three.js bin model, WebSocket client service, full-screen evasive button physics & clamping algorithm, retro-cartoon design system, and custom Web Audio sound engine.
- Vaishnav C: Designed the ESP32 state machine firmware, IR sensor threshold tuning, dual servo actuation mechanics (Lid Servo & Rejection Trapdoor), circuit power wiring, and physical bin chassis assembly.

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)
