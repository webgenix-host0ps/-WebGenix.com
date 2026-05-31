// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // 2. Update Footer Year
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // 3. Navbar Scroll Effect
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // 4. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    const toggleMenu = () => {
        const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true' || false;
        mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        mobileMenuBtn.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    };

    mobileMenuBtn.addEventListener('click', toggleMenu);

    // Close mobile menu when a link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // 5. Theme Toggle (Light/Dark Mode)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check local storage for saved theme, default is dark
    const savedTheme = localStorage.getItem('theme');
    let isLight = false;

    if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
        isLight = true;
    }

    const updateThemeIcon = () => {
        if (typeof feather !== 'undefined') {
            themeIcon.setAttribute('data-feather', isLight ? 'moon' : 'sun');
            feather.replace();
        }
    };

    // Initial icon setup
    updateThemeIcon();

    themeToggleBtn.addEventListener('click', () => {
        isLight = !isLight;
        if (isLight) {
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        }
        updateThemeIcon();
    });

    // 6. Services Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const tabDescription = document.getElementById('tab-description');

    const tabDescriptionsText = {
        'solutions': 'All-in-one packages designed for real business outcomes',
        'infrastructure': 'Powerful, scalable building blocks for your projects',
        'addons': 'Essential services to complete your online presence'
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(p => {
                p.classList.add('hidden');
                p.classList.remove('active');
            });

            // Add active class to clicked button
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            // Show corresponding panel
            const targetId = btn.getAttribute('aria-controls');
            const targetPanel = document.getElementById(targetId);
            
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
                // Small timeout to allow display:block to apply before adding active class for opacity transition
                setTimeout(() => {
                    targetPanel.classList.add('active');
                }, 10);
            }

            // Update description
            const tabKey = targetId.replace('tabpanel-', '');
            if (tabDescription && tabDescriptionsText[tabKey]) {
                tabDescription.textContent = tabDescriptionsText[tabKey];
            }
        });
    });

    // 7. Scroll Animations using IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-scroll');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});
