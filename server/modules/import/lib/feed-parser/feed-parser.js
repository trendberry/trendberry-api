'use strict';
const EventEmitter = require('events'),
  expat = require('node-expat'),
  fs = require('fs'),


  template = {
    id: 'offerId',
    group_id: 'groupId',
    description: 'description',
    name: 'name',
    'Размер': 'size',
    'Пол': 'sex',
    'Возраст': 'age',
    'Сезон': 'season',
    'Сезонность': 'season',
    picture: 'pictures',
    price: 'price',
    url: 'url',
    vendor: 'vendor'
  };

class FeedParser extends EventEmitter {
  constructor(stream) {
    super();
    this.stream = stream;
    this._parser = new expat.Parser('UTF-8');
    this.categories = [];
    this.stats = {
      offerCount: 0,
      categoryCount: 0
    };
    //this.createParser();
  }

  createCounter() {
    this._parser.on('startElement', (name) => {
      switch (name) {
        case 'offer':
          this.stats.offerCount++;
          break;
        case 'category':
          this.stats.categoryCount++;
          break;
      }
    });
  }

  createParser() {

    var offer;
    var currentParam;
    var entity;

    function isEmpty(attrs) {
      for (let field in attrs)
        if (attrs[field]) {
          return false;
        }
      return true;
    }

    this._parser.on('startElement', (name, attrs) => {
      entity = false;
      if (offer) {
        if (template[name]) {
          if (!isEmpty(attrs)) {
            offer[template[name]] = attrs;
          }
          currentParam = name;
        } else currentParam = undefined;
      }

      if (name == 'offer') {
        offer = {};
        for (let field in attrs) {
          if (template[field]) {
            offer[template[field]] = attrs[field];
          }
        }
      }
    });

    this._parser.on('error', (text) => {
      console.error(text);
    });

    this._parser.on('text', (text) => {
      if (text.trim() != '' && text != '\n') {
        entity = (/[&"<>']/.test(text)) || entity;
        if (currentParam) {
          if (offer[currentParam]) {
            if (Array.isArray(offer[currentParam])) {
              if (entity) {
                let arrLength = offer[currentParam].length - 1;
                offer[currentParam][arrLength] += text;
              } else {
                offer[currentParam].push(text);
              }
            } else {
              if (entity) {
                offer[currentParam] += text;
              } else {
                offer[currentParam] = [offer[currentParam]];
                offer[currentParam].push(text);
              }
            }
          } else {
            offer[currentParam] = text;
          }
        }
      }
    });

    this._parser.on('endElement', (name) => {
      if (name == 'offer') {
        this.emit('offer', offer);
        offer = undefined;
      }
      currentParam = undefined;

    });
  };

  reset() {
    this._parser = new expat.Parser('UTF-8');
    for (let event of this.eventNames()) {
      this.removeAllListeners(event);
    }
  }

  startCounting(stream) {
    this.reset();
    this.createCounter();
    if (stream) {
      stream.on('data', (data) => {
        this._parser.write(data)
      });
    }
  }

  startParsing(stream) {
  //  if (stream) this.stream = stream;
    this.reset();
    this.createParser();
    if (this.stream) {
      this.stream.on('data', (data) => {
        this._parser.write(data)
      });
    }
    this.stream.on('end', (data) => {
      console.log('done')
    });
  }
}

module.exports = FeedParser;