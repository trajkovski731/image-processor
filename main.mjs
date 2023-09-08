import { Sobel } from 'sobel'
import triangulate from 'delaunay-triangulate'

console.log(triangulate)
let readonlyBuffer

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
          width = image.width
          height = image.height
          canvas.width = width
          canvas.height = height
          context.drawImage(image, 0, 0, width, height)
          const data = context.getImageData(0, 0, width, height)
          readonlyBuffer = [...data.data]
        })
      })
      reader.readAsDataURL(file)
    }
  })

  registerSobelFilter(context, canvas, image)
})

function sobel(context, canvas, image) {
  const data = context.getImageData(0, 0, image.width, image.height)
  return Sobel(data).toImageData()
}

function sobelFilterHandler(context, canvas, image) {
  const edges = sobel(context, canvas, image)
  removeNoise(edges.data, 120)
  const sample = samplePoints(edges.data, 4000, image)
  console.log(sample)
  const triangles = triangulate(sample)
  console.log(triangles)
  context.putImageData(edges, 0, 0)
  // sample.forEach(point => {
  //   context.beginPath()
  //   context.fillStyle = '#ff0000'
  //   context.fillRect(point[0], point[1], 2, 2)
  //   context.fill()
  // })

  triangles.forEach(tri => {
    const p1 = sample[tri[0]]
    const p2 = sample[tri[1]]
    const p3 = sample[tri[2]]

    var centerX = Math.floor((p1[0] + p2[0] + p3[0]) / 3)
    var centerY = Math.floor((p1[1] + p2[1] + p3[1]) / 3)
    const index = centerX * 4 + centerY * image.width * 4
    const color = `rgb(${readonlyBuffer[index]},${readonlyBuffer[index + 1]},${
      readonlyBuffer[index + 2]
    } )`

    context.beginPath()
    context.moveTo(p1[0], p1[1])
    context.lineTo(p2[0], p2[1])
    context.lineTo(p3[0], p3[1])
    context.closePath()
    context.lineWidth = 1
    context.strokeStyle = color
    context.stroke()

    // context.beginPath()
    // context.fillStyle = '#ff0000'
    // context.fillRect(centerX, centerY, 1, 1)
    // context.fill()

    context.fillStyle = color

    context.fill()
  })
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

function samplePoints(data, amount, image) {
  const candidates = []
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 0) candidates.push(i)
  }
  const shuffled = candidates.sort(() => 0.5 - Math.random())
  let sample = shuffled.slice(0, amount).filter(point => point != null)
  sample = sample.map(index => [
    (index / 4) % image.width,
    Math.floor(index / 4 / image.width)
  ])

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

  const stepsize = 20
  for (let i = 0; i < image.width; i += stepsize) {
    for (let j = 0; j < image.height; j += stepsize) {
      sample.push([
        clamp(i + Math.random() * 10, 0, image.width - 1),
        clamp(j * Math.random() * 10, 0, image.height - 1)
      ])
    }
  }

  sample.push(
    [0, 0],
    [0, image.height],
    [image.width, 0],
    [image.width, image.height]
  )

  return sample
}
