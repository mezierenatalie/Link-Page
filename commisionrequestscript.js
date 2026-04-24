// finds the carousel, bubble container, type label and badge elements in the HTML
const carousel = document.getElementById('portfolio-carousel');
const bubblesContainer = document.getElementById('carousel-bubbles');
const typeLabel = document.querySelector('.carousel-type-label');
const badge = document.querySelector('.commission-badge');

// finds all carousel images and stores them in an array
const images = document.querySelectorAll('.carousel-img');

// tracks whether a click scroll is in progress to prevent observer interference
let isClickScrolling = false;

// builds one bubble per image and adds them to the bubble container
images.forEach((img, index) => {
    const bubble = document.createElement('button');
    bubble.classList.add('carousel-bubble');
    if (index === 0) bubble.classList.add('active');

    // checks if this image starts a new category by comparing its type to the previous image
    const prevImg = images[index - 1];
    if (!prevImg || img.dataset.type !== prevImg.dataset.type) {
        bubble.classList.add('category-start');
    }

    // scrolls to the clicked image and temporarily pauses the observer
    bubble.addEventListener('click', () => {
        isClickScrolling = true;

        // immediately updates the bubble and label to match what was clicked
        bubbles.forEach(b => b.classList.remove('active'));
        bubble.classList.add('active');
        typeLabel.textContent = img.dataset.type;
        badge.textContent = img.dataset.badge;

        img.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });

        // re-enables the observer after the scroll animation finishes
        setTimeout(() => { isClickScrolling = false; }, 800);
    });

    bubblesContainer.appendChild(bubble);
});

// stores all bubbles after they are created
const bubbles = document.querySelectorAll('.carousel-bubble');

// updates the active bubble based on which image is most visible, skips if a click scroll is in progress
const observer = new IntersectionObserver((entries) => {
    if (isClickScrolling) return;
    let mostVisible = null;
    let highestRatio = 0;
    entries.forEach(entry => {
        if (entry.intersectionRatio > highestRatio) {
            highestRatio = entry.intersectionRatio;
            mostVisible = entry.target;
        }
    });
    if (mostVisible) {
        const index = Array.from(images).indexOf(mostVisible);
        bubbles.forEach(b => b.classList.remove('active'));
        bubbles[index].classList.add('active');
        typeLabel.textContent = mostVisible.dataset.type;
        badge.textContent = mostVisible.dataset.badge;
    }
}, { root: carousel, threshold: [0, 0.25, 0.5, 0.75, 1] });

// tells the observer to watch every image
images.forEach(img => observer.observe(img));