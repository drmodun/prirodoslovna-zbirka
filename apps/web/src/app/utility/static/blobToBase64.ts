const blobToBase64 = (blob: any, callback: any) => {
  const reader = new FileReader();
  reader.onload = function () {
    const base64data = String(reader?.result)?.split(",")[1];
    callback(base64data);
  };
  reader.readAsDataURL(blob);
};

export { blobToBase64 };
