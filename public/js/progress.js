// Progress tracking frontend implementation
document.addEventListener('DOMContentLoaded', async () => {
    // Cache DOM elements
    const timeframeButtons = document.querySelectorAll('.time-filter button');
    const weightChart = document.getElementById('weightChart');
    const bodyFatChart = document.getElementById('bodyFatChart');
    const measurementsGrid = document.querySelector('.measurements-grid');
    const exercisesGrid = document.querySelector('.exercises-grid');
    const addMeasurementBtn = document.getElementById('addMeasurementBtn');
    const addPhotoBtn = document.querySelector('.upload-photo-btn');

    // Utility function to fetch data
    const fetchJSON = async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    };

    // Format date for display
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Initialize charts with Chart.js
    const initializeCharts = () => {
        const chartConfig = {
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false
                    },
                    x: {
                        reverse: true
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: (items) => formatDate(items[0].raw.date)
                        }
                    }
                }
            }
        };

        // Weight progress chart
        new Chart(weightChart, {
            ...chartConfig,
            data: {
                datasets: [{
                    label: 'Weight (kg)',
                    borderColor: '#2ecc71',
                    tension: 0.1,
                    data: []
                }]
            }
        });

        // Body fat % chart
        new Chart(bodyFatChart, {
            ...chartConfig,
            data: {
                datasets: [{
                    label: 'Body Fat %',
                    borderColor: '#e74c3c',
                    tension: 0.1,
                    data: []
                }]
            }
        });

        // Initialize mini charts for measurements
        const miniChartElements = document.querySelectorAll('.mini-chart-container canvas');
        miniChartElements.forEach(canvas => {
            new Chart(canvas, {
                ...chartConfig,
                options: {
                    ...chartConfig.options,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            display: false
                        },
                        y: {
                            display: false
                        }
                    }
                }
            });
        });
    };

    // Load and display measurements
    const loadMeasurements = async () => {
        try {
            const measurements = await fetchJSON('/api/progress/measurements');
            if (measurements.length === 0) return;

            const latest = measurements[0];
            const previous = measurements[1] || latest;

            const measurementTypes = {
                weight: { unit: 'kg', target: 'weightChart' },
                body_fat: { unit: '%', target: 'bodyFatChart' },
                chest: { unit: 'cm', target: 'chestChart' },
                waist: { unit: 'cm', target: 'waistChart' },
                biceps: { unit: 'cm', target: 'bicepsChart' },
                thighs: { unit: 'cm', target: 'thighsChart' }
            };

            // Update measurement cards and charts
            for (const [key, { unit, target }] of Object.entries(measurementTypes)) {
                const currentValue = latest[key];
                const previousValue = previous[key];
                const change = currentValue - previousValue;

                // Update measurement card if it exists
                const card = document.querySelector(`[data-measurement="${key}"]`);
                if (card) {
                    card.querySelector('.current').textContent = `${currentValue} ${unit}`;
                    const changeElement = card.querySelector('.change');
                    changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)} ${unit}`;
                    changeElement.className = `change ${change > 0 ? 'positive' : 'negative'}`;
                }

                // Update chart if it exists
                const chart = Chart.getChart(target);
                if (chart) {
                    chart.data.datasets[0].data = measurements.map(m => ({
                        x: m.recorded_at,
                        y: m[key],
                        date: m.recorded_at
                    }));
                    chart.update();
                }
            }
        } catch (error) {
            console.error('Error loading measurements:', error);
        }
    };

    // Load and display exercise progress
    const loadExerciseProgress = async () => {
        try {
            const exercises = await fetchJSON('/api/progress/exercises');
            
            exercises.forEach(exercise => {
                const { exercise_name, max_weight, progress } = exercise;
                const card = document.querySelector(`[data-exercise="${exercise_name}"]`);
                if (!card) return;

                // Update max weight and progress indicators
                card.querySelector('.max-weight').textContent = `${max_weight} kg`;
                
                // Update exercise chart
                const chart = card.querySelector('canvas');
                if (chart) {
                    const chartInstance = Chart.getChart(chart);
                    chartInstance.data.datasets[0].data = progress.map(p => ({
                        x: p.occurred_on,
                        y: p.weight,
                        date: p.occurred_on
                    }));
                    chartInstance.update();
                }
            });
        } catch (error) {
            console.error('Error loading exercise progress:', error);
        }
    };

    // Handle measurement form submission
    const handleMeasurementSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/progress/measurements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save measurements');

            // Reload measurements and close modal
            await loadMeasurements();
            e.target.closest('.modal').classList.remove('active');
        } catch (error) {
            console.error('Error saving measurements:', error);
            alert('Failed to save measurements. Please try again.');
        }
    };

    // Handle photo upload
    const handlePhotoUpload = async (files) => {
        const formData = new FormData();
        [...files].forEach(file => {
            formData.append('photos', file);
        });

        try {
            const response = await fetch('/api/progress/photos', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload photos');
            
            // Reload photos section
            const photos = await fetchJSON('/api/progress/photos');
            updatePhotosGrid(photos);
        } catch (error) {
            console.error('Error uploading photos:', error);
            alert('Failed to upload photos. Please try again.');
        }
    };

    // Update photos grid
    const updatePhotosGrid = (photos) => {
        const photosGrid = document.querySelector('.photos-grid');
        if (!photosGrid || !photos.length) return;

        const photoGroups = groupPhotosByDate(photos);
        photosGrid.innerHTML = photoGroups.map(group => `
            <div class="photo-card">
                <div class="photo-header">${formatDate(group.date)}</div>
                <div class="photo-grid">
                    ${group.photos.map(photo => `
                        <img src="${photo.photo_url}" alt="${photo.category} view" 
                             class="progress-photo ${photo.category}-view">
                    `).join('')}
                </div>
            </div>
        `).join('');
    };

    // Group photos by date
    const groupPhotosByDate = (photos) => {
        const groups = {};
        photos.forEach(photo => {
            const date = photo.taken_at.split('T')[0];
            if (!groups[date]) groups[date] = [];
            groups[date].push(photo);
        });

        return Object.entries(groups).map(([date, photos]) => ({
            date,
            photos
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    // Initialize the page
    const initialize = async () => {
        try {
            // Auth check
            const userResponse = await fetch('/api/user');
            if (!userResponse.ok) {
                window.location.href = '/login.html';
                return;
            }
            const user = await userResponse.json();
            document.querySelector('.username').textContent = user.username;

            // Initialize UI
            initializeCharts();
            await Promise.all([
                loadMeasurements(),
                loadExerciseProgress()
            ]);

            // Add event listeners
            timeframeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    timeframeButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    // Update charts based on timeframe
                    const timeframe = button.textContent;
                    loadMeasurements(timeframe);
                    loadExerciseProgress(timeframe);
                });
            });

            // Measurement form
            const measurementForm = document.getElementById('measurementForm');
            if (measurementForm) {
                measurementForm.addEventListener('submit', handleMeasurementSubmit);
            }

            // Photo upload
            if (addPhotoBtn) {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.multiple = true;
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);

                fileInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        handlePhotoUpload(e.target.files);
                    }
                });

                addPhotoBtn.addEventListener('click', () => fileInput.click());
            }

        } catch (error) {
            console.error('Error initializing progress page:', error);
        }
    };

    // Start the application
    initialize().catch(console.error);
});