const mongoose = require("mongoose");

const clinicianSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, lowercase: true, trim: true },
    lastName: { type: String, required: true, lowercase: true, trim: true },
    screenName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    patients: [
      {
        patient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Patient",
          required: true,
        },
      },
    ],
    role: { type: String, default: "clinician" },
  },
  {
    timestamps: { createdAt: "createTime", updatedAt: "updateTime" },
  }
);

// create collection clinicians in mongodb
const Clinician = mongoose.model("Clinician", clinicianSchema);
module.exports = Clinician;
