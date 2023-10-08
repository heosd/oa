// get width of node
function getWidthNode(d, i, g) {
    const node = g[i];
    const bbox = node.getBBox();
    const w = Math.ceil(bbox.width);
    return w;
}

// get width of node plus margin, used in d3 callback
const fnWidth = (m) => {
    const margin = m;
    let x = 0;

    const fn = (d, i, g) => {
        const w = getWidthNode(d, i, g);

        if (0 === i) {
            x = w + (margin * 2);
            return margin;
        } else {
            const retX = x;
            x = x + w + margin;
            return retX;
        }
    }

    return fn;
}

function createRectLegend(list, opt) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    const scheme = opt?.color || d3.schemeCategory10;
    const size = opt?.size || 15;

    svg.classList.add('_legend_adjust');
    svg.setAttributeNS(null, 'data-size', size);

    var color = d3.scaleOrdinal()
        .domain(list)
        .range(scheme);

    const SVG = d3.select(svg);
    const g = SVG.selectAll('g')
        .data(list)
        .join('g')
        ;

    g.insert('rect')
        .attr('width', size)
        .attr('height', size)
        .attr('fill', color);

    g.insert('text')
        .text(d => d)
        .attr('x', size + 4)
        .attr('text-anchior', 'left')
        .attr('alignment-baseline', 'hanging')
        .attr('fill', color);

    return svg;
}

function adjustRectLegend(svg) {
    const size = ~~svg.getAttribute('data-size');
    if (0 >= size || !size) {
        console.log(`Can not adjust legend, no data-size`);
        return;
    }

    const ff = fnWidth(size);

    const SVG = d3.select(svg);

    SVG.selectAll('g').attr('transform', (d, i, g) => {
        const x = ff(d, i, g);
        return `translate(${x} ${size})`
    });
}

function updateAllRectLegend() {
    document.querySelectorAll('._legend_adjust').forEach(e => {
        e.classList.remove('_legend_adjust');
        adjustRectLegend(e);
    });
}

function _TEST_LEGEND() {
    const list = ['2019', '2020', '2021', '2022'];
    const legend = createRectLegend(list);
    const p = document.getElementById('area-test');
    p.appendChild(legend);
    adjustRectLegend(legend);
}
