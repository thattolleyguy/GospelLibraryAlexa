// mormon_channel.js
// A library for access to the 'scripture' APIs from tech.lds.org
// Uses promises, Ramda functional programming library

// The Book of Mormon is scriptureID=3, so try this:
//    var MC = require('mormon_channel')
//    MC.getBooks(3).then(u => console.log(JSON.Stringify(u, undefined, 2))

var R = require('ramda')

// wrap HTTP.get in a Promise
var get = function(url){
  console.log(url)
  return new Promise((resolve, reject) => {
    var z = HTTP.get(url, (y) => {
          if (y.statusCode > 299) {reject(new Error(`Response ${y.statusCode}`))}
          var reply = []
          y.on("data", d => reply.push(d))
          y.on("end", () => resolve(reply.join('')))
    })
    z.on('error', reject )
  })
}

var action = (a,b) => `http://tech.lds.org/radio?action=${a}&format=json&apiversion=2.0`
// LanguageId -> ScriptureInfos
exports.getScriptures = (a) => {
  return get(action("lds.radio.scriptures.query")+`&languageID=${a||1}`)
    .then(JSON.parse)
    .then(R.prop('scriptures.results'))
    .then(R.prop('scriptures'))
}
// ScriptureId -> BookInfos
exports.getBooks = (a) => {
  return get(action("lds.radio.scriptures.books.query")+`&scriptureID=${a}`)
    .then(JSON.parse)
    .then(R.prop('scriptures.books.results'))
    .then(R.prop('books'))
}
// BookId -> ChapterInfos
exports.getChapters = (a) => {
  return get(action("lds.radio.scriptures.books.chapters.query")+`&bookID=${a}`)
    .then(JSON.parse)
    .then(R.prop('scriptures.books.chapters.results'))
}

// Given a BookId and a list of books (BookInfos)
// Returns the next book info from the list
// OR the first one if it runs of the end of the list
// BookId -> (BookInfos -> BookInfo)
var nextBook = bookId => books => {
  var first = R.head(books)
  var found = R.dropWhile(bk => bk.ID !== bookId, books)
  var after = R.compose(R.head, R.tail)(found)
  if (after !== undefined) {
    return Promise.resolve(after)
  } else {
    return Promise.resolve(first)
  }
}

// ScriptureId -> BookId -> BookInfo
exports.bookAfter = (scripture, bookId) => {
  return exports.getBooks(scripture)
    .then(R.prop('book'))
    .then(nextBook(bookId))
}

// Same as above but with the list reversed
// so you get the previous book
// ScriptureId -> BookId -> BookInfo
exports.bookBefore = (scripture, bookId) => {
  return exports.getBooks(scripture)
    .then(R.prop('book'))
    .then(R.reverse)
    .then(nextBook(bookId))
}

// I get IPA from Wikipedia.
// exports.wrapIpa("jarom", exports.guide.jarom)
// plaintext -> ipa -> SSML_phoneme_element
var wrapIpa = exports.wrapIpa =
  (a,b) => `<phoneme alphabet='ipa' ph='${b}'>${a}</phoneme>`
// pronunciation guide
var guide = exports.guide = {
  alma: "ˈælmə"
  , enos: "ˈiː.nəs"
  , jarom: "ˈdʒɛr.ʌm"
  , nephi: "ˈniːfaɪ"
}
