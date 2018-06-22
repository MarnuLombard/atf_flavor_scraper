const Xray = require('x-ray');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const url = require('url');

const csvWriter = createCsvWriter({
    path: './flavorwest.csv',
    header: [
        {id: 'name', title: 'name'},
        {id: 'vendor', title: 'vendor'},
        {id: 'specific_gravity', title: 'specific_gravity'},
        {id: 'vendor_url', title: 'vendor_url'},
    ]
});

const PG_GRAVITY = 1.036;

var x = Xray({
    filters: {
      strip: function (value) {
        return typeof value === 'string' ? value.replace(/^\s+|\s+$/g, '') : value
      },
      vendor: (value) => {
        return url.parse(value).hostname.replace('.com', '');
      }
    }
  });

var promises = [];
var subPromises = [];
var flavors = [];

const urls = [
    'http://flavorwest.com/index.php/water-soluble-flavoring.html',
    'http://flavorwest.com/index.php/natural-flavoring.html'
]

urls.forEach((url) => {
    promises.push(new Promise((resolve, reject) => {
        x(url, '.item', [{
            name: '.item-title | strip',
            vendor_url: '.item-title a@href',
            vendor: '.item-title a@href | vendor',
            }])(function(err,data){
                flavors = flavors.concat(data);
                resolve();
            })
    }))
})

Promise.all(promises)
.then(() => {
	// Sanity Check
	flavors = flavors.filter(flavor => flavor && !!flavor.name)

	// Remove twist caps
	flavors = flavors.filter(flavor => !flavor.name.includes('0-Twist-Open Dispens'))

	flavors.forEach((flavor, index) => {
		subPromises.push(new Promise((resolve, reject) => {
			x(flavor.vendor_url, '#product_tabs_description_tabbed_contents', '.std')(
				(err, data) => {

					let gravity = data.match(/Specific Gravity: ([.0-9])*/i);

					flavor.specific_gravity = gravity // Will be null if no match is returned
						? gravity[0].replace('Specific Gravity: ', '')
						: PG_GRAVITY;

					flavors[index] = flavor;

					resolve();
				});
			})
		);
	});

	Promise.all(subPromises)
		.then(() => {
			csvWriter.writeRecords(flavors)
				.then(() => {
					console.log('...Done');
				});
		});
});
