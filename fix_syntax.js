const fs = require('fs');
let code = fs.readFileSync('js/hypercube.js', 'utf8');

// Find 'export class Hypercube'
const classIndex = code.indexOf('export class Hypercube');
const classCode = code.substring(classIndex);

const utils = `
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

export function hexToRgba(hex, alpha) {
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return \`rgba(255, 255, 255, \${alpha})\`;
}
`;

fs.writeFileSync('js/hypercube.js', utils + '\n' + classCode);
console.log('Fixed syntax!');
