#include <flashnum.h>
#include <stdio.h>
#include "board.h"
#include "peripherals.h"
#include "pin_mux.h"
#include "clock_config.h"
#include "MKL46Z4.h"
#include "fsl_debug_console.h"
#include "fsl_uart.h"

/* defs for switch and thresholds */
#define SWITCH_1_PIN 3
#define SWITCH_3_PIN 12
#define TOUCH_THRESHOLD 1000 // define your touch threshold
#define DEBOUNCE_COUNT 5     // number of consistent readings required for a valid touch

void uart_init()
{
  uart_config_t config;

  UART_GetDefaultConfig(&config);
  config.baudRate_Bps = 115200;
  config.enableTx = true;
  config.enableRx = true;

  UART_Init(UART2, &config, CLOCK_GetFreq(UART2_CLK_SRC));
}

void read_score(void)
{
  if (UART0->S1 & UART_S1_RDRF_MASK)
  {
    uint8_t received = UART0->D;
    PRINTF("{ \"scoreReceived\": %d }\r\n", received);
    SegLCD_DisplayDecimal(received);
  }
}

/* func to init touch sensor */
void Touch_Init()
{
  SIM->SCGC5 |= SIM_SCGC5_TSI_MASK; // enable clk for TSI

  TSI0->GENCS = TSI_GENCS_OUTRGF_MASK | // out of range flag, set to 1 to clear
                TSI_GENCS_MODE(0u) |    // set at 0 for capacitive sensing
                TSI_GENCS_REFCHRG(0u) | // ref charge
                TSI_GENCS_DVOLT(0u) |   // volt range
                TSI_GENCS_EXTCHRG(0u) | // external charge
                TSI_GENCS_PS(0u) |      // electrode prescaler
                TSI_GENCS_NSCN(31u) |   // number of scans per electrode
                TSI_GENCS_TSIEN_MASK |  // TSI enable bit
                TSI_GENCS_STPE_MASK |   // enables TSI in low power mode
                TSI_GENCS_EOSF_MASK;    // end of scan flag, set to 1 to clear
}

/* func to read touch sensor from low to high capacitance */
int Touch_Scan_LH(void)
{
  TSI0->DATA = TSI_DATA_TSICH(10u);               // using channel 10 of the TSI
  TSI0->DATA |= TSI_DATA_SWTS_MASK;               // software trigger for scan
  int scan = (TSI0->DATA & TSI_DATA_TSICNT_MASK); // get scan result
  TSI0->GENCS |= TSI_GENCS_EOSF_MASK;             // reset end of scan flag
  return scan - 100;                              // subtract offset (adjust as needed)
}

int main(void)
{
  BOARD_InitBootPins();
  BOARD_InitBootClocks();
  BOARD_InitBootPeripherals();
#ifndef BOARD_INIT_DEBUG_CONSOLE_PERIPHERAL
  BOARD_InitDebugConsole();
#endif
  uart_init();
  SegLCD_Init(); // init the SLCD

  // init SWITCH_1 (PTC3)
  SIM->SCGC5 |= SIM_SCGC5_PORTC_MASK;
  PORTC->PCR[SWITCH_1_PIN] &= ~PORT_PCR_MUX_MASK;
  PORTC->PCR[SWITCH_1_PIN] |= PORT_PCR_MUX(1);
  GPIOC->PDDR &= ~(1U << SWITCH_1_PIN);
  PORTC->PCR[SWITCH_1_PIN] |= PORT_PCR_PE_MASK | PORT_PCR_PS_MASK;

  // init SWITCH_3 (PTC12)
  PORTC->PCR[SWITCH_3_PIN] &= ~PORT_PCR_MUX_MASK;
  PORTC->PCR[SWITCH_3_PIN] |= PORT_PCR_MUX(1);
  GPIOC->PDDR &= ~(1U << SWITCH_3_PIN);
  PORTC->PCR[SWITCH_3_PIN] |= PORT_PCR_PE_MASK | PORT_PCR_PS_MASK;

  Touch_Init();            // init touch sensor
  int lastTouchState = 0;  // store the last state of touch
  int debounceCounter = 0; // debounce counter

  while (1)
  {
    int touchValue = Touch_Scan_LH();
    int currentTouchState = (touchValue > TOUCH_THRESHOLD);

    if (currentTouchState != lastTouchState)
    {
      debounceCounter++;
      if (debounceCounter >= DEBOUNCE_COUNT)
      {
        lastTouchState = currentTouchState;
        debounceCounter = 0;

        if (currentTouchState)
        {
          PRINTF("{ \"touchDetected\": true }\r\n");
        }
      }
    }
    else
    {
      debounceCounter = 0;
    }

    if (!(GPIOC->PDIR & (1U << SWITCH_1_PIN)))
    {
      PRINTF("{ \"buttonPressed\": true }\r\n");

      while (!(GPIOC->PDIR & (1U << SWITCH_1_PIN)))
        ;
    }

    if (!(GPIOC->PDIR & (1U << SWITCH_3_PIN)))
    {
      PRINTF("{ \"SW3Pressed\": true }\r\n");

      while (!(GPIOC->PDIR & (1U << SWITCH_3_PIN)))
        ;
    }

    read_score();
    __asm volatile("nop");
  }
  return 0;
}
