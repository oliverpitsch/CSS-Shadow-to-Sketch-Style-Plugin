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
var listOfShadows = []
var listOfInnerShadows = []
var currentShadow = ""

// RGBA to Hex from https://css-tricks.com/converting-color-spaces-in-javascript/
function RGBAToHexA(rgba) {
  let sep = rgba.indexOf(",") > -1 ? "," : " "
  rgba = rgba.substr(5).split(")")[0].split(sep)

  // Strip the slash if using space-separated syntax
  if (rgba.indexOf("/") > -1)
    rgba.splice(3, 1)

  for (let R in rgba) {
    let r = rgba[R];
    if (r.indexOf("%") > -1) {
      let p = r.substr(0, r.length - 1) / 100

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
var getShadowInput = function() {
  UI.getInputFromUser(
    "🖍 Please insert the CSS box-shadow.", {
      initialValue: 'box-shadow: inset 0 2.4px 3.6px rgba(0, 0, 0, 0.087), 0 6.5px 10px rgba(0, 0, 0, 0.125), 0 15.7px 24.1px rgba(0, 0, 0, 0.163), 0 52px 80px rgba(0, 0, 0, 0.25);'
      // initialValue: 'box-shadow: 0 2px 4px rgba(0,0,0,0.6);',
    },
    (err, value) => {
      if (err) {
        // most likely the user canceled the input
        return
      } else {
        shadowInput = value
      }
    }
  )
}

var splitShadows = function(inputCSS) {

  // Remove Line Breaks if necessary
  inputCSS = inputCSS.replace(/(\r\n|\n|\r)/gm, "")

  // Split the Shadow Input taking care if it contains "box-shadow: " or not …
  splittetInput = inputCSS.split(": ")
  if (splittetInput.length >= 2) {
    splittetInput = splittetInput[1].split(";")
  } else {
    splittetInput = splittetInput[0].split(";")
  }

  // Split Shadows at ) and add ) again for each shadow
  listOfShadows = splittetInput.toString().split(")")
  listOfShadows = listOfShadows.map(i => i + ")").slice(0, -1);

  for (var i = listOfShadows.length - 1; i >= 0; i--) {
    if (listOfShadows[i].split(" ")[0] == "inset") { 
      listOfInnerShadows.push(listOfShadows[i])
      listOfShadows.splice(i, 1);
    }
  }
}

var removeRGBASpaces = function(input) {
  // Remove Spaces in RGBA specification
  input = input.split("rgba")
  if (input[1].split(", ").length > 0) {
    input[1] = input[1].split(", ").join()
  }
  input = input[0] + "rgba" + input[1]

  currentShadow = input
}

var getShadowStyleData = function(input) {

  if (currentShadow.split(", ").length > 1) {
    currentShadow = currentShadow.slice(1)
  } else {
    currentShadow = currentShadow
  }
  currentShadow = currentShadow.trim()

  console.log("Input Shadow: " + currentShadow)

  currentShadow = currentShadow.split(" ")

  if (currentShadow.length === 5) {
    inputX = Math.round(parseFloat(currentShadow[0]))
    inputY = Math.round(parseFloat(currentShadow[1]))
    inputBlur = Math.round(parseFloat(currentShadow[2]))
    inputSpread = Math.round(parseFloat(currentShadow[3]))
    inputColor = RGBAToHexA(currentShadow[4])
    console.log("Parsed 5 Data Points: " + inputX + ", " + inputY + ", " + inputBlur + ", " + inputSpread + ", " + inputColor)
  } else if (currentShadow.length === 4) {
    inputX = Math.round(parseFloat(currentShadow[0]))
    inputY = Math.round(parseFloat(currentShadow[1]))
    inputBlur = Math.round(parseFloat(currentShadow[2]))
    inputColor = RGBAToHexA(currentShadow[3])
    inputSpread = "0"
    console.log("Parsed 4 Data Points: " + inputX + ", " + inputY + ", " + inputBlur + ", " + inputSpread + ", " + inputColor)
  } else {
    sketch.UI.message("🤔 Oops. Sure that was a valid box-shadow?")
  }
}

var removeLeadingComma = function(inputShadow) {
  inputShadow.replace(/(^,)|(,$)/g, "")
  console.log(inputShadow)
}

var applyShadows = function(listOfShadows) {
  if (listOfShadows.length >= 1) {
    listOfShadows.forEach(function(shadow, i) {

      removeRGBASpaces(shadow)
      getShadowStyleData(shadow)

      selectedLayers.forEach(function(layer, i) {
        var layerShadows = layer.style.shadows
        layer.style.shadows = layerShadows.concat([{
          x: inputX,
          y: inputY,
          blur: inputBlur,
          spread: inputSpread,
          color: inputColor,
          enabled: true
        }])
        sketch.UI.message("🎉 Shadow applied successfully!")
      })
      console.log("–––––––––––––")
    })
  } else {
    sketch.UI.message("🤔 Oops. Sure that was a valid box-shadow?")
  }
}

var applyInnerShadows = function(listOfInnerShadows){
  if (listOfInnerShadows.length >= 1) {
      listOfInnerShadows.forEach(function(innerShadow, i) {

        removeRGBASpaces(innerShadow)
        getShadowStyleData(innerShadow)

        selectedLayers.forEach(function(layer, i) {
          var layerInnerShadows = layer.style.innerShadows
          layer.style.innerShadows = layerInnerShadows.concat([{
            x: inputX,
            y: inputY,
            blur: inputBlur,
            spread: inputSpread,
            color: inputColor,
            enabled: true
          }])
          sketch.UI.message("🎉 Shadow applied successfully!")
        })
        console.log("–––––––––––––")
      })
    } else {
      sketch.UI.message("🤔 Oops. Sure that was a valid box-shadow?")
    }
}

// This function runs it all
export default function() {
  if (selectedCount === 0) {
    sketch.UI.message("☝️ Please select a layer first.")
  } else {
    getShadowInput()
    splitShadows(shadowInput)
    applyShadows(listOfShadows)
  }
}