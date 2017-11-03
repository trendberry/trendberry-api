var fs = require('fs'),
  path = require('path');

function RuleFile(file) {
  if (file) {
    this.file = file;
  } else {
    this.file = path.resolve('./server/modules/import/lib/rules/default.json');
  }

  try {
    this.rules = JSON.parse(fs.readFileSync(this.file));
  } catch (e) {

  }
}

RuleFile.prototype.save = function () {
  this.rules.category.sort(function (a, b) {
    if (a.category_name.length < b.category_name.length) {
      return 1;
    }
    if (a.category_name.length > b.category_name.length) {
      return -1;
    }
    return 0;
  });
  fs.writeFileSync(this.file, JSON.stringify(this.rules));
};

RuleFile.prototype.structurize = () => {

};




RuleFile.prototype.getRule = function (name) {
  for (var i = 0; i < this.rules.product.param.length; i++) {
    if (this.rules.product.param[i].name.indexOf(name.toLowerCase()) != -1) {
      return this.rules.product.param[i];
    }
  }
  return null;
};

RuleFile.prototype.getProp = function (prop) {
  for (var i = 0; i < this.rules.product.param.length; i++) {
    if (this.rules.product.param[i].prop.indexOf(prop.toLowerCase()) != -1) {
      return this.rules.product.param[i];
    }
  }
  return null;
};

RuleFile.prototype.getValue = function (rule, value) {
  var checkEx = function (val, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (new RegExp(arr[i], 'i').test(val)) {
        return true;
      }
    }
    return false;
  };

  for (var i = 0; i < rule.compare.length; i++) {
    if (rule.compare[i].match.indexOf(value.toLowerCase()) != -1 || checkEx(value, rule.compare[i].matchEx)) {
      return rule.compare[i].value;
    }
  }
  return null;
};

RuleFile.prototype.inBlacklist = function (value) {
  var self = this;

  function inBl(val) {
    if (self.rules.product.name.blacklist.match.indexOf(val.toLowerCase()) != -1) {
      return true;
    }

    for (var i = 0; i < self.rules.product.name.blacklist.matchEx.length; i++) {
      if (new RegExp(self.rules.product.name.blacklist.matchEx[i], 'i').test(val)) {
        return true;
      }
    }
    return false;
  }
  if (Array.isArray(value)) {
    for (var i = 0; i < value.length; i++) {
      var res = inBl(value);
      if (res) return res;
    }
    return false;
  } else {
    return inBl(value);
  }
};

RuleFile.prototype.getCategory = function (value) {
  for (var i = 0; i < this.rules.category.length; i++) {
    if (new RegExp(this.rules.category[i].pattern, 'i').test(value)) {
      return this.rules.category[i];
    }
  }
};

RuleFile.prototype.fillObject = function (obj, source) {
  if (!obj || !source) return null;
  var rule;
  for (let field in obj) {
    rule = this.rules.product.param.find((param) => {
      if (param.prop == field) return true;
    });
    if (rule) {
      var cmpValue;
      for (let param of source.param) {
        if (rule.name.indexOf(param.$.name.toLowerCase()) != -1) {
          cmpValue = param.$text;
          break;
        }
      }
      if (cmpValue) {
        var result;
        for (let compare of rule.compare) {
          if (compare.match.indexOf(cmpValue.toLowerCase()) != -1) {
            result = compare.value;
            break;
          }
        }
        if (!result) {
          for (let compare of rule.compare) {
            if (new RegExp(compare.matchEx, 'i').test(cmpValue)) {
              result = compare.value;
              break;
            }
          }
        }
      }
      if (result) {
        if (Array.isArray(obj[field])) {
          obj[field].push(result);
        } else {
          obj[field] = result;
        }
      }
      rule = undefined;
    }
  }
  return obj;
};


module.exports = RuleFile;