//user challenge state: represents a users participation and progress in a specific challenge
const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  //users progress for each activity in the challenge
  //example: [{ activityId: 'run', progress: 5000 }, { activityId: 'push-ups', progress: 25 }]
  activitiesProgress: [{
    activityId: {
      type: String,
      required: true
      //references the activity name from the challenge
    },
    progress: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  //overall status of the user in this challenge
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  //when the user joined this challenge
  joinedAt: {
    type: Date,
    default: Date.now
  },
  //when the user completed or abandoned the challenge
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

//ensure one user can only have one record per challenge
userChallengeSchema.index({ user: 1, challenge: 1 }, { unique: true });

//populate challenge and user data when querying
userChallengeSchema.pre('find', function() {
  this.populate('challenge', 'title description activities startDate endDate creator')
       .populate('user', 'name email');
});

userChallengeSchema.pre('findOne', function() {
  this.populate('challenge', 'title description activities startDate endDate creator')
       .populate('user', 'name email');
});

module.exports = mongoose.model('UserChallenge', userChallengeSchema);
