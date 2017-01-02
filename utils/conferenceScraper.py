import re
from lxml import html
import requests

reg = re.compile('\s+([\w. ]+)', re.UNICODE)

def cleaner(old): 
   return reg.match(old).group(1)


def scrape(url, filename, scrapeTalkNames):
    page = requests.get(url)
    tree = html.fromstring(page.content)
    names=tree.xpath('//div[@class="lumen-tile__title"]/a/text()')

    target = open(filename, 'w')
    target.truncate()
    target.write("\n".join(set(map(cleaner, names))).encode("UTF-8"))
    target.close()
    if scrapeTalkNames:
        print(tree.xpath('//div[@class="lumen-tile__title"]/a'))

scrape('https://www.lds.org/general-conference/topics?lang=eng', 'topics.txt',True)
scrape('https://www.lds.org/general-conference/speakers?lang=eng','speakers.txt',False)