const fs = require('fs'),
  path = require('path');



class ImportRules {
  constructor(rulesFile) {

    if (rulesFile) {
      this.rulesFile = rulesFile;
    } else {
      this.rulesFile = path.resolve('./server/modules/import/lib/rules/default.json');
    }
    try {
      this.rules = JSON.parse(fs.readFileSync(this.file));
    } catch (e) {

    }
  }

  save() {
    this.rules.category.categories.sort(function (a, b) {
      if (a.category_name.length < b.category_name.length) {
        return 1;
      }
      if (a.category_name.length > b.category_name.length) {
        return -1;
      }
      return 0;
    });
    fs.writeFileSync(this.file, JSON.stringify(this.rules));
  }

  hasRequiredParams(obj) {
    for (let requiredParam of this.product.requiredParam) {
      if (!obj[requiredParam]) return true;
    }
    return false;
  }

  inBlacklist(obj) {
    return (!obj.name || this.product.blacklist.match.includes(obj.name.toLowerCase) || this.product.blacklist.matchEx.some((r) => { return new RegExp(r, "i").test(obj.name)}));
  }

  fillObject(obj, source) {
    for (let field in source) {
      if (this.product.rules[field]) {
        for (let rule of this.product.rules[field]) {
          if (rule.match.includes(source[field].toLowerCase()) || rule.matchEx.some((r) => { return new RegExp(r, "i").test(source[field])})) {
            if (Array.isArray(obj[field])) {
              obj[field].push(rule.value);
            } else obj[field] = rule.value;
            break;
          }
        }
      }
    }
    return obj;
  }

  set rulesFile(path) {
    try {
      this.rules = JSON.parse(fs.readFileSync(path));
      this._rulesFile = path;
    } catch (e) {
      this.rules = null;
      this._rulesFile = null;
    }
  }

  get rulesFile() {
    return this._rulesFile;
  }
}

module.exports = ImportRules;