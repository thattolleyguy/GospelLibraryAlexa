import re
from lxml import html
import requests

page = requests.get('https://www.lds.org/general-conference/topics?lang=eng')
tree = html.fromstring(page.content)
names=tree.xpath('//div[@class="lumen-tile__title"]/a/text()')
reg = re.compile('\s+([\w. ]+)', re.UNICODE)


def cleaner(old): 
   return reg.match(old).group(1)

print("\n".join(map(cleaner, names)))