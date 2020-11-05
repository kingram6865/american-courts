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
      volume: source
    }

    // console.log(`${x.outerHTML}`)
    let tester = (x.getElementsByTagName('a').length > 0) ? x : "<p></p>"
    // console.log(`${tester.outerHTML}`)
    
    if (/_v\./.test(tester.outerHTML)) {
      // console.log(tester.outerHTML)
      // console.log("Data")
      counter++
      record.case_name = x.textContent;
      // if (counter > 24 && counter < 30){
      //   console.log(" ")
      //   console.log(`[${counter}] ${x.outerHTML}`)  
      //   console.log(" ")
      // } 
        // console.log(`[${counter}] ${JSON.stringify(record)}`)
      

      if (tester.getElementsByTagName('a')) {
        [...tester.getElementsByTagName('a')].forEach(item => {
          // console.log(`[${counter}][${item.outerHTML}] ${item.getAttribute('href')}`)
          if (item.hasAttribute('href')){
            // console.log(`[${counter}] ${item.getAttribute('href')}`)
            record.case_links.push(`${url_prefix}${item.getAttribute('href')}`)
          }

          if (item.hasAttribute('title')){
            // console.log(`[${counter}] ${item.getAttribute('href')}`)
            record.href_note = item.getAttribute('title')
          }
          // (item.hasAttribute('href')) ? record.case_links.push(item.getAttribute('href')) : null
          // (item.getAttribute('title')) ? record.href_note = item.getAttribute('title') : null        
        })

        console.log(record)
      }

    //   console.log(`[tester]: ${tester.outerHTML}`)
    //   console.log("==============")
    //   const children = x.getElementsByTagName('a')
    //   record.case_name = x.textContent
      
    //   if (children.length > 1) {
    //     record.case_links = [ ...children ].map(item => `${url_prefix}${item.getAttribute('href')}`)
    //   } else {
    //     record.case_links.push(url_prefix + x.getElementsByTagName('a')[0].getAttribute('href'))
    //   }

    //   // console.log(record.case_name)
    //   // insertData(record)
    // } else {
    //   console.log(`[branch 2] ${x.outerHTML}`)
    }
  }

  // console.log(`Counter says there are ${counter} case references to process across ${files.length} Volumes`)
}

// function processData(input) {
//   let rawdata = fs.readFileSync(input)
//   let wiki = JSON.parse(rawdata)

//   metadata.title = wiki.parse['title']
//   metadata.externallinks = wiki.parse['externallinks']

//   proccessHTML(wiki.parse['text'], wiki.parse['title'])
// }

function processData(input) {
  // let rawdata = fs.readFileSync(input)
  let data = ''
  let readStream = fs.createReadStream(input,'utf8')

  readStream.on('data', (chunk) => {
    data += chunk
  }).on('end', () => {
    // console.log(JSON.parse(data))
    let wiki = JSON.parse(data)
    // console.log(wiki)
    metadata.title = wiki.parse['title']
    metadata.externallinks = wiki.parse['externallinks']
    // console.log(metadata.title)
    // console.log(wiki.parse['text'])
    // console.log(`Processing ${input} data`)
    proccessHTML(wiki.parse['text'], wiki.parse['title'])
    // console.log("========================")
  })

  // let wiki = JSON.parse(rawdata)

  // metadata.title = wiki.parse['title']
  // metadata.externallinks = wiki.parse['externallinks']

  // proccessHTML(wiki.parse['text'], wiki.parse['title'])
}




function insertData(data) {
  // const input = data.map
  // const conn = mysql.createConnection(datasource)
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

execute()
// processData(files[0])
// files.forEach(item => console.log(`processData(${item})`))
files.sort
console.log(`Processing ${files.length} files.`)
files.forEach(item => {
  // console.log(`Sending ${item} to be processed ==========`)
  processData(item)
  // console.log("=============================")
})
// files.forEach(item => console.log(item))
// console.log(counter)