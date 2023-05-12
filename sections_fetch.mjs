import assert from "assert";
import cheerio from "cheerio";

const URL =
    "https://cmsweb.pscs.calpoly.edu/psc/CSLOPRD/EMPLOYEE/SA/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL";

const assertNotPageNoLongerAvailable = async (body) => {
    assert(!body.includes("This page is no longer available."));
    return body;
};

const initialFetchHeaders = new Headers();

const initialFetch = await fetch(URL, {
    method: "GET",
    redirect: "manual",
})
    .then((res) => {
        if (res.headers.get("RespondingWithSignOnPage") !== null) {
            throw new Error(
                "RespondingWithSignOnPage - set redirect back to manual instead of follow"
            );
        }
        return res;
    })
    .then((res) => {
        if (res.status === 302) {
            console.log("redirected");
            let cookies = res.headers.get("set-cookie");
            // NOTE: actually going to newURL is not necessary.
            // The only thing stopping us from getting another 302 is the cookies
            let newURL = res.headers.get("location");
            return fetch(newURL, {
                method: "GET",
                headers: { Cookie: cookies },
            });
        } else {
            return res;
        }
    });

const cookies = initialFetch.headers.get("set-cookie");
let ICHiddens = await initialFetch.text().then((page) => {
    const $ = cheerio.load(page);
    let hiddens = $("#win0divPSHIDDENFIELDS").find("input");
    let ics = new Map();
    hiddens.each((i, elem) => {
        ics.set($(elem).attr("name"), $(elem).attr("value"));
    });
    return ics;
});

const headers = new Headers({ Cookie: cookies });
ICHiddens = new URLSearchParams(ICHiddens);
const ICHiddensCopy = new URLSearchParams(ICHiddens);

// select SLCMP as institution
headers.set("Content-Type", "application/x-www-form-urlencoded");
ICHiddens.set("ICAction", "CLASS_SRCH_WRK2_INSTITUTION$31$");
ICHiddens.set("CLASS_SRCH_WRK2_INSTITUTION$31$", "SLCMP");

await fetch(URL, {
    method: "POST",
    headers,
    body: ICHiddens,
})
    .then((res) => res.text())
    .then(assertNotPageNoLongerAvailable)
    .then((page) => {
        const $ = cheerio.load(page);
        assert(
            $("option[value=SLCMP]").attr("selected") === "selected",
            "failed to select SLCMP"
        );
    });

// select current quarter
ICHiddens.set("ICAction", "SLO_SS_DERIVED_STRM");
ICHiddens.set("SLO_SS_DERIVED_STRM", "2234");
await fetch(URL, {
    method: "POST",
    headers,
    body: ICHiddens,
})
    .then((res) => res.text())
    .then(assertNotPageNoLongerAvailable)
    .then((page) => {
        const $ = cheerio.load(page);
        assert(
            $("#SLO_SS_DERIVED_STRM").attr("value") === "2234",
            "failed to change selected term"
        );
    });

// expand extra options
ICHiddens.set("ICAction", "DERIVED_CLSRCH_SSR_EXPAND_COLLAPS$149$$1");
await fetch(URL, {
    method: "POST",
    headers,
    body: ICHiddens,
})
    .then((res) => res.text())
    .then(assertNotPageNoLongerAvailable)
    .then((page) => {
        const $ = cheerio.load(page);
        assert(
            $("#DERIVED_CLSRCH_SSR_EXPAND_COLLAPS\\$149\\$\\$IMG\\$1")
                .attr("src")
                .includes("COLLAPSE_ICN"),
            "extra options not expanded"
        );
    });

// select CS as subject
ICHiddens.set("SSR_CLSRCH_WRK_SUBJECT_SRCH$0", "CSC");

// Show Closed classes as well
ICHiddens.set("SSR_CLSRCH_WRK_SSR_OPEN_ONLY$chk$3", "N");

// select main cal poly campus (hack to get two search criteria)
ICHiddens.set("ICAction", "SSR_CLSRCH_WRK_CAMPUS$14");
ICHiddens.set("SSR_CLSRCH_WRK_CAMPUS$14", "MAIN");
await fetch(URL, {
    method: "POST",
    headers,
    body: ICHiddens,
})
    .then((res) => res.text())
    .then(assertNotPageNoLongerAvailable);
// NOTE: No checking here because I think the option is updated normally in the dom

// execute search
ICHiddens.set("ICAction", "CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH");
const searchResults = await fetch(URL, {
    method: "POST",
    headers,
    body: ICHiddens,
})
    .then((res) => res.text())
    .then(assertNotPageNoLongerAvailable)
    .then((page) => {
        if (page.includes("Your search will return over 50 classes, would you like to continue?")) {
            console.log("over 50 classes found, continuing");
            // TODO: ignore this problem for now and redo the search with a constraint on the course number
            ICHiddensCopy.set("ICAction", "#ICSave");
            ICHiddensCopy.set("ICAJAX", "1");
            ICHiddensCopy.set("ICNAVTYPEDROPDOWN", "0");
            ICHiddensCopy.set("ICBcDomData", "Unknownvalue");
            // ICHiddensCopy.set("ICStateNum", "6");
            // console.log(ICHiddensCopy)
            // console.log(headers.get('Cookie'))
            return fetch(URL, {
                method: "POST",
                headers,
                body: ICHiddensCopy,
            })
                .then((res) => res.text())
                .then(assertNotPageNoLongerAvailable);
        } else {
            // TODO: check for other messages and handle
            return page;
        }
    })
.then((page) => {
        assert(page.includes("Search Results"), "not on search results page");
        return page;
    });
// console.log(searchResults);
// TODO: look into this AppServ link <DIV id='pt_envinfo_win0' Browser='OTHERS/0/WIN' User='SLO_GUEST' DB='CSLOPRD/ORACLE' AppServ='//cslprd400:42005' ToolsRel='8.59.07'></DIV>
// AppServ is a php/apache/mysql server
// ToolsRel is a PeopleSoft/Tools function for formatting the current version
