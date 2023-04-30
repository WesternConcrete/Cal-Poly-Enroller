import bs4 as bs
import requests
import enum
import re


COURSE_INFO_RE = re.compile(r"([A-Z]+)\s+(\d+)\. (.*)$")

class Term(enum.Enum):
    Fall = 'F'
    Winter = 'W'
    Spring = 'SP'
    Summer = 'SU'
    ToBeDetermined = 'TBD'

    def __repr__(self):
        return self.value

URL = "https://catalog.calpoly.edu/coursesaz/csc/"

soup = bs.BeautifulSoup(requests.get(URL).text, "html.parser")
courses = soup.findAll(class_="courseblock")
for course in courses:
    title_block = course.find(class_="courseblocktitle")
    units_str = title_block.strong.span.text.strip()
    title_str = title_block.strong.text.replace(units_str, "").strip()
    major, num, name = re.match(COURSE_INFO_RE, title_str).groups()
    
    units_num = re.sub(" units?", "", units_str)
    units = None
    if '-' in units_num:
        start,end = units_num.split('-')
        units = range(int(start), int(end))
    else:
        units = int(units_num)
    
    info_block = course.find(class_="courseextendedwrap")
    terms = []
    for info_field in info_block.findAll("p"):
        field_text = info_field.text.strip()
        if "Typically Offered" in field_text:
            terms_offered = field_text.replace("Term Typically Offered: ", "").split(', ')
            for term in Term.__members__.values():
                if term.value in terms_offered:
                    terms.append(term)
        # TODO: "catolog:" field specifying the requirements it fulfills
        # TODO: "CR/NC" field

    print(f"{major=} {num=} {units=} {name=} {terms=}")
