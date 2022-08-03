var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100},
        supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true},
        description: {type: String},
        price: {type: Number, required: true},
        stock:{type: Number},
        category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true}],
        image: {type: String},
    });

// Virtual for item's URL
ItemSchema
.virtual('url')
.get(function() {
    return '/catalog/item/' + this._id;
});

module.exports = mongoose.model('Item', ItemSchema);