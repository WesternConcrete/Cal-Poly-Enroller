import cheerio from "cheerio";

const COURSE_INFO_RE = /([A-Z]+)\s+(\d+)\. (.*)$/;

function scrape_department_courses(page) {
    const $ = cheerio.load(page);

    const courses = $(".courseblock");
    courses.each((i, course) => {
        const title_block = $(course).find(".courseblocktitle");
        const units_str = $(title_block).find("strong span").text().trim();
        const title_str = $(title_block)
            .find("strong")
            .text()
            .replace(units_str, "")
            .trim();
        const [_, major, num, name] = title_str.match(COURSE_INFO_RE);
        let units = null;
        const units_num = units_str.replace(" units", "");
        if (units_num.includes("-")) {
            const [start, end] = units_num.split("-").map(Number);
            units = Array.from(
                { length: end - start + 1 },
                (_, i) => i + start
            );
        } else {
            units = parseInt(units_num);
        }
        const info_block = $(course).find(".courseextendedwrap");
        let terms;
        $(info_block)
            .find("p")
            .each((i, info_field) => {
                const field_text = $(info_field).text().trim();
                if (field_text.startsWith("Term Typically Offered:")) {
                    const terms_offered = field_text
                        .replace("Term Typically Offered: ", "")
                        .split(", ");
                    terms = terms_offered;
                }
                // TODO: "catolog:" field specifying the requirements it fulfills
                // TODO: "CR/NC" field
            });
        console.log(
            `department=${major} num=${num} units=${units} name=${name} terms=${terms}`
        );
    });
}

// TEST:
const DEPARTMENT = "csc";
const page = await fetch(
    `https://catalog.calpoly.edu/coursesaz/${DEPARTMENT}/`
).then((res) => res.text());
scrape_department_courses(page);
