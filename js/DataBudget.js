class SummaryCount {
    constructor(opt) {
        this.opt = {};

        this.opt.k = opt?.k ? opt.k : 'key';
        this.opt.c = opt?.c ? opt.c : 'count';
        this.opt.s = opt?.s ? opt.s : 'sum';

        this.obj = {};

        this.kv = {};
    }

    // -- if you need 0, like invalid : 0
    init(listItems) {
        listItems.forEach(item => {
            this.obj[item] = { c: 0, s: 0 }
        });
    }

    add(item, sum) {
        if (this.obj.hasOwnProperty(item)) {
            this.obj[item].c++;

            if (0 < sum || 0 > sum) {
                this.obj[item].s = this.obj[item].s + sum;
            }
        } else {
            this.obj[item] = { c: 1 };

            if (0 < sum || 0 > sum) {
                this.obj[item].s = sum;
            }
        }
    }

    get result() {
        const list = [];
        for (const [k, v] of Object.entries(this.obj)) {
            const r = {};
            r[this.opt.k] = k;
            r[this.opt.c] = v.c;
            r[this.opt.s] = v.s;
            list.push(r);
        }

        list.sort((a, b) => b[this.opt.c] - a[this.opt.c]);

        return list;
    }

    get object() {
        return this.obj;
    }

    setKV(k, v) {
        this.kv[k] = v;
    }

    getKV(k) {
        return this.kv[k];
    }

    static Test() {
        const sc = new SummaryCount({ k: 'k', c: 'c' });
        sc.add('one');
        sc.add('two');
        sc.add('two');
        sc.add('three');
        sc.add('three');
        sc.add('three');
        sc.add(1);

        const result = sc.result;
        console.log(sc.result);

        return result;
    }
}

class DataBudget {
    constructor() {
        this.ds = [];
        this.option = {
            type: [],
            price: 'price',
            count: 'count',
            date: 'date'
        };
    }

    set dataSource(ds) {
        this.ds = ds;
    }

    get dataSource() {
        return this.ds;
    }

    set opt(o) {
        this.option = o;
    }

    get opt() {
        return this.option;
    }

    get optType() {
        return this.opt.type;
    }

    get optPrice() {
        return this.opt.price;
    }

    get optCount() {
        return this.opt.count;
    }

    get optDate() {
        return this.opt.date;
    }

    static DateGroup(date) {
        if (!date) {
            return undefined;
        }

        const ymd = date.toLocaleDateString('af');
        const y = parseInt(ymd.substring(0, 4));
        const m = parseInt(ymd.substring(5, 7));
        const ym = ymd.substring(0, 7);
        const md = ymd.substring(5);

        return {
            d_ymd: ymd,
            d_m: m,
            d_y: y,
            d_ym: ym,
            d_md: md
        }
    }

    getType(obj, n) {
        const k = this.optType[n];
        return obj[k];
    }

    getValue(obj) {
        const p = this.getPrice(obj);
        if (!p) {
            return 0;
        }

        const c = this.getCount(obj);
        return p * c;
    }

    getPrice(obj) {
        const k = this.optPrice;
        if (!k) {
            return undefined;
        }

        return obj[k];
    }

    getCount(obj) {
        const k = this.optCount;
        if (k && Object.hasOwn(obj, k)) {
            return obj[k];
        } else {
            return 1;
        }
    }

    getDate(obj) {
        const k = this.optDate;
        if (k && Object.hasOwn(obj, k)) {
            return obj[k];
        }

        return undefined;
    }

    processClone() {
        const cloned = this.dataSource.map(d => {
            const p = parseInt(this.getPrice(d));
            const c = parseInt(this.getCount(d));
            const date = this.getDate(d);

            const item = {
                p: p,
                c: c,
                v: p * c,
                d: date,
            };

            // -- type0 ~ typeX
            this.optType.forEach((type, i) => {
                item['type' + i] = d[type];
            });

            // -- d_ymd,...
            if (!isNaN(date)) {
                const dgroup = DataBudget.DateGroup(date);
                for (const [k, v] of Object.entries(dgroup)) {
                    item[k] = v;
                }
            }

            return item;
        });

        this.dataCloned = cloned;
        this.dataClonedTypes = this.optType.map((_, i) => 'type' + i);
    }

    get cloned() {
        return this.dataCloned;
    }

    // execYear(filter) {
    //     let src = this.cloned;
    //     if (filter) {
    //         src = src.filter(filter);
    //     }

    //     const rr = d3.rollup(this.cloned,
    //         (list) => {
    //             const first = list[0];
    //             const sum = d3.sum(list, d => d.v);
    //             const count = list.length;
    //             const result = {
    //                 sum: sum,
    //                 count: count,
    //                 y: first.d_y,
    //                 group: first.d_y,
    //                 desc: {
    //                     count: 'count of items within year',
    //                     sum: 'sum of (price * count)',
    //                     y: 'number type year 2020'
    //                 }
    //             }

    //             return result;
    //         }, (d) => d.d_y);

    //     const result = Array.from(rr.values());
    //     this.ssYear = result;
    // }

    // execMonth(filter) {
    //     let src = this.cloned;
    //     if (filter) {
    //         src = src.filter(filter);
    //     }
    //     const rr = d3.rollup(src,
    //         (list) => {
    //             const first = list[0];
    //             const sum = d3.sum(list, d => d.v);
    //             const count = list.length;
    //             const result = {
    //                 sum: sum,
    //                 count: count,
    //                 ym: first.d_ym,
    //                 group: first.d_ym,
    //                 desc: {
    //                     count: 'count of items within year',
    //                     sum: 'sum of (price * count)',
    //                     ym: 'number type year and month 2020-03'
    //                 }
    //             }

    //             return result;
    //         }, (d) => d.d_ym);

    //     const result = Array.from(rr.values());
    //     this.ssMonth = result;
    // }

    execDate(yearOffset = 100) {
        let src = this.cloned;

        if (!this.optDate) {
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const range = [year - yearOffset, year + yearOffset];

        const scValid = new SummaryCount();
        const scYears = new SummaryCount({ k: 'y', c: 'count' });
        const scMonth = new SummaryCount({ k: 'ym', c: 'count' });
        scValid.init(['valid', 'invalid']);
        src.forEach(d => {
            if (d.d instanceof Date) {
                const fy = d.d.getFullYear();
                if (range[0] <= fy && range[1] >= fy) {
                    scValid.add('valid');
                    scYears.add(fy, d.v);
                    const month = d.d.toLocaleDateString('af').substring(0, 7);
                    scMonth.add(month, d.v);
                } else {
                    scValid.add('invalid');
                }
            } else {
                scValid.add('invalid');
            }
        });

        const scYearResult = scYears.result;
        scYearResult.sort((a, b) => parseInt(a.y) - parseInt(b.y));

        const ssDate = {
            valid: scValid.object.valid.c,
            invalid: scValid.object.invalid.c,
            range: range,
            list: scYearResult,
            listMonth: scMonth.result,
            descList: `only in valid range ${range[0]} ~ ${range[1]}, sort by year`,
            descListMonth: `only in valid range ${range[0]} ~ ${range[1]}, sort by count`,
        }

        this.ssDate = ssDate;
    }

    execType() {
        let src = this.cloned;

        const sc = this.dataClonedTypes.map((d, i) => {
            const scInstance = new SummaryCount();
            scInstance.setKV('colOrigin', this.optType[i]);
            scInstance.setKV('col', d);
            return scInstance;
        });

        // -- each line, each type, sum up v
        src.forEach(d => {
            this.dataClonedTypes.forEach((k, i) => {
                const value = d[k];
                sc[i].add(value, d.v);
            });
        });

        // -- colOrigin is name of original column like 'name'
        // -- col starts 'type0'
        this.ssType = sc.map(d => {
            const obj = {
                colOrigin: d.getKV('colOrigin'),
                col: d.getKV('col'),
                list: d.result,
            }

            return obj;
        });
    }
}