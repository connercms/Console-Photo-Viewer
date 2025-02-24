import axios from "axios";
import chalk from "chalk";
import inquirer from "inquirer";
import open from "open";
import sharp from "sharp";

type TPhoto = {
  photoId: number;
  url: string;
  albumId: number;
  title: string;
};

type TAlbum = {
  albumId: number;
  photos: TPhoto[];
};

let height = Math.min(Math.round(process.stdout.rows * 0.8), 50);
let width: number = Math.min(Math.round(process.stdout.columns * 0.8), 80);

function clearLastLine() {
  process.stdout.write("\x1b[1A"); // Move cursor up one line
  process.stdout.write("\x1b[2K"); // Clear the entire line
}

process.stdout.on("resize", function () {
  height = Math.min(Math.round(process.stdout.rows * 0.8), 50);
  width = Math.min(Math.round(process.stdout.columns * 0.8), 80);
});

async function drawPhoto(photo: TPhoto, renderer: string) {
  console.log("Fetching photo...");
  // Fetch the photo array buffer
  const res = await axios.get(photo.url, {
    responseType: "arraybuffer",
    headers: {
      Accept: "image/jpeg",
    },
  });

  // Load it into sharp, set the size to half of the terminal to allow for prompt to fit
  const image = sharp(res.data).resize({
    height,
    width: undefined,
    fit: "contain",
  });

  const { data: buffer, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (!info.height || !info.width) return;

  clearLastLine();

  let offset = 0;
  const ltStr = "LEANTECHNIQUES";
  const textLength = ltStr.length;
  let textIndex = 0; // Track position in the string
  for (let y = 0; y < info.height; y++) {
    let row = "";
    for (let x = 0; x < info.width; x++) {
      const r = buffer[offset];
      const g = buffer[offset + 1];
      const b = buffer[offset + 2];
      offset += info.channels;
      switch (renderer) {
        case "binary":
          const binaryStr = Number(r + g + b)
            .toString(2)
            .padStart(2, "0");
          row += chalk.rgb(r, g, b)(binaryStr[0] + binaryStr[1]);
          textIndex += 2;
          break;
        case "lt":
          row += chalk.rgb(
            r,
            g,
            b
          )(
            ltStr[textIndex % textLength] + ltStr[(textIndex + 1) % textLength]
          );
          textIndex += 2;
          break;
        default:
          row += chalk.rgb(r, g, b)("\u2588\u2588");
      }
    }
    console.log(row);
  }
}

(async function () {
  const prompt = inquirer.createPromptModule();

  try {
    console.log("Fetching albums...");

    const { data } = await axios.get<TAlbum[]>(
      `https://showcase.leantechniques.com/albums`,
      {
        headers: {
          lt_api_key: "lt_tech_showcase",
        },
      }
    );

    clearLastLine();

    while (true) {
      try {
        const albumRes = await prompt([
          {
            name: "albumId",
            message: "Select an album:",
            type: "list",
            choices: [
              ...data
                .map((album) => ({
                  name: "Album " + album.albumId,
                  value: album.albumId,
                }))
                .sort((a, b) => (a.value < b.value ? -1 : 1)),
              {
                name: "\u21b2 Exit",
                value: -1,
              },
            ],
          },
        ]);

        if (albumRes.albumId === -1) break;

        const album = data.find((album) => album.albumId == albumRes.albumId);

        if (!album) continue;

        let photo: TPhoto | undefined;
        while (true) {
          try {
            const photoRes = await prompt([
              {
                name: "photo",
                message: `Select a photo in album ${album.albumId}:`,
                type: "list",
                choices: [
                  ...album.photos.map((p) => ({
                    name: p.title,
                    value: p.photoId,
                  })),
                  {
                    name: "\u21b2 Back To Albums",
                    value: -1,
                  },
                ],
              },
            ]);

            if (photoRes.photo === -1) break;

            photo = album.photos.find((p) => p.photoId === photoRes.photo);

            if (!photo) throw new Error("Error finding selected photo!");

            try {
              const rendererRes = await prompt([
                {
                  name: "renderer",
                  message: `Select a viewing method:`,
                  type: "list",
                  choices: [
                    {
                      name: "Console: Binary",
                      value: "binary",
                    },
                    {
                      name: "Console: Lean Techniques",
                      value: "lt",
                    },
                    {
                      name: "Console: Pixel",
                      value: "pixel",
                    },
                    {
                      name: "Browser: Original Image",
                      value: "browser",
                    },
                  ],
                },
              ]);
              if (rendererRes.renderer === "browser") open(photo.url);
              else await drawPhoto(photo, rendererRes.renderer);
            } catch (viewMethodErr) {
              if (
                viewMethodErr instanceof Error &&
                viewMethodErr.name === "ExitPromptError"
              )
                break;
              else throw viewMethodErr;
            }
          } catch (photoErr) {
            if (
              photoErr instanceof Error &&
              photoErr.name === "ExitPromptError"
            )
              break;
            else throw photoErr;
          }
        }
      } catch (albumErr) {
        if (albumErr instanceof Error && albumErr.name === "ExitPromptError")
          break;
        else throw albumErr;
      }
    }
  } catch (error) {
    console.error(error);
  }
})();
