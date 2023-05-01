import cheerio from "cheerio";

// select from the following
const SFTF_RE = /\s*Select( one sequence)? from the following.*/;
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
// Note that or conditions can occur OUTSIDE of a sftf block in which case we check the in_sftf
// flag and or the element together with the previous element

async function scrape_degree_requirements(page) {
    const $ = cheerio.load(page);
    const tables = $("table.sc_courselist");
    tables.each((_ti, table) => {
        const table_desc = $(table).prevAll().filter("h2").first().text();
        console.log(table_desc);

        const data = {};
        var cur_section = null;
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
                if (cur_section && data[cur_section]) {
                    console.log(
                        cur_section,
                        "=",
                        JSON.stringify(data[cur_section], null, 2)
                    );
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
                } else if (comment.includes("or")) {
                    if (!in_sftf) {
                        console.error(
                            "Found an \"or\" row outside of 'Select from the following' block. There's even more variations :/"
                        );
                        break;
                    }
                    sftf_sep = "or";
                    prev_was_or = true;
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
}

// NOTE: this URL is scrape-able
const BS_CSC_REQUIREMENTS_URL =
    "https://catalog.calpoly.edu/collegesandprograms/collegeofengineering/computersciencesoftwareengineering/bscomputerscience/";

const page = await fetch(BS_CSC_REQUIREMENTS_URL).then((res) => res.text());
scrape_degree_requirements(page);
