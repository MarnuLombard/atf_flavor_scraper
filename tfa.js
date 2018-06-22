const GRAMS_PER_POUND = 453.592;
const MILILITRES_PER_GALLON = 3785.41;


const Xray = require('x-ray');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const url = require('url');

const csvWriter = createCsvWriter({
	path: './tfa.csv',
	header: [
		{id: 'name', title: 'name'},
		{id: 'vendor', title: 'vendor'},
		{id: 'specific_gravity', title: 'specific_gravity'},
		{id: 'vendor_url', title: 'vendor_url'},
	]
});


let x = Xray();
x('https://dribbble.com', 'li.group', [{
	title: '.dribbble-img strong',
	image: '.dribbble-img [data-src]@data-src',
}])
	.paginate('.next_page@href')
	.limit(3)
	.then(function (res) {
		console.log(res[0]) // prints first result
	})
	.catch(function (err) {
		console.log(err) // handle error in promise
	})

//
// x(
// 	'https://shop.perfumersapprentice.com/specsheetlist.aspx',
// 	'tr td:first-child',
// 	[{name:'a', vendor_url:'a@href'}]
// )((res) => {
// 	console.log(res);
// }).then(
// 	(res) => {
// 		console.log(res);
// 	}
// )
