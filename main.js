import { Niivue, NVImage } from '@niivue/niivue'
import BetWorker from "./worker?worker";


let inputVolumeBuffer = null
let outputVolumeBuffers = {
    "bet": null,
    "mask": null,
    "overlay": null,
    "skull": null
}

function processImage(worker, file) {
    let args = ["vol.nii", "out/vol_bet.nii"].concat(getCLIArgumentsFromModal());
    console.log(args);
  worker.postMessage({files: [{name: "vol.nii", data: new Uint8Array(file)}], args: args});
}

function setVolume(nv, buffer) {
    let vol = new NVImage(buffer);
    nv.setVolume(vol, 0);
}

function hideOutputSelectionLinks() {
    let links = document.querySelectorAll('.overlay-link');

    links.forEach(link => {
        link.classList.add("hidden");
    });
}

function showLink(linkId) {
    document.getElementById(linkId).classList.remove("hidden");
}

function initBetWorker(nv, worker) {
    worker.addEventListener("message", async function(e) {
        if (e.data.length == 1) {
            setVolume(nv, e.data[0].data);
            hideOutputSelectionLinks();
            showLink("betLink");
        } else {
            hideOutputSelectionLinks();

            for (let result of e.data) {
                if (result.name.includes("skull")) {
                    outputVolumeBuffers["skull"] = result.data;
                    showLink("skullLink")
                } else if (result.name.includes("mask")) {
                    outputVolumeBuffers["mask"] = result.data;
                    showLink("maskLink")
                } else if (result.name.includes("overlay")) {
                    outputVolumeBuffers["overlay"] = result.data;
                    showLink("overlayLink")
                } else {
                    outputVolumeBuffers["bet"] = result.data;
                    showLink("betLink")
                }
            }

            setVolume(nv, outputVolumeBuffers["bet"]);
        }
    });
	
	worker.addEventListener("onerror", function(error) {
      console.log(error.message);
	});
}

async function handleFileSelection(event, nv) {
    const file = event.target.files[0];

    if (file) {
        let volume = await NVImage.loadFromFile(file);
        nv.setVolume(volume, 0);
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

async function fetchFile(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        
        return buffer;
    } catch (error) {
        console.error('Fetching file failed:', error);
        throw error;
    }
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

    // BET output links
    let links = document.querySelectorAll('.overlay-link');

    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            links.forEach(innerLink => {
                innerLink.classList.remove('selected');
            });

            if (link.id.includes("skull")) {
                setVolume(nv, outputVolumeBuffers["skull"]);
            } else if (link.id.includes("overlay"))  {
                setVolume(nv, outputVolumeBuffers["overlay"]);
            } else if (link.id.includes("mask"))  {
                setVolume(nv, outputVolumeBuffers["mask"]);
            } else {
                setVolume(nv, outputVolumeBuffers["bet"]);
            }

            this.classList.add('selected');
        });
    });

    initBetWorker(nv, worker);
    inputVolumeBuffer = await fetchFile("./test_t1.nii");
    nv.attachToCanvas(canvas);
    nv.loadVolumes([{
        url: "./test_t1.nii",
        volume: {hdr: null, img: null},
        name: "test_image",
        colorMap: "gray",
        opacity: 1,
        visible: true,
    }]);
}
