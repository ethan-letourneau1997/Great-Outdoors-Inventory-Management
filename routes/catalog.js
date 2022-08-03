var express = require('express');
var router = express.Router();

// Require controller modules.
var item_controller = require('../controllers/itemController');
var supplier_controller = require('../controllers/supplierController');
var category_controller = require('../controllers/categoryController');



/// ITEM ROUTES ///

// GET catalog home page.
router.get('/', item_controller.index);

// GET request for creating a Item. NOTE This must come before routes that display Item (uses id).
router.get('/item/create', item_controller.item_create_get);

// POST request for creating Item.
router.post('/item/create', item_controller.item_create_post);

// GET request to delete Item.
router.get('/item/:id/delete', item_controller.item_delete_get);

// POST request to delete Item.
router.post('/item/:id/delete', item_controller.item_delete_post);

// GET request to update Item.
router.get('/item/:id/update', item_controller.item_update_get);

// POST request to update Item.
router.post('/item/:id/update', item_controller.item_update_post);

// GET request for one Item.
router.get('/item/:id', item_controller.item_detail);

// GET request for list of all Item items.
router.get('/items', item_controller.item_list);

/// SUPPLIER ROUTES ///

// GET request for creating Supplier. NOTE This must come before route for id (i.e. display supplier).
router.get('/supplier/create', supplier_controller.supplier_create_get);

// POST request for creating Supplier.
router.post('/supplier/create', supplier_controller.supplier_create_post);

// GET request to delete Supplier.
router.get('/supplier/:id/delete', supplier_controller.supplier_delete_get);

// POST request to delete Supplier.
router.post('/supplier/:id/delete', supplier_controller.supplier_delete_post);

// GET request to update Supplier.
router.get('/supplier/:id/update', supplier_controller.supplier_update_get);

// POST request to update Supplier.
router.post('/supplier/:id/update', supplier_controller.supplier_update_post);

// GET request for one Supplier.
router.get('/supplier/:id', supplier_controller.supplier_detail);

// GET request for list of all Suppliers.
router.get('/suppliers', supplier_controller.supplier_list);

/// CATEGORY ROUTES ///

// GET request for creating a Category. NOTE This must come before route that displays Category (uses id).
router.get('/category/create', category_controller.category_create_get);

//POST request for creating Category.
router.post('/category/create', category_controller.category_create_post);

// GET request to delete Category.
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST request to delete Category.
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET request to update Category.
router.get('/category/:id/update', category_controller.category_update_get);

// POST request to update Category.
router.post('/category/:id/update', category_controller.category_update_post);

// GET request for one Category.
router.get('/category/:id', category_controller.category_detail);

// GET request for list of all Category.
router.get('/categories', category_controller.category_list);

module.exports = router;

