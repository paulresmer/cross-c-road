import { useState } from 'react'
import reactLogo from './assets/react.svg'
import kiki from '../src/assets/download.png'
import diagram3 from '../src/assets/diagram3.png'
import './App.css'
import Typography from '@mui/material/Typography';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div class='page'>
        <div>
          <h1 class='name'>cross-c road</h1>
          <p class='routes'> <a href="https://github.coecis.cornell.edu/ece3140-sp2024/jse77-pgr39/tree/main">jse77 & pgr39</a></p>
        </div>
        <div class='haha'>
          <a href="https://github.coecis.cornell.edu/ece3140-sp2024/jse77-pgr39/tree/main" target="_blank">
            <img src={kiki} className="logo" alt="Vite logo" />
          </a>
          <div class='about'>
            <h3>overview</h3>
            <p class='body'>
              Our game is modeled off the popular mobile device game, Crossy Road. Our implementation of it will have the graphics in Python, and the game logic in C since we need to communicate with our external FRDM board.


              As a brief overview of how the game typically works, we have a character who tries to avoid obstacles in the road and the objective of the game is to get as far as possible down the course without colliding with any of the obstacles.


              We will interact with the board in the following ways:
              In order to move forward, we will use the switch one, located in the top left corner of the board
              To move horizontally to avoid obstacles, we will use the on board gyroscope, and by tilting the board, the player will be able to move the character left and right
              The on board display will display your current score, that is how far you’ve made it in the game, and the score can range from 0 - 8888.


            </p>

            <p class='body'>

            </p>
          </div>
        </div >
        <div class='technical approach'>
          <h3>technical approach</h3>
          <p class='body'>
            We intend to use serial communication with the host computer via the debug PRINTF functions in MCUXpresso and the pyserial package found here (https://pyserial.readthedocs.io/en/latest/). As project files print to the debug console, pyserial will read these outputs and receive them as inputs to our python program, which will contain the graphics for our game. Since we would like the user input for the game to be taken from the FRDM board, we need to code the rest of this project in C in order to communicate and receive the controls from the board. Similar to our discussion where we poll for interrupts in the case that a button was pressed, we will have our program determine when the switch on the board has been pressed, and consequently move the character forward. In order to do this, we will first enable the clock to the port which is associated with the switch. Then, we will clear the PCR Mux bits for the corresponding port. Then, we will need to set up the port as input, so that we can track the user's actions. This is done by setting it up as GPIO. Then, we will turn on pull enables, and clear the interrupt bits for the port so that we can begin with polling whether or not the switch has been pressed. Then, we will have a switch_polling function that moves the character forward if the interrupt flag is on. Afterwards, we clear the flag, and wait for the next switch to be pressed. In terms of game logic, we will largely base our game on Crossy Road, thus, we will simply check for object overlap to determine whether or not the move forward was valid. In order to avoid objects, we would also like the user to be able to use the on board gyroscope, tilting it to move the character in the respective direction. On the board itself, we have 3-axis sensors, which detect rotation, which we use their relative degree in space to determine whether to move the character to the right or left. This will be a continuous polling, and we will track if the board remains at a certain degree threshold for about half a second to see whether or not to move the character. If we detect such behavior, then, we will trigger an interrupt that calls a function that will move the character to the corresponding direction. Our other on board interaction will come in the scorekeeping feature. Each successful forward jump will increase the counter by 1, which we will display on the on board screen. As a highly unlikely possibility, if the player maxes the display out at 8888, we will print win on the board.


          </p>

          <p class='body'>
            <img src={diagram3} className="diagram3" alt="Vite logo" />
          </p>
        </div>
        <div class='card' id="contact">
          {/* <button onClick={() => setCount((count) => count + 1)}>
            {count} clicks wasted
          </button> */}
          <p>
          </p>
        </div>
        <p className="read-the-docs">
          final project for ece3140/cs3420 sp24
        </p>
      </div>
    </>
  )
}

export default App
