const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, lowercase: true, trim: true },
    lastName: { type: String, required: true, lowercase: true, trim: true },
    screenName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    yearOfBirth: { type: Number, required: true, min: 1900, max: 2022 },
    textBio: { type: String, required: true },
    timeseries: {
      bgl: { type: Boolean, required: true },
      weight: { type: Boolean, required: true },
      doit: { type: Boolean, required: true },
      exercise: { type: Boolean, required: true },
    },
    threasholds: {
      bglmin: { type: Number, default: 0 },
      bglmax: { type: Number, default: 0 },
      weightmin: { type: Number, default: 0 },
      weightmax: { type: Number, default: 0 },
      doitmin: { type: Number, default: 0 },
      doitmax: { type: Number, default: 0 },
      exercisemin: { type: Number, default: 0 },
      exercisemax: { type: Number, default: 0 },
    },
    records: [
      {
        record: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Record",
          required: true,
        },
      },
    ],
    clinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinician",
      required: true,
    },
    eRate: { type: Number, min: 0, max: 2 },
    supportMessage: { type: String },
    role: { type: String, default: "patient" },
  },
  {
    timestamps: { createdAt: "createTime", updatedAt: "updateTime" },
  }
);

// create collection patients in mongodb
const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
