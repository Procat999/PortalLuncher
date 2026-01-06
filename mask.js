const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
const promptInput = document.getElementById("prompt");
const generateBtn = document.getElementById("generate");

let img = new Image();
let drawing = false;

// Upload image
upload.onchange = e => {
  img.src = URL.createObjectURL(e.target.files[0]);
};

// Draw image to canvas
img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
};

// Paint mask
canvas.onmousedown = () => drawing = true;
canvas.onmouseup = () => drawing = false;
canvas.onmouseleave = () => drawing = false;

canvas.onmousemove = e => {
  if (!drawing) return;
  ctx.fillStyle = "rgba(255,0,0,0.7)";
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, 18, 0, Math.PI * 2);
  ctx.fill();
};

// Send to backend
generateBtn.onclick = async () => {
  const res = await fetch("http://localhost:5000/inpaint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: canvas.toDataURL(),
      prompt: promptInput.value
    })
  });

  const data = await res.json();
  img.src = data.image;
};
