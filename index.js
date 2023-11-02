import {ImagesGallery} from './ImagesGallery.js';

(async () => {
    const imagesGalleryContainer = document.querySelector('.images-gallery-container');
    const imagesGallery = new ImagesGallery(imagesGalleryContainer);
    const readyState = document.readyState;

    if (readyState === 'interactive' || readyState === "complete") {
        await imagesGallery.fetchImages();
    } else {
        window.addEventListener('load', async () => {
            await imagesGallery.fetchImages();
        });
    }
})();
