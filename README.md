# Artillery Command

**Artillery Command** is a tactical web-based simulation game where you step into the role of a Fire Support Commander. Coordinate strikes, calculate trajectories using grid coordinates, and manage radio communications to defend your base and destroy enemy targets.

Inspired by the realistic mechanics of military simulators like Arma and Squad, this game shifts the focus from frontline combat to the behind-the-scenes challenges of indirect fire support.

## Features

* **Tactical Gameplay:** Use map grids, azimuth (Degree), and elevation (Mil) to calculate precise firing solutions.
* **Radio Communication System:** Interact with a simulated Radio Operator via an in-game chatbox. Ask for target coordinates, request ammo info, or call for help using keywords.
* **Dynamic Enemies:** Face various enemy types (Tanks, Infantry, APCs, Bases) with unique stats, sizes, and point values.
* **Strategic Ammo Choices:** Choose between High Explosive (HE) for massive pinpoint damage or Shrapnel for a wider blast radius.
* **Save & Resume:** Game progress is automatically saved in your browser's LocalStorage so you never lose your progress.
* **Global Leaderboard:** Compete with other commanders for the highest score and most targets destroyed.
* **Debug/Cheat Menu:** Built-in tools for learning the mechanics (Aim lines, Hitbox visibility).

## Technologies Used

* **Frontend:** HTML5, CSS3, Bootstrap 5
* **Game Engine:** p5.js (Canvas 2D Rendering)
* **Backend:** Node.js, Express.js
* **Data Storage:** JSON & LocalStorage API

## How to Play

1. **Monitor Comms:** Watch the Radio Operator's messages for enemy grid coordinates (e.g., `C16`, `N3`). You can also type in the chat to request target locations.
2. **Calculate:** Find the grid on the map. Use the **Artillery Fire Table** to match the target's distance to the correct elevation (Mil).
3. **Aim & Fire:** Adjust the Degree and Mil sliders (or use `W/A/S/D` / `Arrow keys`). Select your Ammo type, and press **FIRE** (or `Spacebar`).
4. **Watch your fire!** Protect the green Friendly Outpost. Friendly fire will result in massive point loss and immediate mission failure.

## Installation & Setup

To run this game locally on your machine:

1. Clone the repository:
   ```bash
   git clone https://github.com/HamidHekmatnezhad/Artillery-Command.git
    ```

2. Navigate to the project directory:
    ```bash
    cd Artillery-Command
    ```


3. Install the required Node.js dependencies:
    ```bash
    npm install
    ```


4. Start the server:
    ```bash
    npm start 
    # or run: node server.js (depending on your package.json setup)
    ```


5. Open your web browser and go to `http://localhost:8080` (or the port defined in your backend).

## Developer & Credits

* **Developed by:** Hamid Hekmatnezhad
* Created as a project for Web Programming 1 at Technische Hochschule Deggendorf (THD).
* **Icons:** Provided by [Game-icons.net](https://game-icons.net) under the CC BY 3.0 License.
