const { body,validationResult } = require('express-validator');

var Supplier= require('../models/supplier');
var Item = require('../models/item');

var async = require('async');

// Display list of all Suppliers.
exports.supplier_list = function(req, res, next) {

    Supplier.find()
    .sort([['supplier', 'ascending']])
    .exec(function (err, list_suppliers) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('supplier_list', { title: 'Supplier List', supplier_list: list_suppliers });
    });

};

// Display detail page for a specific Supplier.
exports.supplier_detail = function(req, res, next) {

    async.parallel({
        supplier(callback) {
            Supplier.findById(req.params.id)
              .exec(callback)
        },
        suppliers_items(callback) {
          Item.find({ 'supplier': req.params.id })
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.supplier==null) { // No results.
            var err = new Error('Supplier not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('supplier_detail', {
          title: 'Supplier Detail',
          supplier: results.supplier,
          supplier_items: results.suppliers_items,
        });
    });

};


// Display Supplier create form on GET.
exports.supplier_create_get = function(req, res, next) {
    res.render('supplier_form', { title: 'Create Supplier'});
};


// Handle Supplier create on POST.
exports.supplier_create_post = [

    // Validate and sanitize fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.'),
    body('phone').trim().isLength({min:10},{max:10}).escape().withMessage('Phone number must be 9 digits'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('supplier_form', { title: 'Create Supplier', supplier: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Supplier object with escaped and trimmed data.
            var supplier = new Supplier(
                {
                    name: req.body.name,
                    phone: req.body.phone
                });
            supplier.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new supplier record.
                res.redirect(supplier.url);
            });
        }
    }
];


// Display Supplier delete form on GET.
exports.supplier_delete_get = function(req, res, next) {

    async.parallel({
        supplier(callback) {
            Supplier.findById(req.params.id).exec(callback)
        },
        suppliers_items(callback) {
            Item.find({ 'supplier': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.supplier==null) { // No results.
            res.redirect('/catalog/suppliers');
        }
        // Successful, so render.
        res.render('supplier_delete', { title: 'Delete Supplier', supplier: results.supplier, supplier_items: results.suppliers_items });
    });
};


// Handle Supplier delete on POST.
exports.supplier_delete_post = function(req, res, next) {

    async.parallel({
        supplier(callback) {
            Supplier.findById(req.body.supplierid).exec(callback)
        },
        suppliers_items(callback) {
          Item.find({ 'supplier': req.body.supplierid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.suppliers_items.length > 0) {
            // supplier has items. Render in same way as for GET route.
            res.render('supplier_delete', { title: 'Delete Supplier', supplier: results.supplier, supplier_items: results.supplier_items });
            return;
        }
        else {
            // Supplier has no items. Delete object and redirect to the list of suppliers.
            Supplier.findByIdAndRemove(req.body.supplierid, function deleteSupplier(err) {
                if (err) { return next(err); }
                // Success - go to supplier list
                res.redirect('/catalog/suppliers')
            })
        }
    });
};


// Display Supplier update form on GET.
exports.supplier_update_get = function(req, res, next) {


    async.parallel({
        supplier(callback) {
            Supplier.findById(req.params.id).exec(callback)
      },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.supplier==null) { // No results.
                var err = new Error('Supplier not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('supplier_form', { title: 'Update Supplier', supplier: results.supplier });
        });
  
  };
  
  // Handle Supplier update on POST.
  exports.supplier_update_post = [
  
    // Validate and sanitize fields.
    body("name", "Supplier name required").trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
        // Extract the validation errors from a request.
        const errors = validationResult(req);
  
        // Create a Supplier object with escaped/trimmed data and old id.
        var supplier = new Supplier(
          { name: req.body.name,
            phone: req.body.phone,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });
  
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
  
            // Get all suppliers and suppliers for form.
            async.parallel({
                suppliers(callback) {
                    Supplier.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
  
                // Mark our selected suppliers as checked.
                res.render('supplier_form', { title: 'Update Supplier', suppliers: results.suppliers });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Supplier.findByIdAndUpdate(req.params.id, supplier, {}, function (err,thesupplier) {
                if (err) { return next(err); }
                   // Successful - redirect to supplier detail page.
                   res.redirect(thesupplier.url);
                });
        }
    }
  ];