import { useState } from 'react'
import kiki from '../src/assets/crossyroad.png'
import frog from '../src/assets/frog.gif'
import revfrog from '../src/assets/revfrog.gif'
import diagram3 from '../src/assets/diagram3.png'
import './App.css'
import Typography from '@mui/material/Typography';

function App() {
  const [count, setCount] = useState(0)

  const uartInitCode = `void uart_init() {
    uart_config_t config;
    UART_GetDefaultConfig(&config);
    config.baudRate_Bps = 115200;
    config.enableTx = true;
    config.enableRx = true;
    UART_Init(UART2, &config, CLOCK_GetFreq(UART2_CLK_SRC));
}`;

  const uartReadCode = `void read_score(void) {
    if (UART0->S1 & UART_S1_RDRF_MASK) {
        uint8_t received = UART0->D;
        PRINTF("{ \\"scoreReceived\\": %d }\\r\\n", received);
        SegLCD_DisplayDecimal(received);
    }
}`;

  const touchScanCode = `int Touch_Scan_LH(void) {
    TSI0->DATA = TSI_DATA_TSICH(10u); // using channel 10 of the TSI
    TSI0->DATA |= TSI_DATA_SWTS_MASK; // software trigger for scan
    int scan = (TSI0->DATA & TSI_DATA_TSICNT_MASK); // get scan result
    TSI0->GENCS |= TSI_GENCS_EOSF_MASK; // reset end of scan flag
    return scan - 100; // subtract offset (adjust as needed)
}`;

  const debounceCode = `if (currentTouchState != lastTouchState) {
    debounceCounter++;
    if (debounceCounter >= DEBOUNCE_COUNT) {
        lastTouchState = currentTouchState;
        debounceCounter = 0;
        if (currentTouchState) {
            PRINTF("{ \\"touchDetected\\": true }\\r\\n");
        }
    }
} else {
    debounceCounter = 0;
}`;

  const buttonInitCode = `SIM->SCGC5 |= SIM_SCGC5_PORTC_MASK;
PORTC->PCR[SWITCH_1_PIN] &= ~PORT_PCR_MUX_MASK;
PORTC->PCR[SWITCH_1_PIN] |= PORT_PCR_MUX(1);
GPIOC->PDDR &= ~(1U << SWITCH_1_PIN);
PORTC->PCR[SWITCH_1_PIN] |= PORT_PCR_PE_MASK | PORT_PCR_PS_MASK;

PORTC->PCR[SWITCH_3_PIN] &= ~PORT_PCR_MUX_MASK;
PORTC->PCR[SWITCH_3_PIN] |= PORT_PCR_MUX(1);
GPIOC->PDDR &= ~(1U << SWITCH_3_PIN);
PORTC->PCR[SWITCH_3_PIN] |= PORT_PCR_PE_MASK | PORT_PCR_PS_MASK;`;

  const segLcdCode = `void SegLCD_Init(void) {
    // LCD initialization and configuration code
}

void SegLCD_DisplayDecimal(uint16_t value) {
    if (value > 9999) {
        return; // display "Err" if value is greater than 4 digits
    }
    SegLCD_Set(value / 1000, 1);
    SegLCD_Set((value / 100) % 10, 2);
    SegLCD_Set((value / 10) % 10, 3);
    SegLCD_Set(value % 10, 4);
}`;

  const frogMoveCode = `class Frog(pygame.sprite.Sprite):
    def move(self, direction):
        if self.can_move():
            if direction == "UP":
                self.rect.y -= LANE_HEIGHT
                self.score += 1
                encode_score = self.score.to_bytes(1, "big")
                print(self.score)
                ser.write(encode_score)
            elif direction == "DOWN":
                self.rect.y += LANE_HEIGHT
            elif direction == "LEFT":
                self.rect.x -= LANE_HEIGHT
            elif direction == "RIGHT":
                self.rect.x += LANE_HEIGHT`;

  const serialPythonCode = `import serial
ser = serial.Serial("COM3", 115200, timeout=1)

while True:
    if ser.in_waiting > 0:
        line = ser.readline().decode("utf-8").rstrip()
        data = json.loads(line)
        if data.get("touchDetected"):
            frog.move("UP")
        if data.get("buttonPressed"):
            frog.move("RIGHT")
        if data.get("SW3Pressed"):
            frog.move("LEFT")`;

  const updatedCodeSnippet = `encode_score = self.score.to_bytes(1, "big")
print(self.score)
ser.write(encode_score)`;

  return (
    <>
      <div className='page'>
        <div>
          <h1 class='name'>
            <img src={frog} alt="emoji" class="emoji" />
            Cross-C Road
            <img src={revfrog} alt="emoji" class="emoji" />
          </h1>
          <p class='routes'>
            <a href="https://github.coecis.cornell.edu/ece3140-sp2024/jse77-pgr39/tree/main">jse77-pgr39</a>
          </p>
        </div>


        <div className='haha'>
          <a href="https://github.coecis.cornell.edu/ece3140-sp2024/jse77-pgr39/tree/main" target="_blank" className="logo-container">
            <img src={kiki} className="logo kiki" alt="Crossy Road logo" />
          </a>
          <div className='about'>
            <h3>Overview</h3>
            <p className='body'>
              "Cross-C Road" is an implementation of the popular arcade/mobile game <a href="https://en.wikipedia.org/wiki/Crossy_Road"><i>Crossy Road</i></a>,
              where the player controls a character through an endless path of obstacles.
              The objective of the game is to live for as long as possible.
              This app uses serial communication between the FRDM-KL46Z and the user's computer via <a href="https://github.com/pyserial/">pyserial</a>,
              an open-source serial port access library for Python. Our game is rendered on <a href="https://github.com/pygame/pygame">pygame</a>, an open source library built on top of SDL.
              <p>We use the FRDM-KL46Z's onboard <a href="https://www.farnell.com/datasheets/1728679.pdf">capacitive touch slider</a> and user push buttons to control in-game actions such as moving the frog.
                The microcontroller receives and processes the player's score and displays it on the segmented LCD. The game begins upon
                detecting a touch input, and the frog navigates through lanes of moving vehicles,
                with increasing difficulty and new stages as the player progresses.
                If the player allows the frog to collide with a vehicle, the game resets and a new session.
              </p>
            </p>
          </div>
        </div >
        <div className='haha'>
          <div className='about technical-approach'>
            <h3>Technical Approach</h3>
            <p className='body'>
              The game leverages the FRDM-KL46Z microcontroller's onboard peripherals and GPIO pins to interface with the user and provide feedback. Below is a detailed breakdown of the technical components of the program and our configuration approaches:
            </p>
            <h4>1. UART Communication</h4>
            <p>
              UART (Universal Asynchronous Receiver/Transmitter) is used for serial communication between the microcontroller and the computer. The UART interface is configured to transmit and receive data at a baud rate of 115200. This setup allows the game to send and receive messages, such as touch events and score updates, via the serial port.
            </p>
            <p>In the game loop, the microcontroller checks if data has been received through UART. If a score is received, it is displayed on the segmented LCD. This is handled by the read_score function:</p>
            <pre className="console"><code>{uartReadCode}</code></pre>
            <p>For example, when the player scores points in the game, the score is sent from the game to the microcontroller via UART:</p>
            <pre className="console"><code>{updatedCodeSnippet}</code></pre>
            <p>The microcontroller then updates the LCD to display the new score.</p>
          </div>
          <div>
            <img src={diagram3} className="diagram3" alt="Technical Diagram" />
            <iframe
              className="youtube-video"
              src="https://www.youtube.com/embed/CfarSikf71E?si=HbEoZZS7IAHcMnlf"
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <img src={diagram3} className="diagram4" alt="Technical Diagram" />
          </div>
        </div>

        <div className='haha2'>
          <h5>2. Capacitive Touch Slider</h5>
          <p>
            The onboard capacitive touch slider of the FRDM-KL46Z is used to detect touch inputs. The touch slider is initialized and configured for capacitive sensing using the TSI (Touch Sensing Input) module. The function 'Touch_Scan_LH' scans the touch sensor and processes the touch values to detect valid touch events, which start the game and move the frog upward.
          </p>
          <p>The function works by initiating a scan on a specific TSI channel and reading the result:</p>
          <pre className="console"><code>{touchScanCode}</code></pre>
          <p>In this function, a scan is triggered on channel 10 of the TSI module, and the scan result is read. The result is then adjusted by subtracting an offset to get the final touch value. This value is used to determine if a touch event has occurred by comparing it to a predefined threshold.</p>
          <p>Debouncing is crucial to ensure that false or noisy touch readings do not trigger unintended actions. The debounce logic checks for consistent touch states over multiple readings:</p>
          <pre className="console"><code>{debounceCode}</code></pre>
          <p>In this debounce implementation, the current touch state is compared with the last touch state. If they are different, a debounce counter is incremented. If the counter exceeds a certain threshold (DEBOUNCE_COUNT), the touch state is considered valid, and the counter is reset. If the touch states are consistent, the counter is reset to zero. This ensures that only stable touch readings are processed.</p>

          <h4>3. Push Buttons</h4>
          <p>
            The FRDM-KL46Z has push buttons connected to specific GPIO (General Purpose Input/Output) pins. These buttons are used to move the frog left and right. The GPIO pins are configured with pull-up resistors, and button presses are detected by checking the pin states. When a button is pressed, an event is sent to the game to move the frog accordingly. The code sets up the GPIO pins for the buttons, enables pull-up resistors, and checks for button presses within the main loop:
          </p>
          <pre className="console"><code>{buttonInitCode}</code></pre>

          <h4>4. Segment LCD Display</h4>
          <p>
            The segmented LCD on the FRDM-KL46Z is used to display the player's score. The LCD is initialized and configured with the necessary segment and backplane pins. The score is displayed by updating the appropriate segments on the LCD through the function 'SegLCD_DisplayDecimal', which translates numerical values into segment patterns displayed on the LCD. This allows the player to see their current score in real-time:
          </p>
          <pre className="console"><code>{segLcdCode}</code></pre>

          <h4>5. Game Logic and Pygame</h4>
          <p>
            The game logic is implemented in Python using the Pygame library. Pygame is used to create the game window, render graphics, and handle user inputs. The frog character and vehicles are represented as sprites, and their movements and interactions are managed by the game loop. The game starts upon detecting a touch input from the microcontroller. The frog moves through lanes of vehicles, with the difficulty increasing as the game progresses. If the frog collides with a vehicle, the game resets, and a new session begins. The main loop in Pygame handles event processing, game state updates, and rendering.
          </p>

          <h4>6. Serial Communication in Python</h4>
          <p>
            The serial communication between the microcontroller and the Python game is handled using the pyserial library. The game continuously reads data from the serial port to process touch and button events. The player's score is sent from the game to the microcontroller, which updates the segmented LCD display accordingly. The Python code sets up the serial connection, reads incoming data, and parses the JSON messages to trigger in-game actions and update the score display:
          </p>
          <pre className="console"><code>{serialPythonCode}</code></pre>

          <h3>Testing and Debugging</h3>
          <h4>Testing Approach</h4>
          <p>
            Testing was conducted in phases, starting with individual components and moving towards system-level integration. Each component, such as the UART communication, touch slider, and push buttons, was tested separately to ensure proper functionality. Unit tests were written for the firmware functions, and mock inputs were used to simulate various scenarios.
          </p>
          <p>
            For the Pygame application, extensive playtesting was carried out to identify any issues with the game mechanics and serial communication. We used logging and print statements to trace the flow of data between the microcontroller and the game, ensuring that all inputs were correctly processed and the game state updated accordingly.
          </p>
          <p>
            <strong>Phase 1: Component Testing</strong>
            <ul>
              <li><p>              Unit tests were developed for UART initialization and data transmission/reception functions. These tests verified the correct configuration of UART settings and ensured data could be sent and received accurately. Mock inputs were used to simulate UART data transmission, helping to verify that the <code>read_score</code> function correctly interpreted and displayed received scores on the segment LCD. Logging was implemented within the UART functions to trace data flow, ensuring that the correct data bytes were being transmitted and received without corruption.</p>

              </li>
              <li><p>The TSI initialization was verified by checking the configuration registers and ensuring the touch sensor was correctly set up for capacitive sensing. The <code>Touch_Scan_LH</code> function was tested using a range of known capacitance values, with mock values fed into the function to simulate various touch states and ensure accurate threshold detection. The debounce logic was tested to ensure it correctly filtered out spurious touch signals by simulating rapid, inconsistent touch inputs and verifying that only stable, consistent touches were registered.</p>
              </li>
              <li><p>The initialization and functionality of the push buttons (SW1 and SW3) were verified using mock inputs to simulate button presses, checking that the correct state changes were detected and logged. The debouncing logic for push buttons was tested similarly to the touch sensors, ensuring that only valid presses were registered despite rapid, inconsistent presses.</p>
              </li>
            </ul>
          </p>
          <p>
            <strong>Phase 2: Integration Testing</strong>
            <ul>
              <li><p>System initialization was verified to ensure the correct initialization of all peripherals (UART, TSI, GPIO, and SegLCD) in the <code>main</code> function. End-to-end data flow tests were conducted to ensure that touch inputs and button presses resulted in the correct UART messages being sent to the Pygame application. Real-time feedback was ensured by verifying that received scores via UART were correctly displayed on the segment LCD.</p>
              </li>
              <li><p>The initial setup was verified to ensure that the game initialized correctly, with all assets (images, background, etc.) loading as expected. Extensive playtesting was conducted to verify game mechanics, including frog movement, collision detection, and level progression, ensuring that all movements were smooth and visually accurate. Serial communication was monitored between the Pygame script and the microcontroller, using logging to trace data flow and ensure that touch and button inputs were accurately reflected in the game.
              </p>
              </li>
            </ul>
          </p>
          <p>
            <strong>Phase 3: System-Level Integration Testing</strong>
            <ul>
              <li><p> Full pipeline verification was conducted to ensure the complete pipeline from touch/button inputs on the microcontroller to the resulting actions within the Pygame application. Every input was checked to ensure it was correctly processed, and the game state was updated accordingly. Stress testing was performed by simulating rapid sequences of touch and button inputs to ensure the system could handle high-frequency interactions without lag or data loss. Edge cases and error scenarios, such as invalid inputs or communication breakdowns, were tested to ensure robust error handling and system stability.</p>
              </li>
              <li><p>Latency between input actions and corresponding game responses was measured to ensure real-time performance, meeting the desired responsiveness criteria. Resource utilization on the microcontroller (CPU, memory) and the host system running Pygame was monitored to ensure efficient operation without bottlenecks.</p>
              </li>
            </ul>
          </p>
          <p>
            <strong>Detailed Verification Steps:</strong>
            <p>Trace logs were used to monitor every step of data flow, from input detection to UART communication and game state updates. Logs were analyzed to identify and resolve any discrepancies or delays. Automated test pipelines were developed to run unit tests, integration tests, and system tests, ensuring continuous verification of functionality with every code change. Mock environments were created for both firmware and Pygame components to simulate various scenarios and inputs without needing the actual hardware setup for every test cycle. Regression tests were conducted after each significant change to ensure no existing functionality was broken.
            </p>
          </p>

          <h4>Debugging Challenges</h4>
          <p>
            One of the main challenges was ensuring reliable serial communication between the microcontroller and the computer. Initially, we faced issues with data corruption and missed messages, which were resolved by fine-tuning the UART settings and adding error-checking mechanisms.
          </p>
          <p>
            Another subtle bug we encountered was related to the debounce logic for the touch slider. The touch sensor was sometimes too sensitive, causing unintended movements. We adjusted the debounce threshold and added more robust filtering to handle noisy signals effectively.
          </p>
          <p>We experienced a lot of difficulties integrating the functionality of the segment LCD (SLCD) into our project on MCUXpresso. Due to differences in build files imported and created by the example SDK to make the SLCD function, we had to recreate our project in a different environment several times.
            Afterwards we had to trace back a high number of function calls, starting at the initialization of our peripheral devices, to ensure that not only were the right files included but also the right functions and references within those files; this process was very tedious and was likely our greatest source of difficulty throughout the development process.
          </p>
          <p>
            The game reset logic was also a source of bugs. Our implementation implements advancing to a new stage and losing the game very similarly; as a result there were occasions where the game would not reset properly after a collision, leaving the frog sprite in an invalid state. We resolved this by ensuring that all game objects were correctly reinitialized during the reset process.
          </p>
          <h3>Team Work</h3>
          <p>
            We started coming up with ideas for the project early, dedicating time to brainstorm and evaluate various ideas before settling on the final concept. This allowed us to quickly figure out what technical approach we should take for development and eliminate ideas that would have been too difficult or otherwise inaccessible. Throughout the project, we met frequently and worked primarily off a single system, allowing both partners to play an active role in every development phase, from initial coding to debugging and testing. This collaborative approach enabled us to identify and resolve issues quickly through joint debugging sessions, ensuring a smooth and effective development process without major issues. The project proved to be a beneficial learning experience for both partners, as we gained comprehensive knowledge and skills across both firmware and application development. Overall, the frequent meetings, shared responsibilities, and constant communication contributed significantly to the project's success and allowed us to meet our initial objectives.
          </p>
          <h3>Outside Resources</h3>
          <p>
            This project utilized several external libraries and resources to facilitate development and ensure robust functionality. Key resources included:
          </p>
          <ul>
            <li><a href="https://github.com/pygame/pygame">pygame</a> - for game development and graphical interface</li>
            <li><a href="https://github.com/pyserial/">pyserial</a> -
              an open-source serial port access library for Python</li>
            <li>NXP SDK - for peripheral drivers and driver examples</li>
            <li>ARM Cortex-M0 Documentation - for detailed information on microcontroller architecture and programming</li>
            <li><a href="https://forum.digikey.com/t/using-the-segment-lcd-controller-on-the-kinetis-kl46/13277">Using the Segment LCD Controller on the Kinetis KL46</a> - for using the Segment LCD</li>
            <li><a href="https://en.wikipedia.org/wiki/Crossy_Road"><i>Crossy Road</i></a> - for game design inspiration</li>
          </ul>


        </div>
        <div className='card' id="contact">
          <p>
          </p>
        </div>
        <p className="read-the-docs">
          final project for ece3140/cs3420 sp24
        </p>
      </div >
    </>
  )
}

export default App
