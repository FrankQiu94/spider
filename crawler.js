const fs = require('fs')
const http = require('http')
const request = require('request')
const cheerio = require('cheerio')
const xlsx = require('node-xlsx')
const url = 'http://saishi.zgzcw.com/soccer/league/2'
const infoUrl = 'http://saishi.zgzcw.com/summary/liansaiAjax.action'
let tableHead = []
let datas = []
// let resultInfo = [{
//   time:
//   home:
//   score:
//   away:
//   halfScore:
//   Handicap:
//   data:
// }]


http.get(url, (res) => {
  let html = ''
  res.setEncoding('utf-8')
  res.on('data', (chunk) => {
    html += chunk
  })
  res.on('end', () => {
    let $ = cheerio.load(html)
    const ths = $('#matchInfo').children('table').eq(0).find('th')
    ths.each((index, th) => {
      tableHead.push($(th).text())
    })
    datas.push(tableHead)
    const ems = $('.luncib').children('em')
    ems.each((index, em) => {
      freshInfo($(em).text())
    })
    // const buffer = xlsx.build([{ name: "scoreSheet", data: datas }]);
    // fs.writeFile("RESULT.csv", buffer, () => {
    //   console.log('文件输出完毕！')
    // });
  })
})

function freshInfo(CR) {
  request.post({
      url: infoUrl,
      form: {
        source_league_id: '2',
        currentRound: CR,
        season: '2016-2017',
        seasonType: ''
      }
    }, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        let pageHTML = '' 
        pageHTML += body
        let $c = cheerio.load(pageHTML)
        let trs = $c('.zstab').find('tr')
        for (let i = 1; i < trs.length; i++) {
          let dataOne = []
          let tds = $c(trs[i]).children('td')
          tds.each((i, tdEle) => {
            dataOne.push($c(tdEle).text().trim())
          })
          datas.push(dataOne)
        }
        if(datas.length > 28) {
          const buffer = xlsx.build([{ name: "scoreSheet", data: datas }]);
          fs.writeFile("RESULT2017.csv", buffer, () => {
            console.log('文件输出完毕！')
          });
        }
      }
    }
  )
}
