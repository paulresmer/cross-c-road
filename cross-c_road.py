#! /usr/bin/env python
import pygame
import sys
import random
import serial
import json

# initialize the serial connection
ser = serial.Serial("COM3", 115200, timeout=1)

# initialize pygame
pygame.init()

# screen dimensions and other constants
SCREEN_WIDTH, SCREEN_HEIGHT = 800, 600
FPS = 60
LANE_HEIGHT = 40
NUM_LANES_VISIBLE = 15
VEHICLE_WIDTH = 80
VEHICLE_HEIGHT = 40
INITIAL_VEHICLE_SPEED = 5
INITIAL_MOVE_COOLDOWN = 100
DIFFICULTY_INCREASE_RATE = 0.2

# colors
GREEN = (0, 255, 0)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
WHITE = (255, 255, 255)

# setup screen
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("cross-c road")
clock = pygame.time.Clock()

# load images
frog_filename = "./images/our_frog.png"
car_filename = "./images/our_car.png"
background_filenames = [
    "./images/our_background1.png",
    "./images/our_background2.png",
    "./images/our_background3.png",
    "./images/our_background4.png",
    "./images/our_background5.png",
]
frog_image = pygame.image.load(frog_filename).convert_alpha()
frog_image = pygame.transform.scale(frog_image, (40, 40))
car_image = pygame.image.load(car_filename).convert_alpha()
car_image = pygame.transform.scale(car_image, (VEHICLE_WIDTH, VEHICLE_HEIGHT))
background_images = [
    pygame.transform.scale(
        pygame.image.load(filename).convert_alpha(), (SCREEN_WIDTH, SCREEN_HEIGHT)
    )
    for filename in background_filenames
]

current_background_index = 0


class Frog(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = frog_image
        self.rect = self.image.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 20))
        self.last_move_time = 0
        self.score = 0
        self.move_cooldown = INITIAL_MOVE_COOLDOWN

    def can_move(self):
        current_time = pygame.time.get_ticks()
        if current_time - self.last_move_time >= self.move_cooldown:
            self.last_move_time = current_time
            return True
        return False

    def move(self, direction):
        if self.can_move():
            if direction == "UP":
                self.rect.y -= LANE_HEIGHT
                self.score += 1
                encode_score = self.score.to_bytes(1, "big")
                print(encode_score)
                ser.write(encode_score)
            elif direction == "DOWN":
                self.rect.y += LANE_HEIGHT
            elif direction == "LEFT":
                self.rect.x -= LANE_HEIGHT
            elif direction == "RIGHT":
                self.rect.x += LANE_HEIGHT


class Vehicle(pygame.sprite.Sprite):
    def __init__(self, lane, x, speed):
        super().__init__()
        self.image = car_image
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = lane * LANE_HEIGHT
        self.speed = speed

    def update(self):
        self.rect.x += self.speed
        if self.rect.x > SCREEN_WIDTH:
            self.rect.x = -VEHICLE_WIDTH  # reset position to simulate continuous flow


# reset game
def reset_game(
    vehicles,
    all_sprites,
    frog=None,
    vehicle_speed=INITIAL_VEHICLE_SPEED,
    initial_vehicles=1,
):
    vehicles.empty()
    all_sprites.empty()
    if frog is None:
        frog = Frog()
    else:
        frog.rect.center = (SCREEN_WIDTH // 2, SCREEN_HEIGHT - 20)
    all_sprites.add(frog)
    for lane in range(NUM_LANES_VISIBLE - 2):
        for _ in range(random.randint(0, initial_vehicles)):  # num vehicles per lane
            x = random.randint(0, SCREEN_WIDTH)
            vehicle = Vehicle(lane, x, vehicle_speed)
            vehicles.add(vehicle)
            all_sprites.add(vehicle)
    return frog, vehicles, all_sprites


# main loop
def main():
    global current_background_index

    vehicle_speed = INITIAL_VEHICLE_SPEED
    initial_vehicles = 1
    frog, vehicles, all_sprites = reset_game(
        pygame.sprite.Group(),
        pygame.sprite.Group(),
        vehicle_speed=vehicle_speed,
        initial_vehicles=initial_vehicles,
    )

    game_started = False  # flag to check if the game has started

    font = pygame.font.Font(None, 74)
    text = font.render("Tap to Start!", True, WHITE)
    text_rect = text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))

    try:
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()

            # serial check
            if ser.in_waiting > 0:
                line = ser.readline().decode("utf-8").rstrip()
                print(line)
                data = json.loads(line)
                if data.get("touchDetected"):
                    game_started = True  # start the game on touch detected
                if game_started:
                    if data.get("touchDetected"):
                        frog.move("UP")
                    if data.get("buttonPressed"):
                        frog.move("RIGHT")
                    if "direction" in data:
                        frog.move(data["direction"])
                    if data.get("SW3Pressed"):
                        frog.move("LEFT")

            if game_started:
                vehicles.update()

                # ? collideany
                if pygame.sprite.spritecollideany(frog, vehicles):
                    print("hit")
                    frog.score = 0
                    current_background_index = 0
                    vehicle_speed = INITIAL_VEHICLE_SPEED
                    initial_vehicles = 1
                    frog, vehicles, all_sprites = reset_game(
                        vehicles,
                        all_sprites,
                        vehicle_speed=vehicle_speed,
                        initial_vehicles=initial_vehicles,
                    )

                # frog has reach ed top
                if frog.rect.y <= -1:
                    print("reached top")
                    frog, vehicles, all_sprites = reset_game(
                        vehicles, all_sprites, frog, vehicle_speed, initial_vehicles
                    )
                    current_background_index = (current_background_index + 1) % len(
                        background_images
                    )
                    vehicle_speed *= 1 + DIFFICULTY_INCREASE_RATE
                    initial_vehicles = min(NUM_LANES_VISIBLE, initial_vehicles + 1)

            screen.blit(background_images[current_background_index], (0, 0))
            all_sprites.draw(screen)

            if not game_started:
                screen.blit(text, text_rect)

            pygame.display.flip()
            clock.tick(FPS)
    finally:
        ser.close()
        print("closed connection.")


if __name__ == "__main__":
    main()
