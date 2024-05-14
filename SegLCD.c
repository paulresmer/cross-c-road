#include "SegLCD.h"

static const uint8_t LCD_Frontplane_Pin[LCD_NUM_FRONTPLANE_PINS] = {
    LCD_FRONTPLANE0, LCD_FRONTPLANE1, LCD_FRONTPLANE2, LCD_FRONTPLANE3,
    LCD_FRONTPLANE4, LCD_FRONTPLANE5, LCD_FRONTPLANE6, LCD_FRONTPLANE7};

void SegLCD_Init(void)
{
  SIM->SCGC5 |= SIM_SCGC5_PORTB_MASK | SIM_SCGC5_PORTC_MASK | SIM_SCGC5_PORTD_MASK | SIM_SCGC5_PORTE_MASK | SIM_SCGC5_SLCD_MASK; // enable clock to ports B, C, D and E, and SegLCD peripheral
  LCD->GCR |= LCD_GCR_PADSAFE_MASK;                                                                                              // set PADSAFE to disable LCD while configuring
  LCD->GCR &= ~LCD_GCR_LCDEN_MASK;                                                                                               // clear LCDEN (LCD enable) while configuring

  // configure pins for SLCD
  PORTB->PCR[7] = PORT_PCR_MUX(0u);  // set PTB7 to LCD_P7
  PORTB->PCR[8] = PORT_PCR_MUX(0u);  // set PTB8 to LCD_P8
  PORTB->PCR[10] = PORT_PCR_MUX(0u); // set PTB10 to LCD_P10
  PORTB->PCR[11] = PORT_PCR_MUX(0u); // set PTB11 to LCD_P11
  PORTB->PCR[21] = PORT_PCR_MUX(0u); // set PTB21 to LCD_P17
  PORTB->PCR[22] = PORT_PCR_MUX(0u); // set PTB22 to LCD_P18
  PORTB->PCR[23] = PORT_PCR_MUX(0u); // set PTB23 to LCD_P19
  PORTC->PCR[17] = PORT_PCR_MUX(0u); // set PTC17 to LCD_P37
  PORTC->PCR[18] = PORT_PCR_MUX(0u); // set PTC18 to LCD_P38
  PORTD->PCR[0] = PORT_PCR_MUX(0u);  // set PTD0 to LCD_P40
  PORTE->PCR[4] = PORT_PCR_MUX(0u);  // set PTE4 to LCD_P52
  PORTE->PCR[5] = PORT_PCR_MUX(0u);  // set PTE5 to LCD_P53

  // configure LCD registers
  LCD->GCR = LCD_GCR_RVTRIM(0x00) | LCD_GCR_CPSEL_MASK | LCD_GCR_LADJ(0x03) | LCD_GCR_PADSAFE_MASK |
             LCD_GCR_ALTDIV(0x00) | LCD_GCR_FFR_MASK | LCD_GCR_SOURCE_MASK | LCD_GCR_LCLK(0x04) | LCD_GCR_DUTY(0x03);

  // configure LCD_SEG_AR
  LCD->AR = LCD_AR_BRATE(0x00);

  // configure LCD_SEG_FDCR
  LCD->FDCR = 0x00000000;

  // configure LCD_PENn
  LCD->PEN[0] = LCD_PEN_PEN(1u << 7u) | LCD_PEN_PEN(1u << 8u) | LCD_PEN_PEN(1u << 10u) | LCD_PEN_PEN(1u << 11u) |
                LCD_PEN_PEN(1u << 17u) | LCD_PEN_PEN(1u << 18u) | LCD_PEN_PEN(1u << 19u);
  LCD->PEN[1] = LCD_PEN_PEN(1u << 5u) | LCD_PEN_PEN(1u << 6u) | LCD_PEN_PEN(1u << 8u) | LCD_PEN_PEN(1u << 20u) | LCD_PEN_PEN(1u << 21u);

  // configure LCD_BPENn
  LCD->BPEN[0] = LCD_BPEN_BPEN(1u << 18u) | LCD_BPEN_BPEN(1u << 19u);
  LCD->BPEN[1] = LCD_BPEN_BPEN(1u << 8u) | LCD_BPEN_BPEN(1u << 20u);

  // configure LCD_WFyTOx
  for (int i = 0; i < 16; i++)
  {
    LCD->WF[i] = 0x00;
  }
  LCD->WF[4] = LCD_WF_WF18(0x88) | LCD_WF_WF19(0x44);
  LCD->WF[10] = LCD_WF_WF40(0x11);
  LCD->WF[13] = LCD_WF_WF52(0x22);

  // disable GCR_PADSAFE and enable GCR_LCDEN
  LCD->GCR &= ~LCD_GCR_PADSAFE_MASK; // clear PADSAFE to unlock LCD pins
  LCD->GCR |= LCD_GCR_LCDEN_MASK;    // set LCDEN to enable operation of LCD
}

void SegLCD_Set(uint8_t value, uint8_t digit)
{
  if (digit > 4)
  {
    return; // display "Err" if trying to access a digit that does not exist
  }

  static const uint8_t segments[16][2] = {
      {LCD_SEG_D | LCD_SEG_E | LCD_SEG_F, LCD_SEG_A | LCD_SEG_B | LCD_SEG_C},             // 0
      {LCD_CLEAR, LCD_SEG_B | LCD_SEG_C},                                                 // 1
      {LCD_SEG_D | LCD_SEG_E | LCD_SEG_G, LCD_SEG_A | LCD_SEG_B},                         // 2
      {LCD_SEG_D | LCD_SEG_G, LCD_SEG_A | LCD_SEG_B | LCD_SEG_C},                         // 3
      {LCD_SEG_F | LCD_SEG_G, LCD_SEG_B | LCD_SEG_C},                                     // 4
      {LCD_SEG_D | LCD_SEG_F | LCD_SEG_G, LCD_SEG_A | LCD_SEG_C},                         // 5
      {LCD_SEG_D | LCD_SEG_E | LCD_SEG_F | LCD_SEG_G, LCD_SEG_A | LCD_SEG_C},             // 6
      {LCD_CLEAR, LCD_SEG_A | LCD_SEG_B | LCD_SEG_C},                                     // 7
      {LCD_SEG_D | LCD_SEG_E | LCD_SEG_F | LCD_SEG_G, LCD_SEG_A | LCD_SEG_B | LCD_SEG_C}, // 8
      {LCD_SEG_F | LCD_SEG_G, LCD_SEG_A | LCD_SEG_B | LCD_SEG_C},                         // 9
      {LCD_SEG_E | LCD_SEG_F | LCD_SEG_G, LCD_SEG_A | LCD_SEG_B | LCD_SEG_C},             // A
      {LCD_SEG_D | LCD_SEG_E | LCD_SEG_F | LCD_SEG_G, LCD_SEG_C},                         // B
      {LCD_SEG_D | LCD_SEG_E | LCD_SEG_F, LCD_SEG_A},                                     // C
      {LCD_SEG_D | LCD_SEG_E | LCD_SEG_G, LCD_SEG_B | LCD_SEG_C},                         // D
      {LCD_SEG_D | LCD_SEG_E | LCD_SEG_F | LCD_SEG_G, LCD_SEG_A},                         // E
      {LCD_SEG_E | LCD_SEG_F | LCD_SEG_G, LCD_SEG_A}                                      // F
  };

  LCD->WF8B[LCD_Frontplane_Pin[(2 * digit) - 2]] = segments[value][0];
  LCD->WF8B[LCD_Frontplane_Pin[(2 * digit) - 1]] = segments[value][1];
}

void SegLCD_DisplayDecimal(uint16_t value)
{
  if (value > 9999)
  {
    return; // display "Err" if value is greater than 4 digits
  }
  SegLCD_Set(value / 1000, 1);
  SegLCD_Set((value / 100) % 10, 2);
  SegLCD_Set((value / 10) % 10, 3);
  SegLCD_Set(value % 10, 4);
}
