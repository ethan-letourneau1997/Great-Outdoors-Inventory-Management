var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SupplierSchema = new Schema(
    {
       name: {type: String, required: true, maxLength: 100},
        phone: {type: String},
        address: {type: String},       
    }
);

// Virtual for supplier's URL
SupplierSchema
.virtual('url')
.get(function() {
    return '/catalog/supplier/' + this._id;
});

module.exports = mongoose.model('Supplier', SupplierSchema);