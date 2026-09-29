(() => {
  const photos=window.RAYAN_PHOTOS||{};
  document.querySelectorAll('img[data-photo]').forEach(img=>{
    const src=photos[img.dataset.photo];
    if(src) img.src=src;
  });
})();
