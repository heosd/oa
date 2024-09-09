/**
 * table-json
 * e.setDataSource(list);
 * show 100 lines of data
 **/
class TableJSON extends HTMLElement {
    constructor(ds) {
        super();
        this.page = 0;
        this.pageSize = 15;
        this.deletedHeader = [];
        this.initHTML();

        if (ds) {
            this.setDataSource(ds);
        }
    }

    setDataSource(ds) {
        this.ds = ds;

        const first = ds[0];
        const keys = Object.keys(first);
        this.keys = keys;

        this.refreshChild();
    }

    showControl(show) {
        if (show) {
            this.$control.style.display = 'block';
        } else {
            this.$control.style.display = 'none';
        }
    }

    get totalPage() {
        if (!this.ds || 0 === this.ds.length) {
            return 0;
        }

        return ~~(this.ds.length / this.pageSize);
    }

    refreshChild() {
        this.$thead.innerHTML = '';
        this.$tbody.innerHTML = '';

        // thead
        const filteredHeader = this.keys.filter(k => !this.deletedHeader.find(d => d === k));
        const trHead = TableJSON.createTR(filteredHeader, 'th');

        // double click -> remove header from drawing
        trHead.querySelectorAll('th').forEach(th => {
            th.addEventListener('dblclick', () => {
                this.deletedHeader.push(th.textContent);
                this.refreshChild();
            });
        });
        this.$thead.appendChild(trHead);

        // tbody with limited lines
        const paging = [
            this.page * this.pageSize,
            this.page * this.pageSize + this.pageSize,
        ];

        const paged = this.ds.slice(...paging);
        paged.forEach(d => {
            const values = filteredHeader.map(k => d[k]);
            const tr = TableJSON.createTR(values);
            this.$tbody.appendChild(tr);
        });

        this.refreshControlText();
    }

    static createTR = (datas, childTag = 'td') => {
        const tr = document.createElement('tr');
        datas.forEach(d => {
            const td = document.createElement(childTag);
            td.textContent = d;
            td.title = d;
            tr.appendChild(td);
        });

        return tr;
    }

    refreshControlText() {
        const text = `page : ${this.page + 1} / ${this.totalPage + 1}, items : ${this.ds.length}`;
        this.$controlText.textContent = text;
    }

    initHTML() {
        // table
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        table.appendChild(thead);
        table.appendChild(tbody);

        // control
        const div = document.createElement('div');
        const btnPrev = document.createElement('button');
        const btnNext = document.createElement('button');
        const txtControl = document.createElement('span');
        btnPrev.innerHTML = '&#9664';
        btnNext.innerHTML = '&#9654;'
        btnPrev.addEventListener('click', () => {
            if (0 < this.page) {
                this.page = this.page - 1;
                this.refreshChild();
            }
        });
        btnNext.addEventListener('click', () => {
            const tp = this.totalPage;
            if (this.page < tp) {
                this.page = this.page + 1;
                this.refreshChild();
            }
        });
        [txtControl, btnPrev, btnNext].forEach(d => div.appendChild(d));

        // control style
        div.style.display = 'flex';
        btnPrev.style.flex = '1';
        btnNext.style.flex = '1';
        txtControl.style.flex = '30';
        txtControl.style.textAlign = 'left';

        // my body
        this.appendChild(div);
        this.appendChild(table);


        this.$table = table;
        this.$thead = thead;
        this.$tbody = tbody;
        this.$control = div;
        this.$controlText = txtControl;
    }

    static init() {
        customElements.define('table-json', TableJSON);
    }
}

