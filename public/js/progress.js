// Progress tracking frontend implementation
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const timeframeButtons = document.querySelectorAll('.time-filter button');
    const weightCard = document.getElementById('weightCard');
    const bodyFatCard = document.getElementById('bodyFatCard');
    const addMeasurementBtn = document.getElementById('addMeasurementBtn');
    const measurementModal = document.getElementById('measurementModal');

    let weightChart = null;
    let bodyFatChart = null;

    // Toast notification function
    function showToast(message, isError = false) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: isError ? "#e74c3c" : "#2ecc71",
                borderRadius: "8px",
                fontFamily: "'Poppins', sans-serif",
            }
        }).showToast();
    }

    // Initialize charts
    function initializeCharts() {
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    }
                },
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM d'
                        }
                    },
                    reverse: true
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(1);
                            }
                            return label;
                        }
                    }
                }
            }
        };

        // Weight Chart
        weightChart = new Chart(document.getElementById('weightChart'), {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Weight (kg)',
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.1,
                    fill: true,
                    data: []
                }]
            },
            options: chartOptions
        });

        // Body Fat Chart
        bodyFatChart = new Chart(document.getElementById('bodyFatChart'), {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Body Fat %',
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.1,
                    fill: true,
                    data: []
                }]
            },
            options: chartOptions
        });
    }

    // Fetch measurements data
    async function fetchMeasurements(timeframe = '1M') {
        try {
            const response = await fetch('/api/progress/measurements?' + new URLSearchParams({ timeframe }));
            if (!response.ok) throw new Error('Failed to fetch measurements');
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }

            // Update charts
            updateCharts(data);
            
            // Update latest measurements display
            if (data.length > 0) {
                const latest = data[0];
                updateLatestMeasurements(latest);
            }
        } catch (error) {
            console.error('Error fetching measurements:', error);
            showToast('Failed to load progress data', true);
        }
    }

    function updateCharts(data) {
        if (!weightChart || !bodyFatChart || !Array.isArray(data)) return;

        // Prepare data for charts
        const weightData = data
            .filter(m => m.weight != null)
            .map(m => ({
                x: new Date(m.recorded_at),
                y: parseFloat(m.weight)
            }));

        const bodyFatData = data
            .filter(m => m.body_fat != null)
            .map(m => ({
                x: new Date(m.recorded_at),
                y: parseFloat(m.body_fat)
            }));

        // Update charts
        weightChart.data.datasets[0].data = weightData;
        bodyFatChart.data.datasets[0].data = bodyFatData;
        
        weightChart.update();
        bodyFatChart.update();
    }

    function updateLatestMeasurements(latest) {
        if (!latest) return;
        
        const weightElement = document.getElementById('currentWeight');
        const bodyFatElement = document.getElementById('currentBodyFat');
        
        if (weightElement) {
            weightElement.textContent = latest.weight ? `${parseFloat(latest.weight).toFixed(1)} kg` : 'No data';
        }
        if (bodyFatElement) {
            bodyFatElement.textContent = latest.body_fat ? `${parseFloat(latest.body_fat).toFixed(1)}%` : 'No data';
        }
    }

    // Handle measurement submission
    async function submitMeasurement(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            weight: parseFloat(formData.get('weight')),
            body_fat: parseFloat(formData.get('bodyFat'))
        };

        try {
            const response = await fetch('/api/progress/measurements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save measurements');
            }
            
            // Close modal and refresh data
            closeModal();
            fetchMeasurements();
            
            // Show success message
            showToast('Measurements saved successfully!');
        } catch (error) {
            console.error('Error saving measurements:', error);
            showToast(error.message || 'Failed to save measurements', true);
        }
    }

    // Modal handling
    function openModal() {
        measurementModal.classList.remove('hidden');
    }

    function closeModal() {
        measurementModal.classList.add('hidden');
        document.getElementById('measurementForm').reset();
    }

    // Event listeners
    timeframeButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeframeButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            fetchMeasurements(button.textContent);
        });
    });

    addMeasurementBtn?.addEventListener('click', openModal);
    document.querySelector('.modal-close')?.addEventListener('click', closeModal);
    document.getElementById('measurementForm')?.addEventListener('submit', submitMeasurement);

    // Initialize page
    initializeCharts();
    fetchMeasurements();
});