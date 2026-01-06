from flask import Flask, request, jsonify
from diffusers import StableDiffusionInpaintPipeline
import torch, base64, io
from PIL import Image

app = Flask(__name__)

pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16
).to("cuda")

def decode_image(data):
    return Image.open(io.BytesIO(
        base64.b64decode(data.split(",")[1])
    ))

@app.route("/inpaint", methods=["POST"])
def inpaint():
    data = request.json

    image = decode_image(data["image"]).convert("RGB")

    # Create mask from painted red area
    mask = image.convert("L").point(lambda x: 255 if x > 40 else 0)

    result = pipe(
        prompt=data["prompt"],
        image=image,
        mask_image=mask,
        guidance_scale=7.5,
        num_inference_steps=30
    ).images[0]

    buffer = io.BytesIO()
    result.save(buffer, format="PNG")

    return jsonify({
        "image": "data:image/png;base64," +
        base64.b64encode(buffer.getvalue()).decode()
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
