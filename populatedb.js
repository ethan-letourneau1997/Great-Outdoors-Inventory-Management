#! /usr/bin/env node

console.log('This script populates some test items and suppliers to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')
var Supplier = require('./models/supplier')



var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
var categories = []
var suppliers = []

function categoryCreate(name, cb) {
    var category = new Category({ name: name });
         
    category.save(function (err) {
      if (err) {
        cb(err, null);
        return;
      }
      console.log('New Category: ' + category);
      categories.push(category)
      cb(null, category);
    });
  }

function supplierCreate(name, phone, cb) {
var supplier = new Supplier({ 
    name: name, 
    phone: phone, 
});
        
supplier.save(function (err) {
    if (err) {
    cb(err, null);
    return;
    }
    console.log('New Supplier: ' + supplier);
    suppliers.push(supplier)
    cb(null, supplier);
}   );
}

function itemCreate(name, description, price, stock, supplier, category, cb) {
 var item = new Item({
    name: name, 
    description: description,
    price: price,
    stock: stock,
    supplier: supplier,
    category: category,
    
})
  
       
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}

    


function createCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate("Camping", callback);
        },
        function(callback) {
          categoryCreate("Fishing", callback);
        },
        function(callback) {
          categoryCreate("Apparel", callback);
        },
        ],
        // optional callback
        cb);
}

function createSuppliers(cb) {
    async.series([
        function(callback) {
          supplierCreate('DuBuque-King', '6815016', callback);
        },
        function(callback) {
          supplierCreate('Bosco-Luettgen', '5918145', callback);
        },
        function(callback) {
          supplierCreate('Mraz Inc', '7182325 ', callback);
        },
        function(callback) {
          supplierCreate('Howe LLC', '4592015', callback);
        },
        function(callback) {
          supplierCreate('Borer LLC', '2174839 ', callback);
        },
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Blue Sleeping Bag', 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat', 49.99, 48, suppliers[3], categories[0], callback);
        },
        function(callback) {
          itemCreate('Green tent', ' At urna condimentum mattis pellentesque id nibh. Magna fringilla urna porttitor rhoncus dolor. Amet justo donec enim diam vulputate ut pharetra sit.', 199.99, 22, suppliers[2], categories[0], callback);
        },
        function(callback) {
          itemCreate('Camping Stove', 'Est velit egestas dui id ornare. Nulla at volutpat diam ut venenatis tellus in.', 75.00, 17, suppliers[4], categories[0], callback);
        },
        function(callback) {
          itemCreate('Adult Fishing Rod', 'Risus ultricies tristique nulla aliquet. Eget nunc lobortis mattis aliquam. Augue lacus viverra vitae congue eu consequat.', 79.99, 72, suppliers[4], categories[1], callback);
        },
        function(callback) {
          itemCreate('Child Fishing Rod', ' In hac habitasse platea dictumst. Lectus vestibulum mattis ullamcorper velit sed ullamcorper morbi tincidunt ornare. ', 49.99, 42, suppliers[1], categories[1], callback);
        },
        function(callback) {
          itemCreate('Tackle Box', 'Nisi porta lorem mollis aliquam ut porttitor leo. Orci ac auctor augue mauris augue neque gravida.', 19.99, 121, suppliers[2], categories[1], callback);
        },
        function(callback) {
          itemCreate('Big Game Shirt M', 'Dolor purus non enim praesent elementum facilisis leo vel fringilla.', 19.99, 74, suppliers[1], categories[2], callback);
        },
        function(callback) {
          itemCreate('Big Game Shirt L', 'Adipiscing commodo elit at imperdiet dui accumsan sit amet. Ut morbi tincidunt augue interdum velit euismod in.', 19.99, 43, suppliers[3], categories[2], callback);
        },
        function(callback) {
          itemCreate('Camo Hat', 'Mauris cursus mattis molestie a iaculis. At risus viverra adipiscing at in tellus.', 14.99, 102, suppliers[0], categories[2], callback);
        },
        ],
        // optional callback
        cb);
}

async.series([
    createCategories,
    createSuppliers,
    createItems
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Items: '+ items);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
