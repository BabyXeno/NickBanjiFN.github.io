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
    // Example: August 25, 2025, 8:00 PM EST (UTC-5)
    // You'd need a more robust solution for different timezones in a real app.
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

    // --- Functionality for "Read More" and similar buttons ---
    // Select all links that have the 'read-more-btn' class
    const readMoreButtons = document.querySelectorAll('.read-more-btn');

    readMoreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent the default link behavior (navigating to #)

            const targetUrl = this.dataset.url; // Get the URL from the data-url attribute

            if (targetUrl) {
                // Open the URL in a new tab
                window.open(targetUrl, '_blank');
            } else {
                // Fallback or placeholder for a modal/popup
                alert('Content not available yet, or link is missing! (Placeholder functionality)');
                // If you want a modal:
                // openModalWithContent(this.parentElement.querySelector('h3').textContent, 'Detailed content goes here...');
            }
        });
    });

    // Optional: Placeholder for modal/popup function (if you decide to use one)
    /*
    function openModalWithContent(title, content) {
        // Implement your modal creation and display logic here
        // E.g., create a div, append to body, populate title/content, show it.
        console.log(`Opening modal for: ${title} with content: ${content}`);
        alert(`Modal Content for "${title}":\n\n${content}\n\n(This is a simulated modal)`);
    }
    */
});