import cheerio from "cheerio";

// select from the following
const SFTF = /\s*Select (one sequence)? from the following.*/;
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
        const rows = $(table).find("tr");
        const push_requirement = (course) => {};
        for (let i = 0; i < rows.length; i++) {
            const tr = rows[i];
            // TODO: extracting <sup>1</sup> footnote tags

            if ($(tr).hasClass("areaheader")) {
                if (cur_section && data[cur_section]) {
                    console.log(cur_section, "=", data[cur_section]);
                }
                // section
                cur_section = $(tr).text().trim();
                data[cur_section] = [];
                if (!cur_section) {
                    console.error("no text in header:", $(tr));
                    break;
                }
            } else if ($(tr).hasClass("orclass")) {
                // TODO:
            } else {
                // Normal row
                const course = $(tr).find("td.codecol a[title]");
                if (course.length > 1) {
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
                    data[cur_section].push({ and: course_titles });
                } else if (course.length === 1) {
                    const title = course.text().trim();
                    data[cur_section].push(title);
                } else {
                    if (
                        $(tr).find("span.courselistcomment").length > 0 ||
                        $(tr).hasClass("listsum")
                    ) {
                        // TODO: handle
                        continue;
                    }
                    console.log(
                        "no title for:",
                        $(tr).find("td.codecol").text().trim()
                    );
                }
            }
        }
        console.log("end");
        // .each((_i, tr) => {
        //     // TODO: extracting <sup>1</sup> footnote tags
        //     if ($(tr).hasClass("areaheader")) {
        //         cur_section = $(tr).text().trim();
        //         if (!cur_section) {
        //             console.error("no text in header:", $(tr));
        //             return false;
        //         }
        //     } else {
        //         // Normal column case
        //     }
        //     if (cur_section && data[cur_section]) {
        //         console.log(data[cur_section]);
        //     }
        // });
        // TODO: don't end iteration after first table
        return false;
    });
}

// NOTE: this URL is scrape-able
const BS_CSC_REQUIREMENTS_URL =
    "https://catalog.calpoly.edu/collegesandprograms/collegeofengineering/computersciencesoftwareengineering/bscomputerscience/";

const page = await fetch(BS_CSC_REQUIREMENTS_URL).then((res) => res.text());
scrape_degree_requirements(page);
