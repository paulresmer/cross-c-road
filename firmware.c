#include <stdio.h>
#include "board.h"
#include "peripherals.h"
#include "pin_mux.h"
#include "clock_config.h"
#include "MKL46Z4.h"
#include "fsl_debug_console.h"

#define SWITCH_1_PIN 3

int main(void)
{
  BOARD_InitBootPins();
  BOARD_InitBootClocks();
  BOARD_InitBootPeripherals();
#ifndef BOARD_INIT_DEBUG_CONSOLE_PERIPHERAL
  BOARD_InitDebugConsole();
#endif

  /* siwtch setup */
  SIM->SCGC5 |= SIM_SCGC5_PORTC_MASK;
  PORTC->PCR[SWITCH_1_PIN] &= ~PORT_PCR_MUX_MASK;
  PORTC->PCR[SWITCH_1_PIN] |= PORT_PCR_MUX(1);
  GPIOC->PDDR &= ~(1U << SWITCH_1_PIN);
  PORTC->PCR[SWITCH_1_PIN] |= PORT_PCR_PE_MASK | PORT_PCR_PS_MASK;

  while (1)
  {
    if (!(GPIOC->PDIR & (1U << SWITCH_1_PIN))) // button press logic
    {
      PRINTF("{ \"buttonPressed\": true }\r\n");
      while (!(GPIOC->PDIR & (1U << SWITCH_1_PIN)))
        ; // on button release
    }
    __asm volatile("nop");
  }
  return 0;
}
