#include <stdio.h>
#include "board.h"
#include "peripherals.h"
#include "pin_mux.h"
#include "clock_config.h"
#include "MKL46Z4.h"
#include "fsl_debug_console.h"
#include "fsl_uart.h"
#include "SegLCD.h"

/* defs */
#define SWITCH_1_PIN 3
#define TOUCH_THRESHOLD 1000 // touch threshold (sens increases -> 0)

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

void Touch_Init()
{
  SIM->SCGC5 |= SIM_SCGC5_TSI_MASK;

  TSI0->GENCS = TSI_GENCS_OUTRGF_MASK | // out of range flag, set to 1 to clear
                TSI_GENCS_MODE(0u) |
                TSI_GENCS_REFCHRG(0u) |
                TSI_GENCS_DVOLT(0u) |
                TSI_GENCS_EXTCHRG(0u) |
                TSI_GENCS_PS(0u) |
                TSI_GENCS_NSCN(31u) |
                TSI_GENCS_TSIEN_MASK |
                TSI_GENCS_STPE_MASK |
                TSI_GENCS_EOSF_MASK; // end of scan flag, set to 1 to clear
}

/* read touch sensor from low to high capacitance */
int Touch_Scan_LH(void)
{
  TSI0->DATA = TSI_DATA_TSICH(10u); // channel 10
  TSI0->DATA |= TSI_DATA_SWTS_MASK;
  int scan = (TSI0->DATA & TSI_DATA_TSICNT_MASK);
  TSI0->GENCS |= TSI_GENCS_EOSF_MASK;
  return scan - 100; // offset (adjust)
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
  SegLCD_Init(); // initialize the SLCD
  SIM->SCGC5 |= SIM_SCGC5_PORTC_MASK;
  PORTC->PCR[SWITCH_1_PIN] &= ~PORT_PCR_MUX_MASK;
  PORTC->PCR[SWITCH_1_PIN] |= PORT_PCR_MUX(1);
  GPIOC->PDDR &= ~(1U << SWITCH_1_PIN);
  PORTC->PCR[SWITCH_1_PIN] |= PORT_PCR_PE_MASK | PORT_PCR_PS_MASK;

  Touch_Init();
  int lastTouchState = 0; // store the last state of touch

  while (1)
  {
    int touchValue = Touch_Scan_LH();
    int currentTouchState = (touchValue > TOUCH_THRESHOLD);

    if (currentTouchState && !lastTouchState)
    {
      PRINTF("{ \"touchDetected\": true }\r\n");
    }
    lastTouchState = currentTouchState; // update the last state

    if (!(GPIOC->PDIR & (1U << SWITCH_1_PIN)))
    {
      PRINTF("{ \"buttonPressed\": true }\r\n");
      read_score();
      while (!(GPIOC->PDIR & (1U << SWITCH_1_PIN)))
        ;
    }

    __asm volatile("nop");
  }
  return 0;
}
