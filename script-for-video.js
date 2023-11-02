/*При переході ViewTransition створє псевдо елементи
які ми можемо стилізувати існуючими СSS властивостями
*/
/*::view-transition-old(root),*/
/*::view-transition-new(root) {*/
/*    animation-duration: 5s;*/
/*}*/

const pagination = {
    /*------------------- explainer code start ----------------------*/
    'view-transition-name': pagination;
    /*------------------- explainer code end ----------------------*/
}

const header = {
    /*щоб уникнути цього ми можемо прибрати хедер з сторінки, щоб за потреби анімувати його окремо,
    це робиться додаванням властивості view-transition-name до елемента. значення view-transition-name
    може бути яке завгодно, крім none, воно використовується як унікальний ідентефікатор елементи при
    транзішені*/
    /*------------------- explainer code start ----------------------*/
    'view-transition-name': header;
    /*------------------- explainer code end ----------------------*/
}

const imageWithInfoContainer = {
    /*------------------- explainer code start ----------------------*/
    /*Також ми можемо анімувати переходи між різними елементами, дамо нашому елементу view-transition-name
    image-with-info-container*/
    'view-transition-name': 'image-with-info-container';
    /*------------------- explainer code end ----------------------*/
}

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

    #fetchImageInfo = async (event, id, imageWrapper) => {
        this.isFetching = true;
        try {
            const response = await fetch(`https://picsum.photos/id/${id}/info`);
            const imageInfo = await response.json();
            const imageWithInfoCard = this.#renderImageCardWithInfo(imageInfo);
            /*------------------- explainer code start ----------------------*/
            if (!document.startViewTransition) {
                this.#imagesContainer.innerHTML = '';
                this.#imagesContainer.appendChild(imageWithInfoCard);
            }
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    imageWrapper.style.viewTransitionName = '';
                    this.#imagesContainer.innerHTML = '';
                    this.#imagesContainer.appendChild(imageWithInfoCard);
                })
            }
            /*------------------- explainer code end ----------------------*/
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
                /*------------------- explainer code start ----------------------*/
                // потім додамо нашому елементу з картинкою такий же viewTransitionName, який приберемо при переході
                imageWrapper.style.viewTransitionName = 'image-with-info-container';
                /*------------------- explainer code end ----------------------*/
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

            // По замовчуванню перехід в ViewTransition анімується як крос фейд, тож почнемо
            // з нього. В updateDOM ви можете додавати/видаляти ДОМ елементи,
            // міняти класи, стилі що завгодно.
            /*------------------- explainer code start ----------------------*/
            if (!document.startViewTransition) {
                this.#updateDOM(this.images);
            }
            if (document.startViewTransition) {
                const transition = document.startViewTransition(() => {
                    this.#updateDOM(this.images);
                })
                // Крос фейд це не так вражаюче, тож давайте використаємо тут Web Animation API,
                //
                transition.ready.then(() => {
                    document.documentElement.animate(
                        [
                            {transform: 'scale(0.9)'},
                            {transform: 'scale(1)'}
                        ],
                        {
                            duration: 1000,
                            direction: 'alternate',
                            easing: 'ease-in-out',
                            pseudoElement: '::view-transition-new(root)'
                        }
                    )
                })
            }
            /*------------------- explainer code end ----------------------*/
        } catch (error) {
            throw new Error(error);
        } finally {
            this.isFetching = false;
        }
    };
}
