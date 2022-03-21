const signatureCanvas = document.getElementById("signature-canvas");
const signatureInput = document.getElementById("hidden-input");
const canvas = signatureCanvas.getContext("2d");

let startingX, startingY;
const mouseMoveHandler = (e) => {
    canvas.beginPath();
    canvas.fillStyle = "darkblue";
    canvas.moveTo(startingX, startingY);
    canvas.lineTo(e.offsetX, e.offsetY);
    canvas.stroke();
    startingX = e.offsetX;
    startingY = e.offsetY;

    signatureInput.value = signatureCanvas.toDataURL();
};

signatureCanvas.addEventListener("mousedown", (e) => {
    startingX = e.offsetX;
    startingY = e.offsetY;
    signatureCanvas.addEventListener("mousemove", mouseMoveHandler);
});

document.addEventListener("mouseup", () => {
    signatureCanvas.removeEventListener("mousemove", mouseMoveHandler);
});
