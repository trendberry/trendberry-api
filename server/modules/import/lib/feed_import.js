'use strict';

var http = require('http'),
  fs = require('fs'),
  path = require('path'),
  async = require('async'),
  events = require('events'),
  util = require('util'),
  contentDisposition = require('content-disposition'),
  XmlStream = require('xml-stream'),
  RuleFile = require(path.resolve('./server/modules/import/lib/import_rules')),
  ImportLog = require(path.resolve('./server/modules/import/lib/import_log')),
  ws = require(path.resolve('./server/modules/import/sockets/import.socket')),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  Category = mongoose.model('Category'),
  Shop = mongoose.model('Shop'),
  Vendor = mongoose.model('Vendor'),
  crypto = require('crypto'),
  config = require(path.resolve('./config/config'));

 



Product.find({}, function(err, docs){
docs.forEach(function(doc){
//doc.remove()
 })
});


/*Vendor.find({}, function(err, docs){
docs.forEach(function(doc){
doc.remove()
 })
});*/


function FeedImport(source, rules) {
  this.source = source;
  this.rules = new RuleFile(rules);
  this.createdDate = Date.now();
  this.downloadStartedDate = 0;
  this.importStartDate = 0;
  this.downloadTime = 0;
  this.workTime = 0;
  this._importTime = 0;
  this.state = 'idle';
  this.importStats = {
    new: 0,
    updated: 0,
    deleted: 0,
    blocked: 0,
    ignored: 0,
    duplicate: 0
  };
  this.log = new ImportLog(source.name);
  this.categories = {};
  // this.importStreamFile = {};
  this.processedCategories = {};
  this.bindEvents();
}

util.inherits(FeedImport, events.EventEmitter);

FeedImport.prototype.downloadFeed = function (callback) {
  //  console.log('downloading from ' + this.source.url);
  var self = this;
  var downloadTime;

  //test

  self.xmlStream = new XmlStream(fs.createReadStream('lamoda.xml'));
  return callback();


  try {
    var request = http.get(this.source.feedUrl, function (response) {
      if (response.statusCode === 200) {
        var fileName = contentDisposition.parse(response.headers['content-disposition']).parameters.filename;
        self.importStreamFile = fs.createWriteStream(fileName);
        self.importStreamFile.on('finish', function () {
          self.downloadTime = process.hrtime(downloadTime)[0];
          self.workTime = process.hrtime(downloadTime)[0];
          self.xmlStream = new XmlStream(fs.createReadStream(fileName));
          self.emit('download', self.xmlStream);
          console.log('download done');
          self.state = 'download_done';
          callback();
        });
        self.importStreamFile.on('error', function () {
          self.workTime = process.hrtime(downloadTime)[0];
          self.emit('downloadError', filename);
          fs.unlink(fileName);
          self.state = 'download_error';
          console.log('failed to download ' + fileName);
          callback();
        });
        response.pipe(self.importStreamFile);
        this.downloadStartedDate = Date.now();
        downloadTime = process.hrtime();
      } else {
        self.emit('httpError', response.statusMessage);
        console.log(response.statusCode + " " + response.statusMessage);
        callback();
      }
    });
  } catch (e) {
    self.state = 'download_error';
    console.log(e);
    callback();
  }
};

FeedImport.prototype.productExists = function (product) {
  var query = product.groupId ? {
    name: product.name,
    groupId: product.groupId
  } : {
    name: product.name,
    'sku.offerId': {
      $in: [product.sku[0].offerId]
    }
  };
  return Product.findOne(query);
};


FeedImport.prototype.downloadPicture = function (url, callback) {
  return new Promise((resolve, reject) => {

    //test

    return resolve(null);



    var dest = config.uploads.product.image.dest;
    var request = http.get(url, function (response) {
      if (response.statusCode === 200) {

        //todo retry on error

        var fileName = crypto.pseudoRandomBytes(16).toString('hex') + Date.now().toString() + path.extname(url);
        var file = fs.createWriteStream(path.join(dest, fileName));
        file.on('finish', function () {
          callback(null, {
            destination: dest,
            filename: fileName
          });
        });
        file.on('error', function () {
          fs.unlink(fileName);
          callback(new Error('picture download failed'), null);
        });
        response.pipe(file);
      } else {
        callback(new Error(response.statusMessage), null);
      }
    });
  });
};

FeedImport.prototype.importItem = function (item) {
  var params = item.param;
  var picts = item.picture;
  var product = new Product();
  var sku = product.sku.create();
  product.offerId = item.$.id;
  product.groupId = item.$.group_id;
  var rule;
  var value;
  var category;
  var vendor;
  var finalCategoryTree = [];
  product.name = item.name.replace(" " + item.vendor, "");
  sku.offerId = item.$.id;
  this.rules.fillObject(product, item);
  this.rules.fillObject(sku, item);


  category = this.rules.getCategory(product.name);
  if (!category) {
    return this.emit('noCategory', item);
  }

  /*if (!product.age) {
    if (self.categories[item.categoryId]) {
      rule = this.rules.getRule('age');
      value = this.rules.getValue(rule, self.categories[item.categoryId]);
      if (!value) {
        return self.emit('itemImportIgnored', item);
      } else {
        product.age = value;
      }
    }
  }*/

  /* if (!product.sex && product.age != 1) {
     if (category.sex != '') {
       product.sex = category.sex;
     } else {
       if (self.categories[item.categoryId]) {
         rule = this.rules.getRule('gender');
         value = this.rules.getValue(rule, self.categories[item.categoryId]);
         if (!value) {
           return this.emit('itemImportIgnored', item);
         } else {
           product.sex = value;
         }
       }
     }
   }*/

  if (!product.sex && category.sex) {
    product.sex = category.sex;
  }

  if (product.age) {
    switch (product.age) {
      case 1:
        finalCategoryTree.push('Для малышей');
        break;
      case 2:
        finalCategoryTree.push(product.sex == 1 ? 'Девочке' : product.sex == 2 ? 'Мальчику' : '');
        break;
      case 3:
        finalCategoryTree.push(product.sex == 1 ? 'Женщине' : product.sex == 2 ? 'Мужчине' : '');
    }
  }

  finalCategoryTree.push(category.type);
  if (category.sub_type != '') {
    finalCategoryTree.push(category.sub_type);
  }
  finalCategoryTree.push(category.category_name);

  product.description = item.description;
  sku.price = parseInt(item.price);
  sku.oldPrice = item.oldprice !== undefined ? parseInt(item.oldprice) : null;
  sku.url = item.url;
  product.shop = this.source !== undefined ? this.source : null;

  product.sku.push(sku);
  this.addProduct({
    product: product,
    pictures: picts,
    vendor: item.vendor,
    categoryTree: finalCategoryTree
  });
};

FeedImport.prototype.startImport = function () {
  var self = this;
  this.importStartDate = Date.now();
  this._importTime = process.hrtime();
  this.state = 'working';
  this.xmlStream.on('error', function (e) {
    console.log(e);
  });


  /* this.xmlStream.collect('category');
   this.xmlStream.on('endElement: categories', function (categories) {
     function chainCat(cat) {
       if (cat.$.parentId && cat.$.parentId != 0) {
         for (var i = 0; i < categories.category.length; i++) {
           if (categories.category[i].$.id == cat.$.parentId) {
             var c = {};
             Object.assign(c, cat);
             c.$text = chainCat(categories.category[i]).$text + '/' + c.$text;
             return c;
           }
         }
       }
       return cat;
     }
     for (var i = 0; i < categories.category.length; i++) {
       self.categories[categories.category[i].$.id] = chainCat(categories.category[i]).$text;
     }
   });*/

  this.xmlStream.collect('picture');
  this.xmlStream.collect('param');
  this.xmlStream.on('endElement: offer', (item) => {
    this.xmlStream.pause();
    if (this.rules.inBlacklist(item.name)) {
      return self.emit('itemImportBlocked', item);
    };

    switch (undefined) {
      case item.vendor:
      case item.picture:
      case item.price:
        return self.emit('itemImportIgnored', item);
    }
    self.importItem(item);
  });

  this.xmlStream.on('end', () => {
    console.log('stream parsed');
  });
  this.xmlStream.on('endElement: shop', () => {
    this.state = 'finished';
    console.log(this.getInfo());
    this.source.lastUpdate = this.importStartDate;
  });
};

FeedImport.prototype.addProduct = async function (data) {
  var product = await this.processCategory(data.categoryTree, data.product);

  if (!product) {
    return this.emit('noCategory', data.product);
  }
  var isExists = await this.productExists(product);
  if (!isExists) {
    var vendor = await this.processVendor(data.vendor);
    product.vendor = vendor;
    var saved = await product.save();
    return this.emit('productSaved', saved);
  } else {
    var updateResult = isExists.updateBase(product);
    updateResult = isExists.addSku(product.sku[0]);
    if (updateResult) {
      await isExists.save();
      return this.emit('productUpdated', product);
    } else return this.emit('productIsDuplicate', product);
  }
};

FeedImport.prototype.bindEvents = function () {
  var wrapResume = (stream) =>
    setImmediate(() => stream.resume());

  this.on('productSaved', (item) => {
    this.importStats.new++;
    this.log.writeLine('product added');
    this.log.writeLine(item);
    this.log.separate();
    // wrapResume(this.xmlStream);
  });
  this.on('productUpdated', (item) => {
    this.importStats.updated++;
    this.log.writeLine('product updated');
    this.log.writeLine(item);
    this.log.separate();
    // wrapResume(this.xmlStream);
  });
  this.on('productIsDuplicate', (item) => {
    this.importStats.duplicate++;
    this.log.writeLine('deplicate');
    this.log.writeLine(item);
    this.log.separate();
    //  wrapResume(this.xmlStream);

  });
  this.on('noCategory', (item) => {
    this.importStats.ignored++;
    this.log.writeLine('no category');
    this.log.writeLine(item);
    this.log.separate();
    //  wrapResume(this.xmlStream);

  });
  this.on('itemImportBlocked', (item) => {
    this.importStats.blocked++;
    this.log.writeLine('item blocked');
    this.log.writeLine(item);
    this.log.separate();
    //  wrapResume(this.xmlStream);

  });
  this.on('itemImportIgnored', (item) => {
    this.importStats.ignored++;
    this.log.writeLine('item ignored');
    this.log.writeLine(item);
    this.log.separate();
    //  wrapResume(this.xmlStream);
  });

  this.eventNames().forEach((event) => {
    this.on(event, (data) => {
      wrapResume(this.xmlStream);
      this.workTime = process.hrtime(this._importTime)[0];
      //  ws.send(event + ': ' + JSON.stringify(data));

      //  console.log(this.xmlStream._parser.getCurrentByteIndex());

    });
  });
};

FeedImport.prototype.launchImport = async function () {
  this.log.start();
  this.downloadFeed(() => {
    this.startImport();
  });
};

FeedImport.prototype.processCategory = async function (categoryTree, product) {
  var chainTree = categoryTree.map((current, index, array) => {
    return array.slice(0, ++index).join('/');
  });

  var categories = await Category.aggregate()
    .match({
      "name": {
        $in: categoryTree
      }
    })
    .graphLookup({
      from: "categories",
      startWith: "$parent",
      connectFromField: "parent",
      connectToField: "_id",
      as: "ancestors"
    })
    .project({
      "name": 1,
      "tree": {
        $reduce: {
          "input": {
            $reverseArray: "$ancestors.name"
          },
          initialValue: '$name',
          in: {
            $concat: ['$$this', '/', '$$value']
          }
        }
      },
    })
    .match({
      "tree": {
        $in: chainTree
      }
    }).exec();

  if (categories.length !== categoryTree.length) {
    var categoriesToAdd = categoryTree.slice(categories.length).map((item) => {
      return new Category({
        name: item
      });
    });
    categoriesToAdd.forEach((item, index, array) => {
      item.parent = (index == 0) ? categories[categories.length - 1] : array[index - 1];
    });
    await Category.create(categoriesToAdd);
    categories = categories.concat(categoriesToAdd);
  }

  product.category = categories;
  return product;
};

FeedImport.prototype.processVendor = async function (vendorName) {
  var vendor = await Vendor.findOne({name: new RegExp("^" + vendorName + "$", 'i')});
  if (!vendor){
    vendor = new Vendor({name: vendorName});
    await Vendor.create(vendor);
  }
  return vendor;
};

FeedImport.prototype.isPaused = function () {
  if (this.xmlStream && this.xmlStream._suspended != undefined) {
    if (Boolean(this.xmlStream._suspended)) {
      return true;
    } else {
      return false;
    }
  }
  return undefined;
};

FeedImport.prototype.pause = function () {
  var paused = this.isPaused();
  if (paused != undefined && !paused) {
    this.xmlStream.pause();
    this.state = 'paused';
    this.workTime = this.workTime + process.hrtime(this._importTime)[0];
  }
};

FeedImport.prototype.resume = function () {
  var paused = this.isPaused();
  if (paused != undefined && paused) {
    this.xmlStream.resume();
    this.state = 'working';
    this._importTime = process.hrtime();
  }
};


FeedImport.prototype.streamPos = function () {
  return this.xmlStream && this.xmlStream._parser ? this.xmlStream._parser.getCurrentByteIndex() : 0;
};

FeedImport.prototype.streamLength = function () {
  return this.xmlStream ? this.xmlStream._stream.bytesRead : 0;
};

FeedImport.prototype.importProgress = function () {
  if (this.xmlStream && this.xmlStream._parser) {
    return (100 * this.xmlStream._parser.getCurrentByteIndex() / this.xmlStream._stream.bytesRead).toFixed();
  } else {
    return 0;
  }
};

FeedImport.prototype.getInfo = function () {
  return {
    status: this.state,
    createDate: this.createdDate,
    downloadTime: this.downloadTime,
    downloadStartDate: this.downloadStartedDate,
    importStartDate: this.importStartDate,
    workTime: this.workTime,
    streamSize: this.streamLength(),
    streamPos: this.streamPos(),
    importStats: this.importStats,
    lastUpdate: this.source.lastUpdate
  };
};

FeedImport.prototype.toJSON = function () {
  return {
    id: this.source.id,
    shopName: this.source.name,
    state: this.state,
    lastUptade: this.source.lastUpdate
  };
};


module.exports = FeedImport;