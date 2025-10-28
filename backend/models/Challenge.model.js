//challenge schema with activities and participant
const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  //array of activities that make up the challenge
  //example: [{ name: 'run', target: 10000, unit: 'meters' }, { name: 'push-ups', target: 50, unit: 'times' }]
  activities: [{
    name: {
      type: String,
      required: true,
      //other may not use, personalized types not supported for the momment   
      enum: ['run', 'bike', 'walk', 'push-ups', 'sit-ups', 'squats', 'plank', 'other']
    },
    target: {
      type: Number,
      required: true
      //always in base units: integers for everything
    },
    unit: {
      type: String,
      required: true,
      enum: ['meters', 'times', 'minutes', 'hours']
      //meters for distances, times for repetitions, minutes/hours for time
    }
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Challenge', challengeSchema);
