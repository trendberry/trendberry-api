'use strict';

var mongoose = require('mongoose'),
  Category = mongoose.model('Category');

  

Category
  .aggregate()
  .match({$or : [{'name': 'Женщине'}, {'name': 'Одежда'}, {'name': 'Нижнее бельё'} ]})
  
  .append({
    $graphLookup: {
      from: 'categories',
      startWith: '$parent',
      connectFromField: 'parent',
      connectToField: '_id',
      as: 'ancestors'
    }
  })
  
  .project({
      _id: 1,
      vedro:1,  
      name: 1,
        description: 1,
        slug: 1,
        created: 1,
        parent: 1,
        ancestors: 1,
  })

  .exec((err, docs) => {
    console.log(docs);
  });