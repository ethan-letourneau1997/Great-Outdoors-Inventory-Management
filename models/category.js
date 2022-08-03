var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
    {
       name: {type: String, required: true, maxLength: 100}
    }
);

// Virtual for supplier's URL
CategorySchema
.virtual('url')
.get(function() {
    return '/catalog/category/' + this._id;
});

module.exports = mongoose.model('Category', CategorySchema);