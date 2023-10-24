import { Niivue, NVImage } from '@niivue/niivue'
import BetWorker from "./worker?worker";


let inputVolumeBuffer = null

function processImage(worker, file) {
    let args = ["vol.nii", "out/vol_bet.nii"].concat(getCLIArgumentsFromModal());
    console.log(args);
  worker.postMessage({files: [{name: "vol.nii", data: new Uint8Array(file)}], args: args});
}

function initBetWorker(nv, worker) {
    worker.addEventListener("message", async function(e) {
        let vol = new NVImage(e.data[0].data);
        nv.setVolume(vol, 0);
        //worker.terminate();
    });
	
	worker.addEventListener("onerror", function(error) {
      console.log(error.message);
      //worker.terminate();
	});
}

async function handleFileSelection(event, nv) {
    const file = event.target.files[0];

    if (file) {
        let volume = await NVImage.loadFromFile(file);
        nv.addVolume(volume);
        const reader = new FileReader();
        reader.onload = function(fileEvent) {
            inputVolumeBuffer = fileEvent.target.result;
        };
        reader.readAsArrayBuffer(file);
    }
}

function getCLIArgumentsFromModal() {
    const form = document.getElementById('betForm');
    const inputs = form.querySelectorAll('input');
    const params = [];

    for(let input of inputs) {
        // If it's a checkbox and it's checked, push its name
        if (input.type === 'checkbox' && input.checked) {
            params.push(input.name);
        } else if (input.type === 'range' || input.type === 'number') {
            params.push(input.name);
            params.push(input.value);
        }
    }

    return params;
}

 window.onload = async () => {
    console.log(getCLIArgumentsFromModal());
    const canvas = document.getElementById('gl');
    const worker = new BetWorker();
    const nv = new Niivue();

    document.getElementById("fileSelection").addEventListener("click", (e) => {
        e.preventDefault();
        fileInput.click();
    });

    document.getElementById("submitBet").addEventListener("click", (e) => {
        e.preventDefault();
        processImage(worker, inputVolumeBuffer);
        modal.style.display = 'none';
    });

    fileInput.addEventListener("change", (event) => handleFileSelection(event, nv));

    // Modal init
    const modal = document.getElementById('betModal');
    const closeModalButton = document.getElementById('closeModal');
    
    // Show the modal when BET is clicked
    document.getElementById("bet").addEventListener("click", function(e) {
        e.preventDefault();
        modal.style.display = 'block';
    });

    // Close the modal
    closeModalButton.addEventListener("click", function() {
        modal.style.display = 'none';
    });

    document.querySelector('input[name="-f"]').addEventListener('input', function(e) {
        document.getElementById('sliderValueF').textContent = e.target.value;
    });
    
    document.querySelector('input[name="-g"]').addEventListener('input', function(e) {
        document.getElementById('sliderValueG').textContent = e.target.value;
    });

    initBetWorker(nv, worker);
    nv.attachToCanvas(canvas);
    
}
