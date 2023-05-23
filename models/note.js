const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    clinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinician",
      required: true,
    },
    text: { type: String },
  },
  {
    timestamps: { createdAt: "createTime", updatedAt: "updateTime" },
  }
);

// create collection notes in mongodb
const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
