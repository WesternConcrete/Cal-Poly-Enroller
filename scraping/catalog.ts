import assert from "assert";
import * as cheerio from "cheerio/lib/slim";
import { z } from "zod";

const DOMAIN = "https://catalog.calpoly.edu";

const DepartmentSchema = z.object({
    name: z.string(),
    link: z.string().url(),
});
type Department = z.infer<typeof DepartmentSchema>;

const CollegeSchema = z.object({
    name: z.string(),
    link: z.string().url(),
    departments: z.array(DepartmentSchema),
});
type College = z.infer<typeof CollegeSchema>;

const scrapeCollegesAndDepartments = async () => {
    const URL = DOMAIN + "/collegesanddepartments/";
    const page = await fetch(URL).then((res) => res.text());
    const $ = cheerio.load(page);

    const list = $("#textcontainer.page_content");
    const colleges: College[] = [];
    list.find("p").each((i, elem) => {
        const collegeName = $(elem).text().trim();
        const collegePath = $(elem).find("a").attr("href");
        assert(collegePath, "collegePath is null");
        const collegeLink = DOMAIN + collegePath;
        const departmentList: z.infer<typeof DepartmentSchema>[] = [];
        $(elem)
            .next("ul")
            .find("li>a")
            .each((i, elem) => {
                departmentList.push(
                    DepartmentSchema.parse({
                        name: $(elem).text().trim(),
                        link: DOMAIN + $(elem).attr("href"),
                    })
                );
            });
        colleges.push(
            CollegeSchema.parse({
                name: collegeName,
                link: collegeLink,
                departments: departmentList,
            })
        );
    });
    return colleges;
};

const SubjectSchema = z.object({
    subject: z.string(),
    code: z.string().regex(/[A-Z]+/),
});
type Subject = z.infer<typeof SubjectSchema>;

const scrapeSubjects = async () => {
    const subjectRE = /(.+)\s+\(([A-Z ]+)\)/;

    const URL = "https://catalog.calpoly.edu/coursesaz/";
    const $ = cheerio.load(await fetch(URL).then((res) => res.text()));
    const subjects: Subject[] = [];
    $("a.sitemaplink").each((i, elem) => {
        const txt = $(elem).text();
        const [matched, subject, code] = txt.match(subjectRE) ?? [];
        subjects.push(SubjectSchema.parse({ subject, code }));
    });
    return subjects;
};

const BACHELOR_DEGREE_KINDS = Object.freeze({
    BA: "Bachelor of Arts",
    BFA: "Bachelor of Fine Arts",
    BS: "Bachelor of Science",
    BArch: "Bachelor of Architecture",
    BLA: "Bachelor of Landscape Architecture",
});

const DegreeSchema = z.object({
    name: z.string(),
    kind: z.enum(Object.keys(BACHELOR_DEGREE_KINDS)),
    link: z.string().url(),
});
type Degree = z.infer<typeof DegreeSchema>;

const scrapeDegrees = async () => {
    const URL = "https://catalog.calpoly.edu/programsaz/";
    const $ = cheerio.load(await fetch(URL).then((res) => res.text()));
    const majorRE = /(.+),\s+(B\w+)/;
    const degrees: Degree[] = [];
    $("a[name=bachelordegrees]")
        .nextUntil("a[name=concentrations]")
        .filter("p.plist:has(a[href])") // only <a> with href
        .each((i, elem) => {
            const [matched, name, kind] = $(elem).text().match(majorRE) ?? [];
            const link = DOMAIN + $(elem).find("a").attr("href");
            degrees.push(DegreeSchema.parse({ name, kind, link }));
        });
    return degrees;
};

(async () => {
    const results = await scrapeDegrees();
    console.log(results);
})();
