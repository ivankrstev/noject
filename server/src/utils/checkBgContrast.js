export default function checkBgContrast(color) {
  const red = parseInt(color.substring(1, 3), 16);
  const green = parseInt(color.substring(3, 5), 16);
  const blue = parseInt(color.substring(5, 7), 16);
  const yiq = (red * 299 + green * 587 + blue * 114) / 1000;
  return yiq >= 128 ? "#000" : "#FFF";
}
