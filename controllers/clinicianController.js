const Clinician = require("../models/clinician.js");
const Patient = require("../models/patient.js");
const Record = require("../models/record.js");
const Note = require("../models/note.js");
const bcrypt = require("bcrypt");

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [year, month, day].join("-");
}

const renderDashboard = async (req, res) => {
  try {
    const clinicianId = req.user._id;
    const patients = await Patient.find({ clinician: clinicianId }).lean();
    const patientlist = [];
    // Loop patients to find valid patients' data
    for (pat of patients) {
      let data = await Record.findOne(
        { patientId: pat._id, recordDate: formatDate(new Date()) },
        // { data: true }
      ).lean();
      if (data) {
        const dataList = {bgl: {value: data.data.bgl.value, status: data.data.bgl.status, min: pat.threasholds.bglmin, max: pat.threasholds.bglmax},
        weight: {value: data.data.weight.value, status: data.data.weight.status, min: pat.threasholds.weightmin, max: pat.threasholds.weightmax},
        doit: {value: data.data.doit.value, status: data.data.doit.status, min: pat.threasholds.doitmin, max: pat.threasholds.doitmax},
        exercise: {value: data.data.exercise.value, status: data.data.exercise.status, min: pat.threasholds.exercisemin, max: pat.threasholds.exercisemax}};
        patientlist.push({
          screenName: pat.screenName,
          _id: pat._id,
          today: dataList,
        });
      } else {
        patientlist.push({
          screenName: pat.screenName,
          _id: pat._id,
          today: { bgl: {status: 'unrecorded', value: 0}, weight: {status: 'unrecorded', value: 0}, doit: {status: 'unrecorded', value: 0}, exercise: {status: 'unrecorded', value: 0}},
        });
      }
    }
    res.render("dashboard.hbs", { patientlist: patientlist });
  } catch (err) {
    console.log(err);
    res.send("error in renderDashboard");
  }
};

const getPatient = async (req, res) => {
  try {
    const patientId = req.params._id;
    const patient = await Patient.findById(patientId).lean();
    // Find the record of the day
    const record = await Record.find({
      patientId: patient._id,
    }).lean();
    const dataList = { bgl: [], weight: [], doit: [], exercise: [] };
    for (rec of record) {
      const bgl = rec.data.bgl;
      const weight = rec.data.weight;
      const doit = rec.data.doit;
      const exercise = rec.data.exercise;
      for (key in dataList) {
        dataList[key].push(rec.data[key]);
      }
    }
    const array = [];
    for (rec of record) {
      const theData = {time: rec.recordDate, bgl: rec.data.bgl, weight: rec.data.weight, doit: rec.data.doit, exercise: rec.data.exercise}
      array.push(theData);
    }
    res.render("patDetail", { patient: patient, record: array });
  } catch (err) {
    console.log(err);
    res.send("error in getPatient");
  }
};


const renderRegistration = (req, res) => {
  try {
    res.render("register.hbs");
  }catch (err) {
    console.log(err);
    res.send("error in renderRegistration");
  }
};

const register = async (req, res) => {
  try {
    const clinicianId = req.user._id;
    // valid password
    if (req.body.password.length < 8) {
      return res.render("register.hbs", {
        input: req.body,
        message: "Password should be more than 8 characters",
      });
    }
    if (await Patient.findOne({ email: req.body.email.toLowerCase() })) {
      return res.render("register.hbs", {
        input: req.body,
        message: "This email is invalid or it is used by others",
      });
    }
    if (await Patient.findOne({ screenName: req.body.screenName })) {
      return res.render("register.hbs", {
        input: req.body,
        message: "This screen name is used by others",
      });
    }
    const newPat = new Patient({
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      screenName: req.body.screenName,
      yearOfBirth: req.body.yearOfBirth,
      textBio: req.body.textBio,
      timeseries: {
        bgl: req.body.bgl == "true",
        weight: req.body.weight == "true",
        doit: req.body.doit == "true",
        exercise: req.body.exercise == "true",
      },
      threasholds: {
        bglmin: 50,
        bglmax: 200,
        weightmin: 50,
        weightmax: 80,
        doitmin: 1,
        doitmax: 3,
        exercisemin: 200,
        exercisemax: 10000,
      },
      records: [],
      clinician: clinicianId,
      eRate: 0,
      supportMessage: req.body.supportMessage,
    });
    const patient = await newPat.save();
    // insert the patient into the patientList
    const clinician = await Clinician.findById(clinicianId);
    clinician.patients.push({ patient: patient._id });
    await clinician.save();
    res.render("register.hbs", { message: "Registered Successfully" });
  } catch (err) {
    console.log(err);
    res.send("error happens in register");
  }
};

const updateTS = async (req, res) => {
  try {
    const patient = await Patient.findById(req.body.patientId);
    patient.timeseries[req.body.key] = req.body[req.body.key] == "true";
    await patient.save();
    res.redirect("/clinician/dashboard" + req.body.patientId);
  } catch (err) {
    console.log(err);
    res.send("error in updateTS");
  }
};

const updateSM = async (req, res) => {
  try {
    const patient = await Patient.findById(req.body.patientId);
    patient.supportMessage = req.body.supportMessage;
    await patient.save();
    res.redirect("/clinician/dashboard" + req.body.patientId);
  } catch (err) {
    console.log(err);
    res.send("error in updateSM");
  }
};
const updateTH = async (req, res) => {
  try {
    const patient = await Patient.findById(req.body.patientId);
    patient.threasholds[req.body.key] = req.body.value;
    await patient.save();
    res.redirect("/clinician/dashboard" + req.body.patientId);
  } catch (err) {
    console.log(err);
    res.send("error in updateTH");
  }
};

const getComments = async (req, res) => {
  try {
    const clinicianId = req.user._id;
    const patients = await Patient.find({ clinician: clinicianId }).lean();

    const commentlist = []
    for (pat of patients) {
      let data = await Record.findOne(
        { patientId: pat._id, recordDate: formatDate(new Date()) },
        { data: true }
      ).lean();
      if (data) {
        for (key in data.data) {
          if (data.data[key].status == "recorded") {
            commentlist.push({
              patientId: pat._id,
              comment: data.data[key].comment,
            })
          }
        }
      }
    }
    res.render("getComments.hbs", {cl: commentlist})
  } catch (err) {
    console.log(err);
    res.send("error happens in getComments");
  }
}

const renderNotes = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params._id).lean();
    const notes = await Note.find({
      patient: patient._id,
      clinician: req.user._id,
    }).lean();
    res.render("viewNotes.hbs", { notes: notes, patient: patient });
  } catch (err) {
    console.log(err);
    res.send("error in renderNotes");
  }
};

const addNote = async (req, res) => {
  try {
    const newNote = new Note({
      patient: req.body.patientId,
      clinician: req.user._id,
      text: req.body.note,
    });
    await newNote.save();
    res.redirect("/clinician/viewNotes" + req.body.patientId);
  } catch (err) {
    console.log(err);
    res.send("error in addNote");
  }
};

// log in
const renderLogin = (req, res) => {
  res.render("clinicianLogin.hbs", req.session.flash);
};

// log out
const logout = (req, res) => {
  req.logout();
  res.redirect("/clinician/login");
};

module.exports = {
  renderRegistration,
  register,
  renderDashboard,
  getPatient,
  updateTS,
  updateSM,
  updateTH,
  renderNotes,
  addNote,
  getComments,
  renderLogin,
  logout,
};
