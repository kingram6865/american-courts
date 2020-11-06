const directory = './sc' // location of json files containing html to read in
const path = require('path')
const fs = require('fs')
const jsdom = require('jsdom')
const { JSDOM } = jsdom;
const mysql = require('mysql')
const datasource = require('./services/localconfig'); // copy from exampleconfig.js
const files = []
const metadata = {
  title: '',
  externallinks: [],
  cases: []
}
const results = []
const url_prefix = "https://en.wikipedia.org"
let counter = 0

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
      href_note: '',
      case_links: [],
      volume: source.match(/\d+.*$/)
    }

    let tester = (x.getElementsByTagName('a').length > 0) ? x : "<p></p>"
    
    if (/_v\./.test(tester.outerHTML)) {
      counter++
      record.case_name = x.textContent;

      if (tester.getElementsByTagName('a')) {
        [...tester.getElementsByTagName('a')].forEach(item => {

          if (item.hasAttribute('href')){
            record.case_links.push(`${url_prefix}${item.getAttribute('href')}`)
          }

          if (item.hasAttribute('title')){
            record.href_note = item.getAttribute('title')
          }
        })

        // console.log(`[${counter}] ${JSON.stringify(record)}`)
        // if (tester.getElementsByTagName('a').length > 1) {
          insertData(record)
        // }
      }
    }
  }
}

function processData(input) {
  let data = ''
  let readStream = fs.createReadStream(input,'utf8')

  readStream.on('data', (chunk) => {
    data += chunk
  }).on('end', () => {
    let wiki = JSON.parse(data)

    metadata.title = wiki.parse['title']
    metadata.externallinks = wiki.parse['externallinks']

    proccessHTML(wiki.parse['text'], wiki.parse['title'])

  })
}

function insertData(data) {
  const conn = mysql.createConnection(datasource)
  const values = [data.case_name, data.href_note, `${data.case_links}`, data.volume]
  let sql = "INSERT INTO supreme_court (case_name, href_note, url, volume) VALUES (?, ?, ?, ?)";
  //sql = mysql.format(sql,[data.case_name, data.href_note, `${data.case_links}`, data.volume])

  console.log(`Processing #[${counter}] ${data['case_name']}`)
  // conn.query(sql, [values], (error, results, fields) => {
  //       if (error) return error
  //       console.log(JSON.stringify(results.insertId))
  //     })


  return new Promise(async () => {
    await conn.query(sql, values, (error, results, fields) => {
      if (error) return error
      console.log(JSON.stringify(results))
    })
    
    conn.end()
  })


  // sql = mysql.format(sql,[data.case_name, data.href_note, `${data.case_links}`, data.volume])
  // // console.log(sql)
  // conn.query(sql, [data.case_name, data.href_note, `${data.case_links}`, data.volume], (error, results, fields) => {
  //   if (error) return error
  // })


  // console.log(JSON.stringify(data))
  // conn.end()
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

execute()

files.sort
console.log(`Processing ${files.length} files.`)

files.forEach(async (item) => {
  // console.log(`processData(${item})`)
  await processData(item)
})

// for (let i=0; i < files.length; i++){
//   console.log(`processData(${files[i]})`)
// }

// console.log(`processData(${files[1]})`)
// processData(files[0])
// processData(files[1])
// processData(files[2])
