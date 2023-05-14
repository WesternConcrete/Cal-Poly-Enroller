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

const SubjectCodeSchema = z.string().regex(/[A-Z]+/);
const SubjectSchema = z.object({
    subject: z.string(),
    code: SubjectCodeSchema,
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

function toTitleCase(str) {
    return str
        .toLowerCase()
        .split(" ")
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
}

const BACHELOR_DEGREE_KINDS = ["BA", "BFA", "BS", "BArch", "BLA"] as const;

const BACHELOR_DEGREE_KIND_NAMES = Object.freeze({
    BA: "Bachelor of Arts",
    BFA: "Bachelor of Fine Arts",
    BS: "Bachelor of Science",
    BArch: "Bachelor of Architecture",
    BLA: "Bachelor of Landscape Architecture",
});

const RequirementTypeSchema = z.enum([
    "major",
    "tech",
    "ge",
    "support",
    "free",
]);
type RequirementType = z.infer<typeof RequirementTypeSchema>;
const RequirementCollection = z.enum(["or", "and"]);
const BaseRequirementSchema = z.string();
const RequirementSchema = BaseRequirementSchema.or(
    z.record(RequirementCollection, z.array(z.lazy(() => RequirementSchema)))
);
const RequirementTypeListSchema = z.record(
    RequirementTypeSchema,
    z.array(RequirementSchema)
);

const DegreeSchema = z.object({
    name: z.string(),
    kind: z.enum(BACHELOR_DEGREE_KINDS),
    link: z.string().url(),
    requirements: RequirementTypeListSchema,
});
type Degree = z.infer<typeof DegreeSchema>;
const DegreeWORequirementsSchema = DegreeSchema.omit({ requirements: true });
type DegreeWithoutRequirements = z.infer<typeof DegreeWORequirementsSchema>;

const scrapeDegreeRequirements = async (
    degreeWOReqs: DegreeWithoutRequirements
) => {
    // select from the following
    // If we're in a sftf block the courses are in one of the following formats:
    // a)
    // [course]
    // or [course]
    // or [course]
    // ... until row not starting with "or"
    //
    // b)
    // [course]
    // or
    // [course]
    // or
    // ... until there are two [course] rows not separated by "or" row
    //
    // c)
    // [course]
    // [course]
    // [course]
    // ... until another sftf block or areaheader block (because y tf not)
    //
    // To differentiate these cases the in_sftf flag signifies if we're in a
    // stft block and the sftf_sep is either "or" (for cases a or b) or null (for case c)
    //
    // Note that or conditions can occur OUTSIDE of a sftf block in which
    // case we get our FOURTH and (hopefullly) final option:
    // d)
    // [course]
    // or [course]
    const SFTF_RE = /\s*Select( one sequence)? from the following.*/;

    const degree: Degree = { ...degreeWOReqs, requirements: {} };
    const $ = cheerio.load(await fetch(degree.link).then((res) => res.text()));

    const tables = $("table.sc_courselist");
    tables.each((_ti, table) => {
        const table_desc = $(table).prevAll().filter("h2").first().text();
        if (table_desc !== "Degree Requirements and Curriculum") {
            console.warn("Parsing table of unrecognized kind:", table_desc);
        }

        const data = {};
        var cur_section: string | null = null;
        // within a select from the following block
        // see comment at top of file which explains these flags
        var in_sftf = false;
        var sftf_sep = null;
        var prev_was_or = false;
        const rows = $(table).find("tr");
        for (let i = 0; i < rows.length; i++) {
            const tr = rows[i];
            // TODO: extracting <sup>1</sup> footnote tags

            if ($(tr).hasClass("areaheader")) {
                if (cur_section) {
                    let cur_section_kind: RequirementType;
                    if (
                        cur_section.includes("MAJOR COURSES") ||
                        cur_section.includes("Technical Electives") ||
                        cur_section.includes("GENERAL EDUCATION") ||
                        cur_section.includes("SUPPORT COURSES")
                    ) {
                        cur_section_kind = toTitleCase(
                            cur_section
                        ) as RequirementType;
                    } else {
                        cur_section_kind = cur_section as RequirementType;
                        // console.log("Unrecognized section kind for", cur_section);
                    }
                    degree.requirements[cur_section_kind] =
                        data[cur_section] ?? [];
                }
                in_sftf = false;
                prev_was_or = false;
                sftf_sep = null;
                // new section
                cur_section = $(tr).text().trim();
                data[cur_section] = [];
                if (!cur_section) {
                    console.error("no text in header:", $(tr));
                    break;
                }
            } else if ($(tr).find("span.courselistcomment").length > 0) {
                const comment = $(tr)
                    .find("span.courselistcomment")
                    .text()
                    .trim();
                if (comment.match(SFTF_RE)) {
                    in_sftf = true;
                    data[cur_section].push({ or: [] });
                    sftf_sep = null;
                } else if (comment === "or") {
                    if (!in_sftf) {
                        console.warn(
                            "Found an \"or\" row outside of 'Select from the following' block. There's even more variations :/",
                            "in", degree.name, "(",degree.link, ")",comment
                        );
                        break;
                    }
                    sftf_sep = "or";
                    prev_was_or = true;
                } else {
                    console.error("unrecognized comment:", comment)
                }
            } else {
                var course = $(tr).find("td.codecol a[title]");
                const is_and = course.length > 1;
                if (is_and) {
                    // course is actually courses plural
                    // make sure it's actually an '&' of the courses
                    if (!$(tr).find("span.blockindent").text().includes("&")) {
                        console.error(
                            "multiple elements found but no & to be found in:",
                            $(tr)
                        );
                    }
                    let course_titles = [];
                    $(course).each((_i, c) =>
                        course_titles.push($(c).text().trim())
                    );
                    course = { and: course_titles };
                } else if (course.length !== 1) {
                    if ($(tr).hasClass("listsum")) {
                        continue;
                    }
                    // TODO: handle sections with references to other information on page
                    console.log(
                        "no title for:",
                        $(tr).find("td.codecol").text().trim()
                    );
                }
                if (!is_and && course.length === 1) {
                    course = course.text().trim();
                }
                const has_orclass = $(tr).hasClass("orclass");
                const last = data[cur_section].length - 1;

                if (in_sftf) {
                    const last_or = data[cur_section][last].or;
                    if (last_or.length === 0) {
                        last_or.push(course);
                    } else if (last_or.length >= 1) {
                        if (last_or.length === 1 && has_orclass) {
                            sftf_sep = "or";
                        }
                        if (has_orclass || prev_was_or || sftf_sep == null) {
                            data[cur_section][last].or.push(course);
                        } else {
                            in_sftf = false;
                            sftf_sep = null;
                        }
                    }
                    prev_was_or = false;
                }
                if (!in_sftf && has_orclass) {
                    // TODO: assert data.cur.last is not or already
                    // (multiple or's chained togehter outside of sftf)
                    data[cur_section][last] = {
                        or: [data[cur_section][last], course],
                    };
                } else if (!in_sftf) {
                    // Normal row
                    data[cur_section].push(course);
                }
            }
        }
        // TODO: Parse GE table
        // (returning false prevents it from being parsed by ending the iteration)
        return false;
    });
    return degree;
};

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
            degrees.push(
                DegreeWORequirementsSchema.parse({ name, kind, link })
            );
        });
    return degrees;
};

(async () => {
    const degrees = await scrapeDegrees();
    const requirements = await Promise.all(
        degrees.map(scrapeDegreeRequirements)
    );
    // console.log(requirements);
})();
