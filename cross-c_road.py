#! /usr/bin/env python
import sys
import random
import json
import serial
import pygame

from sys import exit

ser = serial.Serial("COM3", 115200, timeout=1)

pygame.init()

SCREEN_WIDTH, SCREEN_HEIGHT = 800, 600
FPS = 60
LANE_HEIGHT = 40
NUM_LANES_VISIBLE = 15
VEHICLE_WIDTH = 80
VEHICLE_HEIGHT = 40
VEHICLE_SPEED = 5
MOVE_COOLDOWN = 100

GREEN = (0, 255, 0)
BLACK = (0, 0, 0)
RED = (255, 0, 0)

screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("cross-c road")
clock = pygame.time.Clock()
frog_filename = "./images/our_frog.png"
car_filename = "./images/our_car.png"
frog_image = pygame.image.load(frog_filename).convert_alpha()
frog_image = pygame.transform.scale(frog_image, (40, 40))
car_image = pygame.image.load(car_filename).convert_alpha()
car_image = pygame.transform.scale(car_image, (VEHICLE_WIDTH, VEHICLE_HEIGHT))


class Frog(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = frog_image
        self.rect = self.image.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 20))
        self.last_move_time = 0

    def can_move(self):
        current_time = pygame.time.get_ticks()
        if current_time - self.last_move_time >= MOVE_COOLDOWN:
            self.last_move_time = current_time
            return True
        return False

    def move(self, direction):
        if self.can_move():
            if direction == "UP":
                self.rect.y -= LANE_HEIGHT
            elif direction == "DOWN":
                self.rect.y += LANE_HEIGHT
            elif direction == "LEFT":
                self.rect.x -= LANE_HEIGHT
            elif direction == "RIGHT":
                self.rect.x += LANE_HEIGHT


class Vehicle(pygame.sprite.Sprite):
    def __init__(self, lane, x):
        super().__init__()
        self.image = car_image
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = lane * LANE_HEIGHT
        self.speed = VEHICLE_SPEED

    def update(self):
        self.rect.x += self.speed
        if self.rect.x > SCREEN_WIDTH:
            self.rect.x = -VEHICLE_WIDTH


def reset_game(vehicles, all_sprites):
    vehicles.empty()
    all_sprites.empty()
    frog = Frog()
    all_sprites.add(frog)
    for lane in range(NUM_LANES_VISIBLE - 2):
        for _ in range(random.randint(0, 2)):
            x = random.randint(0, SCREEN_WIDTH)
            vehicle = Vehicle(lane, x)
            vehicles.add(vehicle)
            all_sprites.add(vehicle)
    return frog, vehicles, all_sprites


def main():
    frog, vehicles, all_sprites = reset_game(
        pygame.sprite.Group(), pygame.sprite.Group()
    )
    score = 0

    try:
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()

            if ser.in_waiting > 0:
                line = ser.readline().decode("utf-8").rstrip()
                print(line)
                data = json.loads(line)
                if data.get("buttonPressed"):
                    frog.move("UP")
                    score += 1
                    encode_score = score.to_bytes(
                        1, "big"
                    )  # Send score as a single byte
                    print(encode_score)
                    ser.write(encode_score)
                if "direction" in data:
                    frog.move(data["direction"])

            vehicles.update()

            if pygame.sprite.spritecollideany(frog, vehicles):
                print("hit")
                score = 0
                frog, vehicles, all_sprites = reset_game(vehicles, all_sprites)

            if frog.rect.y <= -1:
                print("reached top")
                frog, vehicles, all_sprites = reset_game(vehicles, all_sprites)

            screen.fill(BLACK)
            all_sprites.draw(screen)
            pygame.display.flip()
            clock.tick(FPS)
    finally:
        ser.close()
        print("Closed connection.")


if __name__ == "__main__":
    main()
