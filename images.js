#!/bin/nodemon
const express = require('express');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const app = express();

let IMAGE_FOLDER = 'img/';
let IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
let LISTEN_PORT = 3000;
let TITLE = 'Default Title';
let MAX_THUMB_SIZE = 250;

try {
  const config = JSON.parse(fs.readFileSync('config.json'));
  IMAGE_FOLDER = config.imageFolder ?? IMAGE_FOLDER;
  IMAGE_EXTENSIONS = config.imageExtensions ?? IMAGE_EXTENSIONS;
  LISTEN_PORT = config.port ?? LISTEN_PORT;
  TITLE = config.title ?? TITLE;
  MAX_THUMB_SIZE = config.max_thumb_size ?? MAX_THUMB_SIZE;
} catch (err) {
  console.error(err);
}

function getImageFolder() {
//  const date = new Date();
//  const year = date.getFullYear();
//  const month = (date.getMonth() + 1).toString().padStart(2, '0');
//  const day = date.getDate().toString().padStart(2, '0');
//  const folder = `${IMAGE_FOLDER}${year}-${month}-${day}/`;
  const folder = `${IMAGE_FOLDER}`;
  return folder;
}


app.set('view engine', 'pug');

app.get('/', async (req, res) => {
  try {
    const images = await getImagesFromDir(getImageFolder());
    const virtualImages = images.map((image) => {
      const thumbUrl = `/thumb-image?url=${encodeURIComponent(image)}`;
      const fullImageUrl = `/full-image?url=${encodeURIComponent(image)}`;
      const imageUrl = `/images/${encodeURIComponent(image)}`;
      const fileName = path.basename(image);
      return { thumbUrl, imageUrl, fullImageUrl, fileName };
    });
    res.render('gallery', { title: TITLE, images: virtualImages });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading gallery');
  }
});

function getImagesFromDir(dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, { withFileTypes: true }, async (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      const allImages = [];
      for (const file of files) {
        const fileLocation = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          const subdirImages = await getImagesFromDir(fileLocation);
          allImages.push(...subdirImages);
        } else if (file.isFile() && IMAGE_EXTENSIONS.includes(path.extname(fileLocation))) {
          allImages.push(path.relative(getImageFolder(), fileLocation));
        } else if (file.isSymbolicLink()) {
          const realPath = await fs.promises.realpath(fileLocation);
          if (realPath !== dirPath) {
            const linkImages = await getImagesFromDir(realPath);
            allImages.push(...linkImages);
          }
        }
      }
      resolve(allImages);
    });
  });
}


app.get('/thumb-image', async (req, res) => {
  try {
    const imageUrl = decodeURIComponent(req.query.url);
    const imageBuffer = await fs.promises.readFile(path.join(getImageFolder(), imageUrl));
    const thumbBuffer = await sharp(imageBuffer)
      .rotate() // Automatically rotate based on EXIF data
      .resize({ width: MAX_THUMB_SIZE, withoutEnlargement: true }) // Only downscale, do not upscale
      .toBuffer();
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(thumbBuffer, 'binary');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating thumbnail');
  }
});

app.get('/full-image', async (req, res) => {
  try {
    const imageUrl = decodeURIComponent(req.query.url);
    const imageBuffer = await fs.promises.readFile(path.join(getImageFolder(), imageUrl));
    const fileName = path.basename(imageUrl);
    res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Disposition': `inline; filename="${fileName}"`, });
    res.end(imageBuffer, 'binary');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading image');
  }
});

app.listen(LISTEN_PORT, () => {
console.log('Server started on port '+LISTEN_PORT);
});