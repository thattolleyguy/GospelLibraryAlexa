var AWS = require("aws-sdk");

bookInfos = {
    "title page": {
        start: 1,
        fileName: 'title-page',
        prefix: '2013-06-'
    },

    "introduction": {
        start: 2,
        fileName: 'introduction',
        prefix: '2013-06-'
    },

    "testimony of three witnesses": {
        start: 3,
        fileName: 'the-testimony-of-three-witnesses',
        prefix: '2013-06-'
    },
    "testimony of eight witnesses": {
        start: 4,
        fileName: 'the-testimony-of-eight-witnesses',
        prefix: '2013-06-'
    },
    "testimony of the prophet joseph smith": {
        start: 5,
        fileName: 'the-testimony-of-the-prophet-joseph-smith',
        prefix: '2013-06-'
    },
    "a brief explanation": {
        start: 6,
        fileName: 'a-brief-explanation-about-the-book-of-mormon',
        prefix: '2013-06-'
    },
    "order of books": {
        start: 7,
        fileName: 'order-of-books',
        prefix: '2013-06-'
    },
    "1st nephi": {
        start: 8,
        fileName: '1-nephi',
        chapters: 22,
        prefix: '2013-06-',
        pronunciation: "first <phoneme alphabet=\"ipa\" ph=\"ˈniːfaɪ\">nephi</phoneme>"
    },
    "second nephi": {
        start: 31,
        fileName: '2-nephi',
        chapters: 33,
        prefix: '2013-06-',
        pronunciation: "second <phoneme alphabet=\"ipa\" ph=\"ˈniːfaɪ\">nephi</phoneme>"
    },
    "jacob": {
        start: 65,
        fileName: 'jacob',
        chapters: 7,
        prefix: '2013-06-',
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"ˈdʒeɪkəb\">jacob</phoneme>"
    },
    "enos": {
        start: 73,
        fileName: 'enos',
        chapters: 1,
        prefix: '2013-06-',
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"ˈiː.nəs\">enos</phoneme>"
    },
    "jarom": {
        start: 75,
        fileName: 'jarom',
        chapters: 1,
        prefix: '2013-06-',
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"ˈdʒɛr.ʌm\">jarom</phoneme>"
    },
    "omni": {
        start: 77,
        fileName: 'omni',
        chapters: 1,
        prefix: '2013-06-',
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"ˈɑːm.naɪ\">omni</phoneme>"
    },
    "words of mormon": {
        start: 79,
        fileName: 'words-of-mormon',
        chapters: 1,
        prefix: '2013-06-',
        pronunciation: "words of <phoneme alphabet=\"ipa\" ph=\"ˈmɔːrmən\">mormon</phoneme>"
    },
    "mosiah": {
        start: 81,
        fileName: 'mosiah',
        chapters: 29,
        prefix: '2013-06-',
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"moʊˈsaɪ.ə\">mosiah</phoneme>"
    },
    "alma": {
        start: 111,
        fileName: 'alma',
        chapters: 63,
        prefix: '2013-06-',
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"ˈælmə\">alma</phoneme>"
    },
    "helaman": {
        start: 175,
        fileName: 'helaman',
        chapters: 16,
        prefix: '2013-06-',
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"ˈhiːləmən\">helaman</phoneme>"
    },
    "3rd nephi": {
        start: 192,
        fileName: '3-nephi',
        chapters: 30,
        prefix: '2013-06-',
        pronunciation: "third <phoneme alphabet=\"ipa\" ph=\"ˈniːfaɪ\">nephi</phoneme>"
    },
    "4th nephi": {
        start: 223,
        fileName: '4-nephi',
        chapters: 1,
        prefix: '2013-06-',
        pronunciation: "fourth <phoneme alphabet=\"ipa\" ph=\"ˈniːfaɪ\">nephi</phoneme>"
    },
    "mormon": {
        start: 225,
        fileName: 'mormon',
        chapters: 9,
        prefix: '2013-06-',
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"ˈmɔːrmən\">mormon</phoneme>"
    },
    "ether": {
        start: 235,
        fileName: 'ether',
        chapters: 15,
        prefix: '2013-06-',
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"ˈiː.θɜːr\">ether</phoneme>"
    },
    "moroni": {
        start: 251,
        fileName: 'moroni',
        chapters: 10,
        prefix: '2013-06-',
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"mə\ˈroʊnaɪ\">moroni</phoneme>"
    },
    "doctrine and covenants": {
        start: 1,
        fileName: 'section',
        chapters: 138,
        prefix: '2010-08-'
    },
    "moses": {
        start: 1,
        fileName: 'moses',
        chapters: 8,
        prefix: '2010-08-',
        fileNumberPadding: 2,
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"\ˈmoʊzɪz\">moses</phoneme>"
    },
    "abraham": {
        start: 10,
        fileName: 'abraham',
        chapters: 5,
        prefix: '2010-08-',
        fileNumberPadding: 2,
        pronunciation: "<phoneme alphabet=\"ipa\" ph=\"\ˈeɪbrəˌhæm\">abraham</phoneme>"
    },
    "joseph smith matthew": {
        start: 18,
        fileName: 'joseph-smith-matthew',
        prefix: '2010-08-',
        fileNumberPadding: 2
    },
    "joseph smith history": {
        start: 19,
        fileName: 'joseph-smith-history',
        prefix: '2010-08-',
        fileNumberPadding: 2
    },
    "articles of faith": {
        start: 20,
        fileName: 'the-articles-of-faith',
        prefix: '2010-08-',
        fileNumberPadding: 2
    }

};


AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
})

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "GospelLibraryBookInfo";

Object.keys(bookInfos).forEach(function (title) {
    var bookItem = bookInfos[title];
    var params = {
        TableName: table,
        Item: {
            "bookName": title,
            "fileName": bookItem.fileName,
            "prefix": bookItem.prefix,
            "fileNumberPadding": bookItem.fileNumberPadding,
            "start":bookItem.start,
            "chapters":bookItem.chapters,
            "pronunciation":bookItem.pronunciation
        }
    };

    console.log("Adding a new item...");
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });
});