// const Clinician = require("../models/clinician.js");
const Patient = require("../models/patient.js");
const Record = require("../models/record.js");
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

const renderHomepage = async (req, res) => {
  try {
    calEngageRate(req.user._id)
    const patient = await Patient.findById(req.user._id).lean()
    const record = await Record.findOne({ patientId: patient._id, recordDate: formatDate(new Date()) })
      .populate({
        path: "patientId",
        options: { lean: true },
      }).lean();

    if (!record) {
      const emptyRecord = new Record({
        patientId: patient._id,
        recordDate: formatDate(new Date()),
        data: await checkNeed(patient._id),
      }).toObject();
      return res.render("homepage.hbs", { patient: patient, record: emptyRecord})  
    }
    if (req.query.submitted === "true") {
      return res.render("homepage.hbs", { patient: patient, record: record, submitted: true });
    }
    res.render("homepage.hbs", { patient:patient, record: record });
  } catch (err) {
    console.log(err);
    res.send("error in renderHomepage");
  }
};

// Calculate engagement rate for the patient
async function calEngageRate(patientId) {
  const records = (await Record.find({ patientId: patientId }).lean()).filter(
    (record) => checkRecorded(record)
  );
  const patient = await Patient.findById(patientId);
  const a = new Date(formatDate(Date.now()));
  a.toLocaleString("en-Au", {timeZone: "Australia/Melbourne",});
  const today = a.getTime();
  const b = new Date(formatDate(patient.createTime));
  b.toLocaleString("en-Au", {timeZone: "Australia/Melbourne",});
  const start = b.getTime();
  const difference = (today - start) / (24 * 60 * 60 * 1000) + 1;
  patient.eRate = (records.length / difference).toFixed(3);
  await patient.save();
}

// Render leaderboard
const renderLeaderboard = async (req, res) => {
  const patients = await Patient.find({}, {});
  for (patient of patients) {
    await calEngageRate(patient._id);
  }
  var patientlist = await Patient.find({}, {}).lean();
  patientlist = patientlist
    .sort((a, b) => {
      return b.eRate - a.eRate;
    })
    .slice(0, 5);
  res.render("leaderboard.hbs", { pats: patientlist });
};

// Check if a time-serie is needed or not
async function checkNeed(patientId) {
  const timeseries = (await Patient.findById(patientId).lean()).timeseries;
  const data = {};
  for (key in timeseries) {
    data[key] = {};
    if (timeseries[key] == false) {
      data[key].status = "no need";
    } else {
      data[key].status = "unrecorded";
    }
  }
  return data;
}

async function initRecord(patientId) {
  try {
    const result = await Record.findOne({
      patientId: patientId,
      recordDate: formatDate(new Date()),
    });
    if (!result) {
      // Create a new record today
      const newRecord = new Record({
        patientId: patientId,
        recordDate: formatDate(new Date()),
        data: await checkNeed(patientId),
      });
      const record = await newRecord.save();
      // put record in
      const patient = await Patient.findById(patientId);
      patient.records.push({ record: record._id });
      await patient.save();

      return record.id;
    } else {
      return result.id;
    }
  } catch (err) {
    console.log(err);
    console.log("error in initRecord");
  }
}


const recordData = async (req, res) => {
  try {
    const patientId = req.user._id;
    const recordId = await initRecord(patientId);
    const record = await Record.findOne({ _id: recordId });
    const data = record.data[req.body.key];
    data.value = req.body.value;
    data.comment = req.body.comment;
    data.status = "recorded";
    data.createdAt = new Date().toLocaleString("en-Au", {timeZone: "Australia/Melbourne",});
    record.save();
    res.redirect("/patient/home?submitted=true");
  } catch (err) {
    console.log(err);
    res.send("error in recordDataa");
  }
};

function getDateList(timespan) {
  // a day: 86400000
  const oneDay = 86400000;
  const today = Date.now();
  const dateList = [];
  for (let i = 0; i < timespan; i++) {
    dateList.unshift(formatDate(today - i * oneDay));
  }
  return dateList;
}

const viewData = async (req, res) => {
  try {
    const records = await Record.find({ patientId: req.user._id }).lean();
    // record of 2 weeks: 14 days
    const dateList = getDateList(14);
    // get data
    const dataList = { bgl: [], weight: [], doit: [], exercise: [] };
    for (date of dateList) {
      let record = records.find((record) => {
        return record.recordDate == date;
      });
      // 0 if no data that day
      if (record) {
        for (key in dataList) {
          dataList[key].push(record.data[key].value);
        }
      } else {
        for (key in dataList) {
          dataList[key].push(0);
        }
      }
    }
    res.render("viewData.hbs", {
      // stringify: change data type
      dates: JSON.stringify(dateList),
      datas: JSON.stringify(dataList),
    });
  } catch (err) {
    console.log(err);
    res.send("error in viewData");
  }
};

// Make sure the data of the day is valid for engagement rate
function checkRecorded(record) {
  var check = false;
  for (key in record.data) {
    if (record.data[key].status == "recorded") {
      check = true;
    }
  }
  return check;
}

// log in
const renderLogin = (req, res) => {
  res.render("patientLogin.hbs", req.session.flash);
};
// change password
const renderChangePwd = (req, res) => {
  res.render("changePwd.hbs");
};
// change password
const updatePwd = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id);
    if (!(await bcrypt.compare(req.body.oldPwd, patient.password))) {
      return res.render("changePwd", {
        message: "Incorrect Current Password!",
      });
    }
    if (req.body.oldPwd == req.body.newPwd) {
      return res.render("changePwd", {
        message: "New password is the same as old one!",
      });
    }
    if (!(req.body.newPwd == req.body.confirm)) {
      return res.render("changePwd", {
        message: "Please Enter Same Password Twice to Confirm!",
      });
    }
    patient.password = await bcrypt.hash(req.body.confirm, 10);
    await patient.save();
    res.render("changePwd", { message: "Successfully change your password!" });
  } catch (err) {
    console.log(err);
    res.send("error happens when update password");
  }
};

// log out
const logout = (req, res) => {
  req.logout();
  res.redirect("/patient/login");
};


module.exports = {
  renderHomepage,
  recordData,
  renderLogin,
  renderChangePwd,
  updatePwd,
  logout,
  viewData,
  renderLeaderboard,
};
