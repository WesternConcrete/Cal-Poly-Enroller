import assert from "assert";
import * as cheerio from "cheerio/lib/slim";

const DOMAIN = "https://catalog.calpoly.edu";

const scrapeCollegesAndDepartments = async () => {
    const URL = DOMAIN + "/collegesanddepartments/";
    const page = await fetch(URL).then((res) => res.text());
    const $ = cheerio.load(page);

    const list = $("#textcontainer.page_content");
    const colleges = [];
    list.find("p").each((i, elem) => {
        const collegeName = $(elem).text().trim();
        const collegePath = $(elem).find("a").attr("href");
        assert(collegePath, "collegePath is null");
        const collegeLink = DOMAIN + collegePath;
        const departmentList = [];
        $(elem)
            .next("ul")
            .find("li>a")
            .each((i, elem) => {
                departmentList.push({
                    name: $(elem).text().trim(),
                    link: DOMAIN + $(elem).attr("href"),
                });
            });
        colleges.push({
            name: collegeName,
            link: collegeLink,
            departments: departmentList,
        });
    });
    return colleges;
};

const scrapeSubjects = async () => {
    const subjectRE = /(.+)\s+\(([A-Z ]+)\)/;

    const URL = "https://catalog.calpoly.edu/coursesaz/";
    const $ = cheerio.load(await fetch(URL).then((res) => res.text()));
    const subjects = [];
    $("a.sitemaplink").each((i, elem) => {
        const txt = $(elem).text();
        const [matched, subject, code] = txt.match(subjectRE) ?? [];
        assert(matched, `subject,code not matched: "${txt}"`);
        subjects.push({ subject, code });
    });
    return subjects;
};

const scrapeMajors = async () => {
    const URL = "https://catalog.calpoly.edu/programsaz/";
    const $ = cheerio.load(await fetch(URL).then((res) => res.text()));
    const majorRE = /(.+),\s+(B\w+)/;
    const majors = [];
    $("a[name=bachelordegrees]")
        .nextUntil("a[name=concentrations]")
        .filter("p.plist:has(a[href])") // only <a> with href
        .each((i, elem) => {
            const [matched, name, kind] = $(elem).text().match(majorRE) ?? [];
            assert(matched, `name,degreeKind not matched: "${$(elem).text()}"`);
            const link = DOMAIN + $(elem).find("a").attr("href");
            majors.push({ name, kind, link});
        });
    return majors;
};

(async () => {
    const results = await scrapeMajors();
    console.log(results);
})();
