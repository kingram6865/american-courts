const directory = './sc'
const path = require('path')
const fs = require('fs')
const jsdom = require('jsdom')
const { JSDOM } = jsdom;
const files = []
const metadata = {
  title: '',
  externallinks: [],
  cases: []
}
const results = []
const url_prefix = "https://en.wikipedia.org"
/**
 * 
 * If link is red:
 * https://en.wikipedia.org/w/index.php?title=Davison%27s_Lessee_v._Bloomer&action=edit&redlink=1
 * 
 * If link is blue
 * https://en.wikipedia.org/wiki/Respublica_v._De_Longchamps
 * 
 * 
 * 
 */

function processData(input) {
  let rawdata = fs.readFileSync(input)
  let wiki = JSON.parse(rawdata)
  /**
   * title
   * text
   * externallinks
   */
  // console.log(wiki.parse['title'])
  // console.log(wiki.parse['externallinks'])
  metadata.title = wiki.parse['title']
  metadata.externallinks = wiki.parse['externallinks']

  console.log(metadata.title)
  console.log(metadata.externallinks.length)

  proccessHTML(wiki.parse['text'])
}

function proccessHTML(fragment){
  const dom = new JSDOM(fragment["*"])
  const doclist = dom.window.document.getElementsByTagName("a")

  const listitems = dom.window.document.getElementsByTagName('li')
  
  for (let x of listitems) {
    console.log(`${x.getElementsByTagName('a')[0].getAttribute('href')} -- ${x.textContent}`)
  }
/*
  for (let item of doclist) {
    const response = {
      url: '',
      text: ''
    }

    response.text = item.textContent
    response.url = item.href
    results.push(response)
    // console.log(`${item.textContent} __ ${item.innerHTML}`)
  }
*/
}


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

// console.log(files[0])
processData(files[0])

// console.log(results[10])