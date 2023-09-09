import { Sobel } from 'sobel'

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('upload')
  const canvas = document.getElementById('main-canvas')
  const context = canvas.getContext('2d')

  const image = new Image()
  let width, height

  input.addEventListener('change', () => {
    const [file] = input.files
    if (file) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        image.src = reader.result
        image.addEventListener('load', () => {
          const [width, height] = clampDimensions(image.width, image.height);
          canvas.width = width
          canvas.height = height
          context.drawImage(image, 0, 0, width, height)
          const data = context.getImageData(0, 0, width, height)
        })
      })
      reader.readAsDataURL(file)
    }
  })

  registerSobelFilter(context, canvas, image)
  registerASCIIFilter(context, canvas, image)
})

function sobel(context, canvas, image) {
  const data = context.getImageData(0, 0, image.width, image.height)
  return Sobel(data).toImageData()
}

function sobelFilterHandler(context, canvas, image) {
  const edges = sobel(context, canvas, image)
  removeNoise(edges.data, 170)
  context.putImageData(edges, 0, 0)
}

function registerSobelFilter(context, canvas, image) {
  const btn = document.getElementById('sobel-filter-btn')
  btn.addEventListener('click', () =>
    sobelFilterHandler(context, canvas, image)
  )
}

function removeNoise(data, threshold) {
  for (let i = 0; i < data.length; i += 4) {
    const intensity = data[i]
    if (intensity < threshold) {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
    }
  }
  return data
}

function samplePoints(data, amount) {
  const candidates = []
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 0) candidates.push(i)
  }
}

function getFontRatio() {
  const pre = document.createElement('pre');
  pre.style.display = 'inline';
  pre.textContent = ' ';

  document.body.appendChild(pre);
  const { width, height } = pre.getBoundingClientRect();
  document.body.removeChild(pre);

  return height / width;
}

const fontRatio = getFontRatio();

const MAXIMUM_WIDTH = 60;
const MAXIMUM_HEIGHT = 60;

function clampDimensions(width, height) {
    const rectifiedWidth = Math.floor(getFontRatio() * width);

    if (height > MAXIMUM_HEIGHT) {
        const reducedWidth = Math.floor(rectifiedWidth * MAXIMUM_HEIGHT / height);
        return [reducedWidth, MAXIMUM_HEIGHT];
    }

    if (width > MAXIMUM_WIDTH) {
        const reducedHeight = Math.floor(height * MAXIMUM_WIDTH / rectifiedWidth);
        return [MAXIMUM_WIDTH, reducedHeight];
    }

    return [rectifiedWidth, height];
}

function registerASCIIFilter(context, canvas, image) {
  const btn = document.getElementById('ascii-filter-btn')
  btn.addEventListener('click', () =>
    asciiFilterHandler(context, canvas, image)
  )
}

function asciiFilterHandler(context, canvas, image) {
  const [adjustedWidth, adjustedHeight] = clampDimensions(canvas.width, canvas.height)
  const grayScales = convertToGrayScales(context, canvas.width, canvas.height)
  drawAscii(grayScales, canvas.width)
}

function drawAscii(grayScales, width) {
  const asciiImage = document.getElementById('ascii');
  const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
      let nextChars = getCharacterForGrayScale(grayScale);
      if ((index + 1) % width === 0) {
          nextChars += '\n';
      }

      return asciiImage + nextChars;
  }, '');

  asciiImage.textContent = ascii;
}

function convertToGrayScales(context, width, height) {
  const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;
  const imageData = context.getImageData(0, 0, width, height);

  const grayScales = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    const grayScale = toGrayScale(r, g, b);
    imageData.data[i] = imageData.data[i + 1] = imageData.data[
      i + 2
    ] = grayScale;

    grayScales.push(grayScale);
  }

  return grayScales;
}

const grayRamp =
  "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
const rampLength = grayRamp.length;

// the grayScale value is an integer ranging from 0 (black) to 255 (white)
function getCharacterForGrayScale(grayScale) {
  return grayRamp[Math.ceil(((rampLength - 1) * grayScale) / 255)];
}
