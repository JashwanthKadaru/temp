const fs = require('fs');
const mammoth = require('mammoth');

fs.readFile('example_dummy.docx', (err, data) => {
  if (err) throw err;

  mammoth.convertToMarkdown({ buffer: data }) // use .convertToMarkdown
    .then(result => {
      fs.writeFile('output.md', result.value, err => {
        if (err) throw err;
        console.log('✅ Markdown saved to output.md');
      });
    })
    .catch(err => console.error(err));
});
