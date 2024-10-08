const uploadBtn = document.getElementById('uploadBtn');
const audioInput = document.getElementById('audio');
const fileNameDisplay = document.getElementById('fileName');
const canvas = document.getElementById('canvas');

let audioContext;
let analyser;
let source;

uploadBtn.onclick = () => {
    audioInput.click(); // Trigger file input when button is clicked
};

audioInput.addEventListener('change', function (e) {
    const file = e.target.files[0];

    // Check if the file is an MP3
    if (!file || (!file.type.match('audio/mpeg') && !file.type.match('audio/mp3'))) {
        alert('Please select a valid MP3 file.');
        return;
    }

    fileNameDisplay.textContent = file.name; // Display the file name

    // Read the MP3 file
    const reader = new FileReader();
    reader.onload = function (event) {
        const arrayBuffer = event.target.result;

        // Initialize the audio context and analyser
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        // Decode the audio data
        audioContext.decodeAudioData(arrayBuffer, function (audioBuffer) {
            visualize(audioBuffer); // Visualize the decoded audio data
        }, function (error) {
            console.error('Error decoding MP3 file:', error);
        });
    };
    reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
});

function visualize(audioBuffer) {
    // Create a buffer source
    source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(audioContext.destination); // Connect to the speakers
    source.start(); // Start playing the audio

    const frequencyBufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(frequencyBufferLength);

    const canvasContext = canvas.getContext("2d");
    const barWidth = canvas.width / frequencyBufferLength;

    function draw() {
        requestAnimationFrame(draw); // Create a continuous loop

        analyser.getByteFrequencyData(frequencyData); // Get frequency data

        canvasContext.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        for (let i = 0; i < frequencyBufferLength; i++) {
            // Draw the frequency data as bars
            const barHeight = frequencyData[i];
            canvasContext.fillStyle = "rgb(" + (barHeight + 100) + ", 50, 50)";
            canvasContext.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
        }
    }

    draw(); // Start drawing the visualizer
}
