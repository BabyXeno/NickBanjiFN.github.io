document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }

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
    // Example: October 26, 2025 8:00:00 PM EST (GMT-0500)
    const nextStreamDate = new Date('November 30, 2025 20:00:00 GMT-0500').getTime();

    function updateCountdown() {
        if (!countdownElement) return; // Exit if element doesn't exist

        const now = new Date().getTime();
        const distance = nextStreamDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) {
            countdownElement.textContent = "NickBanjiFN is LIVE! Tune in!"; // Or "Stream has ended!"
            // Optionally, add a class to style it differently when live
            countdownElement.classList.add('live-status');
        } else {
            countdownElement.textContent = `Next Stream in: ${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            countdownElement.classList.remove('live-status'); // Ensure class is removed if stream isn't live
        }
    }

    // Initialize and update countdown every second
    if (countdownElement) {
        setInterval(updateCountdown, 1000);
        updateCountdown(); // Call once immediately to avoid initial '--:--:--'
    }

    // --- Expand/Collapse Functionality for "Read More" buttons ---
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
                // nodeValue is used because the text is directly inside the <a> tag, not wrapped in another element
                // We preserve any leading/trailing spaces if present in the original HTML
                this.childNodes[0].nodeValue = 'Show Less ';
                if (icon) icon.className = 'fas fa-arrow-up'; // Change icon to arrow-up
                if (shortDescription) shortDescription.style.display = 'none'; // Hide short description
            } else {
                this.childNodes[0].nodeValue = 'Read More ';
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

    // --- Handle `data-url` links (if still needed for other buttons) ---
    // This targets buttons like "Take a Quiz" or "View All Posts"
    const dataUrlLinks = document.querySelectorAll(
        '.cyber-btn[data-url]:not(.read-more-toggle)' // Exclude read-more-toggle
    );
    dataUrlLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetUrl = this.dataset.url;
            if (targetUrl) {
                window.open(targetUrl, '_blank');
            } else {
                console.warn('Link clicked but data-url is missing:', this);
            }
        });
    });

    // --- NEW: Chatbot Functionality ---
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotToggleBtn = document.getElementById('chatbot-toggle');
    const chatbotHeader = document.querySelector('.chatbot-header');
    const chatbotBody = document.getElementById('chatbot-body');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSendBtn = document.getElementById('chatbot-send-btn');
    const openChatbotBtn = document.getElementById('open-chatbot-btn');

    let chatbotResponses = {}; // To store responses loaded from JSON

    // Function to load chatbot responses from JSON
    async function loadChatbotResponses() {
        try {
            const response = await fetch('chatbot_responses.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            chatbotResponses = await response.json();
            console.log('Chatbot responses loaded successfully:', chatbotResponses);
        } catch (error) {
            console.error('Failed to load chatbot responses:', error);
            // Fallback: display an error message in the chat
            appendMessage('bot', 'Error loading chatbot knowledge. Please try again later.');
        }
    }

    // Call to load responses when the DOM is ready
    loadChatbotResponses();

    // Function to append messages to the chatbot body
    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chatbot-message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

        // Allow for simple line breaks in bot messages if you use '\n' in JSON
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');

        chatbotBody.appendChild(messageDiv);
        chatbotBody.scrollTop = chatbotBody.scrollHeight; // Scroll to bottom
    }

    // Function to get bot response based on user input
    function getBotResponse(userInput) {
        const lowerCaseInput = userInput.toLowerCase();

        // Check for specific keywords
        for (const key in chatbotResponses.keywords) {
            if (chatbotResponses.keywords.hasOwnProperty(key)) {
                const keywordsArray = chatbotResponses.keywords[key].trigger_words;
                for (const word of keywordsArray) {
                    if (lowerCaseInput.includes(word)) {
                        // Randomly select a response from the matched keyword category
                        const responses = chatbotResponses.keywords[key].responses;
                        return responses[Math.floor(Math.random() * responses.length)];
                    }
                }
            }
        }

        // Check for greeting/farewell
        for (const greeting of chatbotResponses.greetings || []) { // Use || [] for safety
            if (lowerCaseInput.includes(greeting)) {
                return chatbotResponses.greeting_responses[Math.floor(Math.random() * chatbotResponses.greeting_responses.length)];
            }
        }

        for (const farewell of chatbotResponses.farewells || []) { // Use || [] for safety
            if (lowerCaseInput.includes(farewell)) {
                return chatbotResponses.farewell_responses[Math.floor(Math.random() * chatbotResponses.farewell_responses.length)];
            }
        }

        // Default fallback response
        // Ensure default_response array exists and is not empty
        if (chatbotResponses.default_response && chatbotResponses.default_response.length > 0) {
             return chatbotResponses.default_response[Math.floor(Math.random() * chatbotResponses.default_response.length)];
        }
        return "I'm not sure how to respond to that. Please try a different question."; // Ultimate fallback
    }

    // Send message function
    function sendMessage() {
        const userInput = chatbotInput.value.trim();
        if (userInput === '') return;

        appendMessage('user', userInput);
        chatbotInput.value = ''; // Clear input

        // Simulate bot typing/thinking delay
        setTimeout(() => {
            const botResponse = getBotResponse(userInput);
            appendMessage('bot', botResponse);
        }, 500); // 0.5 second delay
    }

    // Event listeners for chatbot
    if (chatbotSendBtn && chatbotInput) {
        chatbotSendBtn.addEventListener('click', sendMessage);
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }


    // Toggle chatbot visibility (minimize/maximize)
    function toggleChatbot() {
        if (!chatbotContainer || !chatbotToggleBtn || !openChatbotBtn) return;

        chatbotContainer.classList.toggle('minimized');
        const icon = chatbotToggleBtn.querySelector('i');
        if (chatbotContainer.classList.contains('minimized')) {
            icon.classList.remove('fa-minus');
            icon.classList.add('fa-comment-dots'); // Change to chat icon when minimized
            openChatbotBtn.style.display = 'flex'; // Show the open button
        } else {
            icon.classList.remove('fa-comment-dots');
            icon.classList.add('fa-minus');
            openChatbotBtn.style.display = 'none'; // Hide the open button
            chatbotInput.focus(); // Focus input when maximized
        }
    }

    if (chatbotToggleBtn) {
        chatbotToggleBtn.addEventListener('click', toggleChatbot);
    }
    if (chatbotHeader) {
        chatbotHeader.addEventListener('click', (e) => {
            // Only toggle if not clicking the button itself
            if (e.target !== chatbotToggleBtn && !chatbotToggleBtn.contains(e.target)) {
                toggleChatbot();
            }
        });
    }

    // Button to open minimized chatbot
    if (openChatbotBtn) {
        openChatbotBtn.addEventListener('click', () => {
            if (!chatbotContainer || !chatbotToggleBtn || !chatbotInput) return;

            chatbotContainer.classList.remove('minimized');
            chatbotToggleBtn.querySelector('i').classList.remove('fa-comment-dots');
            chatbotToggleBtn.querySelector('i').classList.add('fa-minus');
            openChatbotBtn.style.display = 'none';
            chatbotInput.focus();
        });
    }


    // Initially minimize the chatbot on page load
    // Check if chatbot elements exist before manipulating them
    if (chatbotContainer && chatbotToggleBtn && openChatbotBtn) {
        chatbotContainer.classList.add('minimized');
        chatbotToggleBtn.querySelector('i').classList.remove('fa-minus');
        chatbotToggleBtn.querySelector('i').classList.add('fa-comment-dots');
        openChatbotBtn.style.display = 'flex'; // Ensure it's visible on load
    }
});