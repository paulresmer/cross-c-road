################################################################################
# Automatically-generated file. Do not edit!
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../CMSIS/system_MKL46Z4.c 

C_DEPS += \
./CMSIS/system_MKL46Z4.d 

OBJS += \
./CMSIS/system_MKL46Z4.o 


# Each subdirectory must supply rules for building sources it contributes
CMSIS/%.o: ../CMSIS/%.c CMSIS/subdir.mk
	@echo 'Building file: $<'
	@echo 'Invoking: MCU C Compiler'
	arm-none-eabi-gcc -D__REDLIB__ -DCPU_MKL46Z256VLL4_cm0plus -DCPU_MKL46Z256VLL4 -DFSL_RTOS_BM -DSDK_OS_BAREMETAL -DSDK_DEBUGCONSOLE=1 -DCR_INTEGER_PRINTF -DPRINTF_FLOAT_ENABLE=0 -D__MCUXPRESSO -D__USE_CMSIS -DDEBUG -I"C:\Users\resme\Documents\MCUXpressoIDE_11.9.0_2144\workspace\finalproj_0\board" -I"C:\Users\resme\Documents\MCUXpressoIDE_11.9.0_2144\workspace\finalproj_0\source" -I"C:\Users\resme\Documents\MCUXpressoIDE_11.9.0_2144\workspace\finalproj_0" -I"C:\Users\resme\Documents\MCUXpressoIDE_11.9.0_2144\workspace\finalproj_0\drivers" -I"C:\Users\resme\Documents\MCUXpressoIDE_11.9.0_2144\workspace\finalproj_0\CMSIS" -I"C:\Users\resme\Documents\MCUXpressoIDE_11.9.0_2144\workspace\finalproj_0\startup" -I"C:\Users\resme\Documents\MCUXpressoIDE_11.9.0_2144\workspace\finalproj_0\utilities" -O0 -fno-common -g3 -gdwarf-4 -Wall -c -ffunction-sections -fdata-sections -ffreestanding -fno-builtin -fmerge-constants -fmacro-prefix-map="$(<D)/"= -mcpu=cortex-m0plus -mthumb -D__REDLIB__ -fstack-usage -specs=redlib.specs -MMD -MP -MF"$(@:%.o=%.d)" -MT"$(@:%.o=%.o)" -MT"$(@:%.o=%.d)" -o "$@" "$<"
	@echo 'Finished building: $<'
	@echo ' '


clean: clean-CMSIS

clean-CMSIS:
	-$(RM) ./CMSIS/system_MKL46Z4.d ./CMSIS/system_MKL46Z4.o

.PHONY: clean-CMSIS

