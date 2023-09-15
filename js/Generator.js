class Generator {
    static DAY = 1000 * 60 * 60 * 24;
    static NAMES = ["민준", "지훈", "현우", "준서", "우진", "건우", "예준", "현준", "도현", "동현", "준혁", "민재", "서준", "승현", "승민", "민성", "시우"];

    static GenerateDate(days, base) {
        let pbase = base;
        if ("string" === typeof base) {
            pbase = new Date(base);
        } else if (!base) {
            pbase = new Date();
        }

        const before = new Date(new Date().getTime() - Generator.DAY * days);
        const scaleTime = d3.scaleTime([before, pbase], [0, days]);

        const gen = () => {
            const rd = ~~(Math.random() * days);
            return scaleTime.invert(rd);
        };

        return gen;
    }

    static GenerateDateFromTo(from, to) {
        let pfrom = from,
            pto = to;
        if ("string" === typeof from) {
            pfrom = new Date(from);
        }

        if ("string" === typeof to) {
            pto = new Date(to);
        }

        const days = Generator.CountDays(pfrom, pto);

        const domain = [0, days];
        const range = [from, to];

        const scaleTime = d3.scaleTime(range, domain);

        const fn = () => {
            const random = Math.floor(Math.random() * days);
            return scaleTime.invert(random);
        };

        return fn;
    }

    static CountDays(a, b) {
        const da = ~~(a.getTime() / Generator.DAY);
        const db = ~~(b.getTime() / Generator.DAY);
        return Math.abs(db - da);
    }

    static TestGenerateDate() {
        const fn = Generator.GenerateDate(750);
        const result = [];
        for (let i = 0; i < 100; ++i) {
            result.push(fn());
        }

        console.log(result);

        return result;
    }

    static TestGenerateDateFromTo() {
        const before = new Date().getTime() - Generator.DAY * 365 * 4;
        const a = new Date(before);
        const fn = Generator.GenerateDateFromTo(a, new Date());

        const result = [];
        for (let i = 0; i < 100; i++) {
            result.push(fn());
        }
    }

    static GenerateNames(numbers) {
        const len = Generator.NAMES.length;

        const candidates = [];
        for (let i = 0; i < numbers; i++) {
            const at = ~~(Math.random() * len);
            candidates.push(Generator.NAMES[at]);
        }

        const fn = () => {
            const name = candidates[Math.floor(Math.random() * candidates.length)];
            return name;
        };

        return fn;
    }

    static TestGenerateNames() {
        const fn = Generator.GenerateNames(10);
        const result = [];
        for (let i = 0; i < 100; ++i) {
            result.push(fn());
        }

        console.log(result);

        return result;
    }

    static async GenerateItems(numbers = 30) {
        //const csv = await FileAttachment("price.csv").csv();
        const csv = await d3.csv('../data/price.csv');
        csv.forEach((d) => {
            d.no = ~~d.no;
            d.avg = ~~d.avg;
        });

        const len = csv.length;

        const candidates = [];
        for (let i = 0; i < numbers; i++) {
            const at = ~~(Math.random() * len);
            candidates.push(csv[at]);
        }

        const fn = () => {
            const item = candidates[Math.floor(Math.random() * candidates.length)];
            return item;
        };

        return fn;
    }

    static async TestGenerateItems() {
        const fn = await Generator.GenerateItems(10);
        const result = [];
        for (let i = 0; i < 100; ++i) {
            result.push(fn());
        }

        console.log(result);

        return result;
    }

    static async Generate(count) {
        async function fnGen() {
            const fnDate = Generator.GenerateDate(365 * 4);
            const fnName = Generator.GenerateNames(20);
            const fnItem = await Generator.GenerateItems(30);
            const fnCount = () => ~~(Math.random() * 20 + 1);

            // https://www.price.go.kr/tprice/portal/board/boardInfoDetail.do#

            const fn = () => {
                const item = fnItem();

                const obj = {
                    date: fnDate(),
                    name: fnName(),
                    type1: item.type1,
                    type2: item.type2,
                    item: item.name,
                    price: item.avg,
                    count: fnCount()
                };

                return obj;
            };

            return fn;
        }

        const ff = await fnGen();

        const result = [];
        for (let i = 0; i < count; ++i) {
            result.push(ff());
        }
        return result;
    }
}
