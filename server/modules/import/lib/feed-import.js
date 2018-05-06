'use strict';

var http = require('http'),
  fs = require('fs'),
  path = require('path'),
  EventEmitter = require('events'),
  contentDisposition = require('content-disposition'),
  XmlStream = require('xml-stream'),
  FeedParser = require('./feed-parser/feed-parser'),
  ImportRules = require(path.resolve('./server/modules/import/lib/import-rules')),
  ImportLog = require(path.resolve('./server/modules/import/lib/import_log')),
  ws = require(path.resolve('./server/modules/import/sockets/import.socket')),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  Category = mongoose.model('Category'),
  Shop = mongoose.model('Shop'),
  Vendor = mongoose.model('Vendor'),
  crypto = require('crypto'),
  config = require(path.resolve('./config/config'));






/*for (let model of ['Product']) {
  mongoose.model(model).find({}, (err, docs) => {
    docs.forEach(function (doc) {
      //   doc.remove()


    })
  })
}*/




class FeedImport extends EventEmitter {
  constructor(source, rules) {
    super();
    this.source = source;
    this.rules = new ImportRules(rules);
    this.createdDate = Date.now();
    this._feedParser = new FeedParser();
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

  downloadFeed() {
    console.log('downloading from ' + this.source.feedUrl);
    this.state = 'downloading_feed';
    var downloadTime = process.hrtime();
    return new Promise((resolve, reject) => {
      http.get(this.source.feedUrl, (response) => {
        if (response.statusCode === 200) {
          var fileName;
          if (response.headers['content-disposition']) {
            fileName = contentDisposition.parse(response.headers['content-disposition']).parameters.filename;
          } else {
            fileName = this.source.name + '_' + Date.now().toString();
          }
          this.importStreamFile = fs.createWriteStream(fileName);
          this.importStreamFile.on('finish', () => {
            this.downloadTime = process.hrtime(downloadTime)[0];
            this.workTime = process.hrtime(downloadTime)[0];
           this._feedParser.stream = fs.createReadStream(fileName);
            // this.xmlStream = new XmlStream(fs.createReadStream(fileName));
            this.emit('download', this.xmlStream);
            console.log('download done');
            this.state = 'download_done';
            resolve(this.state);
          });
          this.importStreamFile.on('error', (err) => {
            this.workTime = process.hrtime(downloadTime)[0];
            this.emit('downloadError', this.source.feedUrl);
            fs.unlink(fileName);
            reject(err);
          });
          this._feedParser.startCounting(response);
          response.pipe(this.importStreamFile);
          this.downloadStartedDate = Date.now();
          downloadTime = process.hrtime();
        } else {
          this.emit('httpError', response.statusMessage);
          reject(new Error(response.statusMessage));
        }
      }).on('error', (e) => {
        reject(e);
      });
    }).catch((e) => {
      this.state = 'download_error';
      console.log(e);
    });
  };

  async productExist(product) {
    var query = product.groupId ? {
      groupId: product.groupId
    } : {
      'sku.offerId': {
        $in: [product.sku[0].offerId]
      }
    };
    query.name = product.name,
      query.shop = this.source;
    return await Product.findOne(query);
  };

  downloadPicture(url, callback) {
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

  importItem(item) {
    var product = new Product();
    var sku = product.sku.create();
    product.offerId = item.$.id;
    product.groupId = item.$.group_id;
    var category;

    var finalCategoryTree = [];
    product.name = item.name.replace(" " + item.vendor, "");
    sku.offerId = item.$.id;
    this.rules.fillObject(product, item);
    this.rules.fillObject(sku, item);


    category = this.rules.getCategory(product.name);
    if (!category) {
      return this.emit('noCategory', item);
    }

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
      pictures: item.picture,
      vendor: item.vendor,
      categoryTree: finalCategoryTree
    });
  };

  deleteItem(item) {
    var target = {
      name: item.name.replace(" " + item.vendor, ""),
      'sku.offerId': {
        $in: [item.$.id]
      },
      shop: this.source
    };
    if (item.$.group_id) {
      target.groupId = item.$.group_id;
    }
    Product.findOne(target, (err, doc) => {
      if (doc) {
        if (doc.sku.length === 1) {
          doc.remove();
        } else {
          var hasSku = doc.hasSku({
            offerId: item.$.id
          });
          if (!hasSku) return;
          doc.sku.pull(hasSku._id);
          doc.save();
        }
        return this.emit('productRemoved', doc);
      } else return this.emit('itemImportIgnored', item);
    });
  };

  startImport() {
    this.importStartDate = Date.now();
    this._importTime = process.hrtime();
    this.state = 'working';
    this._feedParser.startParsing(this.importStreamFile)
    this._feedParser.on('offer', (item) => {
      if (!this.rules.hasRequiredParams(item) || this.rules.inBlacklist(item)){
        return this.emit('itemImportIgnored', item);
      }
      if (item.$.deleted) {
        this.deleteItem(item);
      } else {
        this.importItem(item);
      }
    });

 //   this.xmlStream.on('end', () => {
   //   console.log('stream parsed');
   // });
  //  this.xmlStream.on('endElement: shop', () => {
    //  this.state = 'finished';
   //   console.log(this.getInfo());
   //   this.source.lastUpdate = this.importStartDate;
   //   this.source.save();
  //  });
  };

  async addProduct(data) {
    var product = await this.processCategory(data.categoryTree, data.product);
    if (!product) {
      return this.emit('noCategory', data.product);
    }
    var exist = await this.productExist(product);
    if (!exist) {
      var vendor = await this.processVendor(data.vendor);
      product.vendor = vendor;
      var saved = await product.save();
      return this.emit('productSaved', saved);
    } else {
      var updateResult, newSku, hasSku = false;
      updateResult = exist.updateProduct(product);
      hasSku = exist.hasSku(product.sku[0]);
      if (hasSku) {
        updateResult = hasSku.updateSku(product.sku[0]) || updateResult;
      } else {
        exist.sku.push(product.sku[0]);
        newSku = true;
      }
      if (!(updateResult && newSku)) return this.emit('productIsDuplicate', product);
      if (updateResult) {
        await exist.save();
        this.emit('productUpdated', product);
      }
      if (newSku) {
        await exist.save();
        this.emit('productSaved', product);
      }
    }
  };

  bindEvents() {
    var wrapResume = (stream) =>
      setImmediate(() => stream.resume());

    this.on('productSaved', (item) => {
      this.importStats.new++;
      this.log.writeLine('product added');
      this.log.writeLine(item);
      this.log.separate();
    });
    this.on('productUpdated', (item) => {
      this.importStats.updated++;
      this.log.writeLine('product updated');
      this.log.writeLine(item);
      this.log.separate();
    });
    this.on('productDeleted', (item) => {
      this.importStats.deleted++;
      this.log.writeLine('product deleted');
      this.log.writeLine(item);
      this.log.separate();
    });
    this.on('productIsDuplicate', (item) => {
      this.importStats.duplicate++;
      this.log.writeLine('deplicate');
      this.log.writeLine(item);
      this.log.separate();
    });
    this.on('noCategory', (item) => {
      this.importStats.ignored++;
      this.log.writeLine('no category');
      this.log.writeLine(item);
      this.log.separate();
    });
    this.on('itemImportBlocked', (item) => {
      this.importStats.blocked++;
      this.log.writeLine('item blocked');
      this.log.writeLine(item);
      this.log.separate();
    });
    this.on('itemImportIgnored', (item) => {
      this.importStats.ignored++;
      this.log.writeLine('item ignored');
      this.log.writeLine(item);
      this.log.separate();
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

  async launchImport() {
    // this.log.start();
    await this.downloadFeed();
    if (this.state === 'download_done') {
      this.startImport();
    }
  };

  async processCategory(categoryTree, product) {
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

  async processVendor(vendorName) {
    var regExp = new RegExp('\&(amp|quot|apos|lt|gt)\;', 'g');
    vendorName = vendorName.replace(regExp, (entity) => {
      return xmlEntities[entity];
    });
    var vendor = await Vendor.findOne({
      name: new RegExp("^" + vendorName + "$", 'i')
    });
    if (!vendor) {
      vendor = new Vendor({
        name: vendorName
      });
      await Vendor.create(vendor);
    }
    return vendor;
  };

  isPaused() {
    if (this.xmlStream && this.xmlStream._suspended != undefined) {
      if (Boolean(this.xmlStream._suspended)) {
        return true;
      } else {
        return false;
      }
    }
    return undefined;
  };

  pause() {
    var paused = this.isPaused();
    if (paused != undefined && !paused) {
      this.xmlStream.pause();
      this.state = 'paused';
      this.workTime = this.workTime + process.hrtime(this._importTime)[0];
    }
  };

  resume() {
    var paused = this.isPaused();
    if (paused != undefined && paused) {
      this.xmlStream.resume();
      this.state = 'working';
      this._importTime = process.hrtime();
    }
  };

  streamPos() {
    return this.xmlStream && this.xmlStream._parser ? this.xmlStream._parser.getCurrentByteIndex() : 0;
  };

  streamLength() {
    return this.xmlStream ? this.xmlStream._stream.bytesRead : 0;
  };

  importProgress() {
    if (this.xmlStream && this.xmlStream._parser) {
      return (100 * this.xmlStream._parser.getCurrentByteIndex() / this.xmlStream._stream.bytesRead).toFixed();
    } else {
      return 0;
    }
  };

  getInfo() {
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

  toJSON() {
    return {
      id: this.source.id,
      shopName: this.source.name,
      state: this.state,
      lastUptade: this.source.lastUpdate
    };
  };

}

module.exports = FeedImport;