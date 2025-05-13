// Workout Templates Data
const workoutTemplates = [
    {
        id: 1,
        name: 'Full Body Strength',
        duration: 60,
        difficulty: 'Intermediate',
        equipment: 'Gym Required',
        description: 'Complete full body workout targeting all major muscle groups.',
        exercises: [
            { name: 'Barbell Squats', sets: 4, reps: 10 },
            { name: 'Bench Press', sets: 4, reps: 10 },
            { name: 'Deadlifts', sets: 4, reps: 10 },
            { name: 'Pull-ups', sets: 3, reps: 8 },
            { name: 'Overhead Press', sets: 3, reps: 10 },
            { name: 'Dumbbell Rows', sets: 3, reps: 12 }
        ]
    },
    {
        id: 2,
        name: 'HIIT Cardio Blast',
        duration: 30,
        difficulty: 'Advanced',
        equipment: 'Minimal Equipment',
        description: 'High-intensity interval training to maximize calorie burn.',
        exercises: [
            { name: 'Burpees', time: 45, rest: 15 },
            { name: 'Mountain Climbers', time: 45, rest: 15 },
            { name: 'Jump Squats', time: 45, rest: 15 },
            { name: 'Push-ups', time: 45, rest: 15 },
            { name: 'High Knees', time: 45, rest: 15 }
        ]
    }
];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Create New Workout Button
    const createWorkoutBtn = document.querySelector('.create-workout-btn');
    createWorkoutBtn?.addEventListener('click', openWorkoutCreator);

    // Start Workout Buttons
    const startWorkoutBtns = document.querySelectorAll('.start-workout-btn');
    startWorkoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const workoutCard = e.target.closest('.workout-card');
            const workoutName = workoutCard.querySelector('h3').textContent;
            startWorkout(workoutName);
        });
    });

    // View Details Buttons
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const workoutCard = e.target.closest('.workout-history-card');
            const workoutName = workoutCard.querySelector('h4').textContent;
            viewWorkoutDetails(workoutName);
        });
    });
});

// Workout Functions
function openWorkoutCreator() {
    // TODO: Implement workout creator modal
    alert('Create New Workout feature coming soon!');
}

function startWorkout(workoutName) {
    const template = workoutTemplates.find(t => t.name === workoutName);
    if (!template) {
        alert('Workout template not found!');
        return;
    }

    // Save current workout to localStorage
    localStorage.setItem('currentWorkout', JSON.stringify({
        ...template,
        startTime: new Date().toISOString(),
        completed: false
    }));

    // TODO: Implement workout interface
    alert(`Starting ${workoutName} workout! This feature is coming soon.`);
}

function viewWorkoutDetails(workoutName) {
    // TODO: Implement workout details modal
    alert(`Viewing details for ${workoutName}. This feature is coming soon!`);
}

// Utility Functions
function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
}

function calculateCalories(workout) {
    // TODO: Implement proper calorie calculation based on exercise intensity and duration
    return Math.round(workout.duration * 7.5);
}

// Export for use in other modules
export {
    workoutTemplates,
    startWorkout,
    viewWorkoutDetails,
    calculateCalories
};
