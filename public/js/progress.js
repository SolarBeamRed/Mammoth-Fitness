// Progress Data Structure
let progressData = {
    weight: [],
    bodyFat: [],
    muscleMass: [],
    measurements: {
        chest: [],
        waist: [],
        arms: [],
        legs: []
    },
    strength: {
        benchPress: [],
        squat: [],
        deadlift: []
    },
    photos: []
};

// Chart Configuration
const chartConfig = {
    weight: {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    },
    miniChart: {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
            },
            elements: {
                point: {
                    radius: 0
                },
                line: {
                    borderWidth: 2
                }
            }
        }
    }
};

// Sample Data (Replace with actual data from backend)
const sampleData = {
    weight: [
        { date: '2025-05-01', value: 84.8 },
        { date: '2025-05-03', value: 84.2 },
        { date: '2025-05-05', value: 83.9 },
        { date: '2025-05-07', value: 83.5 },
        { date: '2025-05-09', value: 83.1 },
        { date: '2025-05-11', value: 82.8 },
        { date: '2025-05-13', value: 82.5 }
    ],
    bodyFat: [
        { date: '2025-05-01', value: 18 },
        { date: '2025-05-07', value: 18.2 },
        { date: '2025-05-13', value: 18.5 }
    ],
    muscleMass: [
        { date: '2025-05-01', value: 64.4 },
        { date: '2025-05-07', value: 64.8 },
        { date: '2025-05-13', value: 65.2 }
    ],
    strength: {
        benchPress: [
            { date: '2025-05-01', value: 85 },
            { date: '2025-05-07', value: 87.5 },
            { date: '2025-05-13', value: 90 }
        ],
        squat: [
            { date: '2025-05-01', value: 112.5 },
            { date: '2025-05-07', value: 117.5 },
            { date: '2025-05-13', value: 120 }
        ],
        deadlift: [
            { date: '2025-05-01', value: 130 },
            { date: '2025-05-07', value: 135 },
            { date: '2025-05-13', value: 140 }
        ]
    }
};

// Initialize Charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadProgressData();
    initializeCharts();
    setupEventListeners();
});

function loadProgressData() {
    const savedData = localStorage.getItem('progressData');
    if (savedData) {
        progressData = JSON.parse(savedData);
    } else {
        // Use sample data for demonstration
        progressData = sampleData;
    }
}

function initializeCharts() {
    // Weight Chart
    const weightCtx = document.getElementById('weightChart').getContext('2d');
    new Chart(weightCtx, {
        ...chartConfig.weight,
        data: {
            labels: progressData.weight.map(entry => new Date(entry.date).toLocaleDateString()),
            datasets: [{
                data: progressData.weight.map(entry => entry.value),
                borderColor: '#E63946',
                tension: 0.4
            }]
        }
    });

    // Body Fat Chart
    const bodyFatCtx = document.getElementById('bodyFatChart').getContext('2d');
    new Chart(bodyFatCtx, {
        ...chartConfig.miniChart,
        data: {
            labels: progressData.bodyFat.map(entry => new Date(entry.date).toLocaleDateString()),
            datasets: [{
                data: progressData.bodyFat.map(entry => entry.value),
                borderColor: '#457B9D',
                tension: 0.4
            }]
        }
    });

    // Muscle Mass Chart
    const muscleMassCtx = document.getElementById('muscleMassChart').getContext('2d');
    new Chart(muscleMassCtx, {
        ...chartConfig.miniChart,
        data: {
            labels: progressData.muscleMass.map(entry => new Date(entry.date).toLocaleDateString()),
            datasets: [{
                data: progressData.muscleMass.map(entry => entry.value),
                borderColor: '#4CAF50',
                tension: 0.4
            }]
        }
    });

    // Strength Charts
    initializeStrengthChart('benchPress');
    initializeStrengthChart('squat');
    initializeStrengthChart('deadlift');
}

function initializeStrengthChart(exercise) {
    const ctx = document.getElementById(`${exercise}Chart`).getContext('2d');
    new Chart(ctx, {
        ...chartConfig.miniChart,
        data: {
            labels: progressData.strength[exercise].map(entry => new Date(entry.date).toLocaleDateString()),
            datasets: [{
                data: progressData.strength[exercise].map(entry => entry.value),
                borderColor: '#E63946',
                tension: 0.4
            }]
        }
    });
}

function setupEventListeners() {
    // Timeframe Selector
    const timeframeButtons = document.querySelectorAll('.timeframe-selector button');
    timeframeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            timeframeButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            updateChartsTimeframe(e.target.textContent.toLowerCase());
        });
    });

    // Log Progress Button
    const logProgressBtn = document.querySelector('.log-progress-btn');
    logProgressBtn?.addEventListener('click', openProgressLogger);

    // Upload Photo Button
    const uploadPhotoBtn = document.querySelector('.upload-photo-btn');
    uploadPhotoBtn?.addEventListener('click', openPhotoUploader);
}

function updateChartsTimeframe(timeframe) {
    const now = new Date();
    let startDate;

    switch (timeframe) {
        case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case '3 months':
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
        case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
    }

    // Update all charts with filtered data
    // TODO: Implement chart data filtering based on timeframe
}

function openProgressLogger() {
    // TODO: Implement progress logging modal
    alert('Progress logging feature coming soon!');
}

function openPhotoUploader() {
    // TODO: Implement photo upload modal
    alert('Photo upload feature coming soon!');
}

function addProgress(type, value) {
    const entry = {
        date: new Date().toISOString(),
        value: value
    };

    if (type === 'weight') {
        progressData.weight.push(entry);
    } else if (type === 'bodyFat') {
        progressData.bodyFat.push(entry);
    } else if (type === 'muscleMass') {
        progressData.muscleMass.push(entry);
    } else if (type in progressData.measurements) {
        progressData.measurements[type].push(entry);
    } else if (type in progressData.strength) {
        progressData.strength[type].push(entry);
    }

    saveProgressData();
    updateCharts();
}

function saveProgressData() {
    localStorage.setItem('progressData', JSON.stringify(progressData));
}

function updateCharts() {
    // TODO: Implement chart updates
    initializeCharts();
}

// Export for use in other modules
export {
    progressData,
    addProgress
};
