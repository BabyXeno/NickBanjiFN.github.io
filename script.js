document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });

            // Update active state in nav (optional)
            document.querySelectorAll('.main-nav a').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // --- Intersection Observer for Scroll Reveal Effect ---
    const revealItems = document.querySelectorAll('.reveal-item');

    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the item must be visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    revealItems.forEach(item => {
        observer.observe(item);
    });

    // --- Countdown Timer for Next Stream (Community Section) ---
    const countdownElement = document.getElementById('nextStreamCountdown');
    // Set your next stream date/time here (Year, Month (0-11), Day, Hour, Minute, Second)
    const nextStreamDate = new Date('August 25, 2025 20:00:00 GMT-0500').getTime(); 

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = nextStreamDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) {
            countdownElement.textContent = "Stream is LIVE!"; // Or "Stream has ended!"
        } else {
            countdownElement.textContent = `Next Stream in: ${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    if (countdownElement) {
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    // --- NEW: Expand/Collapse Functionality for "Read More" buttons ---
    const readMoreToggles = document.querySelectorAll('.read-more-toggle');

    readMoreToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior (e.g., navigating to #)

            // Find the parent card (guide-card or blog-post-card)
            const parentCard = this.closest('.guide-card, .blog-post-card, .fan-feature-card');
            if (!parentCard) return; // Should not happen if HTML structure is correct

            // Find the expandable content and short description within this card
            const expandableContent = parentCard.querySelector('.expandable-content');
            const shortDescription = parentCard.querySelector('.short-description');
            
            if (!expandableContent) return; // Ensure expandable content exists

            // Toggle the 'is-expanded' class
            const isExpanded = expandableContent.classList.toggle('is-expanded');
            this.classList.toggle('is-expanded', isExpanded); // Also toggle on the button itself for icon rotation

            // Update button text and icon
            const icon = this.querySelector('i.fas'); // Assuming FontAwesome icon
            if (isExpanded) {
                this.childNodes[0].nodeValue = 'Show Less '; // Change text node directly
                if (icon) icon.className = 'fas fa-arrow-up'; // Change icon to arrow-up
                if (shortDescription) shortDescription.style.display = 'none'; // Hide short description
            } else {
                this.childNodes[0].nodeValue = 'Read More '; // Change text node directly
                if (icon) icon.className = 'fas fa-arrow-down'; // Change icon to arrow-down
                if (shortDescription) shortDescription.style.display = 'block'; // Show short description
            }

            // Scroll to the top of the expanded card to keep it in view,
            // especially if content pushes it off-screen
            // Using requestAnimationFrame to ensure scroll happens after expansion starts
            if (isExpanded) {
                requestAnimationFrame(() => {
                    parentCard.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest' // Scrolls so the element is as close to the top as possible
                    });
                });
            }
        });
    });

    // --- Previous functionality for `data-url` links (if still needed for other buttons) ---
    // If you have other .cyber-link elements (like the blog-archive-btn) that still use data-url
    // and should redirect, keep this part.
    // Otherwise, you can remove it if ALL cyber-links are now expand/collapse.
    const dataUrlLinks = document.querySelectorAll('.cyber-link[data-url]');
    dataUrlLinks.forEach(link => {
        // Ensure this doesn't conflict with the new expand/collapse
        // The read-more-toggle class will prevent this from being triggered on those elements
        if (!link.classList.contains('read-more-toggle')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetUrl = this.dataset.url;
                if (targetUrl) {
                    window.open(targetUrl, '_blank');
                } else {
                    console.warn('Link clicked but data-url is missing:', this);
                }
            });
        }
    });

});