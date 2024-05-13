
function capitalizeFirstLetter(str) {
    // Check if the input string is not empty
    if (str.length === 0) {
        return str;
    }

    // Capitalize the first character and concatenate it with the rest of the string
    return str.charAt(0).toUpperCase() + str.slice(1);
}

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

        },
        years: [],
        currentYear: "",
        yearData: {},
        get courses() { return Object.keys(this.yearData); },
        currentCourse: "",
        get classes() { return Object.keys(this.yearData?.[this.currentCourse]?.classes || {}); },
        currentClass: "",
        get results() { return this._indexResults(this.yearData?.[this.currentCourse]?.classes?.[this.currentClass]?.results || []); },
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
        _indexResults(results) {
            let idx = 1;
            return results.map(runner => {
                const position = runner.eligible ? idx++ : null;
                return { ...runner, position };
            });
        },
        _setUrlParams() {
            const params = new URLSearchParams(document.location.search);
            params.set("class", this.currentClass);
            params.set("course", this.currentCourse);
            params.set("year", this.currentYear);
            history.replaceState(null, null, "?" + params.toString());
        }
    };
};

const getRunner = () => {
    return {
        async init() {
            const params = new URLSearchParams(document.location.search);
            this.name = params.get("name");
            await this.loadAllYears();
            this.allResults = this.formatResults();
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
            const classes = Object.keys(this.allResults);
            if (!this.currentClass || !classes.includes(this.currentClass)) this.currentClass = classes[0];
            return classes;
        },
        get courses() {
            const courses = Object.keys(this.allResults?.[this.currentClass] || {});
            if (!this.currentCourse || !courses.includes(this.currentCourse))
                this.currentCourse = courses[0];
            return courses;
        },
        get currentResults() {
            return (this.allResults?.[this.currentClass]?.[this.currentCourse] || []).sort((a, b) => b.year - a.year);
        },
        currentClass: "",
        currentCourse: "",
        onClickCourse(course) {
            this.currentCourse = course;

        },
        // class is keyword, hence ageClass
        onClickClass(ageClass) {
            this.currentClass = ageClass;

        },
        formatResults() {
            const data = {};
            for (const [year, courses] of Object.entries(this.allYears)) {
                for (const [course, courseData] of Object.entries(courses)) {
                    for (const [ageClass, ageClassData] of Object.entries(courseData.classes)) {
                        const result = ageClassData.results.find(runner => runner.name === this.name);
                        if (result) {
                            if (!data.hasOwnProperty(ageClass)) data[ageClass] = {};
                            if (!data[ageClass].hasOwnProperty(course)) data[ageClass][course] = [];
                            data[ageClass][course].push({ ...result, year });
                        }
                    }
                }
            }
            return data;
        }
    };
};