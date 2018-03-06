const Xray = require('x-ray');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const url = require('url');

const csvWriter = createCsvWriter({
    path: './flavorwest.csv',
    header: [
        {id: 'name', title: 'name'},
        {id: 'vendor', title: 'vendor'},
        {id: 'vendor_url', title: 'vendor_url'},
    ]
});

var x = Xray({
    filters: {
      strip: function (value) {
        return typeof value === 'string' ? value.replace(/^\s+|\s+$/g, '') : value
      },
      urlToVendor: (value) => {
        return url.parse(value).hostname.replace('.com', '');
      }
    }
  });

var promises = [];
var flavors = [];

const urls = [
    'http://flavorwest.com/index.php/water-soluble-flavoring.html',
    'http://flavorwest.com/index.php/natural-flavoring.html'
]

urls.forEach((url)=>{
    promises.push(new Promise((resolve, reject) => {
        x(url, '.item', [{
            name: '.item-title | strip',
            vendor_url: '.item-title a@href',
            vendor: '.item-title a@href | urlToVendor',
            }])(function(err,data){
                flavors = flavors.concat(data);
                resolve();
            })
    }))
})

Promise.all(promises)
.then(function(data){

    // Sanity Check
    flavors = flavors.filter(flavor => flavor && !!flavor.name)

    // Remove twist caps
    flavors = flavors.filter(flavor => !flavor.name.includes('0-Twist-Open Dispens'))

    csvWriter.writeRecords(flavors)
    .then(() => {
        console.log('...Done');
    });

})
