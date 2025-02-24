# Console Photo Viewer

A NodeJS console application for fetching albums from the LT web service and "drawing" them to the terminal window.

The application requests a photo from the web service as an array buffer and uses the [sharp](https://www.npmjs.com/package/sharp) npm package to resize it to fit the user's terminal window. I then iterate over the array buffer values, sample each RGB byte, and use the [chalk](https://www.npmjs.com/package/chalk) npm
package to draw an appropriately colored ASCII character to the screen, thus recreating the photo in ASCII.
Below each photo is also a link to open the original photo in the user's browser (might have to CTRL + click based on terminal).

> Note: Photo resolution is tied to user's terminal window width, therefore image output clarity is improved with a larger terminal window size.

# Steps to run the program

First, use `npm i` to install the required dependencies.

You can run the program using `ts-node` from the project root as follows: `npx ts-node index.ts`

You can use the start script (`npm run start`) which will first build the source then run the compiled javascript.
