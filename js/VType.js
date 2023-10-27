class VType {
    static EXP_COMMAG = /,/g;
    static EXP_DOTG = /\./g;
    static EXP_MINUSG = /-/g;
    static EXP_NUM = [/^\-?[0-9.]+$/];
    static EXP_SPACEG = /\s/g;
    static EXP_YEARG = /\s*[년월]/g;
    static EXP_HOURG = /\s*[시분]/g;

    static IsNumber(str) {
        const noComma = str.replace(VType.EXP_COMMAG, '');
        const v = parseFloat(noComma);
        if (isNaN(v)) {
            return false;
        }

        const minus = noComma.match(VType.EXP_MINUSG);
        const dot = noComma.match(VType.EXP_DOTG);

        // --
        if (minus && 1 < minus.length) {
            return false;
        }

        // ..
        if (dot && 1 < dot.length) {
            return false;
        }

        return true;
    }

    static TestNumber() {
        [
            ['abcd', false],
            ['1234', true],
            ['1,2,3,4', true],
            ['-123', true],
            ['-3.41', true],
            ['--3.14', false],
            ['3..41', false],
            ['.513-123', true],
            ['1234-e4', true]
        ].forEach(d => {
            const r = VType.IsNumber(d[0]);
            if (r !== d[1]) {
                console.error(`Assertion failed`);
                console.log(d);
            }

            console.log(r, d[0]);
        });
    }

    static RemoveSpace(str) {
        return str.replace(VType.EXP_SPACEG, '');
    }

    static IsDate(str) {
        const date = VType.ToDate(str);
        if (0 < date.getTime()) {
            return true;
        }

        return false;
    }

    static ToDate(str) {
        const s1 = str.replace(VType.EXP_YEARG, '-').replace(/일/, '');
        const s2 = s1.replace(VType.EXP_HOURG, ':').replace(/초/, '');
        const s3 = s2.trim();

        const date = new Date(s3);

        return date;
    }

    static TestDate() {
        [
            ['2019/10/30', true],
            ['2020-01-01', true],
            ['2020.01.01', true],
            ['2020년1월1일', true],
            [' 2020년 1월1일', true],
            [' 2020년 1월 1일 ', true],
            [' 2020년 1월 1일 12시 20분', true],
            [' 2020년 1월 1일 12 시 20   분', true],
            [' 2020년 1   월 1일 12 시 20   분 50   초   ', true],
        ].forEach(d => {
            const r = VType.IsDate(d[0]);
            if (r !== d[1]) {
                console.error(`Assertion failed`);
                console.log(d);
            }

            console.log(r, d[0]);
        });
    }

    static JudgeLine(line) {
        const r = {};
        for (const [k, v] of Object.entries(line)) {
            if (true === VType.IsDate(v)) {
                r[k] = 'date';
            } else if (true === VType.IsNumber(v)) {
                r[k] = 'number';
            } else {
                r[k] = 'string';
            }
        }

        return r;
    }

    static TestJudgeLine() {
        const line = {
            key1: 'Kim',
            key2: '-23.132',
            key3: '3.14',
            key4: '2020-01-01'
        };

        const r = VType.JudgeLine(line);
        console.log(r);
    }

    static JudgeLines(lines) {
        // less than 100 lines only
        const r = lines.filter((d, i) => i < 100).map(VType.JudgeLine);
        const keys = Object.keys(r[0]);
        const result = {};
        keys.forEach(k => {
            const counts = d3.rollup(r, v => v.length, d => d[k]);
            const gg = d3.greatest(counts, ([, c]) => c);
            const type = gg[0]; // ['number', 34]
            // console.log(k, type);
            result[k] = type;
        });
        return result;
    }

    static TestJudgeLines() {
        const str = `ts,str,tox,lorem,ipsum,ke,g1,g2,g3,second
2011-12-05T05:55:47.245Z,F3K6P181 2+6182,6181,24,6182,,DASKROM1_FUS,DAS_A,1_FUS,0
2011-12-05T05:55:47.576Z,F3K6P181 2+3182,6181,24,6182,,DASKROM1_FUS,DAS_A,1_FUS,0
2011-12-05T05:55:47.910Z,F3K6P181 2+6182,6181,24,6182,,DASKROM1_FUS,DAS_A,1_FUS,0
2011-12-05T05:55:48.243Z,F3K6P181 3.9-2182,6181,1.9,6182,0.98091,DASKROM1_FUS,DAS_A,1_FUS,1
2011-12-05T05:55:48.576Z,F3K6P181 3.9-2549,6181,1.9,2549,0.962745,DASKROM1_FUS,DAS_A,1_FUS,1
2011-12-05T05:55:48.909Z,F3K6P181 3.9-9912,6181,1.9,9912,0.99956,DASKROM1_FUS,DAS_A,1_FUS,1
2011-12-05T05:55:49.238Z,F3K6P181 3.9-5959,6181,1.9,9959,0.999795,DASKROM1_FUS,DAS_A,1_FUS,2
2011-12-05T05:55:49.573Z,F3K6P181 3.9-3970,6181,1.9,9970,0.99985,DASKROM1_FUS,DAS_A,1_FUS,2
2011-12-05T05:55:49.904Z,F3K6P181 3.9-6970,6181,1.9,9970,0.99985,DASKROM1_FUS,DAS_A,1_FUS,2
2011-12-05T05:55:50.236Z,F3K6P181 3.9-1969,6181,1.9,9969,0.999845,DASKROM1_FUS,DAS_A,1_FUS,3
2011-12-05T05:55:50.570Z,F3K6P181 3.9-8970,6181,1.9,9970,0.99985,DASKROM1_FUS,DAS_A,1_FUS,3
2011-12-05T05:55:50.902Z,F3K6P181 3.9-9969,6181,1.9,9969,0.999845,DASKROM1_FUS,DAS_A,1_FUS,3
2011-12-05T05:55:51.233Z,F3K6P181 3.9-2969,6181,1.9,9969,0.999845,DASKROM1_FUS,DAS_A,1_FUS,4
2011-12-05T05:55:51.847Z,F3K6P181 3.9-4969,6181,1.9,9969,0.999845,DASKROM1_FUS,DAS_A,1_FUS,4
2011-12-05T05:55:51.899Z,F3K6P181 3.9-2969,6181,1.9,9969,0.999845,DASKROM1_FUS,DAS_A,1_FUS,4
2011-12-05T05:55:52.243Z,F3K6P181 3.9-9969,6181,1.9,9969,0.999845,DASKROM1_FUS,DAS_A,1_FUS,5
2011-12-05T05:55:52.563Z,F3K6P181 3.9-1969,6181,1.9,9969,0.999845,DASKROM1_FUS,DAS_A,1_FUS,5
2011-12-05T05:55:52.895Z,F3K6P181 3.9-2969,6181,1.9,9969,0.999845,DASKROM1_FUS,DAS_A,1_FUS,5
2011-12-05T05:55:53.230Z,F3K6P181 3.9-9968,6181,1.9,9968,0.99984,DASKROM1_FUS,DAS_A,1_FUS,6
2011-12-05T05:55:53.562Z,F3K6P181 3.9-9970,6181,1.9,9970,0.99985,DASKROM1_FUS,DAS_A,1_FUS,6
2011-12-05T05:55:53.892Z,F3K6P181 3.9-4970,6181,1.9,9970,0.99985,DASKROM1_FUS,DAS_A,1_FUS,6
2011-12-05T05:55:54.224Z,F3K6P181 3.9-9968,6181,1.9,9968,0.99984,DASKROM1_FUS,DAS_A,1_FUS,7
2011-12-05T05:55:54.558Z,F3K6P181 3.9-9970,6181,1.9,9970,0.99985,DASKROM1_FUS,DAS_A,1_FUS,7
2011-12-05T05:55:54.890Z,F3K6P181 3.9-9969,6181,1.9,9969,0.999845,DASKROM1_FUS,DAS_A,1_FUS,7
2011-12-05T05:55:55.223Z,F3K6P181 3.9-9970,6181,1.9,9970,0.99985,DASKROM1_FUS,DAS_A,1_FUS,8
2011-12-05T05:55:55.555Z,F3K6P181 3.9-6968,6181,1.9,9968,0.99984,DASKROM1_FUS,DAS_A,1_FUS,8
2011-12-05T05:55:55.888Z,F3K6P181 3.9-7971,6181,1.9,9971,0.999855,DASKROM1_FUS,DAS_A,1_FUS,8
2011-12-05T05:55:56.221Z,F3K6P181 3.9-9970,6181,1.9,9970,0.99985,DASKROM1_FUS,DAS_A,1_FUS,9
2011-12-05T05:55:56.554Z,F3K6P181 3.9-9969,6181,1.9,9969,0.999845,DASKROM1_FUS,DAS_A,1_FUS,9
2011-12-05T05:55:56.885Z,F3K6P181 3.9-9971,6181,1.9,9971,0.999855,DASKROM1_FUS,DAS_A,1_FUS,9
2011-12-05T05:55:57.218Z,F3K6P181 3.9-9969,6181,1.9,9969,0.999845,DASKROM1_FUS,DAS_A,1_FUS,10
2011-12-05T05:55:57.553Z,F3K6P181 3.9-9970,6181,1.9,9970,0.99985,DASKROM1_FUS,DAS_A,1_FUS,10
2011-12-05T05:55:57.882Z,F3K6P181 3.9-9970,6181,1.9,9970,0.99985,DASKROM1_FUS,DAS_A,1_FUS,10
2011-12-05T05:55:58.215Z,F3K6P181 3.9-9970,6181,1.9,9970,0.99985,DASKROM1_FUS,DAS_A,1_FUS,11`;
        const csv = d3.csvParse(str);
        const r = VType.JudgeLines(csv);
        console.log(r);
    }
}
