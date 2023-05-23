const helpers = {
  ifRecorded: function (status, options) {
    if (status == "recorded") {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  ifUnrecorded: function (status, options) {
    if (status == "unrecorded") {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  ifNoNeed: function (status, options) {
    if (status == "no need") {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  compare: function (v1, v2, v3) {
    console.log(v1, v2, v3);
    if (v1 == v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  checkBadge: function (eRate, options) {
    if (eRate >= 0.8) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  
  ifLower: function (val, min, options) {
    if (val < min) {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  ifHigher: function (val, max, options) {
    if (val > max) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
};

module.exports.helpers = helpers;
