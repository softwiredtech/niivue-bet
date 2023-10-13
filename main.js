import { Niivue, NVImage } from '@niivue/niivue'
import BetWorker from "./worker?worker";

function processImage(worker, file) {
  worker.postMessage({files: [{name: "test.nii", data: new Uint8Array(file)}], args: ["test.nii", "out/test_betted.nii", "-f" ,"0.5", "-o", "-g" ,"0"]});
}

function initBetWorker(nv, worker) {
    worker.addEventListener("message", async function(e) {
        nv.setVolume(new NVImage(e.data[0].data), nv.volumes.length);								
	    worker.terminate();
    });
	
	worker.addEventListener("onerror", function(error) {
      console.log(error.message);
	  worker.terminate();
	});
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
    const worker = new BetWorker();
    const canvas = document.getElementById('gl');
    const nv = new Niivue();
    initBetWorker(nv, worker);
    const testInputNii = await fetchFile("./test_t1.nii");
    nv.attachToCanvas(canvas);
    nv.loadVolumes([{
        url: "./test_t1.nii",
        volume: {hdr: null, img: null},
        name: "test_image",
        colorMap: "gray",
        opacity: 1,
        visible: true,
    }]);
    processImage(worker, testInputNii);
}
