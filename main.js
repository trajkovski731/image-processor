document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("upload")
  const canvas = document.getElementById("main-canvas")
  const context = canvas.getContext("2d")

  const image = new Image()
  let w, h

  input.addEventListener("change", () => {
    const [file] = input.files
    if(file) {
      const reader = new FileReader()
      reader.addEventListener("load", () => {
        image.src = reader.result
        image.addEventListener("load", () => {
          const {width, height} = image
          w = width
          h = height
          console.log(w, h)
          canvas.width = w
          canvas.height = h
          context.drawImage(image, 0, 0, w, h)
          const data = context.getImageData(0, 0, w, h)
          console.log(data)
        })
      })
      reader.readAsDataURL(file)
    }

  })
})