const DOMAIN = "https://polyflowbuilder.duncanapple.io";

const getSCookie = async () => {
    return fetch(DOMAIN).then(
        (res) => res.headers.get("set-cookie").split(";")[0]
    );
};

const createHeaders = (s) => {
    const headers = new Headers();
    // encode cookies properly
    headers.append("Cookie", s);
    return headers;
};

const login = async (s) => {
    require("dotenv").config();
    const email = process.env.POLYFLOWBUILDER_EMAIL;
    const password = process.env.POLYFLOWBUILDER_PWORD;

    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    const headers = createHeaders(s);
    headers.set("Content-Type", "application/x-www-form-urlencoded");

    return fetch(DOMAIN + "/login", {
        method: "POST",
        body: formData,
        headers,
    }).then((res) => console.assert(res.status === 200, "Login failed"));
};

const getFlow = async (catologYear, major) => {
    const s = await getSCookie();

    await login(s);

    const headers = createHeaders(s);
    headers.set("Content-Type", "application/json");

    const defaultFlow = await fetch(DOMAIN + "/api/util/getDefaultFlow", {
        method: "POST",
        headers,
        body: JSON.stringify({
            flowCatalogYear: catologYear,
            flowMajor: major,
            flowConcentration: "",
            options: { fgoRemoveGE: false },
        }),
        redirect: "follow",
    });
    // assert defaultFLow response content type is json
    if (defaultFlow.headers.get("content-type").includes("html")) {
        console.log("sent back html");
    } else if (defaultFlow.headers.get("content-type").includes("json")) {
        console.log(await defaultFlow.json());
    }
};

const fetchAllOptions = async () => {
    const s = await getSCookie();
    const headers = createHeaders(s);
    await login(s);

    return fetch(DOMAIN + "/api/data/getAvailableFlowchartMetadata", {
        method: "GET",
        headers,
    });
};

(async () => {
    // await getFlow("2021-2022", "52CSCBSU");
    await fetchAllOptions()
        .then((res) => res.json())
        .then(console.log);
})();
