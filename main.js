import { fabric } from 'fabric';

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("upload");
  const canvas = new fabric.Canvas('main-canvas');
  const context = canvas.getContext("2d");
  let filter = new fabric.Image.filters.Pixelate({
    blocksize: 5 // Adjust the value as needed
  });

  const image = new Image();
  let w, h;

  input.addEventListener("change", () => {
    const [file] = input.files;
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        image.src = reader.result;
        image.addEventListener("load", () => {
          const { width, height } = image;
          w = width;
          h = height;
          console.log(w, h);

          // Set canvas dimensions
          canvas.setWidth(w);
          canvas.setHeight(h);

          // Clear the canvas
          canvas.clear();
          context.clearRect(0, 0, canvas.width, canvas.height);

          // Create a Fabric.js image object
          const fabricImage = new fabric.Image(image, {
            left: 0,
            top: 0,
            width: w,
            height: h,
          });

          // Add the Fabric.js image to the canvas
          canvas.add(fabricImage);

          // Apply a grayscale filter (example)
          fabricImage.filters.push(filter);

          // Apply filters and render
          fabricImage.applyFilters();
          canvas.renderAll();
        });
      });
      reader.readAsDataURL(file);
    }
  });


  const grayscale = document.getElementById("grayscale");
  grayscale.addEventListener("click", new fabric.Image.filters.Grayscale())

  const sepia = document.getElementById("sepia");
  sepia.addEventListener("click", () => filter = new fabric.Image.filters.Sepia())

});
