const {Schema, model} = require('mongoose');

const courseSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  img: String,
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

courseSchema.methods.toClient = function() {
  const course = this.toObject();

  course.id = course._id;
  delete course._id;

  return course
}

module.exports = model('Course', courseSchema);