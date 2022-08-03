const { body, validationResult } = require("express-validator");

var Category= require('../models/category');
var Supplier = require('../models/supplier');
var Item = require('../models/item');
var async = require('async');


// Display list of all Categories.
exports.category_list = function(req, res, next) {

    Category.find()
    .sort([['category', 'ascending']])
    .exec(function (err, list_categories) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('category_list', { title: 'Category List', category_list: list_categories });
    });

};

// Display detail page for a specific Category.
exports.category_detail = function(req, res, next) {

    async.parallel({
        category(callback) {
            Category.findById(req.params.id)
              .exec(callback);
        },

        category_items(callback) {
            Item.find({ 'category': req.params.id })
              .populate('supplier')
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('category_detail', {
          title: 'Category Detail',
          category: results.category,
          category_items: results.category_items,
        });
    });

};


// Display Category create form on GET.
exports.category_create_get = (req, res, next) => {
    res.render("category_form", { title: "Create Category" });
  };
  

// Handle Category create on POST.
exports.category_create_post = [
    // Validate and sanitize the name field.
    body("name", "Category name required").trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a category object with escaped and trimmed data.
      const category = new Category({ name: req.body.name });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("category_form", {
          title: "Create Category",
          category,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
        // Check if Category with same name already exists.
        Category.findOne({ name: req.body.name }).exec((err, found_category) => {
          if (err) {
            return next(err);
          }
  
          if (found_category) {
            // Category exists, redirect to its detail page.
            res.redirect(found_category.url);
          } else {
            category.save((err) => {
              if (err) {
                return next(err);
              }
              // Category saved. Redirect to category detail page.
              res.redirect(category.url);
            });
          }
        });
      }
    },
  ];
  

// Display Category delete form on GET.
exports.category_delete_get = function(req, res, next) {

  async.parallel({
    category(callback) {
      Category.findById(req.params.id).exec(callback)
      },
      categories_items(callback) {
          Item.find({ 'category': req.params.id }).exec(callback)
      },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.category==null) { // No results.
          res.redirect('/catalog/categories');
      }
      // Successful, so render.
      res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.categories_items });
  });
};


// Handle Category delete on POST.
exports.category_delete_post = function(req, res, next) {

  async.parallel({
      category(callback) {
          Category.findById(req.body.categoryid).exec(callback)
      },
      categories_items(callback) {
        Item.find({ 'category': req.body.categoryid }).exec(callback)
      },
  }, function(err, results) {
      if (err) { return next(err); }
      // Success
      if (results.categories_items.length > 0) {
          // category has items. Render in same way as for GET route.
          res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items });
          return;
      }
      else {
          // Category has no items. Delete object and redirect to the list of categories.
          Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
              if (err) { return next(err); }
              // Success - go to category list
              res.redirect('/catalog/categories')
          })
      }
  });
};

// Display Category update form on GET.
exports.category_update_get = function(req, res, next) {

  async.parallel({
    category(callback) {
        Category.findById(req.params.id).exec(callback)
    },
      }, function(err, results) {
          if (err) { return next(err); }
          if (results.category==null) { // No results.
              var err = new Error('Category not found');
              err.status = 404;
              return next(err);
          }
          // Success.
          res.render('category_form', { title: 'Update Category', category: results.category });
      });

};

// Handle Category update on POST.
exports.category_update_post = [

  // Validate and sanitize fields.
  body("name", "Category name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Category object with escaped/trimmed data and old id.
      var category = new Category(
        { name: req.body.name,
          _id:req.params.id //This is required, or a new ID will be assigned!
         });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/error messages.

          // Get all suppliers and categories for form.
          async.parallel({
              categories(callback) {
                  Category.find(callback);
              },
          }, function(err, results) {
              if (err) { return next(err); }

              // Mark our selected categories as checked.
              res.render('category_form', { title: 'Update Category', categories: results.categories });
          });
          return;
      }
      else {
          // Data from form is valid. Update the record.
          Category.findByIdAndUpdate(req.params.id, category, {}, function (err,thecategory) {
              if (err) { return next(err); }
                 // Successful - redirect to category detail page.
                 res.redirect(thecategory.url);
              });
      }
  }
];