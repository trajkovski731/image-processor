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
          width = image.width
          height = image.height
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
  console.log(data.length)
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
