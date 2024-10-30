let red = document.getElementById("red");
let blue = document.getElementById("blue");
let green = document.getElementById("green");

let redVal = document.getElementById("redValue");
let blueVal = document.getElementById("blueValue");
let greenVal = document.getElementById("greenValue");

let hue = document.getElementById("hue");
let saturation = document.getElementById("saturation");
let lightness = document.getElementById("lightness");

let hueVal = document.getElementById("hueValue");
let saturationVal = document.getElementById("saturationValue");
let lightnessVal = document.getElementById("lightnessValue");

let hex = document.getElementById("hex");

let swatch = document.getElementById("colorSwatch");

let colorName = document.getElementById("colorName");

colorName.addEventListener("input", setColor);

red.addEventListener("input", updateColor);
green.addEventListener("input", updateColor);
blue.addEventListener("input", updateColor);

hue.addEventListener("input", updateColor);
saturation.addEventListener("input", updateColor);
lightness.addEventListener("input", updateColor);

hex.addEventListener("input", updateColor);

function init() {
  for (let i = 0; i <= colorName.options.length; i++) {
    if (!colorName.options[i])
      continue;
    document.getElementById(colorName.options[i].value).style["background-color"] = localStorage.getItem(colorName.options[i].value) ?? "rgb(0,0,0)";
  }
  setColor();
}
function updateColor() {
  let tab = Array.from(document.getElementById("colorTab").childNodes).filter(x => x.type != undefined && Array.from(x.firstElementChild.classList).includes("active"))[0].firstElementChild.id.split("-")[0];
  let color = "";

  switch (tab) {
    case "rgb":
      color = "rgb(" + red.value + "," + green.value + "," + blue.value + ")";
      swatch.style["background-color"] = color;
      document.getElementById(colorName.value).style["background-color"] = color;

      updateRgbVal();
      break;
    case "hsl":
      color = convertToRgb("hsl(" + hue.value + "," + saturation.value + "%," + lightness.value + "%)");
      color = "rgb(" + color['r'] + "," + color['g'] + "," + color['b'] + ")";
      swatch.style["background-color"] = color;
      document.getElementById(colorName.value).style["background-color"] = color;

      updateHslVal();
      break;
    case "hex":
      color = hexToRgb(hex.value);
      color = "rgb(" + color['r'] + "," + color['g'] + "," + color['b'] + ")";

      swatch.style["background-color"] = color;
      document.getElementById(colorName.value).style["background-color"] = color;
      break;
  }

  localStorage.setItem(colorName.value, color);

  window.browser.runtime.sendMessage({ type: 'applyTheme' });
}
function setColor() {
  let color = localStorage.getItem(colorName.value) ?? "rgb(0,0,0)";
  color = convertToRgb(color) ?? { 'r': '0', 'g': '0', 'b': '0' };

  swatch.style["background-color"] = "rgb(" + color['r'] + "," + color['g'] + "," + color['b'] + ")";

  red.value = color['r'];
  green.value = color['g'];
  blue.value = color['b'];
  updateRgbVal();

  let hslColor = rgbToHsl(color['r'], color['g'], color['b']);
  hue.value = hslColor['h'];
  saturation.value = hslColor['s'];
  lightness.value = hslColor['l'];
  updateHslVal();

  hex.value = rgbToHex(color['r'], color['g'], color['b']);
}
function reset() {
  var options = Array.from(colorName.options).map(x => x.value);

  for (let i = 0; i < options.length; i++) {
    colorName.value = options[i];

    setColor();
    updateColor();
    init();
  }
}

function updateRgbVal() {
  redVal.innerHTML = red.value;
  greenVal.innerHTML = green.value;
  blueVal.innerHTML = blue.value;
}
function updateHslVal() {
  hueVal.innerHTML = hue.value;
  saturationVal.innerHTML = saturation.value;
  lightnessVal.innerHTML = lightness.value;
}

init();

// #region Colors
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}
// Convert RGB to Hex
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}
// Convert HSL to RGB
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255)
  };
}
// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
// Convert Hex to HSL
function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}
// Parse an RGB string to RGB object
function parseRgbString(rgbString) {
  const match = rgbString.match(/\d+/g);
  if (!match) return null;
  return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
}
// Convert color string to RGB
function convertToRgb(color) {
  if (color.startsWith("hsl")) {
    const match = color.match(/(\d+),\s*(\d+)%,\s*(\d+)%/);
    if (!match) return null;
    return hslToRgb(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
  } else if (color.startsWith("#")) {
    return hexToRgb(color);
  } else if (color.startsWith("rgb")) {
    return parseRgbString(color);
  }
  return null;
}

// #region PreMadeThemes
let purpleLight = document.getElementById("PurpleLight");
purpleLight.addEventListener("click", PurpleLight)
function PurpleLight() {
  localStorage.setItem("ColorMap--accent-color", '#a375e4');
  localStorage.setItem("ColorMap--accent-color-hover", '#8a2be2');
  localStorage.setItem("ColorMap--butterfly-icon", '#8a2be2');
  localStorage.setItem("ColorMap--background", '#ffffff');
  localStorage.setItem("ColorMap--content-warnings", '#dfcfff');
  localStorage.setItem("ColorMap--content-warnings-hover", '#baa3e7');
  localStorage.setItem("ColorMap--text-primary", '#000000');
  localStorage.setItem("ColorMap--text-secondary", '#535353');
  localStorage.setItem("ColorMap--border-color", '#000000');
  reset();
}
let purpleDim = document.getElementById("PurpleDim");
purpleDim.addEventListener("click", PurpleDim)
function PurpleDim() {
  localStorage.setItem("ColorMap--accent-color", '#bb98ff');
  localStorage.setItem("ColorMap--accent-color-hover", '#8a2be2');
  localStorage.setItem("ColorMap--butterfly-icon", '#8a2be2');
  localStorage.setItem("ColorMap--background", '#200d46');
  localStorage.setItem("ColorMap--content-warnings", '#322d3c');
  localStorage.setItem("ColorMap--content-warnings-hover", '#4b435b');
  localStorage.setItem("ColorMap--text-primary", '#fff');
  localStorage.setItem("ColorMap--text-secondary", '#7f7f7f');
  localStorage.setItem("ColorMap--border-color", 'rgb(46, 64, 82)');
  reset();
}
let purpleDark = document.getElementById("PurpleDark");
purpleDark.addEventListener("click", PurpleDark)
function PurpleDark() {
  localStorage.setItem("ColorMap--accent-color", '#7636c5');
  localStorage.setItem("ColorMap--accent-color-hover", '#8b2be2');
  localStorage.setItem("ColorMap--butterfly-icon", '#8a2be2');
  localStorage.setItem("ColorMap--background", '#0e000e');
  localStorage.setItem("ColorMap--content-warnings", '#3c1157');
  localStorage.setItem("ColorMap--content-warnings-hover", '#3c2c57');
  localStorage.setItem("ColorMap--text-primary", '#fff');
  localStorage.setItem("ColorMap--text-secondary", '#8f9eb7');
  localStorage.setItem("ColorMap--border-color", '#ffffff');
  reset();
}
// #endregion
// #endregions