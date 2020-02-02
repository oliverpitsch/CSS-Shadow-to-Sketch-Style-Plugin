import sketch from 'sketch'
// documentation: https://developer.sketchapp.com/reference/api/

var UI = require('sketch/ui')
var async = require('sketch/async')
var DataSupplier = require('sketch/data-supplier')
var Settings = require('sketch/settings')
var Style = require('sketch/dom').Style


var document = sketch.getSelectedDocument()

var selectedLayers = document.selectedLayers
var selectedCount = selectedLayers.length
var shadowInput = ""
var splittetInput = ""
var inputX = "0"
var inputY = "0"
var inputBlur = "0"
var inputSpread = "0"
var inputColor = "#0000ff"
var numberOfShadows = '1'
var singleShadow = ""
var multipleShadows = ""

// RGBA to Hex from https://css-tricks.com/converting-color-spaces-in-javascript/
function RGBAToHexA(rgba) {
  let sep = rgba.indexOf(",") > -1 ? "," : " "
  rgba = rgba.substr(5).split(")")[0].split(sep)
                
  // Strip the slash if using space-separated syntax
  if (rgba.indexOf("/") > -1)
    rgba.splice(3,1)

  for (let R in rgba) {
    let r = rgba[R];
    if (r.indexOf("%") > -1) {
      let p = r.substr(0,r.length - 1) / 100

      if (R < 3) {
        rgba[R] = Math.round(p * 255)
      } else {
        rgba[R] = p
      }
    }
  }

  let r = (+rgba[0]).toString(16),
      g = (+rgba[1]).toString(16),
      b = (+rgba[2]).toString(16),
      a = Math.round(+rgba[3] * 255).toString(16)

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;
  if (a.length == 1)
    a = "0" + a;

  return "#" + r + g + b + a
}



// Get CSS Shadow Input as String
var getShadowInput = function(){
  UI.getInputFromUser(
      "🖍 Please insert the CSS box-shadow.",
      {
        initialValue: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);'
        // initialValue: 'box-shadow: 0 2px 4px rgba(0,0,0,0.6);',
      },
      (err, value) => {
        if (err) {
          // most likely the user canceled the input
          return
        }
        else {
          shadowInput = value
        }
      }
    )
}

var splitShadow = function(inputCSS) {
  // Split the Shadow Input taking care if it contains "box-shadow: " or not …

  // Remove Spaces in RGBA specification
  inputCSS = inputCSS.split("rgba")
  if (inputCSS[1].split(", ").length > 0){
    inputCSS[1] = inputCSS[1].split(", ").join()
  }
  inputCSS = inputCSS[0] + "rgba" + inputCSS[1]

  splittetInput = inputCSS.split(": ")

  if (splittetInput.length >= 2) {
    splittetInput = splittetInput[1].split(";")
  } else {
    splittetInput = splittetInput[0].split(";")
  }

  splittetInput = splittetInput[0].split(" ")
}

var getShadowInputData = function(input) {
  if (input.length === 5) {
    inputX = input[0]
    inputY = input[1]
    inputBlur = input[2]
    inputSpread = input[3]
    inputColor = RGBAToHexA(input[4])
  }
  else if (input.length === 4) {
    inputX = input[0]
    inputY = input[1]
    inputBlur = input[2]
    inputColor = RGBAToHexA(input[3])    
  }
  else {
    sketch.UI.message("Wrong Input, sorry. 😢")
  }
}

var applyShadow = function(shadow) {
  getShadowInputData(shadow)

  selectedLayers.forEach(function (layer, i) {
    console.log(layer.style.shadows.length)
    var layerShadows = layer.style.shadows
    layer.style.shadows = layerShadows.concat([{
      x: inputX,
      y: inputY,
      blur: inputBlur,
      spread: inputSpread,
      color: inputColor,
      enabled: true
    }])
  })
  sketch.UI.message("🎉 Shadow applied successfully!")

}

// This function runs it all
export default function() {
  if (selectedCount === 0) {
    sketch.UI.message("☝️ Please select a layer first.")
  } else {
    getShadowInput()
    splitShadow(shadowInput)
    applyShadow(splittetInput)

  }
}
