export default function (rgbColor) {
  rgbColor = rgbColor.replace("rgb(", "");
  rgbColor = rgbColor.replace(")", "");
  const rgb = rgbColor.split(", ");
  const yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return yiq >= 128 ? "#000" : "#FFF";
}
