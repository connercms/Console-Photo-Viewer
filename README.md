# Console Photo Viewer

A NodeJS console application for fetching albums from the LT web service and "drawing" them to the terminal window.

A user may browse by album, then choose a photo from the selected album to view. The photo may be viewed as ASCII art directly in the console or as the original image in the user's default browser.

The ASCII art is created by storing the photo response from the web service as an array buffer and using the [sharp](https://www.npmjs.com/package/sharp) npm package to resize it to fit the user's terminal window. The array buffer values are then iterated over, sampling each RGB byte value to generate the individual ASCII color, and using the [chalk](https://www.npmjs.com/package/chalk) npm package to color the console output.

> Note: Photo resolution is tied to user's terminal window width, therefore image output clarity is improved with a larger terminal window size.

# Steps to run the program

First, use `npm i` to install the required dependencies.

You can run the program using `ts-node` from the project root as follows: `npx ts-node index.ts`

You can use the start script (`npm run start`) which will first build the source then run the compiled javascript.
