function getData() {
    return {
        selectedOption: "",
        options: [{
            value: "0.95",
            text: "0.95"
        },
        {
            value: "0.9",
            text: "0.9"
        },
        {
            value: "0.8",
            text: "0.8"
        },
        {
            value: "0.7",
            text: "0.7"
        },
        ],
        searchValue: '',
        page: 1,
        limit: 10,
        total: 50,
        events: null,
        isLoading: false,
        previousPage: 1,
        nextPage: null,
        lastPage: 0,
        fetchData(page = this.page) {
            this.page = page;
            this.isLoading = true;
            fetch(`https://5d6516c05b26ae001489eb85.mockapi.io/api/v1/events?search=${this.searchValue}&page=${this.page}&limit=${this.limit}`)
                .then((res) => res.json())
                .then((data) => {
                    this.isLoading = false;
                    this.events = data;
                    this.previousPage = this.page == 1 ? this.previousPage : this.page - 1;
                    this.nextPage = this.page + 1;
                    this.lastPage = Math.floor(this.total / this.limit);
                });
        },
    };
}


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
            this.years = await (await fetch("./data/years.json")).json();
            this.currentYear = this.years[0];
            await this.fetchYearData();
        },
        years: [],
        currentYear: "",
        yearData: {},
        get courses() {
            const courses = Object.keys(this.yearData);
            if (!this.currentCourse || !courses.includes(this.currentCourse))
                this.currentCourse = courses[0];
            return courses;
        },
        currentCourse: "",
        get classes() {
            const classes = Object.keys(this.yearData?.[this.currentCourse]?.classes || {});
            if (!this.currentClass || !classes.includes(this.currentClass))
                this.currentClass = classes[0];
            return classes;
        },
        currentClass: "",
        get results() { return this._indexResults(this.yearData?.[this.currentCourse]?.classes?.[this.currentClass]?.results || []); },
        async onClickYear(year) {
            this.currentYear = year;
            await this.fetchYearData();

        },
        onClickCourse(course) {
            this.currentCourse = course;

        },
        // class is keyword, hence ageClass
        onClickClass(ageClass) {
            this.currentClass = ageClass;

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