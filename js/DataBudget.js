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
            d_y: y.toString(),
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
            _validRange: range,
            list: scYearResult,
            listMonth: scMonth.result,
            _descList: `only in valid range ${range[0]} ~ ${range[1]}, sort by year`,
            _descListMonth: `only in valid range ${range[0]} ~ ${range[1]}, sort by count`,
        }

        this.ssDate = ssDate;
    }

    // price, count, value
    execPCV() {
        let src = this.cloned;

        this.ssPCV = {
            pvalid: 0,
            pinvalid: 0,
            cvalid: 0,
            cinvalid: 0,
            vvalid: 0,
            vinvalid: 0,
            colPrice: '',
            colCount: '',
            prange: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
            crange: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
            vrange: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
            // colValue: '', // no column for value now
        }

        if (this.optPrice) {
            src.forEach(d => {
                this.ssPCV.colPrice = this.optPrice;
                if (isNaN(d.p)) {
                    this.ssPCV.pinvalid++;
                } else {
                    this.ssPCV.pvalid++;

                    // min max
                    if (this.ssPCV.prange[0] > d.p) {
                        this.ssPCV.prange[0] = d.p;
                    }

                    if (this.ssPCV.prange[1] < d.p) {
                        this.ssPCV.prange[1] = d.p;
                    }
                }
            });
        }

        if (this.optCount) {
            src.forEach(d => {
                this.ssPCV.colCount = this.optCount;
                if (isNaN(d.c)) {
                    this.ssPCV.cinvalid++;
                } else {
                    this.ssPCV.cvalid++;

                    // min max
                    if (this.ssPCV.crange[0] > d.c) {
                        this.ssPCV.crange[0] = d.c;
                    }

                    if (this.ssPCV.crange[1] < d.c) {
                        this.ssPCV.crange[1] = d.c;
                    }

                }
            });
        }

        src.forEach(d => {
            if (isNaN(d.v)) {
                this.ssPCV.vinvalid++;
            } else {
                this.ssPCV.vvalid++;

                // min max
                if (this.ssPCV.vrange[0] > d.v) {
                    this.ssPCV.vrange[0] = d.v;
                }

                if (this.ssPCV.vrange[1] < d.v) {
                    this.ssPCV.vrange[1] = d.v;
                }
            }
        });
    }

    execType() {
        let src = this.cloned;

        const sc = this.dataClonedTypes.map((d, i) => {
            const scInstance = new SummaryCount();
            scInstance.setKV('colOrigin', this.optType[i]);
            scInstance.setKV('col', d);
            return scInstance;
        });

        // -- assert init - valid, invalid count for keys
        const assert = {};
        this.dataClonedTypes.forEach(k => assert[k] = { valid: 0, invalid: 0 });

        // -- each line, each type, sum up v
        src.forEach(d => {
            this.dataClonedTypes.forEach((k, i) => {
                const value = d[k];

                // type key assertion
                if (undefined === typeof valid) {
                    assert[k].invalid++;
                } else {
                    assert[k].valid++;
                }

                // sum up summary count
                sc[i].add(value, d.v);
            });
        });

        // -- colOrigin is name of original column like 'name'
        // -- col starts 'type0'
        this.ssType = sc.map(d => {
            const col = d.getKV('col');
            const obj = {
                colOrigin: d.getKV('colOrigin'),
                col: col,
                valid: assert[col].valid,
                invalid: assert[col].invalid,
                list: d.result,
                _descValid: 'assert line has its type name, check undefined only'
            }

            return obj;
        });
    }

    execYears() {
        this.ssDate.list.forEach(d => {
            const year = parseInt(d.y);
            this.execYear(year);
        });
    }

    execYear(year) {
        let src = this.cloned;
        const y = parseInt(year);
        const list = src.filter(d => d.d_y === y);

        if(!this.ssYear) {
            this.ssYear = {};
        }

        if(0 === list) {
            this.ssYear[y] = undefined;
            return undefined;
        }

        const sc = this.dataClonedTypes.map((d, i) => {
            const scInstance = new SummaryCount();
            scInstance.setKV('colOrigin', this.optType[i]);
            scInstance.setKV('col', d);
            return scInstance;
        });

        // -- assert init - valid, invalid count for keys
        const assert = {};
        this.dataClonedTypes.forEach(k => assert[k] = { valid: 0, invalid: 0 });

        // -- each line, each type, sum up v
        list.forEach(d => {
            this.dataClonedTypes.forEach((k, i) => {
                const value = d[k];

                // type key assertion
                if (undefined === typeof valid) {
                    assert[k].invalid++;
                } else {
                    assert[k].valid++;
                }

                // sum up summary count
                sc[i].add(value, d.v);
            });
        });

        // -- colOrigin is name of original column like 'name'
        // -- col starts 'type0'
        const ssType = sc.map(d => {
            const col = d.getKV('col');
            const obj = {
                colOrigin: d.getKV('colOrigin'),
                col: col,
                valid: assert[col].valid,
                invalid: assert[col].invalid,
                list: d.result,
                _descValid: 'assert line has its type name, check undefined only'
            }

            return obj;
        });

        this.ssYear[y] = ssType;
    }
}