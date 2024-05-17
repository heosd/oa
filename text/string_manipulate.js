function selectAllText(e) {
    const result = [];
    e.childNodes.forEach(d => result.push(...selectAllText(d)));

    if ('#text' === e.nodeName) {
        result.push(e);
    }

    return result;
}

function isNumber(str) {
    const n = Number(str);

    return !isNaN(n);
}

function numberComma(str) {
    const str2 = str.split('.');
    if (2 !== str2.length) {
        return str;
    }

    const strComma = Number(str2[0]).toLocaleString();
    return strComma + '.' + str2[1];
}

function removeComma(str) {
    return str.replace(/,/g, '');
}

function trim(str) {
    return str.trim();
}

function spaceFloat(str, count = 3) {
    const str2 = str.split('.');
    if (2 !== str2.length) {
        return str;
    }

    const regSplit = new RegExp(`(\\d{${count}})`);

    return str2[0] + '.' + str2[1].split(regSplit).join(' ').trim();
}

function removeSpaceText(str) {
    return str.replace(/\s/g, '');
}

function toFixed(str, n) {
    return Number(str).toFixed(n);
}

function execTrim(type, value) {
    if ('text/plain' === type) {
        const trimmed = value.replace(/^\s*/gm, '').replace(/\s*$/gm, '');
        return trimmed;
    } else if ('text/html' === type) {
        eoutputhtml.innerHTML = value;
        selectAllText(eoutputhtml).forEach(d => {
            d.textContent = d.textContent.trim();
        });

        return eoutputhtml.innerHTML;
    }
}

function execComma(type, value) {
    if ('text/plain' === type) {
        // const trimmed = value.replace(/^\s*/gm, '').replace(/\s*$/gm, '');
        return value;
    } else if ('text/html' === type) {
        eoutputhtml.innerHTML = value;
        selectAllText(eoutputhtml).forEach(d => {
            d.textContent = numberComma(d.textContent);
        });

        return eoutputhtml.innerHTML;
    }
}

function execRemoveComma(type, value) {
    if ('text/plain' === type) {
        // const trimmed = value.replace(/^\s*/gm, '').replace(/\s*$/gm, '');
        return value;
    } else if ('text/html' === type) {
        eoutputhtml.innerHTML = value;
        selectAllText(eoutputhtml).forEach(d => {
            d.textContent = removeComma(d.textContent);
        });

        return eoutputhtml.innerHTML;
    }
}

function execFixed(type, value, arg) {
    if ('text/plain' === type) {
        // const trimmed = value.replace(/^\s*/gm, '').replace(/\s*$/gm, '');
        return value;
    } else if ('text/html' === type) {
        const fixed = arg.fixed;

        eoutputhtml.innerHTML = value;
        selectAllText(eoutputhtml).forEach(d => {
            const t = d.textContent;
            if (isNumber(t)) {
                d.textContent = toFixed(t, fixed);
            }
        });

        return eoutputhtml.innerHTML;
    }
}

function execRemoveSpace(type, value) {
    if ('text/plain' === type) {
        // const trimmed = value.replace(/^\s*/gm, '').replace(/\s*$/gm, '');
        return value;
    } else if ('text/html' === type) {
        eoutputhtml.innerHTML = value;
        selectAllText(eoutputhtml).forEach(d => {
            const t = d.textContent;
            d.textContent = removeSpaceText(t);
        });

        return eoutputhtml.innerHTML;
    }
}

function execSpaceFloat(type, value, arg) {
    if ('text/plain' === type) {
        // const trimmed = value.replace(/^\s*/gm, '').replace(/\s*$/gm, '');
        return value;
    } else if ('text/html' === type) {
        const space = arg.space;
        eoutputhtml.innerHTML = value;
        selectAllText(eoutputhtml).forEach(d => {
            const t = d.textContent;
            d.textContent = spaceFloat(t, space);
        });

        return eoutputhtml.innerHTML;
    }
}