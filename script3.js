// plot‐tree.js
//
// Usage:
//   npm install d3 fs
//   node plot‐tree.js sections.json
//
// This script reads your JSON (an array of { title, subsections: […] }) and
// writes a standalone HTML file that uses D3.js to render a collapsible tree.

const fs = require('fs');
const path = require('path');

if (process.argv.length !== 3) {
  console.error('Usage: node plot‐tree.js <sections.json>');
  process.exit(1);
}

const jsonPath = process.argv[2];
const sections = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Convert to a single “root” → children tree
const treeData = {
  name: 'Document',
  children: sections.map(sec => ({
    name: sec.title,
    children: (sec.subsections || []).map(sub => ({ name: sub.title }))
  }))
};

const html = `<!DOCTYPE html>
<meta charset="utf-8">
<style>
  .node circle { fill: #999; stroke: steelblue; stroke-width: 1.5px; }
  .node text { font: 12px sans-serif; }
  .link { fill: none; stroke: #555; stroke-width: 1.5px; }
</style>
<body>
<script src="https://d3js.org/d3.v6.min.js"></script>
<script>
// ===== D3 collapsible tree setup =====
const data = ${JSON.stringify(treeData)};

const width = 800, height = 600;
const svg = d3.select('body')
  .append('svg')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', 'translate(40,0)');

const root = d3.hierarchy(data);
const treeLayout = d3.tree().size([height, width - 160]);
treeLayout(root);

// Links
svg.selectAll('.link')
  .data(root.links())
  .enter()
  .append('path')
    .attr('class', 'link')
    .attr('d', d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x)
    );

// Nodes
const node = svg.selectAll('.node')
  .data(root.descendants())
  .enter()
  .append('g')
    .attr('class', 'node')
    .attr('transform', d => \`translate(\${d.y},\${d.x})\`);

node.append('circle')
    .attr('r', 4);

node.append('text')
    .attr('dy', '0.31em')
    .attr('x', d => d.children ? -8 : 8)
    .style('text-anchor', d => d.children ? 'end' : 'start')
    .text(d => d.data.name);
</script>
`;

fs.writeFileSync('tree.html', html);
console.log('Wrote tree.html – open in your browser to see the section/subsection tree.');
