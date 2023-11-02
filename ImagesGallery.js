export class ImagesGallery {
    #imagesContainer;
    #imagesLimitForOneFetch;
    #images;
    #currentPage;

    constructor(imagesContainer) {
        this.#imagesContainer = imagesContainer instanceof Element
            ? imagesContainer
            : (function () {
                throw new Error('Images container is not type of DOM Element.')
            }());
        this.#imagesLimitForOneFetch = 9;
        this.#images = [];
        this.#currentPage = 1;
        this.isFetching = false;
    }

    #renderImageCard = (image) => {
        const {author, download_url, id} = image;

        return `<figure class="image-card" id=${id}>
                  <img  class="image-card__image" src=${download_url} loading="lazy" alt="foto by ${author}">
                  <figcaption  class="image-card__caption">Author: ${author}</figcaption>
                </figure>`;
    };

    #renderImageCardWithInfo = (info) => {
        const {author, download_url, height, id, url, width} = info;
        const imageWithInfoContainer = document.createElement('div');
        imageWithInfoContainer.classList.add('image-with-info-container');
        imageWithInfoContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('image-card__image')) {
                await this.fetchImages();
            }
        });
        imageWithInfoContainer.innerHTML = `<figure class="image-card" id=${id}>
          <img  class="image-card__image" src=${download_url} loading="lazy" alt="foto by ${author}">
        </figure>
        <ul class="image-info-container">
            <li class="image-info-item"><span class="image-info-item-heading">Author</span><span class="image-info-item-data">${author}</span></li>
            <li class="image-info-item"><span class="image-info-item-heading">Download URL</span><span class="image-info-item-data">${download_url}</span></li>
            <li class="image-info-item"><span class="image-info-item-heading">Height</span><span class="image-info-item-data">${height}px</span></li>
            <li class="image-info-item"><span class="image-info-item-heading">Width</span><span class="image-info-item-data">${width}px</span></li>
            <li class="image-info-item"><span class="image-info-item-heading">URL</span><span class="image-info-item-data">${url}</span></li>
            <li class="image-info-item"><span class="image-info-item-heading">ID</span><span class="image-info-item-data">${id}</span></li>
        </ul>`;

        return imageWithInfoContainer;
    }

    #fetchImageInfo = async (event, id, imageWrapper) => {
        this.isFetching = true;
        try {
            const response = await fetch(`https://picsum.photos/id/${id}/info`);
            const imageInfo = await response.json();
            const imageWithInfoCard = this.#renderImageCardWithInfo(imageInfo);

            if (!document.startViewTransition) {
                this.#imagesContainer.innerHTML = '';
                this.#imagesContainer.appendChild(imageWithInfoCard);
            }
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    imageWrapper.style.viewTransitionName = '';
                    this.#imagesContainer.innerHTML = '';
                    this.#imagesContainer.appendChild(imageWithInfoCard);
                });
            }
        } catch (error) {
            throw new Error(error);
        } finally {
            this.isFetching = false;
        }
    }

    #updateDOM = (images) => {
        this.#imagesContainer.innerHTML = '';
        const imagesGallery = document.createElement('div');
        imagesGallery.classList.add('images-gallery');

        images.forEach((image) => {
            const imageWrapper = document.createElement('div');
            imageWrapper.classList.add('image-wrapper');
            imageWrapper.dataset.imageKey = image.id;
            imageWrapper.addEventListener('click', async (event) => {
                imageWrapper.style.viewTransitionName = 'full-embed';
                await this.#fetchImageInfo(event, image.id, imageWrapper);
            })
            imageWrapper.innerHTML = this.#renderImageCard(image);
            imagesGallery.appendChild(imageWrapper);
        });
        this.#imagesContainer.appendChild(imagesGallery);

        this.#renderPagination();
    };

    fetchImages = async () => {
        const API_URL = `https://picsum.photos/v2/list?page=${this.#currentPage}&limit=${this.#imagesLimitForOneFetch}`;
        this.isFetching = true;

        try {
            const response = await fetch(API_URL);
            this.images = await response.json();

            if (!document.startViewTransition) {
                this.#updateDOM(this.images);
            }
            if (document.startViewTransition) {
                const transition = document.startViewTransition(() => {
                    this.#updateDOM(this.images);
                });
                transition.ready.then(() => {
                    document.documentElement.animate(
                        [
                            {transform: 'scale(0.9)'},
                            {transform: 'scale(1)'},
                        ],
                        {
                            duration: 1000,
                            direction: 'alternate',
                            easing: 'ease-in-out',
                            pseudoElement: '::view-transition-new(root)'
                        }
                    );
                });
            }
        } catch (error) {
            throw new Error(error);
        } finally {
            this.isFetching = false;
        }
    };

    #renderPagination = () => {
        const pagination = document.createElement('nav');
        pagination.classList.add('pagination');

        const paginationBackLink = document.createElement('a');
        paginationBackLink.classList.add('page-back', 'pagination-button');
        paginationBackLink.innerText = 'Back';
        paginationBackLink.addEventListener('click', async () => {
            this.#currentPage--;
            await this.fetchImages();
        });

        const pageNumber = document.createElement('span');
        pageNumber.classList.add('pagination-page-number');
        pageNumber.innerText = this.#currentPage;

        const paginationForwardLink = document.createElement('a');
        paginationForwardLink.classList.add('page-forward', 'pagination-button');
        paginationForwardLink.innerText = 'Forward';
        paginationForwardLink.addEventListener('click', async () => {
            this.#currentPage++;
            await this.fetchImages();
        });

        pagination.appendChild(paginationBackLink);
        pagination.appendChild(pageNumber);
        pagination.appendChild(paginationForwardLink);

        this.#imagesContainer.appendChild(pagination);
    }
}
