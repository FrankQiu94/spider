const http = require('http');
const fs = require('fs');
const cheerio = require('cheerio');
let i = 0;
let str = '';
let addressInfo = [];
let end = '';
let page = 0;
const url = 'http://www.fuyaotang.com/a110000';

function fetchPage(x) {
  startRequest(x);
};

function startRequest(x) {
  http.get(x, (res) => {
    let html = '';
    res.setEncoding('utf-8');
    res.on('data', (chunk) => {
      html += chunk;
    });
    res.on('end', () => {
      let $ = cheerio.load(html);
      let infoArray = $('div.related a');
      infoArray.each((index, item) => {
        addressInfo.push({
          storeName: infoArray.eq(index).children('h3').text().trim(),
          address: infoArray.eq(index).children('p').eq(0).text().trim(),
          telNum: infoArray.eq(index).children('p').eq(-1).text().trim(),
          id: i += 1
        });
      });
      // console.log(addressInfo);
      end = $('div.list a').eq(-2).attr('href');
      end = end.substr(end.length - 2).replace(/[_]/g, "");
      let newxtLink = `http://www.fuyaotang.com/${$('div.list a').eq(-2).attr('href')}`;
      str = encodeURI(newxtLink);
      if(page < end) {
        page += 1;
        fetchPage(str);
      } else {
        saveContent($, addressInfo);
      }
    });
  }).on('error', (err) => {
    console.log(err);
  })
}

function saveContent($, data) {
  let storeName = '',
      address = '',
      telNum = '';
  data.forEach((item, index) => {
      storeName += data[index].storeName + '\r\n';
      address += data[index].address + '\r\n';
      telNum += data[index].telNum + '\r\n';
  });
  fs.appendFile('./data/' + $('.filtertag').find('.cur').text().trim() + '_店铺.txt', storeName, 'utf-8', (err) => {
    if (err) {
      console.log(err)
    }
  })
  fs.appendFile('./data/' + $('.filtertag').find('.cur').text().trim() + '_地址.txt', address, 'utf-8', (err) => {
    if (err) {
      console.log(err)
    }
  })
  fs.appendFile('./data/' + $('.filtertag').find('.cur').text().trim() + '_电话.txt', telNum, 'utf-8', (err) => {
    if (err) {
      console.log(err)
    }
  })
};

fetchPage(url);
