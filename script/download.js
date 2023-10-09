/**
 * Fires a download with the specified contents and mime type.
 * @param {string} content
 * @param {string} fileName
 * @param {string} mimeType
 */
export const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const a = document.createElement("a");

  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = [mimeType, a.download, a.href].join(":");
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(function () {
    URL.revokeObjectURL(a.href);
  }, 1500);
};
