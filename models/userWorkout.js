const mongoose = require('mongoose');

const userWorkoutSchema = mongoose.Schema ({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    name: String,
    exercices: [{
        exercice: { type: mongoose.Schema.Types.ObjectId, ref: 'exercices' },
        rest: Number,
        sets: [{
            weight: Number,
            rep: Number
        }]
    }]
})

const UserWorkout = mongoose.model('userworkouts', userWorkoutSchema);
module.exports = UserWorkout;