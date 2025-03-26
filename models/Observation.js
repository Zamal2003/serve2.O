const mongoose = require("mongoose");

const observationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  date: { type: Date, default: Date.now },
  location: { type: String, required: true },
  responsiblePerson: { type: String, required: true },
  observation: { type: String, required: true },
  category: { type: String, enum: ["U.A", "U.C"], required: true },
  correctiveAction: { type: String, required: true },
});

const Observation = mongoose.model("Observation", observationSchema);

module.exports = Observation;
