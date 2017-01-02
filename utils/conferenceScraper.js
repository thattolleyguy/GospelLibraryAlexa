var request = require('request');
let cheerio = require('cheerio');
var regex = /\([0-9]+\)/;
var fs = require('fs');

function scrapeTalks(path, filename){
    var url = 'https://www.lds.org'+path;
    request(url, function(error,response,body){
        // console.log("Url "+url+" scraped");
        let $ = cheerio.load(body);
        var items = new Set();
        $('div.lumen-tile__title').each(function(index,element){
            items.add(element.children[0].data.trim().toLowerCase()+"\n")
        })
        items.forEach(function(value){
            fs.appendFile(filename,value , 'utf8');
            
        })
    })
};

function scrape(url, filename, shouldScrapeTalks =false){
    request(url, function(error, response, body){
        if(!error && response.statusCode == 200)
        {
            let $ = cheerio.load(body);
            var items=new Set();
            fs.truncate(filename);
            var groupUrls=[];
            $('div.lumen-tile__title > a').each(function(index, element){            
                items.add(element.children[0].data.trim().replace(regex,'')+'\n');
                groupUrls.push(element.attribs['href']);

            });
            items.forEach(function(speaker){
                fs.appendFile(filename,speaker, 'utf8');
            })

            if(shouldScrapeTalks)
            {
                fs.truncate("talks.txt")
                groupUrls.forEach(function(value,index){
                    scrapeTalks(value,"talks.txt");
                })
            }

            
        }
    });
};

scrape('https://www.lds.org/general-conference/speakers?lang=eng','speakers.txt',true);
scrape('https://www.lds.org/general-conference/topics?lang=eng','topics.txt');