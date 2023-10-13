import { fsl_run } from "./bet2.js"

self.addEventListener("message", function(event) {
  var FSLBetModule = {
	  passBack: function (betted) {
		self.postMessage(betted);
	  },
	  
	  files: event.data.files,
	  
	  arguments: event.data.args,
	  
	  outputDirectory: "out",
	  
	  TOTAL_MEMORY: 956301312
  };
  
  fsl_run(FSLBetModule);
});