# Cross-C Road (jse77-pgr39)
"Cross-C Road" is an implementation of the popular arcade and mobile game [Crossy Road](https://en.wikipedia.org/wiki/Crossy_Road), where the player controls a character through an endless path of obstacles. The objective of the game is to live for as long as possible. 

## How to play!
This app uses serial communication between the FRDM-KL46Z and your computer. The local files you need to download are cross-c_road.py and firmware.c. Create an new project in MCUXpresso, ensuring that you **choose 'UART'  instead of 'Semihost' in the 'Project Options' during the setup.** Add 'firmware.c' as your project's new source file, then simply build and flash. Run 'cross-c_road.py' to launch the pygame window: 

### pygame
This app runs on [pygame](https://github.com/pygame/pygame), an open source library built on top of SDL. The installation instructions have been copied below:

Before installing pygame, you must check that Python is installed
on your machine. To find out, open a command prompt (if you have
Windows) or a terminal (if you have MacOS or Linux) and type this:
::

   python --version


If a message such as "Python 3.8.10" appears, it means that Python
is correctly installed. If an error message appears, it means that
it is not installed yet. You must then go to the `official website
<https://www.pygame.org/docs/>`_ and follow the instructions.

Once Python is installed, you have to perform a final check: you have
to see if pip is installed. Generally, pip is pre-installed with
Python but we are never sure. Same as for Python, type the following
command:
::

   pip --version


If a message such as "pip 20.0.2 from /usr/lib/python3/dist-packages/pip
(python 3.8)" appears, you are ready to install pygame! To install
it, enter this command:
::

   pip install pygame 

<!-- # Feedback
 Proposal Feedback: I assume the game would run on a computer? You can totally use the board as in input device for a game, but you need to make sure that some significant amount of the processing happens on the board. Just sending buttons press events is not complex enough. There are a few ways you can expand on this, either you do some level selecting game logic at startup and send that over to set up the game, or you could use a sensor that needs some on-board processing like decoding tilts and/or the capacitive touch sensor.  -->

## Project Web-Page
[https://pages.github.coecis.cornell.edu/ece3140-sp2024/jse77-pgr39](https://pages.github.coecis.cornell.edu/ece3140-sp2024/jse77-pgr39)
