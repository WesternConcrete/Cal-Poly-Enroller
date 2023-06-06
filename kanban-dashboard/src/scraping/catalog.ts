import { PrismaClient, Requirement } from "@prisma/client";
import assert from "assert";
import { constants } from "buffer";
import * as cheerio from "cheerio/lib/slim";
import fetchRetry from "fetch-retry";
const fetch = fetchRetry(global.fetch)
import { z } from "zod";

const DOMAIN = "https://catalog.calpoly.edu";

export const DepartmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  link: z.string().url(),
});
export type Department = z.infer<typeof DepartmentSchema>;

const CollegeSchema = z.object({
  name: z.string(),
  link: z.string().url(),
  departments: z.array(DepartmentSchema),
});
export type College = z.infer<typeof CollegeSchema>;

export const scrapeCollegesAndDepartments = async () => {
  const URL = DOMAIN + "/collegesanddepartments/";
  const page = await fetch(URL).then((res) => res.text());
  const $ = cheerio.load(page);

  const list = $("#textcontainer.page_content");
  const colleges: College[] = [];
  list.find("p").each((_i, elem) => {
    const collegeName = $(elem).text().trim();
    const collegePath = $(elem).find("a").attr("href");
    assert(collegePath, "collegePath is null");
    const collegeLink = DOMAIN + collegePath;
    const departmentList: z.infer<typeof DepartmentSchema>[] = [];
    $(elem)
      .next("ul")
      .find("li>a")
      .each((_i, elem) => {
        const link = DOMAIN + $(elem).attr("href");
        const id = link
          .split("/")
          .findLast((s) => s.length > 0 && !s.startsWith("#"));
        departmentList.push(
          DepartmentSchema.parse({
            name: $(elem).text().trim(),
            link,
            id,
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

export const BACHELOR_DEGREE_KINDS = [
  "BA",
  "BFA",
  "BS",
  "BArch",
  "BLA",
] as const;

export const BACHELOR_DEGREE_KIND_NAMES = Object.freeze({
  BA: "Bachelor of Arts",
  BFA: "Bachelor of Fine Arts",
  BS: "Bachelor of Science",
  BArch: "Bachelor of Architecture",
  BLA: "Bachelor of Landscape Architecture",
});

export const RequirementTypeSchema = z.enum([
  "major",
  "elective",
  "ge",
  "support",
]);
export type RequirementType = z.infer<typeof RequirementTypeSchema>;

const stripCrosslistInfoFromCourseCode = (courseCode: string) => {
  const match = courseCode.match(/([A-Z]+)(?:\/[A-Z]+)*\s+(\d+)(?:\s+\d+)*/);
  if (!match)
    throw new Error(
      `course code: ${courseCode} did not match the course code regex`
    );
  const [_, code, num] = match;
  courseCode = code + " " + num;
  if (!courseCode.match(/^[A-Z]+\s\d+$/))
    throw new Error(
      `resulting course code: ${courseCode} from stripping crosslist info is not a valid course code`
    );
  return courseCode;
};

// NOTE: it is expected that information from crosslistings can be parsed in subject course
// lists and handled properly when using degree course requirements
const CourseCodeSchema = z.string().transform(stripCrosslistInfoFromCourseCode); // .regex(/^[A-Z]+\s\d+$/);

type CourseCode = z.infer<typeof CourseCodeSchema>;
type RequirementGroupList = (RequirementGroup | CourseCode)[];
type RequirementGroupKind = "or" | "and";
type RequirementGroup =
  | { or: RequirementGroupList }
  | { and: RequirementGroupList };

export const RequirementGroupSchema: z.ZodType<RequirementGroup> = z.lazy(() =>
  z.union([
    z.object({ or: z.array(RequirementGroupSchema.or(CourseCodeSchema)) }),
    z.object({ and: z.array(RequirementGroupSchema.or(CourseCodeSchema)) }),
  ])
);

// TODO: decide whether this is usefull
// export const RequirementSchema = z.object({
//   kind: RequirementTypeSchema.or(z.string()),
//   fulfilledBy:
//
// });

export const RequirementCourseSchema = z.object({
  kind: RequirementTypeSchema.or(z.string()),
  code: CourseCodeSchema,
  units: z.number(),
  title: z.string(),
});

export type RequirementCourse = z.infer<typeof RequirementCourseSchema>;

export const DegreeSchema = z.object({
  name: z.string(),
  kind: z.enum(BACHELOR_DEGREE_KINDS),
  link: z.string().url(),
  id: z.string(),
  departmentId: z.string(),
});

export type Degree = z.infer<typeof DegreeSchema>;

const GEAreaCodeRE = /[ABCDEF][1234]/;
const GEDivisionCodeRE = /(Upper|Lower)-Division [ABCDEF]( Elective)?/;
const GeAreaRE = /Area [ABCDEF]( Elective)?/;
const GESubAreaVariant = z.union([
  z.string().regex(GEAreaCodeRE),
  z.string().regex(GEDivisionCodeRE),
  z.string().regex(GeAreaRE),
]);

const GeRequirementSchema = z.object({
  code: z
    .string()
    .regex(GEAreaCodeRE)
    .or(z.string().regex(GEDivisionCodeRE))
    .or(z.string().regex(GeAreaRE))
    .or(z.null()),
  units: z.number().nonnegative(),
  // TODO: constraints (C1 or C2) / fullfilled by (B3 = lab w/ B1 or B2 course)
});

type GeRequirement = z.infer<typeof GeRequirementSchema>;

export const DegreeRequirementsSchema = z.object({
  degreeId: DegreeSchema.shape.id,
  groups: z.array(RequirementGroupSchema),
  courses: z.map(z.string(), RequirementCourseSchema),
  ge: z.array(GeRequirementSchema),
});

export type DegreeRequirements = z.infer<typeof DegreeRequirementsSchema>;

const parseMajorCourseRequirementsTable = (
  $: cheerio.CheerioAPI,
  table: cheerio.Element,
  degree: Degree
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
  /// mapping of course code to meta information about the course (such as whether it is a support/major/etc)
  const courses = new Map();
  // TODO:
  const groups: RequirementGroup[] = [];
  const SFTF_RE = /\s*Select( one sequence)? from the following.*/;

  let curRequirementKind: string | null = null;
  // within a select from the following block
  // see comment at top of file which explains these flags
  let in_sftf = false;
  let sftf_sep = null;
  let prev_was_or = false;
  const rows = $(table).find("tr");
  for (let i = 0; i < rows.length; i++) {
    const tr = rows[i];
    // TODO: extracting <sup>1</sup> footnote tags

    if ($(tr).hasClass("areaheader")) {
      in_sftf = false;
      prev_was_or = false;
      sftf_sep = null;
      // new section
      const sectionTitle = $(tr).text().trim();
      if (sectionTitle.includes("MAJOR COURSES")) {
        curRequirementKind = "major";
      } else if (sectionTitle.includes("Electives")) {
        // FIXME: include the type of elective
        curRequirementKind = "elective";
      } else if (sectionTitle.includes("GENERAL EDUCATION")) {
        curRequirementKind = "ge";
      } else if (sectionTitle.includes("SUPPORT COURSES")) {
        curRequirementKind = "support";
      } else {
        curRequirementKind = sectionTitle as RequirementType;
        console.log("Unrecognized section kind:", sectionTitle);
      }
      if (!curRequirementKind) {
        console.error("no text in header:", $(tr));
        break;
      }
    } else if ($(tr).find("span.courselistcomment").length > 0) {
      const comment = $(tr).find("span.courselistcomment").text().trim();
      if (comment.match(SFTF_RE)) {
        in_sftf = true;
        groups.push({ or: [] });
        sftf_sep = null;
      } else if (comment === "or") {
        if (!in_sftf) {
          console.warn(
            "Found an \"or\" row outside of 'Select from the following' block. There's even more variations :/",
            "in",
            degree.name,
            "(",
            degree.link,
            ")",
            comment
          );
          break;
        }
        sftf_sep = "or";
        prev_was_or = true;
      } else if (!comment.match(/\(?[Ss](ee|elect).*below.?\)?$/)) {
        console.error("unrecognized comment:", comment);
      }
    } else {
      const course_elem = $(tr).find("td.codecol a[title]");
      let course: any; // TODO: type this
      const isAndGroup = course_elem.length > 1;
      if (isAndGroup) {
        // course is actually courses plural
        // make sure it's actually an '&' of the courses
        if (!$(tr).find("span.blockindent").text().includes("&")) {
          console.error(
            "multiple elements found but no & to be found in:",
            $(tr)
          );
        }
        const course_codes: string[] = [];
        $(course_elem).each((_i, c) => {
          course_codes.push($(c).text().trim());
        });
        const course_titles: string[] = [];
        const titles = $(tr).find("td:not([class])");
        $(titles)
          .contents()
          .each((i: number, t) => {
            if (t.type === "text" && i === 0) {
              course_titles.push($(t).text().trim());
            } else if (t.type === "tag" && t.name === "span") {
              course_titles.push($(t).text().trim().replace(/^and /, ""));
            }
          });
        if (course_codes.length !== course_titles.length) {
          console.warn(
            "found different length code,title lists in and block:",
            { course_titles, course_codes },
            "in",
            degree.name
          );
        } else if (course_titles.length === 0) {
          console.warn("didnt find any titles for course list:", course_codes);
        } else {
          course_codes.map((code, i) => {
            courses.set(code, {
              kind: curRequirementKind,
              code,
              title: course_titles[i],
              units: 0, // TODO: total units
            });
          });
        }

        course = { and: course_codes };
      } else if (course_elem.length !== 1) {
        if ($(tr).hasClass("listsum")) {
          continue;
        }
        // TODO: handle sections with references to other information on page
        console.log("no title for:", $(tr).find("td.codecol").text().trim());
      }
      if (!isAndGroup && course_elem.length === 1) {
        course = course_elem.text().trim();
      }
      const has_orclass = $(tr).hasClass("orclass");
      const last = groups.length - 1;

      if (in_sftf) {
        const last_or = groups[last].or;
        if (last_or.length === 0) {
          last_or.push(course);
        } else if (last_or.length >= 1) {
          if (last_or.length === 1 && has_orclass) {
            sftf_sep = "or";
          }
          if (has_orclass || prev_was_or || sftf_sep == null) {
            groups[last].or.push(course);
          } else {
            in_sftf = false;
            sftf_sep = null;
          }
        }
        prev_was_or = false;
      } else if (has_orclass) {
        // TODO: assert data.cur.last is not or already
        // (multiple or's chained togehter outside of sftf)
        if (groups[last].or) {
          groups[last].or.push(course);
        } else {
          groups[last] = {
            or: [groups[last], course],
          };
        }
      } else if (!in_sftf) {
        // Normal row
        groups.push(course);
      }
      if (!course.and) {
        const title = $(tr).find("td:not([class])").text().trim();
        // TODO: more accurate units when in or/and block
        const unitsStr = $(tr).find("td.hourscol").text().trim() || 0;
        const units = parseInt(unitsStr);
        const code = course;
        const courseObj = RequirementCourseSchema.parse({
          kind: curRequirementKind,
          title,
          units,
          code,
        });
        courses.set(code, courseObj);
      }
    }
  }
  courses.forEach((code, { kind }) => {
    if (["support", "elective"].includes(kind) && !!groups.find(code)) {
      console.error("/////", kind, code, "not in or/and group");
    }
  });
  return { courses, groups };
};

const parseGeCourseRequirementsTable = (
  $: cheerio.CheerioAPI,
  table: cheerio.Element
) => {
  // FIXME: parse ge "constraints" (C1 or C2, three different prefixes, etc)
  const requirements: GeRequirement[] = $(table)
    .find("tr")
    .filter(":not(:is(.areaheader,.listsum))")
    .map((_i, tr) => {
      const label = $(tr).find("td").first().text();
      let units = parseInt($(tr).find("td.hourscol").text().trim());
      if (isNaN(units)) {
        let cSubjectPrefixesWarningStr =
          "Lower-division courses in Area C must come from three different subject prefixes.";
        if (label.includes(cSubjectPrefixesWarningStr)) {
          return null;
        }
      }
      let [code] = label.match(GEAreaCodeRE) ??
        label.match(GeAreaRE) ??
        label.match(GEDivisionCodeRE) ??
        label.match(/^[ABCDEF]/) ?? [null];
      if (code === undefined) {
        if (label.includes("Select courses from two different areas")) {
          return null;
        } else if (label.includes("GE Electives")) {
          code = null;
          console.log(label);
          console.assert(isNaN(units), "electives does not have NaN units");
        } else {
          console.error("unrecognized ge:", label);
          return null;
        }
      }
      if (isNaN(units)) {
        units = 0;
        const rowText = $(tr).text();
        const b3OneLabWarningStr =
          "One lab taken with either a B1 or B2 course";
        const twoAreasWarning = "Select courses from two different areas";
        if (!rowText.includes(twoAreasWarning) && code !== "B3") {
          console.error("could not determine why units for:", label, "was NaN");
        }
      }
      return { code, units };
    })
    .get()
    .filter((req) => !!req);
  return requirements;
};

export const scrapeDegreeRequirements = async (degree: Degree) => {
  const $ = cheerio.load(await fetch(degree.link).then((res) => res.text()));
  let requirements: DegreeRequirements = {} as DegreeRequirements;

  // TODO: Parse footers (sc_footnotes)
  const tables = $("table.sc_courselist");

  tables.each((_ti, table) => {
    // page has flat structure and this is a way to find the previous h2 element (prevUntil is exclusive)
    const titleElem = $(table).prevUntil("h2").last().prev();
    const title = $(titleElem).text().trim();
    if (title === "Degree Requirements and Curriculum") {
      const { courses, groups } = parseMajorCourseRequirementsTable(
        $,
        table,
        degree
      );
      requirements.courses = courses;
      requirements.groups = groups;
    } else if (title === "General Education (GE) Requirements") {
      requirements.ge = parseGeCourseRequirementsTable($, table);
    } else {
      console.warn("Unrecognized table with title:", title);
    }
  });

  // TODO: check for correctness by counting the units and comparing to the degree's unit count
  // could keep total units count in groups and check against stated unit totals

  return requirements;
};

export const scrapeDegrees = async () => {
  const URL = "https://catalog.calpoly.edu/programsaz/";
  const $ = cheerio.load(await fetch(URL).then((res) => res.text()));
  const majorRE = /(.+),\s+(B\w+)/;
  const degrees: Degree[] = [];
  $("a[name=bachelordegrees]")
    .nextUntil("a[name=concentrations]")
    .filter("p.plist:has(a[href])") // only <a> with href
    .each((i, elem) => {
      const [_matched, name, kind] = $(elem).text().match(majorRE) ?? [];
      const link = DOMAIN + $(elem).find("a").attr("href");
      const linkSegments = link
        .split("/")
        .filter((s) => s.length > 0 && !s.startsWith("#"));
      const id = linkSegments.at(-1);
      const departmentId = linkSegments.at(-2);
      degrees.push(DegreeSchema.parse({ name, kind, link, id, departmentId }));
    });
  return degrees;
};

// const TermSchema = z.enum(["F", "W", "SP", "SU", "TBD"]);

const CourseSchema = z.object({
  code: CourseCodeSchema,
  title: z.string(),
  // subjectCode: z.string(),
  number: z.number(),
  description: z.string(),
  // TODO: turn termsTypicallyOffered into bitmask based on 2,4,6,8 term codes
  termsTypicallyOffered: z.string(), // z.array(TermSchema),
  // if not range minUnits is maxUnits
  minUnits: z.number(),
  maxUnits: z.number(),
});

type Course = z.infer<typeof CourseSchema>;

export const scrapeSubjectCourses = async (subjectCode: string) => {
  const COURSE_INFO_RE = /(([A-Z]+)\s+(\d+))\. (.*?)\.?$/;
  const URL = `https://catalog.calpoly.edu/coursesaz/${subjectCode.toLowerCase()}/`;
  const $ = cheerio.load(await fetch(URL).then((res) => res.text()));

  const courses = $(".courseblock");
  const scrapedCourses: Course[] = [];
  courses.each((i, course) => {
    const title_block = $(course).find(".courseblocktitle");
    const units_str = $(title_block).find("strong span").text().trim();
    let minUnits = 0,
      maxUnits = 0;
    const units_num = units_str.replace(" units", "");
    if (units_num.includes("-")) {
      [minUnits, maxUnits] = units_num.split("-").map(Number);
    } else {
      let units = parseInt(units_num);
      minUnits = units;
      maxUnits = units;
    }
    let [_, code, subjectCode, numStr, title] =
      $(title_block)
        .find("strong")
        .text()
        .replace(units_str, "")
        .trim()
        .match(COURSE_INFO_RE) ?? [];
    const number = parseInt(numStr);
    const info_block = $(course).find(".courseextendedwrap");
    let termsTypicallyOffered = null;
    $(info_block)
      .find("p")
      .each((i, info_field) => {
        const field_text = $(info_field).text().trim();
        if (field_text.startsWith("Term Typically Offered:")) {
          // normalize terms offered list so it is in csv format without extra spaces
          termsTypicallyOffered = field_text
            .replace("Term Typically Offered: ", "")
            .split(/, ?/)
            .join(",");
        }
        // TODO: "catolog:" field specifying the requirements it fulfills
        // TODO: prerequisite field
        // TODO: "CR/NC" field
        // TODO: crosslisted as (+ field in db schema)
      });
    const description = $(course).find(".courseblockdesc").text().trim();
    scrapedCourses.push(
      CourseSchema.parse({
        number,
        code,
        title,
        termsTypicallyOffered,
        minUnits,
        maxUnits,
        description,
      })
    );
  });
  return scrapedCourses;
};

export const SubjectSchema = z.object({
  name: z.string(),
  code: CourseCodeSchema,
});

export type Subject = z.infer<typeof SubjectSchema>;

export const scrapeSubjects = async () => {
  // TODO: scrape ge areas, gwr, uscp, etc from same page
  const subjectRE = /(.+)\s+\(([A-Z ]+)\)/;

  const URL = "https://catalog.calpoly.edu/coursesaz/";
  const $ = cheerio.load(await fetch(URL).then((res) => res.text()));
  const subjects: Subject[] = [];
  $("a.sitemaplink").each((_i, elem) => {
    const txt = $(elem).text();
    const [_matched, name, code] = txt.match(subjectRE) ?? [];
    subjects.push(SubjectSchema.parse({ name, code }));
  });
  return subjects;
};

const GEAreasEnum = z.enum(["A", "B", "C", "D", "E", "F", "ELECTIVES", "USCP"]);

const GESubAreaSchema = z
  .object({
    constraints: z.array(z.string()).default([]),
    name: z.string().nullable().default(null),
    fullfilledBy: z.array(CourseCodeSchema).default([]),
    description: z.string().nullable().default(null),
  })
  .default({});

type GESubArea = z.infer<typeof GESubAreaSchema>;

const GEAreaSchema = z
  .object({
    name: z.string().default(""),
    constraints: z.array(z.string()).default([]),
    subareas: z.record(GESubAreaVariant, GESubAreaSchema).default({}),
    fullfilledBy: z.array(CourseCodeSchema).default([]),
  })
  .default({});

type GEArea = z.infer<typeof GEAreaSchema>;

export const GEDataSchema = z.map(GEAreasEnum, GEAreaSchema);
type GEData = z.infer<typeof GEDataSchema>;

/** Returns courses that fulfill ge requirements for each area */
export const scrapeCourseGEFullfillments = async () => {
  const url =
    "https://catalog.calpoly.edu/generalrequirementsbachelorsdegree/#GE-Requirements";
  const $ = await fetch(url)
    .then((res) => res.text())
    .then(cheerio.load);
  // TODO: use high-unit/standard info for verification against major ge requirement scraping

  const sections: GEData = new Map();
  const areaTables = $("table.tbl_transfercredits").filter(
    (_i, table) =>
      // do not include info tables that are adjacent to sc_courselist tables
      $(table).next(":not(.sc_courselist)").length > 0 &&
      $(table).prev(":not(.sc_courselist)").length > 0
  );
  areaTables.each((_i, table) => {
    const info: GEArea = GEAreaSchema.parse({});
    const tbody = $(table).find("tbody");
    let areaLabel = $(tbody)
      .find("tr.firstrow")
      .find("td.column0")
      .first()
      .text()
      .trim();
    let area: z.infer<typeof GEAreasEnum>;
    if (areaLabel.includes("GE ELECTIVES")) {
      info.name = areaLabel;
      area = "ELECTIVES";
      // TODO: include limit info (only area B C D)
    } else {
      let match = areaLabel.match(/\(AREA ([ABCDEF])\)/);
      if (!match)
        throw new Error(
          "unrecognized ge area label for section: ".concat(areaLabel)
        );
      area = GEAreasEnum.parse(match[1]);
      areaLabel = areaLabel.replace(match[0], "").trim();
      info.name = areaLabel;
    }

    $(tbody)
      .find("tr:not(.firstrow)")
      .find("td.column0")
      .get()
      .map((labelElement) => $(labelElement).text().trim())
      .filter((label) => {
        return !!label && !["Unit Sub-total", "GE TOTAL"].includes(label);
      })
      .forEach((label) => {
        let match;
        let subarea;
        let subareaInfo: GESubArea = GESubAreaSchema.parse({});
        if (
          (match = label.match(
            /(?:-?(Writing Intensive))|(?:\s-\s((?:[\w \d,;-]|\(Standard\))+))/
          ))
        ) {
          let subconstraint = match[1] ?? match[2];
          if (match[1]) subareaInfo.constraints.push(subconstraint);
          label = label.replace(match[0], "").replace("()", "").trim();
          // still push the label at the end
          match = undefined;
        }
        if ((match = label.match(new RegExp(`\\((${area}([1234])?)\\)`)))) {
          let [matched, _subarea, num] = match;
          label = label.replace(matched, "").replace(/1$/, "").trim();
          if (num) {
            subarea = _subarea;
            subareaInfo.description = label;
          }
        }
        if (
          (match = label.match(
            /((?:Upper|Lower)-Division) [A-F]( Elective)?s?/
          ))
        ) {
          let [matched, _subarea, elective] = match;
          _subarea += elective ?? "";
          subarea = _subarea;
          label = label.replace(matched, "").trim();
          subareaInfo.description = label ?? null;
        }
        if ((match = label.match(/(Area [A-F] Elective)/))) {
          subarea = "Elective";
        }
        if (!subarea) {
          info.constraints.push(label);
          if (subareaInfo.constraints.length > 0) {
            console.warn(
              "adding subconstraints:",
              subareaInfo.constraints,
              "to area:",
              area,
              "because no subarea was found"
            );
          }
          return;
        }
        info.subareas[subarea] = subareaInfo;
      });
    sections.set(area, info);
  });
  const courseTables = $("table.sc_courselist:not(div#uscptextcontainer *)");

  courseTables.each((_i, table) => {
    const headerElement = $(table)
      .prev("table.sc_sctable")
      .find("tbody")
      .find("tr.lastrow")
      .find("td.column0")
      .get();

    const headerInfo = headerElement.map((e) => $(e).text().trim());
    let [title, ...meta] = headerInfo;
    const commentHeader = $(table)
      .find("tr.firstrow span.courselistcomment.areaheader")
      .first()
      .text()
      .trim();
    if (commentHeader && commentHeader !== "") title = commentHeader;
    console.log("title:", title);
    // title = commentHeader;
    // TODO: updating title when "td>div.courselistcomment" is encountered
    // TODO: parsing "ge" from title

    const courses = z.array(CourseCodeSchema).parse(
      $(table)
        .find("td.codecol")
        .map((_i, codeCol) => $(codeCol).text().trim())
        .get()
    );
    if (!title) {
      console.error("found courses for table with no title", { courses });
      return;
    }
    let match;
    if (title.includes("GE ELECTIVES")) {
      sections.get("ELECTIVES")!.fullfilledBy = courses;
    } else if ((match = title.match(/((?:Upper|Lower)-Division) ([A-F])/))) {
      const [_, division, area] = match;
      const subarea = sections.get(area)!.subareas[division];
      if (!subarea) {
        console.warn(
          "creating new found subarea:",
          division,
          "for",
          area,
          "because it was found in the course list"
        );
        sections.get(area)!.subareas[division] = GESubAreaSchema.parse({
          fulfilledBy: courses,
        });
      } else subarea.fullfilledBy = courses;
    } else if ((match = title.match(/(([A-F])[1-4])/))) {
      const [_, subarea, area] = match;
      sections.get(area)!.subareas[subarea].fullfilledBy = courses;
    if (subarea === "B2" || subarea === "B1") {
        const b3courses = $(table)
          .find('td:contains("& B3")')
          .map((_i, b3desc) => $(b3desc).prev().text().trim())
          .get();
        const b3 = sections.get(area)!.subareas.B3
        b3.fullfilledBy = b3.fullfilledBy ?? [];
        b3.fullfilledBy.push(...b3courses);
      }
    }
    // FIXME: (B2 & B3)

    // sections.set(ge.ge, ge);
  });
  const uscpCourses = $("div#uscptextcontainer table.sc_courselist")
    .first()
    .find("td.codecol")
    .map((_i, codeCol) => $(codeCol).text().trim())
    .get();
  sections.set("USCP", GEAreaSchema.parse({ fullfilledBy: uscpCourses }));

  // return Array.from(sections.values());
  return sections;
};
