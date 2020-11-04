const directory = './sc'
const path = require('path')
const fs = require('fs')
const jsdom = require('jsdom')
const { JSDOM } = jsdom;
const mysql = require('mysql')
const datasource = require('./services/config')
const files = []
const metadata = {
  title: '',
  externallinks: [],
  cases: []
}
const results = []
const url_prefix = "https://en.wikipedia.org"

/**
 * If link is red:
 * https://en.wikipedia.org/w/index.php?title=Davison%27s_Lessee_v._Bloomer&action=edit&redlink=1
 * 
 * If link is blue
 * https://en.wikipedia.org/wiki/Respublica_v._De_Longchamps
 */



function proccessHTML(fragment, source){
  const dom = new JSDOM(fragment["*"])
  const listitems = dom.window.document.getElementsByTagName('li')
  
  for (let x of listitems) {
    const record = {
      case_name: '',
      case_links: [],
      volume: source
    }

    let tester = x.getElementsByTagName('a')[0].getAttribute('href')

    if (/_v\./.test(tester)) {
      const children = x.getElementsByTagName('a')
      // record.case_links = x.getElementsByTagName('a').map((item, index) => item[index].getAttribute('href'))
      record.case_name = x.textContent
      
      if (children.length > 1) {
        record.case_links = [ ...children ].map(item => `${url_prefix}${item.getAttribute('href')}`)
      } else {
        record.case_links.push(url_prefix + x.getElementsByTagName('a')[0].getAttribute('href'))
      }

      insertData(record)

      // if (anchors === 2){
      //   record.case_name = x.textContent
      //   record.case_links.push(url_prefix + x.getElementsByTagName('a')[0].getAttribute('href'))
      //   record.case_links.push(url_prefix + x.getElementsByTagName('a')[1].getAttribute('href'))
      //   // console.log(`${x.getElementsByTagName('a')[0].getAttribute('href')} -- ${x.getElementsByTagName('a')[1].getAttribute('href')} -- ${x.textContent}`)
      // // console.log(JSON.stringify(record))
      // } else if (anchors === 3) {
      //   record.case_name = x.textContent
      //   record.case_links.push(url_prefix + x.getElementsByTagName('a')[0].getAttribute('href'))
      //   record.case_links.push(url_prefix + x.getElementsByTagName('a')[1].getAttribute('href'))
      //   record.case_links.push(url_prefix + x.getElementsByTagName('a')[2].getAttribute('href'))
      //   // console.log(`${x.getElementsByTagName('a')[0].getAttribute('href')} -- ${x.getElementsByTagName('a')[1].getAttribute('href')} -- ${x.getElementsByTagName('a')[2].getAttribute('href')} -- ${x.textContent}`)
      // // console.log(JSON.stringify(record))
      // } else {
      //   record.case_name = x.textContent
      //   record.case_links.push(url_prefix + x.getElementsByTagName('a')[0].getAttribute('href'))
      //   // console.log(`${x.getElementsByTagName('a')[0].getAttribute('href')} -- ${x.textContent}`)
      // // console.log(JSON.stringify(record))
      // insertData(record)
      // }

      // console.log(JSON.stringify(record))
      // results.push(record)
    }
    // console.log(JSON.stringify(record))
    // console.log(`${x.getElementsByTagName('a')[0].getAttribute('href')} -- ${x.getElementsByTagName('a')[1].getAttribute('href')} -- ${x.textContent}`)
    // console.log(x.getElementsByTagName('a').length)
  }

  // console.log(`Results list size: ${results.length}`)
}

function processData(input) {
  let rawdata = fs.readFileSync(input)
  let wiki = JSON.parse(rawdata)

  metadata.title = wiki.parse['title']
  metadata.externallinks = wiki.parse['externallinks']

  proccessHTML(wiki.parse['text'], wiki.parse['title'])
}

function insertData(data) {
  // const input = data.map
  const conn = mysql.createConnection(datasource)
  let sql = "INSERT INTO supreme_court (case_name, url, volume) VALUES ?,?";
  // async conn.query(sql, )
  console.log(data)
}



// =================================
function execute() {
  fs.readdirSync(directory).forEach(file => {
    if (fs.lstatSync(path.resolve(directory, file)).isDirectory()) {
      console.log(`Directory: ${file}`)
    } else {
      // console.log(`File: ${file}`)
      // processData(`${directory}/${file}`)
      // console.log(`${directory}/${file}`)
      files.push(`${directory}/${file}`)
    }
  })
}
// console.log(files[0])
execute()
processData(files[0])