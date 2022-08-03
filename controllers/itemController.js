const { body,validationResult } = require('express-validator');

var Item = require('../models/item');
var Supplier = require('../models/supplier');
var Category = require('../models/category');



var async = require('async');



exports.index = function(req, res) {

    async.parallel({
        item_count(callback) {
            Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        supplier_count(callback) {
            Supplier.countDocuments({}, callback);
        },
        category_count(callback) {
            Category.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Great Outdoors™ Inventory', error: err, data: results });
    });
};


// Display list of all Items.
exports.item_list = function(req, res, next) {

    Item.find({}, 'name stock price image supplier')
      .sort({name: 1})
      .populate('supplier')
      .exec(function (err, list_items) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('item_list', { 
            title: 'All Products', 
            item_list: list_items});
      });
  
  };

// Display detail page for a specific item.
exports.item_detail = function(req, res, next) {

    async.parallel({
        item(callback) {

            Item.findById(req.params.id)
              .populate('name')
              .populate('category')
              .populate('supplier')
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item==null) { // No results.
            var err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('item_detail', {
            title: "Item Details",
            name: results.item.name,
            item: results.item,
            img: decodeURIComponent(results.item.image).replace(/&#x2F;/gi,'/')
        });
    });

};


// Display Item create form on GET.
exports.item_create_get = function(req, res, next) {

    // Get all suppliers and categories, which we can use for adding to our item.
    async.parallel({
        suppliers(callback) {
            Supplier.find(callback);
        },
        categories(callback) {
            Category.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('item_form', { title: 'Create Item', suppliers: results.suppliers, categories: results.categories });
    });

};


// Handle Item create on POST.
exports.item_create_post = [
    // Convert the category to an array.
    (req, res, next) => {
        if(!(Array.isArray(req.body.category))){
            if(typeof req.body.category ==='undefined')
            req.body.category = [];
            else
            req.body.category = [req.body.category];
        }
        next();
    },



    // Validate and sanitize fields.
    body('name', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('supplier', 'Supplier must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('stock', 'Stock must not be empty').trim().isLength({ min: 1 }).escape(),
    body('image', 'Stock must not be empty').trim().isLength({ min: 1 }).escape(),
    body('category.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Item object with escaped and trimmed data.
        var item = new Item(
          { name: req.body.name,
            supplier: req.body.supplier,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category,
            image: encodeURIComponent(req.body.image),
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all suppliers and categories for form.
            async.parallel({
                suppliers(callback) {
                    Supplier.find(callback);
                },
                categories(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected categories as checked.
                for (let i = 0; i < results.categories.length; i++) {
                    if (item.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked='true';
                    }
                }
                res.render('item_form', { title: 'Create Item',suppliers:results.suppliers, categories:results.categories, item: item, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save item.
            item.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new item record.
                   res.redirect(item.url);
                });
        }
    }
];


// Display Item delete form on GET.
exports.item_delete_get = function(req, res, next) {
    
    async.parallel({
        item(callback) {

            Item.findById(req.params.id)
              .populate('name')
              .populate('category')
              .populate('supplier')
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item==null) { // No results.
            res.redirect('/catalog/items');
        }
        // Successful, so render.
        res.render('item_delete', { title: 'Delete Item', item: results.item, name: results.item.name, });
    });
};

// Handle Item delete on POST.
exports.item_delete_post = function(req, res, next) {

    async.parallel({
        item(callback) {
            Item.findById(req.body.itemid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
  
            // Item has no items. Delete object and redirect to the list of items.
            Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
                if (err) { return next(err); }
                // Success - go to item list
                res.redirect('/catalog/items')
            })
      
    });
};

// Display item update form on GET.
exports.item_update_get = function(req, res, next) {

    // Get item, suppliers and categories for form.
    async.parallel({
        item(callback) {
            Item.findById(req.params.id).populate('supplier').populate('category').exec(callback);
        },
        suppliers(callback) {
            Supplier.find(callback);
        },
        categories(callback) {
            Category.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.item==null) { // No results.
                var err = new Error('Item not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected categories as checked.
            for (var all_g_iter = 0; all_g_iter < results.categories.length; all_g_iter++) {
                for (var item_g_iter = 0; item_g_iter < results.item.category.length; item_g_iter++) {
                    if (results.categories[all_g_iter]._id.toString()===results.item.category[item_g_iter]._id.toString()) {
                        results.categories[all_g_iter].checked='true';
                    }
                }
            }
            res.render('item_form', { title: 'Update Item', suppliers: results.suppliers, categories: results.categories, item: results.item });
        });

};


// Handle Item update on POST.
exports.item_update_post = [

    // Convert the category to an array
    (req, res, next) => {
        if(!(Array.isArray(req.body.category))){
            if(typeof req.body.category==='undefined')
            req.body.category=[];
            else
            req.body.category=[req.body.category];
        }
        next();
    },

    // Validate and sanitize fields.
    body('name', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('supplier', 'Supplier must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('stock', 'Stock must not be empty').trim().isLength({ min: 1 }).escape(),
    body('category.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Item object with escaped/trimmed data and old id.
        var item = new Item(
          { name: req.body.name,
            supplier: req.body.supplier,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            image: encodeURIComponent(req.body.image),
            category: (typeof req.body.category==='undefined') ? [] : req.body.category,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all suppliers and categories for form.
            async.parallel({
                suppliers(callback) {
                    Supplier.find(callback);
                },
                categories(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected categories as checked.
                for (let i = 0; i < results.categories.length; i++) {
                    if (item.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked='true';
                    }
                }
                res.render('item_form', { title: 'Update Item',suppliers: results.suppliers, categories: results.categories, item: item, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Item.findByIdAndUpdate(req.params.id, item, {}, function (err,theitem) {
                if (err) { return next(err); }
                   // Successful - redirect to item detail page.
                   res.redirect(theitem.url);
                });
        }
    }
];
