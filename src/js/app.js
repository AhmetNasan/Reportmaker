document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    // Function to load page content
    const loadPage = async (page) => {
        try {
            const response = await fetch(`src/views/${page}.html`);
            if (!response.ok) {
                throw new Error('Page not found');
            }
            const content = await response.text();
            app.innerHTML = content;

            // Initialize any page-specific JavaScript
            if (page === 'estimation') {
                initializeEstimation();
            }
        } catch (error) {
            app.innerHTML = `<div class="card"><p>Error loading page: ${error.message}</p></div>`;
        }
    };

    // Initial page load
    loadPage('main');

    // Handle navigation clicks
    document.addEventListener('click', (e) => {
        if (e.target.matches('.nav-item')) {
            const page = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
            loadPage(page);
        }
    });
});

function initializeEstimation() {
    // All the functions from estimation.js will be called from here
    // For now, it's empty, but it will be populated with the necessary functions
}
