import { useState } from 'react'
import reactLogo from './assets/react.svg'
import kiki from '../src/assets/crossyroad.png'
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
            frog move("LEFT")`;

  const updatedCodeSnippet = `encode_score = self.score.to_bytes(1, "big")
print(self.score)
ser.write(encode_score)`;

  return (
    <>
      <div className='page'>
        <div>
          <h1 className='name'>Cross-C Road</h1>
          <p className='routes'> <a href="https://github.coecis.cornell.edu/ece3140-sp2024/jse77-pgr39/tree/main">jse77-pgr39</a></p>
        </div>
        <div className='haha'>
          <a href="https://github.coecis.cornell.edu/ece3140-sp2024/jse77-pgr39/tree/main" target="_blank" className="logo-container">
            <img src={kiki} className="logo kiki" alt="Crossy Road logo" />
          </a>
          <div className='about'>
            <h3>Overview</h3>
            <p className='body'>
              "Cross-C Road" is an implementation of the popular arcade/mobile game <a href="https://en.wikipedia.org/wiki/Crossy_Road">Crossy Road</a>,
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
              The game leverages the FRDM-KL46Z microcontroller's onboard  <br></br>peripherals and GPIO pins to interface with the user and provide <br></br>feedback. Below is a detailed breakdown of the hardware <br></br>components and their configuration:

              <h4>1. UART Communication</h4>
              <p>
                UART (Universal Asynchronous Receiver/Transmitter) is used for serial communication between the microcontroller and the computer. The UART interface is configured to transmit and receive data at a baud rate of 115200. This setup allows the game to send and receive messages, such as touch events and score updates, via the serial port.
              </p>
              <p>Specifically, the <code>uart_init</code> function in the C code initializes the UART with the desired configuration, enabling both transmission and reception:</p>
              <pre><code>{uartInitCode}</code></pre>
              <p>In the game loop, the microcontroller checks if data has been received through UART. If a score is received, it is displayed on the segmented LCD. This is handled by the <code>read_score</code> function:</p>
              <pre><code>{uartReadCode}</code></pre>
              <p>For example, when the player scores points in the game, the score is sent from the game to the microcontroller via UART:</p>
              <pre><code>{updatedCodeSnippet}</code></pre>
              <p>The microcontroller then updates the LCD to display the new score.</p>

              <h4>2. Capacitive Touch Slider</h4>
              <p>
                The onboard capacitive touch slider of the FRDM-KL46Z is used to detect touch inputs. The touch slider is initialized and configured for capacitive sensing using the TSI (Touch Sensing Input) module. The <code>Touch_Scan_LH</code> function scans the touch sensor and processes the touch values to detect valid touch events, which start the game and move the frog upward.
              </p>
              <p>The <code>Touch_Scan_LH</code> function works by initiating a scan on a specific TSI channel and reading the result:</p>
              <pre><code>{touchScanCode}</code></pre>
              <p>In this function, a scan is triggered on channel 10 of the TSI module, and the scan result is read. The result is then adjusted by subtracting an offset to get the final touch value. This value is used to determine if a touch event has occurred by comparing it to a predefined threshold.</p>
              <p>Debouncing is crucial to ensure that false or noisy touch readings do not trigger unintended actions. The debounce logic checks for consistent touch states over multiple readings:</p>
              <pre><code>{debounceCode}</code></pre>
              <p>In this debounce implementation, the current touch state is compared with the last touch state. If they are different, a debounce counter is incremented. If the counter exceeds a certain threshold (DEBOUNCE_COUNT), the touch state is considered valid, and the counter is reset. If the touch states are consistent, the counter is reset to zero. This ensures that only stable touch readings are processed.</p>

              <h4>3. Push Buttons</h4>
              <p>
                The FRDM-KL46Z has push buttons connected to specific GPIO (General Purpose Input/Output) pins. These buttons are used to move the frog left and right. The GPIO pins are configured with pull-up resistors, and button presses are detected by checking the pin states. When a button is pressed, an event is sent to the game to move the frog accordingly. The code sets up the GPIO pins for the buttons, enables pull-up resistors, and checks for button presses within the main loop:
              </p>
              <pre><code>{buttonInitCode}</code></pre>

              <h4>4. Segment LCD Display</h4>
              <p>
                The segmented LCD on the FRDM-KL46Z is used to display the player's score. The LCD is initialized and configured with the necessary segment and backplane pins using the <code>SegLCD_Init</code> function. The score is displayed by updating the appropriate segments on the LCD through the <code>SegLCD_DisplayDecimal</code> function, which translates numerical values into segment patterns displayed on the LCD. This allows the player to see their current score in real-time:
              </p>
              <pre><code>{segLcdCode}</code></pre>

              <h4>5. Game Logic and Pygame</h4>
              <p>
                The game logic is implemented in Python using the Pygame library. Pygame is used to create the game window, render graphics, and handle user inputs. The frog character and vehicles are represented as sprites, and their movements and interactions are managed by the game loop. The game starts upon detecting a touch input from the microcontroller. The frog moves through lanes of vehicles, with the difficulty increasing as the game progresses. If the frog collides with a vehicle, the game resets, and a new session begins. The main loop in Pygame handles event processing, game state updates, and rendering:
              </p>
              <pre><code>{frogMoveCode}</code></pre>

              <h4>6. Serial Communication in Python</h4>
              <p>
                The serial communication between the microcontroller and the Python game is handled using the pyserial library. The game continuously reads data from the serial port to process touch and button events. The player's score is sent from the game to the microcontroller, which updates the segmented LCD display accordingly. The Python code sets up the serial connection, reads incoming data, and parses the JSON messages to trigger in-game actions and update the score display:
              </p>
              <pre><code>{serialPythonCode}</code></pre>
            </p>
          </div>
          <img src={diagram3} className="diagram3" alt="Technical Diagram" />
        </div>
        <div className='card' id="contact">
          {/* <button onClick={() => setCount((count) => count + 1)}>
            {count} clicks wasted
          </button> */}
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
