const exec = require('child_process').exec;

const commands = [
    'aws s3 cp dist s3://butchersworkshop.io/chillsect/dist/ --recursive',
    'aws s3 cp favicon.ico s3://butchersworkshop.io/chillsect/',
    'aws s3 cp index.html s3://butchersworkshop.io/chillsect/',
    'aws s3 cp controlPanel.html s3://butchersworkshop.io/chillsect/',
    'aws s3 cp assets s3://butchersworkshop.io/chillsect/assets/ --recursive',
    'aws cloudfront create-invalidation --distribution-id E1QL53R2NWUK1Z --paths /chillsect/*'
];

commands.forEach(cmd => {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
});