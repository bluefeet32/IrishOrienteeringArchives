function capitalizeFirstLetter(str) {
    // Check if the input string is not empty
    if (str.length === 0) {
        return str;
    }

    // Capitalize the first character and concatenate it with the rest of the string
    return str.charAt(0).toUpperCase() + str.slice(1);
}





const SPRINT = "sprint";
const MIDDLE = "middle";
const LONG = "long";
const RELAY = "relay";

const OVERALL_COURSE = "overall";
const INDIVIDUAL_COURSE = "individual";
const INDIVIDUAL_FOREST_COURSE = "individual forest";
const FOREST_COURSE = "forest";


const EVENT_COURSES = [
    SPRINT, MIDDLE, LONG, RELAY
];

const RANKING_COURSES = [
    OVERALL_COURSE,
    INDIVIDUAL_COURSE,
    INDIVIDUAL_FOREST_COURSE,
    FOREST_COURSE,
];

const COURSE_SORT_ORDER = {
    [SPRINT]: 0,
    [MIDDLE]: 1,
    [LONG]: 2,
    [RELAY]: 3,
    [OVERALL_COURSE]: 4,
    [INDIVIDUAL_COURSE]: 5,
    [INDIVIDUAL_FOREST_COURSE]: 6,
    [FOREST_COURSE]: 7,
};


/**
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function sortCourses(a, b) {
    return (COURSE_SORT_ORDER[a] ?? Number.MAX_VALUE) - (COURSE_SORT_ORDER[b] ?? Number.MAX_VALUE);
}

const pointsFromPosition = {
    1: 10,
    2: 8,
    3: 6,
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1,
};

const getResults = () => {
    return {
        async init() {
            const params = new URLSearchParams(document.location.search);
            this.currentYear = params.get("year");
            this.currentCourse = params.get("course");
            this.currentClass = params.get("class");

            this.years = await (await fetch("./data/years.json")).json();
            if (!this.currentYear) this.currentYear = this.years[0];
            await this.fetchYearData();

            if (!this.currentCourse || !this.courses.includes(this.currentCourse)) this.currentCourse = this.courses[0];
            if (!this.currentClass || !this.classes.includes(this.currentClass)) this.currentClass = this.classes[0];
            this._setUrlParams();

            console.log(this.yearData);

            console.log(this.$refs.areaHeader);


        },
        years: [],
        currentYear: "",
        yearData: {},
        get courses() {
            return Object.keys(this.yearData).sort((a, b) => sortCourses(a, b));
        },
        currentCourse: "",
        get classes() {
            return Object.keys(this.yearData?.[this.currentCourse]?.classes || {});
        },
        currentClass: "",
        get results() {
            return this._indexResults(this.yearData?.[this.currentCourse]?.classes?.[this.currentClass]?.results || []);
        },
        get results() {
            resultList = this.yearData?.[this.currentCourse]?.classes?.[this.currentClass]?.results || [];
            for (result of resultList) {
                result['points'] = pointsFromPosition[result['position']];
            }
            return this.yearData?.[this.currentCourse]?.classes?.[this.currentClass]?.results || [];
        },
        get area() {
            return this.yearData?.[this.currentCourse]?.area || "";
        },
        get mapImage() {
            class_info = this.yearData?.[this.currentCourse]?.classes?.[this.currentClass];
            if (class_info?.course_image == null || class_info?.course_image == "")
                return "404.html";
            return class_info?.course_image || "";
        },
        async onClickYear(year) {
            this.currentYear = year;
            await this.fetchYearData();
            this._setUrlParams();
        },
        onClickCourse(course) {
            this.currentCourse = course;
            this._setUrlParams();
        },
        // class is keyword, hence ageClass
        onClickClass(ageClass) {
            this.currentClass = ageClass;
            this._setUrlParams();
        },
        async fetchYearData() {
            this.yearData = await (await fetch(`./data/${this.currentYear}.json`)).json();
        },
        _setUrlParams() {
            const params = new URLSearchParams(document.location.search);
            params.set("class", this.currentClass);
            params.set("course", this.currentCourse);
            params.set("year", this.currentYear);
            history.replaceState(null, null, "?" + params.toString());
        },
    };
};

const getRunner = () => {
    return {
        async init() {
            const params = new URLSearchParams(document.location.search);
            this.name = params.get("name");
            this.currentCourse = params.get("course");
            this.currentClass = params.get("class");

            await this.loadAllYears();
            this.allResults = this.formatResults();

            if (!this.currentClass || !this.classes.includes(this.currentClass)) this.currentClass = this.classes[0];
            if (!this.currentCourse || !this.courses.includes(this.currentCourse)) this.currentCourse = this.courses[0];
            this._setUrlParams();

            console.log(this.allResults);
        },
        name: "",
        allYears: {},
        async loadAllYears() {
            const years = await (await fetch("./data/years.json")).json();
            const data = {};
            for (const year of years) {
                data[year] = await (await fetch(`./data/${year}.json`)).json();
            }
            this.allYears = data;
        },
        allResults: {},
        get classes() {
            return Object.keys(this.allResults);
        },
        get courses() {
            return Object.keys(this.allResults?.[this.currentClass] || {}).sort((a, b) => sortCourses(a, b));
        },
        get currentResults() {
            return (this.allResults?.[this.currentClass]?.[this.currentCourse] || []).sort((a, b) => b.year - a.year);
        },
        currentClass: "",
        currentCourse: "",
        onClickCourse(course) {
            this.currentCourse = course;
            this._setUrlParams();
        },
        // class is keyword, hence ageClass
        onClickClass(ageClass) {
            this.currentClass = ageClass;
            this._setUrlParams();
        },
        formatResults() {
            const data = {};
            for (const [year, courses] of Object.entries(this.allYears)) {
                for (const [course, courseData] of Object.entries(courses)) {
                    for (const [ageClass, ageClassData] of Object.entries(courseData.classes)) {
                        const result = ageClassData.results.find((runner) => runner.name === this.name);
                        if (result) {
                            points = result.position <= 8 ? pointsFromPosition[result.position] : 0;
                            area = courseData.area;
                            map = ageClassData.course_image != null ? ageClassData.course_image : "404.html";
                            if (!data.hasOwnProperty(ageClass)) data[ageClass] = {};
                            if (!data[ageClass].hasOwnProperty(course)) data[ageClass][course] = [];
                            data[ageClass][course].push({ ...result, year, area, map, points });
                        }
                    }
                }
            }
            return data;
        },
        _setUrlParams() {
            const params = new URLSearchParams(document.location.search);
            params.set("name", this.name);
            params.set("class", this.currentClass);
            params.set("course", this.currentCourse);
            history.replaceState(null, null, "?" + params.toString());
        },
    };
};


const getRankings = () => {
    return {
        async init() {
            const params = new URLSearchParams(document.location.search);
            this.currentCourse = params.get("course");
            this.currentClass = params.get("class");

            await this.loadAllYears();
            this.allResults = this.formatResults();

            if (!this.currentClass || !this.classes.includes(this.currentClass)) this.currentClass = this.classes[0];
            if (!this.currentCourse || !this.courses.includes(this.currentCourse)) this.currentCourse = this.courses[0];
            this._setUrlParams();

            await this.$nextTick();
            this.loading = false;

        },
        loading: true,
        name: "",
        years: [],
        allYears: {},
        async loadAllYears() {
            this.years = await (await fetch("./data/years.json")).json();
            const allData =
                await Promise.all(
                    this.years.map(year =>
                        fetch(`./data/${year}.json`).then(response => response.json())
                    )
                );

            this.allYears = Object.fromEntries(this.years.map((year, index) => [year, allData[index]]));
        },
        allResults: {},
        get classes() {
            return Object.keys(this.allResults);
        },
        get courses() {
            return Object.keys(this.allResults?.[this.currentClass] || {}).sort((a, b) => sortCourses(a, b));
        },
        get currentResults() {
            return (this.allResults?.[this.currentClass]?.[this.currentCourse]?.["results"] || []).sort((a, b) => b.total - a.total);
        },
        get currentAreas() {
            return this.allResults?.[this.currentClass]?.[this.currentCourse]?.["areas"] || [];
        },
        get currentMaps() {
            return this.allResults?.[this.currentClass]?.[this.currentCourse]?.["maps"] || [];
        },
        // get years() {return this.years},
        currentClass: "",
        currentCourse: "",
        onClickCourse(course) {
            this.currentCourse = course;
            this._setUrlParams();
        },
        // class is keyword, hence ageClass
        onClickClass(ageClass) {
            this.currentClass = ageClass;
            this._setUrlParams();
        },

        /**
         * Scroll `.table-container` in a specified direction.
         * @param {'left' | 'right'} direction - The direction to move.
         */
        onClickScroll(direction) {
            let scrollAmount = 500;
            if (direction === 'left') scrollAmount = -scrollAmount;
            else if (direction === 'right') scrollAmount = scrollAmount;
            else return;

            document.querySelector('body').scrollBy({ left: scrollAmount, behavior: 'smooth' });
        },
        addRankedResult(course, resultData, year, points) {
            const result = Object.values(course).find((runner) => runner.name === resultData.name);
            if (result) {
                if (!result.hasOwnProperty(year)) {
                    result[year] = points;
                } else {
                    result[year] += points;
                }
                result["total"] += points;
            } else {
                const tmpResult = {};
                tmpResult["name"] = resultData.name;
                tmpResult[year] = points;
                tmpResult["total"] = points;
                course.push(tmpResult);
            }
        },
        formatResults() {
            const data = {};
            for (const [year, courses] of Object.entries(this.allYears)) {
                for (const [course, courseData] of Object.entries(courses)) {
                    for (const [ageClass, ageClassData] of Object.entries(courseData.classes)) {
                        if (!data.hasOwnProperty(ageClass)) data[ageClass] = {};
                        if (!data[ageClass].hasOwnProperty(course)) data[ageClass][course] = {
                            "areas": {},
                            "maps": {},
                            "results": [],
                        };
                        for (const rankingCourse of RANKING_COURSES) {
                            if (!data[ageClass].hasOwnProperty(rankingCourse)) data[ageClass][rankingCourse] = {
                                // As ranking courses cover multiple disciplines they can't have an assocaited map.
                                "areas": null,
                                "maps": null,
                                "results": [],
                            };
                        }
                        data[ageClass][course]["areas"][year] = courseData.area;
                        data[ageClass][course]["maps"][year] = ageClassData.course_image;
                        for (const [_, resultData] of Object.entries(ageClassData.results)) {
                            points = pointsFromPosition[resultData.position];
                            points = points ? points : 0;

                            this.addRankedResult(data[ageClass][course]["results"], resultData, year, points);
                            this.addRankedResult(data[ageClass][OVERALL_COURSE]["results"], resultData, year, points);

                            if (course != RELAY) {
                                this.addRankedResult(data[ageClass][INDIVIDUAL_COURSE]["results"], resultData, year, points);
                                if (course != SPRINT) {
                                    this.addRankedResult(data[ageClass][INDIVIDUAL_FOREST_COURSE]["results"], resultData, year, points);
                                }
                            }
                            if (course != SPRINT) {
                                this.addRankedResult(data[ageClass][FOREST_COURSE]["results"], resultData, year, points);
                            }
                        }
                    }
                }
            }
            return data;
        },



        _setUrlParams() {
            const params = new URLSearchParams(document.location.search);
            params.set("class", this.currentClass);
            params.set("course", this.currentCourse);
            history.replaceState(null, null, "?" + params.toString());
        },
    };
};

const getOverview = () => {
    return {
        async init() {
            await this.loadAllYears();
            this.allResults = this.formatResults();
            console.log(this.allResults);
        },
        years: [],
        allYears: {},
        async loadAllYears() {
            this.years = await (await fetch("./data/years.json")).json();

            const allData =
                await Promise.all(
                    this.years.map(year =>
                        fetch(`./data/${year}.json`).then(response => response.json())
                    )
                );

            this.allYears = Object.fromEntries(this.years.map((year, index) => [year, allData[index]]));

        },
        allResults: [],
        get courses() {
            return EVENT_COURSES.sort((a, b) => sortCourses(a, b)) || [];
        },
        get currentResults() {
            return this.allResults || {};
        },
        currentClass: "",
        // class is keyword, hence ageClass
        onClickClass(ageClass) {
            this.currentClass = ageClass;
            this._setUrlParams();
        },
        formatResults() {
            const data = [];
            for (const [year, courses] of Object.entries(this.allYears)) {
                yearData = { "year": year };
                for (const course of EVENT_COURSES) {
                    yearData[course] = "";
                }
                for (const [course, courseData] of Object.entries(courses)) {
                    yearData[course] = courseData.area;
                }
                data.push(yearData);
            }
            return data.sort().reverse();
        },
    };
};
