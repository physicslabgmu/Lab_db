// Main JavaScript functionality for the Physics Lab Setup website

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar functionality
    initializeSidebar();
    
    // Card hover effects
    initializeCards();
    
    // Initialize tooltips
    initializeTooltips();
});

function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const closeSidebar = document.getElementById('closeSidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('active');
            content.classList.toggle('active');
        });
    }

    if (closeSidebar) {
        closeSidebar.addEventListener('click', function() {
            sidebar.classList.remove('active');
            content.classList.remove('active');
        });
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (sidebar && sidebarToggle) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickInsideToggle = sidebarToggle.contains(event.target);
            
            if (!isClickInsideSidebar && !isClickInsideToggle && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                content.classList.remove('active');
            }
        }
    });
}

function initializeCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Form validation for equipment requests
function validateEquipmentRequest(form) {
    const requiredFields = ['equipment_name', 'quantity', 'date_needed'];
    let isValid = true;

    requiredFields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Dynamic loading for lab resources
function loadLabResource(resourceId) {
    const contentArea = document.getElementById('resource-content');
    if (!contentArea) return;

    // Show loading spinner
    contentArea.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

    // Simulate loading content (replace with actual API call)
    setTimeout(() => {
        fetch(`/api/resources/${resourceId}`)
            .then(response => response.json())
            .then(data => {
                contentArea.innerHTML = data.content;
            })
            .catch(error => {
                contentArea.innerHTML = '<div class="alert alert-danger">Error loading resource. Please try again later.</div>';
                console.error('Error:', error);
            });
    }, 500);
}

// Equipment search functionality
function searchEquipment(query) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }

    // Show loading state
    searchResults.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Searching...</span></div></div>';

    // Simulate search (replace with actual API call)
    setTimeout(() => {
        fetch(`/api/equipment/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    searchResults.innerHTML = '<div class="alert alert-info">No equipment found matching your search.</div>';
                    return;
                }

                const resultsHtml = data.map(item => `
                    <div class="card mb-2">
                        <div class="card-body">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="card-text">Location: ${item.location}</p>
                            <p class="card-text">Status: ${item.status}</p>
                        </div>
                    </div>
                `).join('');

                searchResults.innerHTML = resultsHtml;
            })
            .catch(error => {
                searchResults.innerHTML = '<div class="alert alert-danger">Error performing search. Please try again later.</div>';
                console.error('Error:', error);
            });
    }, 300);
}

// Export functions for use in other modules
export {
    initializeSidebar,
    initializeCards,
    initializeTooltips,
    validateEquipmentRequest,
    loadLabResource,
    searchEquipment
};
