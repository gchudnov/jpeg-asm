(function () {

  if (!window.FileReader) {
    document.write('<strong>Sorry, your web browser does not support the FileReader API.</strong>');
    return;
  }

  function displayError(err) {
    var el = document.getElementById('errors');
    el.innerHTML = err ? err.message : '';
  }

  function clearError() {
    displayError()
  }

  function clearCanvas() {
    var canvas = document.getElementById('source-canvas');
    var ctx = canvas.getContext("2d");
    ctx.clearRect (0 , 0 , canvas.width, canvas.height);
  }

  function displayDecodedData(decoded) {
    var canvas = document.getElementById('source-canvas');
    canvas.width = decoded.width;
    canvas.height = decoded.height;

    var ctx = canvas.getContext("2d");

    var imageData = ctx.getImageData(0, 0, decoded.width, decoded.height);
    var imageBytes = imageData.data;
    var bufferView = new Uint8Array(decoded.buffer);
    for (var i = 0, j = 0, size = decoded.width * decoded.height * 4; i < size; ) {
      imageBytes[i++] = bufferView[j++]; // R
      imageBytes[i++] = bufferView[j++]; // G
      imageBytes[i++] = bufferView[j++]; // B
      imageBytes[i++] = 0xFF; // A
    }

    ctx.putImageData(imageData, 0, 0);
  }

  var handleFile = function (event) {
    var files = event.target.files;

    var reader = new FileReader();
    reader.onload = function (event) {
      var buf = event.target.result;
      try {
        var decoded = jpegasm.decode(buf);
        displayDecodedData(decoded);
      } catch (err) {
        displayError(err);
      }
    };

    clearError();
    clearCanvas();

    reader.readAsArrayBuffer(files[0]);
  };

  window.addEventListener('load', function () {
    document.getElementById('file').addEventListener('change', handleFile, false);
  }, false);

}());